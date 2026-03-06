import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";

/** "Check your email" confirmation page shown after requesting a magic link. */
export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            We&apos;ve sent a secure sign-in link to your inbox. Click the link
            to access your NextNest dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              The link expires in 24 hours. If you don&apos;t see the email,
              check your spam folder or request a new link.
            </p>
          </div>
          <a
            href="/login"
            className="inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            Didn&apos;t receive it? Try again
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
