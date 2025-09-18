const express = require('express');
const { body, validationResult } = require('express-validator');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');
const { 
  authenticateToken, 
  requireFacultyOrAdmin,
  canAccessStudentData 
} = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/grades
// @desc    Get grades
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { studentId, courseId, semester, academicYear, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Build query based on user role
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'faculty') {
      // Faculty can see grades for courses they teach
      const courses = await Course.find({ instructor: req.user._id }).select('_id');
      const courseIds = courses.map(course => course._id);
      query.course = { $in: courseIds };
    }
    // Admin can see all grades (no additional restrictions)
    
    if (studentId) {
      // Check if user can access this student's data
      if (req.user.role === 'student' && studentId !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'You can only view your own grades',
          code: 'ACCESS_DENIED'
        });
      }
      query.student = studentId;
    }
    
    if (courseId) query.course = courseId;
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;

    const grades = await Grade.find(query)
      .populate('student', 'firstName lastName studentId')
      .populate('course', 'courseCode courseName')
      .populate('gradedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Grade.countDocuments(query);

    res.json({
      grades,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      message: 'Failed to get grades',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/grades/student/:studentId
// @desc    Get grades for a specific student
// @access  Private
router.get('/student/:studentId', authenticateToken, canAccessStudentData, async (req, res) => {
  try {
    const { semester, academicYear, courseId } = req.query;
    
    let query = { student: req.params.studentId };
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;
    if (courseId) query.course = courseId;

    const grades = await Grade.find(query)
      .populate('course', 'courseCode courseName credits')
      .populate('gradedBy', 'firstName lastName')
      .sort({ 'course.courseCode': 1, createdAt: -1 });

    // Calculate GPA for each course
    const courseGPAs = {};
    for (const grade of grades) {
      const courseId = grade.course._id.toString();
      if (!courseGPAs[courseId]) {
        courseGPAs[courseId] = await Grade.getStudentGPAByCourse(req.params.studentId, courseId);
      }
    }

    // Calculate overall GPA
    const overallGPA = await Grade.getStudentOverallGPA(req.params.studentId, semester, academicYear);

    res.json({
      grades,
      courseGPAs,
      overallGPA: Math.round(overallGPA * 100) / 100
    });

  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      message: 'Failed to get student grades',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/grades/course/:courseId
// @desc    Get grades for a specific course
// @access  Private (Faculty/Admin)
router.get('/course/:courseId', authenticateToken, requireFacultyOrAdmin, async (req, res) => {
  try {
    const { semester, academicYear, assignment } = req.query;
    
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
        message: 'You can only view grades for courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    let query = { course: req.params.courseId };
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;
    if (assignment) query['assignment.title'] = { $regex: assignment, $options: 'i' };

    const grades = await Grade.find(query)
      .populate('student', 'firstName lastName studentId')
      .populate('gradedBy', 'firstName lastName')
      .sort({ 'student.lastName': 1, 'assignment.title': 1 });

    // Calculate course statistics
    const totalStudents = course.students.length;
    const gradedStudents = [...new Set(grades.map(g => g.student._id.toString()))].length;
    const averageGrade = grades.length > 0 ? 
      grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length : 0;

    res.json({
      grades,
      statistics: {
        totalStudents,
        gradedStudents,
        averageGrade: Math.round(averageGrade * 100) / 100
      }
    });

  } catch (error) {
    console.error('Get course grades error:', error);
    res.status(500).json({
      message: 'Failed to get course grades',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/grades
// @desc    Create/Update grade
// @access  Private (Faculty/Admin)
router.post('/', authenticateToken, requireFacultyOrAdmin, [
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('assignment.title').trim().isLength({ min: 1, max: 100 }).withMessage('Assignment title is required'),
  body('assignment.type').isIn(['Assignment', 'Quiz', 'Midterm', 'Final', 'Project', 'Lab']).withMessage('Invalid assignment type'),
  body('assignment.maxMarks').isInt({ min: 1, max: 1000 }).withMessage('Max marks must be between 1 and 1000'),
  body('assignment.weightage').isInt({ min: 0, max: 100 }).withMessage('Weightage must be between 0 and 100'),
  body('marksObtained').isInt({ min: 0, max: 1000 }).withMessage('Marks obtained must be between 0 and 1000'),
  body('feedback').optional().trim().isLength({ max: 500 }),
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

    const { studentId, courseId, assignment, marksObtained, feedback, semester, academicYear } = req.body;

    // Verify course exists and user can grade for it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }

    if (req.user.role === 'faculty' && !course.instructor.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You can only grade for courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    // Verify student exists and is enrolled in the course
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({
        message: 'Invalid student',
        code: 'INVALID_STUDENT'
      });
    }

    if (!course.students.includes(studentId)) {
      return res.status(400).json({
        message: 'Student is not enrolled in this course',
        code: 'NOT_ENROLLED'
      });
    }

    // Check if grade already exists for this assignment
    const existingGrade = await Grade.findOne({
      student: studentId,
      course: courseId,
      'assignment.title': assignment.title
    });

    let grade;
    if (existingGrade) {
      // Update existing grade
      existingGrade.assignment = assignment;
      existingGrade.marksObtained = marksObtained;
      existingGrade.feedback = feedback;
      existingGrade.gradedBy = req.user._id;
      existingGrade.gradedAt = new Date();
      existingGrade.semester = semester;
      existingGrade.academicYear = academicYear;
      
      grade = await existingGrade.save();
    } else {
      // Create new grade
      grade = new Grade({
        student: studentId,
        course: courseId,
        assignment,
        marksObtained,
        feedback,
        gradedBy: req.user._id,
        semester,
        academicYear
      });

      grade = await grade.save();
    }

    // Populate the grade
    await grade.populate([
      { path: 'student', select: 'firstName lastName studentId' },
      { path: 'course', select: 'courseCode courseName' },
      { path: 'gradedBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      message: existingGrade ? 'Grade updated successfully' : 'Grade created successfully',
      grade
    });

  } catch (error) {
    console.error('Create/Update grade error:', error);
    res.status(500).json({
      message: 'Failed to create/update grade',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/grades/:id
// @desc    Update grade
// @access  Private (Faculty/Admin)
router.put('/:id', authenticateToken, requireFacultyOrAdmin, [
  body('marksObtained').optional().isInt({ min: 0, max: 1000 }),
  body('feedback').optional().trim().isLength({ max: 500 }),
  body('isPublished').optional().isBoolean()
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

    const grade = await Grade.findById(req.params.id)
      .populate('course', 'instructor');

    if (!grade) {
      return res.status(404).json({
        message: 'Grade not found',
        code: 'GRADE_NOT_FOUND'
      });
    }

    // Check if user can update this grade
    if (req.user.role === 'faculty' && !grade.course.instructor.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You can only update grades for courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    const allowedUpdates = ['marksObtained', 'feedback', 'isPublished'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'student', select: 'firstName lastName studentId' },
      { path: 'course', select: 'courseCode courseName' },
      { path: 'gradedBy', select: 'firstName lastName' }
    ]);

    res.json({
      message: 'Grade updated successfully',
      grade: updatedGrade
    });

  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      message: 'Failed to update grade',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/grades/:id
// @desc    Delete grade
// @access  Private (Faculty/Admin)
router.delete('/:id', authenticateToken, requireFacultyOrAdmin, async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('course', 'instructor');

    if (!grade) {
      return res.status(404).json({
        message: 'Grade not found',
        code: 'GRADE_NOT_FOUND'
      });
    }

    // Check if user can delete this grade
    if (req.user.role === 'faculty' && !grade.course.instructor.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You can only delete grades for courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    await Grade.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Grade deleted successfully'
    });

  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      message: 'Failed to delete grade',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
