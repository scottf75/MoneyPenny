import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex">
            {/* Left sidebar */}
            <aside className="w-64 border-r border-border bg-card">
              <nav className="p-4 space-y-2">
                <Link href="/" className="flex items-center p-2 rounded-lg hover:bg-accent">
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link href="/accounts" className="flex items-center p-2 rounded-lg hover:bg-accent">
                  <span className="font-medium">Accounts</span>
                </Link>
                <Link href="/transactions" className="flex items-center p-2 rounded-lg hover:bg-accent">
                  <span className="font-medium">Transactions</span>
                </Link>
                <Link href="/reports" className="flex items-center p-2 rounded-lg hover:bg-accent">
                  <span className="font-medium">Reports</span>
                </Link>
              </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"}>MoneyPenny</Link>
                    {/* <div className="flex items-center gap-2">
                      <DeployButton />
                    </div> */}
                  </div>
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div>
              </nav>
              <div className="flex flex-col gap-20 max-w-5xl p-5 mx-auto">
                {children}
              </div>

              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                <p>
                  Powered by Sefware
                </p>
                <ThemeSwitcher />
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
