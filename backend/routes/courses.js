const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const { 
  authenticateToken, 
  requireAdmin, 
  requireFacultyOrAdmin,
  canAccessCourseData 
} = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, semester, year, instructor, page = 1, limit = 10, search } = req.query;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'student') {
      // Students can only see courses they are enrolled in
      query.students = req.user._id;
    } else if (req.user.role === 'faculty') {
      // Faculty can see courses they teach
      query.instructor = req.user._id;
    }
    // Admin can see all courses (no additional query restrictions)
    
    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (year) query.year = year;
    if (instructor) query.instructor = instructor;
    if (search) {
      query.$or = [
        { courseCode: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName email')
      .populate('students', 'firstName lastName studentId')
      .sort({ courseCode: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      message: 'Failed to get courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', authenticateToken, canAccessCourseData, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email department')
      .populate('students', 'firstName lastName studentId email');

    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }

    // Check if user has access to this course
    if (req.user.role === 'student' && !course.students.some(student => student._id.equals(req.user._id))) {
      return res.status(403).json({
        message: 'You are not enrolled in this course',
        code: 'NOT_ENROLLED'
      });
    }

    if (req.user.role === 'faculty' && !course.instructor._id.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You are not the instructor of this course',
        code: 'NOT_INSTRUCTOR'
      });
    }

    res.json({ course });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      message: 'Failed to get course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Faculty/Admin)
router.post('/', authenticateToken, requireFacultyOrAdmin, [
  body('courseCode').trim().isLength({ min: 3, max: 10 }).withMessage('Course code must be 3-10 characters'),
  body('courseName').trim().isLength({ min: 3, max: 100 }).withMessage('Course name must be 3-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('department').trim().isLength({ min: 2, max: 100 }).withMessage('Department is required'),
  body('semester').isIn(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']).withMessage('Invalid semester'),
  body('year').isIn(['1st', '2nd', '3rd', '4th', '5th', 'Graduate']).withMessage('Invalid year'),
  body('instructor').optional().isMongoId().withMessage('Invalid instructor ID'),
  body('maxStudents').optional().isInt({ min: 1, max: 200 }).withMessage('Max students must be between 1 and 200')
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

    const { courseCode, courseName, description, credits, department, semester, year, instructor, maxStudents } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode: courseCode.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({
        message: 'Course with this code already exists',
        code: 'COURSE_EXISTS'
      });
    }

    // Set instructor - faculty can only create courses for themselves, admin can assign any instructor
    let instructorId = instructor;
    if (req.user.role === 'faculty') {
      instructorId = req.user._id;
    } else if (!instructorId) {
      instructorId = req.user._id; // Default to current user if admin doesn't specify
    }

    // Verify instructor exists and is faculty
    const instructorUser = await User.findById(instructorId);
    if (!instructorUser || instructorUser.role !== 'faculty') {
      return res.status(400).json({
        message: 'Invalid instructor - must be a faculty member',
        code: 'INVALID_INSTRUCTOR'
      });
    }

    const course = new Course({
      courseCode: courseCode.toUpperCase(),
      courseName,
      description,
      credits,
      department,
      semester,
      year,
      instructor: instructorId,
      maxStudents: maxStudents || 50
    });

    await course.save();

    // Populate the course with instructor details
    await course.populate('instructor', 'firstName lastName email');

    res.status(201).json({
      message: 'Course created successfully',
      course
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      message: 'Failed to create course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Faculty/Admin)
router.put('/:id', authenticateToken, requireFacultyOrAdmin, [
  body('courseName').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('credits').optional().isInt({ min: 1, max: 6 }),
  body('department').optional().trim().isLength({ min: 2, max: 100 }),
  body('semester').optional().isIn(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']),
  body('year').optional().isIn(['1st', '2nd', '3rd', '4th', '5th', 'Graduate']),
  body('maxStudents').optional().isInt({ min: 1, max: 200 })
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

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }

    // Check if user can update this course
    if (req.user.role === 'faculty' && !course.instructor.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You can only update courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    const allowedUpdates = [
      'courseName', 'description', 'credits', 'department', 
      'semester', 'year', 'maxStudents', 'schedule', 'syllabus'
    ];
    const updates = {};

    // Only allow certain fields to be updated
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('instructor', 'firstName lastName email');

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      message: 'Failed to update course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll student in course
// @access  Private (Faculty/Admin)
router.post('/:id/enroll', authenticateToken, requireFacultyOrAdmin, [
  body('studentId').isMongoId().withMessage('Valid student ID is required')
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

    const { studentId } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }

    // Check if user can enroll students in this course
    if (req.user.role === 'faculty' && !course.instructor.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You can only enroll students in courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    // Verify student exists and is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({
        message: 'Invalid student ID',
        code: 'INVALID_STUDENT'
      });
    }

    // Check if course is full
    if (course.isFull()) {
      return res.status(400).json({
        message: 'Course is full',
        code: 'COURSE_FULL'
      });
    }

    // Check if student is already enrolled
    if (course.students.includes(studentId)) {
      return res.status(400).json({
        message: 'Student is already enrolled in this course',
        code: 'ALREADY_ENROLLED'
      });
    }

    // Enroll student
    const success = course.addStudent(studentId);
    if (success) {
      await course.save();
      await course.populate('students', 'firstName lastName studentId');
      
      res.json({
        message: 'Student enrolled successfully',
        course
      });
    } else {
      res.status(400).json({
        message: 'Failed to enroll student',
        code: 'ENROLLMENT_FAILED'
      });
    }

  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({
      message: 'Failed to enroll student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/courses/:id/enroll/:studentId
// @desc    Remove student from course
// @access  Private (Faculty/Admin)
router.delete('/:id/enroll/:studentId', authenticateToken, requireFacultyOrAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }

    // Check if user can remove students from this course
    if (req.user.role === 'faculty' && !course.instructor.equals(req.user._id)) {
      return res.status(403).json({
        message: 'You can only remove students from courses you teach',
        code: 'NOT_INSTRUCTOR'
      });
    }

    // Remove student
    course.removeStudent(req.params.studentId);
    await course.save();
    await course.populate('students', 'firstName lastName studentId');

    res.json({
      message: 'Student removed from course successfully',
      course
    });

  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({
      message: 'Failed to remove student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      });
    }

    res.json({
      message: 'Course deactivated successfully',
      course
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      message: 'Failed to delete course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/courses/stats/overview
// @desc    Get course statistics overview
// @access  Private (Admin)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ isActive: true });
    const totalEnrollments = await Course.aggregate([
      { $project: { enrollmentCount: { $size: '$students' } } },
      { $group: { _id: null, total: { $sum: '$enrollmentCount' } } }
    ]);

    // Get courses by department
    const coursesByDepartment = await Course.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get average enrollment per course
    const avgEnrollment = await Course.aggregate([
      { $project: { enrollmentCount: { $size: '$students' } } },
      { $group: { _id: null, average: { $avg: '$enrollmentCount' } } }
    ]);

    res.json({
      overview: {
        totalCourses,
        activeCourses,
        totalEnrollments: totalEnrollments[0]?.total || 0,
        averageEnrollment: Math.round(avgEnrollment[0]?.average || 0)
      },
      coursesByDepartment
    });

  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      message: 'Failed to get course statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
