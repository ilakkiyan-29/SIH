import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { GraduationCap, Calendar, Trophy, Clock } from "lucide-react";

export function DashboardOverview() {
  const stats = [
    {
      title: "Current GPA",
      value: "3.75",
      description: "Out of 4.0",
      icon: GraduationCap,
      trend: "+0.15 from last semester"
    },
    {
      title: "Attendance Rate",
      value: "92%",
      description: "This semester",
      icon: Calendar,
      trend: "Above target"
    },
    {
      title: "Credits Earned",
      value: "87",
      description: "Total credit hours",
      icon: Trophy,
      trend: "13 more needed to graduate"
    },
    {
      title: "Study Hours",
      value: "156",
      description: "This month",
      icon: Clock,
      trend: "+12 hours from last month"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            <Badge variant="secondary" className="mt-2 text-xs">
              {stat.trend}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}