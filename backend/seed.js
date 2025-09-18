const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Course = require('./models/Course');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-portal');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@academicportal.com',
      password: 'admin123456',
      role: 'admin',
      department: 'Administration',
      phone: '+1234567890',
      isActive: true
    });
    await admin.save();
    console.log('👑 Created admin user');

    // Create faculty users
    const faculty1 = new User({
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@academicportal.com',
      password: 'faculty123456',
      role: 'faculty',
      department: 'Computer Science',
      phone: '+1234567891',
      isActive: true
    });
    await faculty1.save();

    const faculty2 = new User({
      firstName: 'Prof. Michael',
      lastName: 'Chen',
      email: 'michael.chen@academicportal.com',
      password: 'faculty123456',
      role: 'faculty',
      department: 'Mathematics',
      phone: '+1234567892',
      isActive: true
    });
    await faculty2.save();

    const faculty3 = new User({
      firstName: 'Dr. Emily',
      lastName: 'Davis',
      email: 'emily.davis@academicportal.com',
      password: 'faculty123456',
      role: 'faculty',
      department: 'Physics',
      phone: '+1234567893',
      isActive: true
    });
    await faculty3.save();
    console.log('👨‍🏫 Created faculty users');

    // Create student users
    const students = [
      {
        firstName: 'Alex',
        lastName: 'Smith',
        email: 'alex.smith@academicportal.com',
        password: 'student123456',
        department: 'Computer Science',
        year: '3rd',
        semester: '5th'
      },
      {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.wilson@academicportal.com',
        password: 'student123456',
        department: 'Computer Science',
        year: '2nd',
        semester: '3rd'
      },
      {
        firstName: 'James',
        lastName: 'Brown',
        email: 'james.brown@academicportal.com',
        password: 'student123456',
        department: 'Mathematics',
        year: '4th',
        semester: '7th'
      },
      {
        firstName: 'Sophia',
        lastName: 'Garcia',
        email: 'sophia.garcia@academicportal.com',
        password: 'student123456',
        department: 'Physics',
        year: '1st',
        semester: '1st'
      },
      {
        firstName: 'William',
        lastName: 'Martinez',
        email: 'william.martinez@academicportal.com',
        password: 'student123456',
        department: 'Computer Science',
        year: '3rd',
        semester: '5th'
      }
    ];

    const createdStudents = [];
    for (const studentData of students) {
      const student = new User({
        ...studentData,
        role: 'student',
        isActive: true
      });
      student.generateStudentId();
      await student.save();
      createdStudents.push(student);
    }
    console.log('🎓 Created student users');

    // Create courses
    const courses = [
      {
        courseCode: 'CS101',
        courseName: 'Introduction to Programming',
        description: 'Fundamentals of programming using Python',
        credits: 3,
        department: 'Computer Science',
        semester: '1st',
        year: '1st',
        instructor: faculty1._id,
        students: [createdStudents[0]._id, createdStudents[1]._id, createdStudents[4]._id],
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: { start: '09:00', end: '10:00' },
          room: 'CS-101'
        },
        maxStudents: 30
      },
      {
        courseCode: 'CS201',
        courseName: 'Data Structures and Algorithms',
        description: 'Advanced programming concepts and data structures',
        credits: 4,
        department: 'Computer Science',
        semester: '3rd',
        year: '2nd',
        instructor: faculty1._id,
        students: [createdStudents[0]._id, createdStudents[1]._id, createdStudents[4]._id],
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: { start: '10:00', end: '12:00' },
          room: 'CS-201'
        },
        maxStudents: 25
      },
      {
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        description: 'Advanced calculus topics including integration and series',
        credits: 4,
        department: 'Mathematics',
        semester: '3rd',
        year: '2nd',
        instructor: faculty2._id,
        students: [createdStudents[2]._id],
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: { start: '11:00', end: '12:00' },
          room: 'MATH-201'
        },
        maxStudents: 35
      },
      {
        courseCode: 'PHYS101',
        courseName: 'General Physics I',
        description: 'Mechanics, thermodynamics, and waves',
        credits: 4,
        department: 'Physics',
        semester: '1st',
        year: '1st',
        instructor: faculty3._id,
        students: [createdStudents[3]._id],
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: { start: '14:00', end: '16:00' },
          room: 'PHYS-101'
        },
        maxStudents: 40
      }
    ];

    for (const courseData of courses) {
      const course = new Course(courseData);
      await course.save();
    }
    console.log('📚 Created courses');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@academicportal.com / admin123456');
    console.log('Faculty: sarah.johnson@academicportal.com / faculty123456');
    console.log('Student: alex.smith@academicportal.com / student123456');
    console.log('\n🚀 You can now start the application!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed function
seedData();
