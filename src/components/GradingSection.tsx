import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export type SemesterGrade = {
  semester: string;
  courses: { name: string; grade?: string }[];
};

const SEMESTER_GRADES: SemesterGrade[] = [
  {
    semester: "Semester 1",
    courses: [
      { name: "Math 101", grade: "A+" },
      { name: "Physics 101", grade: "A" },
      { name: "Chemistry 101", grade: "B+" },
    ],
  },
  {
    semester: "Semester 2",
    courses: [
      { name: "Math 102", grade: "A" },
      { name: "CS 101", grade: "O" },
      { name: "English 101", grade: "A+" },
    ],
  },
  {
    semester: "Semester 3",
    courses: [
      { name: "Math 201", grade: "A" },
      { name: "CS 201", grade: "A+" },
      { name: "Electronics 101", grade: "B" },
    ],
  },
  {
    semester: "Semester 4",
    courses: [
      { name: "Math 202", grade: "A+" },
      { name: "CS 202", grade: "A" },
      { name: "Statistics 101", grade: "O" },
    ],
  },
  {
    semester: "Semester 5",
    courses: [
      { name: "CS 301", grade: "A" },
      { name: "Math 301", grade: "A+" },
      { name: "Project 1", grade: "O" },
    ],
  },
  {
    semester: "Semester 6",
    courses: [
      { name: "CS 302", grade: "A+" },
      { name: "Math 302", grade: "A" },
      { name: "Project 2", grade: "O" },
    ],
  },
  {
    semester: "Semester 7",
    courses: [
      { name: "Elective 1" },
      { name: "Elective 2" },
      { name: "Project 3" },
    ],
  },
  {
    semester: "Semester 8",
    courses: [
      { name: "Elective 3" },
      { name: "Elective 4" },
      { name: "Final Project" },
    ],
  },
];

export function GradingSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grading Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {SEMESTER_GRADES.map((sem) => (
            <div key={sem.semester}>
              <div className="font-semibold mb-1">{sem.semester}</div>
              <ul className="ml-4 list-disc">
                {sem.courses.map((course, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{course.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {course.grade ? course.grade : "-"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
