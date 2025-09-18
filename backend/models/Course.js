const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    uppercase: true
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot exceed 6']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
  },
  year: {
    type: String,
    required: [true, 'Year is required'],
    enum: ['1st', '2nd', '3rd', '4th', '5th', 'Graduate']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    time: {
      start: String,
      end: String
    },
    room: String
  },
  syllabus: {
    type: String,
    default: ''
  },
  assignments: [{
    title: String,
    description: String,
    dueDate: Date,
    maxMarks: Number,
    weightage: Number
  }],
  exams: [{
    title: String,
    type: {
      type: String,
      enum: ['Midterm', 'Final', 'Quiz', 'Assignment']
    },
    date: Date,
    maxMarks: Number,
    weightage: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    default: 50,
    min: [1, 'Maximum students must be at least 1']
  }
}, {
  timestamps: true
});

// Index for better query performance
courseSchema.index({ courseCode: 1 }, { unique: true });
courseSchema.index({ department: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ semester: 1, year: 1 });

// Virtual for current enrollment
courseSchema.virtual('currentEnrollment').get(function() {
  return this.students.length;
});

// Method to check if course is full
courseSchema.methods.isFull = function() {
  return this.students.length >= this.maxStudents;
};

// Method to add student to course
courseSchema.methods.addStudent = function(studentId) {
  if (!this.isFull() && !this.students.includes(studentId)) {
    this.students.push(studentId);
    return true;
  }
  return false;
};

// Method to remove student from course
courseSchema.methods.removeStudent = function(studentId) {
  this.students = this.students.filter(id => !id.equals(studentId));
};

module.exports = mongoose.model('Course', courseSchema);
