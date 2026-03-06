"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  hasIntake: boolean;
  hasPlan: boolean;
  milestonesCompleted: number;
  milestonesTotal: number;
}

interface UserTableProps {
  users: AdminUser[];
}

/** Tabular display of all users with engagement status badges. */
export function UserTable({ users }: UserTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-medium text-muted-foreground">User</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Status</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Milestones</th>
                <th className="pb-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="hover:underline underline-offset-4"
                    >
                      <p className="font-medium">{user.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-1.5">
                      {user.hasPlan ? (
                        <Badge className="text-xs">Plan Active</Badge>
                      ) : user.hasIntake ? (
                        <Badge variant="secondary" className="text-xs">
                          Intake Done
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Signed Up
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {user.milestonesTotal > 0 ? (
                      <span>
                        {user.milestonesCompleted}/{user.milestonesTotal}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
