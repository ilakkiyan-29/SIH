import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function AcademicPerformance() {
  // CGPA out of 10 system
  const semesterGrades = [
    { semester: 'Fall 2023', cgpa: 7.2, credits: 15 },
    { semester: 'Spring 2025', cgpa: 8.1, credits: 16 },
    { semester: 'Fall 2025', cgpa: 7.8, credits: 17 },
  ];

  const courseGrades = [
    { course: 'Math 301', grade: 'O', credits: 3, points: 30 },
    { course: 'CS 401', grade: 'A+', credits: 4, points: 36 },
    { course: 'Eng 205', grade: 'A', credits: 3, points: 27 },
    { course: 'Phy 301', grade: 'B+', credits: 3, points: 24 },
    { course: 'Hist 101', grade: 'B', credits: 2, points: 16 },
  ];

  const gradeDistribution = [
    { name: 'O (10)', value: 30, color: '#22c55e' },
    { name: 'A+ (9)', value: 25, color: '#3b82f6' },
    { name: 'A (8)', value: 20, color: '#f59e0b' },
    { name: 'B+ (7)', value: 15, color: '#ef4444' },
    { name: 'B (6)', value: 10, color: '#a855f7' },
  ];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>CGPA Grade Distribution</CardTitle>
          <CardDescription>Overall CGPA grade breakdown (out of 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={420}>
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