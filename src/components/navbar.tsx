// @ts-nocheck -- ported legacy code; typed loosely in the original project

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ThemeSwitcher from "@/components/theme-switcher";
import {
  ChevronDownIcon,
  PersonIcon,
  TimerIcon,
  HamburgerMenuIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";
import { User, LogOut, ShieldCheck, Ticket, Star, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { openAuthModal, getStoredUser, logoutUser, UserProfile, DEMO_TRADER, saveUser } from "@/lib/utils/auth-store";
import { AuthModal } from "@/components/auth-modal";
import { LogoTridentE } from "@/components/ui/logo-trident-e";

import { EmpirialLogo } from "@/components/ui/empirial-logo";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const discordMock = urlParams.get("discord_mock");
    const discordToken = urlParams.get("discord_token");

    if (discordMock) {
      // Clean mock variables from the URL immediately
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);

      const mockUid = urlParams.get("discord_uid") || "discord:sandbox";
      const mockUsername = urlParams.get("discord_username") || "Discord Sandbox Trader";
      const mockEmail = urlParams.get("discord_email") || "sandbox@discord.gg";
      const mockAvatar = urlParams.get("discord_avatar") || undefined;

      const userProfile: UserProfile = {
        uid: mockUid,
        displayName: mockUsername,
        email: mockEmail,
        phoneNumber: "",
        role: "trader",
        traderId: `EMP-${mockUid.substring(8, 13).toUpperCase()}`,
        referral_code: `EMP-${mockUid.substring(8, 13).toUpperCase()}`,
        avatarUrl: mockAvatar,
        points: 0,
        accountsPurchased: [],
        country: "Global",
        discordHandle: `@${mockUsername.toLowerCase().replace(/\s+/g, "_")}`,
        bio: "",
      };
      saveUser(userProfile);
      setCurrentUser(userProfile);
    } else if (discordToken) {
      // Clean token from the URL immediately
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);

      // Perform custom token login
      (async () => {
        try {
          const { signInWithCustomToken } = await import("firebase/auth");
          const { auth } = await import("@/lib/firebase/config");
          const { DEFAULT_PURCHASED_ACCOUNTS } = await import("@/lib/utils/auth-store");
          
          const result = await signInWithCustomToken(auth, discordToken);
          const user = result.user;

          const userProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || "Discord Trader",
            email: user.email || "trader@discord.gg",
            phoneNumber: "",
            role: "trader",
            traderId: `EMP-${user.uid.substring(0, 5).toUpperCase()}`,
            avatarUrl: user.photoURL || undefined,
            points: 0,
            accountsPurchased: DEFAULT_PURCHASED_ACCOUNTS,
            country: "Global",
            discordHandle: user.displayName ? `@${user.displayName.toLowerCase().replace(/\s+/g, "_")}` : undefined,
            bio: "",
          };
          saveUser(userProfile);
          setCurrentUser(userProfile);
        } catch (err) {
          console.error("Failed to sign in with Discord custom token:", err);
        }
      })();
    } else {
      // Check initial user from localStorage
      const user = getStoredUser();
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    }

    const handleAuthChange = (e: CustomEvent) => {
      setCurrentUser(e.detail || null);
    };

    window.addEventListener("auth-changed" as any, handleAuthChange);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("auth-changed" as any, handleAuthChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navItems = [
    { name: "Prop Firms", href: "/firms" },
    { name: "Offers", href: "/deals" },
    { name: "Challenges", href: "/challenges" },
    { name: "State Hall", href: "/blog" },
    { name: "Compare", href: "/compare" },
  ];

  const browseItems = [
    {
      title: "Reviews",
      desc: "Verified trader ratings & feedback",
      href: "/reviews",
      icon: <PersonIcon className="mr-2.5 h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />,
    },
    {
      title: "Events & Giveaway",
      desc: "Tournaments, gaming & bootcamps",
      href: "/events",
      icon: <TimerIcon className="mr-2.5 h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />,
    },
    {
      title: "Contact & Desk",
      desc: "Email, WhatsApp, Discord & Live Chat",
      href: "/contact",
      icon: <Ticket className="mr-2.5 h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />,
    },
  ];

  const showNavbarBlur = isScrolled || isMenuOpen;

  return (
    <>
      <AuthModal />
      <nav
        className={`sticky top-0 z-50 w-full transition-[background-color,backdrop-filter] duration-300 ease-out ${
          showNavbarBlur
            ? "backdrop-blur-md bg-background/80 border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            <div className="flex sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative"
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {isMenuOpen ? <Cross1Icon /> : <HamburgerMenuIcon />}
                </motion.div>
              </Button>
            </div>

            {/* Brand Name (Mobile) */}
            <div className="flex sm:hidden">
              <EmpirialLogo height={32} textSize="text-lg font-bold" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-6 md:space-x-8">
              <EmpirialLogo height={36} />

              {navItems.map((item) => (
                <Button asChild key={item.name} variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-foreground">
                  <Link href={item.href}>{item.name}</Link>
                </Button>
              ))}

              {/* Browse Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-foreground">
                    Browse
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 p-1.5 rounded-2xl bg-white dark:bg-[#141414] backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-0.5">
                  {browseItems.map((item) => (
                    <DropdownMenuItem
                      key={item.title}
                      asChild
                      className="group p-2.5 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 focus:bg-zinc-100 dark:focus:bg-zinc-800/80 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800/80 transition-colors outline-none"
                    >
                      <Link href={item.href} className="flex items-start w-full">
                        {item.icon}
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">
                            {item.title}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                            {item.desc}
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right Action: Connect / Profile & Theme Switcher */}
            <div className="flex items-center space-x-3">
              {currentUser ? (
                /* Connected State: PROFILE button with Avatar */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all shadow-xs cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-zinc-800 dark:bg-zinc-200 overflow-hidden flex items-center justify-center text-[10px] font-extrabold shrink-0 border border-white/20 dark:border-black/20">
                        {currentUser.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{currentUser.displayName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold tracking-tight truncate max-w-[100px]">
                        {currentUser.displayName.toUpperCase()}
                      </span>
                      <ChevronDownIcon className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-1.5 rounded-2xl bg-white dark:bg-[#141414] backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-0.5">
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 mb-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground truncate">{currentUser.displayName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                    </div>

                    <DropdownMenuItem asChild className="p-2 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 focus:bg-zinc-100 dark:focus:bg-zinc-800/80 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800/80 transition-colors outline-none">
                      <Link href="/profile" className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        <User className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                        <span>Trader Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="p-2 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 focus:bg-zinc-100 dark:focus:bg-zinc-800/80 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800/80 transition-colors outline-none">
                      <Link href="/profile" className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        <Star className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                        <span>My Reviews</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="p-2 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 focus:bg-zinc-100 dark:focus:bg-zinc-800/80 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800/80 transition-colors outline-none">
                      <Link href="/profile" className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        <Calendar className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                        <span>Registered Events</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="p-2 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 focus:bg-zinc-100 dark:focus:bg-zinc-800/80 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800/80 transition-colors outline-none">
                      <Link href="/profile" className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        <Ticket className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                        <span>Contact Support</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />

                    <DropdownMenuItem
                      onClick={() => logoutUser()}
                      className="p-2 rounded-xl cursor-pointer text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:bg-rose-50 dark:focus:bg-rose-950/40 data-[highlighted]:bg-rose-50 dark:data-[highlighted]:bg-rose-950/40 transition-colors outline-none flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect Wallet / Account</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* Disconnected State: Connect Button */
                <Button
                  onClick={openAuthModal}
                  className="hidden sm:inline-flex items-center gap-2 rounded-xl font-semibold px-4 h-9 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer text-xs"
                  size="sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </Button>
              )}

              <ThemeSwitcher />
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="sm:hidden overflow-hidden"
              >
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  exit={{ y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="px-2 pt-2 pb-4 space-y-1"
                >
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className="block px-3 py-2 text-base font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}

                  <div className="pt-2 border-t border-border">
                    <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Browse
                    </div>
                    {browseItems.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-xl transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="pt-3">
                    {currentUser ? (
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors shadow-xs"
                      >
                        <div className="w-5 h-5 rounded bg-zinc-800 dark:bg-zinc-200 overflow-hidden flex items-center justify-center text-[10px] shrink-0">
                          {currentUser.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt={currentUser.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{currentUser.displayName.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span>PROFILE ({currentUser.displayName})</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          openAuthModal();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors shadow-xs"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="size-4 shrink-0"
                        >
                          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
}
