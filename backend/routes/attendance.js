const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const User = require('../models/User');
const { 
  authenticateToken, 
  requireFacultyOrAdmin,
  canAccessStudentData 
} = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { studentId, courseId, date, semester, academicYear, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Build query based on user role
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'faculty') {
      // Faculty can see attendance for courses they teach
      const courses = await Course.find({ instructor: req.user._id }).select('_id');
      const courseIds = courses.map(course => course._id);
      query.course = { $in: courseIds };
    }
    // Admin can see all attendance (no additional restrictions)
    
    if (studentId) {
      // Check if user can access this student's data
      if (req.user.role === 'student' && studentId !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'You can only view your own attendance',
          code: 'ACCESS_DENIED'
        });
      }
      query.student = studentId;
    }
    
    if (courseId) query.course = courseId;
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'firstName lastName studentId')
      .populate('course', 'courseCode courseName')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      message: 'Failed to get attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/attendance/student/:studentId
// @desc    Get attendance for a specific student
// @access  Private
router.get('/student/:studentId', authenticateToken, canAccessStudentData, async (req, res) => {
  try {
    const { courseId, semester, academicYear } = req.query;
    
    let query = { student: req.params.studentId };
    if (courseId) query.course = courseId;
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;

    const attendance = await Attendance.find(query)
      .populate('course', 'courseCode courseName')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1 });

    // Calculate attendance percentage for each course
    const courseAttendance = {};
    for (const record of attendance) {
      const courseId = record.course._id.toString();
      if (!courseAttendance[courseId]) {
        courseAttendance[courseId] = {
          course: record.course,
          records: [],
          percentage: 0
        };
      }
      courseAttendance[courseId].records.push(record);
    }

    // Calculate percentage for each course
    for (const courseId in courseAttendance) {
      const records = courseAttendance[courseId].records;
      const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
      courseAttendance[courseId].percentage = records.length > 0 ? (presentCount / records.length) * 100 : 0;
    }

    res.json({
      attendance,
      courseAttendance: Object.values(courseAttendance)
    });

  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      message: 'Failed to get student attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/attendance/course/:courseId
// @desc    Get attendance for a specific course
// @access  Private (Faculty/Admin)
router.get('/course/:courseId', authenticateToken, requireFacultyOrAdmin, async (req, res) => {
  try {
    const { date, semester, academicYear } = req.query;
    
    // Check if user can access this course
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }

    if (req.user.role === 'faculty' && !course.instructor.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You can only view attendance for courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    let query = { course: req.params.courseId };
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'firstName lastName studentId')
      .populate('markedBy', 'firstName lastName')
      .sort({ date: -1, 'student.lastName': 1 });

    // Get attendance summary
    const summary = await Attendance.getCourseAttendanceSummary(req.params.courseId, date);

    res.json({
      attendance,
      summary
    });

  } catch (error) {
    console.error('Get course attendance error:', error);
    res.status(500).json({
      message: 'Failed to get course attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/attendance
// @desc    Mark attendance
// @access  Private (Faculty/Admin)
router.post('/', authenticateToken, requireFacultyOrAdmin, [
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('attendanceData').isArray({ min: 1 }).withMessage('Attendance data is required'),
  body('attendanceData.*.studentId').isMongoId().withMessage('Valid student ID is required'),
  body('attendanceData.*.status').isIn(['Present', 'Absent', 'Late', 'Excused']).withMessage('Invalid status'),
  body('semester').trim().isLength({ min: 1 }).withMessage('Semester is required'),
  body('academicYear').trim().isLength({ min: 1 }).withMessage('Academic year is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseId, date, attendanceData, semester, academicYear } = req.body;

    // Verify course exists and user can mark attendance for it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }

    if (req.user.role === 'faculty' && !course.instructor.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You can only mark attendance for courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      course: courseId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lte: new Date(date).setHours(23, 59, 59, 999)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: 'Attendance already marked for this date',
        code: 'ATTENDANCE_EXISTS'
      });
    }

    // Prepare attendance records
    const attendanceRecords = attendanceData.map(data => ({
      student: data.studentId,
      course: courseId,
      date: new Date(date),
      status: data.status,
      markedBy: req.user._id,
      remarks: data.remarks || '',
      semester,
      academicYear
    }));

    // Mark bulk attendance
    const createdAttendance = await Attendance.markBulkAttendance(attendanceRecords);

    // Populate the records
    await Attendance.populate(createdAttendance, [
      { path: 'student', select: 'firstName lastName studentId' },
      { path: 'course', select: 'courseCode courseName' },
      { path: 'markedBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: createdAttendance
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      message: 'Failed to mark attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Faculty/Admin)
router.put('/:id', authenticateToken, requireFacultyOrAdmin, [
  body('status').isIn(['Present', 'Absent', 'Late', 'Excused']).withMessage('Invalid status'),
  body('remarks').optional().trim().isLength({ max: 200 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const attendance = await Attendance.findById(req.params.id)
      .populate('course', 'instructor');

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found',
        code: 'ATTENDANCE_NOT_FOUND'
      });
    }

    // Check if user can update this attendance
    if (req.user.role === 'faculty' && !attendance.course.instructor.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You can only update attendance for courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    const allowedUpdates = ['status', 'remarks'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'student', select: 'firstName lastName studentId' },
      { path: 'course', select: 'courseCode courseName' },
      { path: 'markedBy', select: 'firstName lastName' }
    ]);

    res.json({
      message: 'Attendance updated successfully',
      attendance: updatedAttendance
    });

  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      message: 'Failed to update attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Faculty/Admin)
router.delete('/:id', authenticateToken, requireFacultyOrAdmin, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('course', 'instructor');

    if (!attendance) {
      return res.status(404).json({
        message: 'Attendance record not found',
        code: 'ATTENDANCE_NOT_FOUND'
      });
    }

    // Check if user can delete this attendance
    if (req.user.role === 'faculty' && !attendance.course.instructor.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You can only delete attendance for courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      message: 'Failed to delete attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/attendance/stats/student/:studentId
// @desc    Get attendance statistics for a student
// @access  Private
router.get('/stats/student/:studentId', authenticateToken, canAccessStudentData, async (req, res) => {
  try {
    const { courseId, semester, academicYear } = req.query;
    
    let query = { student: req.params.studentId };
    if (courseId) query.course = courseId;
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;

    const attendance = await Attendance.find(query)
      .populate('course', 'courseCode courseName');

    // Calculate statistics
    const courseStats = {};
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalExcused = 0;

    attendance.forEach(record => {
      const courseId = record.course._id.toString();
      if (!courseStats[courseId]) {
        courseStats[courseId] = {
          course: record.course,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
          percentage: 0
        };
      }

      courseStats[courseId].total++;
      if (record.status === 'Present') {
        courseStats[courseId].present++;
        totalPresent++;
      } else if (record.status === 'Absent') {
        courseStats[courseId].absent++;
        totalAbsent++;
      } else if (record.status === 'Late') {
        courseStats[courseId].late++;
        totalLate++;
      } else if (record.status === 'Excused') {
        courseStats[courseId].excused++;
        totalExcused++;
      }
    });

    // Calculate percentages
    Object.values(courseStats).forEach(stat => {
      stat.percentage = stat.total > 0 ? ((stat.present + stat.late) / stat.total) * 100 : 0;
    });

    const totalRecords = totalPresent + totalAbsent + totalLate + totalExcused;
    const overallPercentage = totalRecords > 0 ? ((totalPresent + totalLate) / totalRecords) * 100 : 0;

    res.json({
      courseStats: Object.values(courseStats),
      overall: {
        totalRecords,
        present: totalPresent,
        absent: totalAbsent,
        late: totalLate,
        excused: totalExcused,
        percentage: Math.round(overallPercentage * 100) / 100
      }
    });

  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      message: 'Failed to get attendance statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
