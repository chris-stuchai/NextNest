"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, LayoutDashboard, Target } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    completedIntakes: number;
    activePlans: number;
    milestoneCompletionRate: number;
  };
}

/** Overview metric cards for the admin dashboard. */
export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Completed Intakes",
      value: stats.completedIntakes,
      icon: ClipboardCheck,
    },
    {
      title: "Active Plans",
      value: stats.activePlans,
      icon: LayoutDashboard,
    },
    {
      title: "Milestone Completion",
      value: `${stats.milestoneCompletionRate}%`,
      icon: Target,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
