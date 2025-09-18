import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function AcademicPerformance() {
  const semesterGrades = [
    { semester: 'Fall 2023', gpa: 3.6, credits: 15 },
    { semester: 'Spring 2024', gpa: 3.8, credits: 16 },
    { semester: 'Fall 2024', gpa: 3.75, credits: 17 },
  ];

  const courseGrades = [
    { course: 'Math 301', grade: 'A', credits: 3, points: 12 },
    { course: 'CS 401', grade: 'A-', credits: 4, points: 14.8 },
    { course: 'Eng 205', grade: 'B+', credits: 3, points: 9.9 },
    { course: 'Phy 301', grade: 'A', credits: 3, points: 12 },
    { course: 'Hist 101', grade: 'B', credits: 2, points: 6 },
  ];

  const gradeDistribution = [
    { name: 'A (4.0)', value: 40, color: '#22c55e' },
    { name: 'A- (3.7)', value: 25, color: '#3b82f6' },
    { name: 'B+ (3.3)', value: 20, color: '#f59e0b' },
    { name: 'B (3.0)', value: 15, color: '#ef4444' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>GPA Trend</CardTitle>
          <CardDescription>Your academic progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={semesterGrades}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semester" />
              <YAxis domain={[3.0, 4.0]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="gpa" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="GPA"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Semester Grades</CardTitle>
          <CardDescription>Course performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseGrades}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="points" fill="#3b82f6" name="Grade Points" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>Overall grade breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}