import Link from "next/link";

/** Site-wide footer with branding and navigation links. */
export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold tracking-tight">NextNest</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Transform your move from chaos to confidence with a personalized
              relocation plan.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/intake" className="hover:text-foreground transition-colors">
                  Build My Move Plan
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NextNest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
