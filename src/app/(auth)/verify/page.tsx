"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

/** Animated "check your email" confirmation page with polished design. */
export default function VerifyPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      {/* Background accents */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl shadow-black/5 text-center">
          <CardHeader className="space-y-4 pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              {/* Animated ring */}
              <div className="absolute -inset-2 animate-ping rounded-2xl bg-primary/5" style={{ animationDuration: "2s" }} />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Check your email
              </CardTitle>
              <CardDescription className="mt-2 text-base leading-relaxed">
                We&apos;ve sent a secure sign-in link to your inbox. Click it
                to access your NextNest dashboard.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <div className="rounded-xl bg-muted/50 p-4 border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The link expires in 24 hours. If you don&apos;t see the email,
                check your spam folder.
              </p>
            </div>
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/login">
                Didn&apos;t receive it? Try again
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
