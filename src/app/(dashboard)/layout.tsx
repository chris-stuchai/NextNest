import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Authenticated layout — redirects unauthenticated users to login. */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
