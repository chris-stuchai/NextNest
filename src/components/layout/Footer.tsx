import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const navigation = {
  product: [
    { name: "Build My Move Plan", href: "/intake" },
    { name: "Pricing", href: "/pricing" },
    { name: "Dashboard", href: "/dashboard" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Sign In", href: "/login" },
    { name: "Create Account", href: "/signup" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

/** Refined site-wide footer with branding and organized navigation. */
export function Footer() {
  return (
    <footer className="relative border-t bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <Logo size="sm" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Transform your move from chaos to confidence with a personalized
              relocation plan built just for you.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="transition-colors duration-200 hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="transition-colors duration-200 hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="transition-colors duration-200 hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NextNest. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built to make moving feel less like moving.
          </p>
        </div>
      </div>
    </footer>
  );
}
