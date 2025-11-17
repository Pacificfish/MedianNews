"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Search, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Top Banner - Professional news style */}
      <div className="bg-gray-900 dark:bg-gray-950 text-white py-2.5 px-4 border-b border-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="font-medium">See every side of every news story</span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="hidden sm:inline text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <Link href="/register">
            <Button className="bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 text-xs h-7 px-4 font-semibold">
              Subscribe
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Navigation - News Website Style */}
      <nav className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b-2 border-gray-300 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Main Nav */}
            <div className="flex items-center gap-8">
              <Logo variant="dark" />
              
              <div className="hidden lg:flex items-center gap-1 border-l-2 border-gray-300 dark:border-gray-700 pl-8">
                <Link href="/">
                  <Button variant="ghost" className="text-gray-900 dark:text-gray-100 hover:text-[#DC2626] dark:hover:text-[#DC2626] hover:bg-transparent font-bold text-sm h-10 px-4 rounded-none border-b-2 border-transparent hover:border-[#DC2626] transition-colors">
                    Home
                  </Button>
                </Link>
                {user && (
                  <>
                    <Link href="/profile">
                      <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-[#DC2626] dark:hover:text-[#DC2626] hover:bg-transparent font-semibold text-sm h-10 px-4 rounded-none border-b-2 border-transparent hover:border-[#DC2626] transition-colors">
                        For You
                      </Button>
                    </Link>
                    <Link href="/saved">
                      <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-[#DC2626] dark:hover:text-[#DC2626] hover:bg-transparent font-semibold text-sm h-10 px-4 rounded-none border-b-2 border-transparent hover:border-[#DC2626] transition-colors">
                        Saved
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/local">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-[#DC2626] dark:hover:text-[#DC2626] hover:bg-transparent font-semibold text-sm h-10 px-4 rounded-none border-b-2 border-transparent hover:border-[#DC2626] transition-colors">
                    Local
                  </Button>
                </Link>
                <Link href="/incomplete">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-[#DC2626] dark:hover:text-[#DC2626] hover:bg-transparent font-semibold text-sm h-10 px-4 rounded-none border-b-2 border-transparent hover:border-[#DC2626] transition-colors">
                    Coverage Gaps
                  </Button>
                </Link>
                <Link href="/analyze">
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-[#DC2626] dark:hover:text-[#DC2626] hover:bg-transparent font-semibold text-sm h-10 px-4 rounded-none border-b-2 border-transparent hover:border-[#DC2626] transition-colors">
                    Analyze
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Search Icon */}
              <Link href="/search">
                <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>

              {user ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut} 
                    className="text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-sm text-gray-700 hover:text-gray-900">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-[#3366FF] hover:bg-[#2952CC] text-white text-sm font-semibold px-6">
                      Subscribe
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile Menu */}
              <Button variant="ghost" size="icon" className="lg:hidden text-gray-600">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

