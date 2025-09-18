# Academic Portal - Full Stack Application

A comprehensive academic management system built with React, TypeScript, Node.js, Express, and MongoDB. This application provides role-based access for students, faculty, and administrators with features for course management, grading, attendance tracking, and more.

## 🚀 Features

### For Students
- **Dashboard Overview**: Academic performance, recent activities, and quick stats
- **Course Management**: View enrolled courses, assignments, and schedules
- **Grade Tracking**: Monitor grades, GPA, and academic progress
- **Attendance**: Track attendance records and percentages
- **Transcripts**: Access and download academic documents

### For Faculty
- **Course Management**: Create and manage courses, enroll students
- **Grading System**: Grade assignments, quizzes, and exams
- **Attendance Tracking**: Mark and monitor student attendance
- **Student Roster**: View and manage enrolled students
- **Reports**: Generate academic reports and analytics

### For Administrators
- **User Management**: Manage students, faculty, and admin accounts
- **System Analytics**: Comprehensive system statistics and insights
- **Course Oversight**: Monitor all courses and enrollments
- **System Settings**: Configure system-wide settings
- **Reports**: Generate institutional reports

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons
- **React Context** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **CORS** for cross-origin requests

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd academic-portal
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
npm install
```

#### Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/academic-portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-secure
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:5173

# Admin Default Credentials
ADMIN_EMAIL=admin@academicportal.com
ADMIN_PASSWORD=admin123456

# Student Default Credentials
STUDENT_EMAIL=student@academicportal.com
STUDENT_PASSWORD=student123456

# Faculty Default Credentials
FACULTY_EMAIL=faculty@academicportal.com
FACULTY_PASSWORD=faculty123456
```

### 4. Database Setup

Make sure MongoDB is running on your system, then seed the database:

```bash
cd backend
npm run seed
cd ..
```

### 5. Start the Application

#### Start the Backend Server
```bash
cd backend
npm run dev
```

#### Start the Frontend Development Server
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔐 Default Login Credentials

After seeding the database, you can use these credentials to test the application:

### Admin
- **Email**: admin@academicportal.com
- **Password**: admin123456

### Faculty
- **Email**: sarah.johnson@academicportal.com
- **Password**: faculty123456

### Student
- **Email**: alex.smith@academicportal.com
- **Password**: student123456

## 📁 Project Structure

```
academic-portal/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   ├── LoginPage.tsx         # Authentication page
│   │   ├── StudentDashboard.tsx  # Student dashboard
│   │   ├── FacultyDashboard.tsx  # Faculty dashboard
│   │   └── AdminDashboard.tsx    # Admin dashboard
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx       # Authentication context
│   ├── services/                 # API services
│   │   └── api.ts                # API client
│   └── styles/                   # Global styles
├── backend/                      # Backend source code
│   ├── models/                   # MongoDB models
│   ├── routes/                   # API routes
│   ├── middleware/               # Express middleware
│   ├── server.js                 # Main server file
│   └── seed.js                   # Database seeder
├── .env                          # Environment variables
└── README.md                     # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/students` - Get all students
- `GET /api/users/faculty` - Get all faculty
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin)

### Courses
- `GET /api/courses` - Get courses
- `POST /api/courses` - Create course (faculty/admin)
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course (faculty/admin)
- `POST /api/courses/:id/enroll` - Enroll student

### Grades
- `GET /api/grades` - Get grades
- `POST /api/grades` - Create/update grade (faculty/admin)
- `GET /api/grades/student/:id` - Get student grades
- `GET /api/grades/course/:id` - Get course grades

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance (faculty/admin)
- `GET /api/attendance/student/:id` - Get student attendance
- `GET /api/attendance/course/:id` - Get course attendance

## 🎨 UI Components

The application uses a comprehensive set of UI components built with Radix UI and styled with Tailwind CSS:

- **Forms**: Input, Button, Label, Select, Textarea
- **Navigation**: Tabs, Sidebar, Breadcrumb
- **Data Display**: Table, Card, Badge, Avatar
- **Feedback**: Alert, Toast, Progress
- **Overlays**: Dialog, Popover, Tooltip

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Express Validator for API validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet**: Security headers for Express.js

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Set environment variables for API URL

### Backend Deployment (Railway/Heroku)
1. Set up MongoDB Atlas or use cloud MongoDB service
2. Configure environment variables
3. Deploy the backend folder
4. Run database seeding: `npm run seed`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- **Real-time Notifications**: WebSocket integration for live updates
- **File Upload**: Assignment and document upload functionality
- **Email Integration**: Automated email notifications
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Detailed reporting and analytics
- **Calendar Integration**: Google Calendar/Outlook integration
- **Video Conferencing**: Built-in video calling for online classes

---

**Built with ❤️ for educational institutions**