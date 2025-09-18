const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    required: [true, 'Status is required'],
    default: 'Absent'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Marked by is required']
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [200, 'Remarks cannot exceed 200 characters']
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
attendanceSchema.index({ student: 1, course: 1, date: 1 });
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ date: 1 });

// Static method to get attendance percentage for a student in a course
attendanceSchema.statics.getAttendancePercentage = async function(studentId, courseId, semester, academicYear) {
  const query = { student: studentId, course: courseId };
  if (semester) query.semester = semester;
  if (academicYear) query.academicYear = academicYear;
  
  const attendanceRecords = await this.find(query);
  if (attendanceRecords.length === 0) return 0;
  
  const presentCount = attendanceRecords.filter(record => 
    record.status === 'Present' || record.status === 'Late'
  ).length;
  
  return (presentCount / attendanceRecords.length) * 100;
};

// Static method to get attendance summary for a course
attendanceSchema.statics.getCourseAttendanceSummary = async function(courseId, date) {
  const query = { course: courseId };
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }
  
  const attendanceRecords = await this.find(query).populate('student', 'firstName lastName studentId');
  
  const summary = {
    totalStudents: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0
  };
  
  if (attendanceRecords.length > 0) {
    summary.totalStudents = attendanceRecords.length;
    summary.present = attendanceRecords.filter(r => r.status === 'Present').length;
    summary.absent = attendanceRecords.filter(r => r.status === 'Absent').length;
    summary.late = attendanceRecords.filter(r => r.status === 'Late').length;
    summary.excused = attendanceRecords.filter(r => r.status === 'Excused').length;
    summary.attendancePercentage = ((summary.present + summary.late) / summary.totalStudents) * 100;
  }
  
  return summary;
};

// Static method to mark attendance for multiple students
attendanceSchema.statics.markBulkAttendance = async function(attendanceData) {
  try {
    const attendanceRecords = attendanceData.map(data => ({
      student: data.studentId,
      course: data.courseId,
      date: data.date,
      status: data.status,
      markedBy: data.markedBy,
      remarks: data.remarks,
      semester: data.semester,
      academicYear: data.academicYear
    }));
    
    return await this.insertMany(attendanceRecords);
  } catch (error) {
    throw new Error(`Failed to mark bulk attendance: ${error.message}`);
  }
};

module.exports = mongoose.model('Attendance', attendanceSchema);
