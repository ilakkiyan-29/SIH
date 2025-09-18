const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  assignment: {
    title: String,
    type: {
      type: String,
      enum: ['Assignment', 'Quiz', 'Midterm', 'Final', 'Project', 'Lab']
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks are required']
    },
    weightage: {
      type: Number,
      required: [true, 'Weightage is required'],
      min: [0, 'Weightage cannot be negative'],
      max: [100, 'Weightage cannot exceed 100']
    }
  },
  marksObtained: {
    type: Number,
    required: [true, 'Marks obtained are required'],
    min: [0, 'Marks cannot be negative'],
    max: [1000, 'Marks cannot exceed 1000']
  },
  percentage: {
    type: Number,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W'],
    default: 'I'
  },
  gpa: {
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [4, 'GPA cannot exceed 4']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Grader is required']
  },
  gradedAt: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  semester: {
    type: String,
    required: [true, 'Semester is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  }
}, {
  timestamps: true
});

// Index for better query performance
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ course: 1 });
gradeSchema.index({ semester: 1, academicYear: 1 });

// Pre-save middleware to calculate percentage and letter grade
gradeSchema.pre('save', function(next) {
  if (this.marksObtained && this.assignment.maxMarks) {
    this.percentage = (this.marksObtained / this.assignment.maxMarks) * 100;
    
    // Calculate letter grade based on percentage
    if (this.percentage >= 97) this.letterGrade = 'A+';
    else if (this.percentage >= 93) this.letterGrade = 'A';
    else if (this.percentage >= 90) this.letterGrade = 'A-';
    else if (this.percentage >= 87) this.letterGrade = 'B+';
    else if (this.percentage >= 83) this.letterGrade = 'B';
    else if (this.percentage >= 80) this.letterGrade = 'B-';
    else if (this.percentage >= 77) this.letterGrade = 'C+';
    else if (this.percentage >= 73) this.letterGrade = 'C';
    else if (this.percentage >= 70) this.letterGrade = 'C-';
    else if (this.percentage >= 67) this.letterGrade = 'D+';
    else if (this.percentage >= 60) this.letterGrade = 'D';
    else this.letterGrade = 'F';
    
    // Calculate GPA
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    this.gpa = gradePoints[this.letterGrade] || 0;
  }
  next();
});

// Static method to get student's GPA for a course
gradeSchema.statics.getStudentGPAByCourse = async function(studentId, courseId) {
  const grades = await this.find({ student: studentId, course: courseId });
  if (grades.length === 0) return 0;
  
  const totalWeightedGPA = grades.reduce((sum, grade) => {
    return sum + (grade.gpa * grade.assignment.weightage);
  }, 0);
  
  const totalWeightage = grades.reduce((sum, grade) => {
    return sum + grade.assignment.weightage;
  }, 0);
  
  return totalWeightage > 0 ? totalWeightedGPA / totalWeightage : 0;
};

// Static method to get student's overall GPA
gradeSchema.statics.getStudentOverallGPA = async function(studentId, semester, academicYear) {
  const query = { student: studentId };
  if (semester) query.semester = semester;
  if (academicYear) query.academicYear = academicYear;
  
  const grades = await this.find(query);
  if (grades.length === 0) return 0;
  
  const totalWeightedGPA = grades.reduce((sum, grade) => {
    return sum + (grade.gpa * grade.assignment.weightage);
  }, 0);
  
  const totalWeightage = grades.reduce((sum, grade) => {
    return sum + grade.assignment.weightage;
  }, 0);
  
  return totalWeightage > 0 ? totalWeightedGPA / totalWeightage : 0;
};

module.exports = mongoose.model('Grade', gradeSchema);
