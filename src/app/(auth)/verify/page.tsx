import { redirect } from "next/navigation";

/** Verify page is no longer used — redirect to login. */
export default function VerifyPage() {
  redirect("/login");
}
