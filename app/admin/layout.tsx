'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { getStoredUser, logoutUser } from '@/lib/utils/auth-store';
import { getRoleDisplayName } from '@/lib/utils/roles-store';
import {
  Shield,
  LayoutDashboard,
  Building2,
  Trophy,
  Tag,
  Star,
  Calendar,
  Mail,
  Sliders,
  Image as ImageIcon,
  Settings,
  ArrowLeft,
  UserCheck,
  Lock,
  History,
} from 'lucide-react';

interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  roles: string[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local stored session first
    const storedUser = getStoredUser();
    if (storedUser && ['admin', 'super_admin', 'data_entry', 'reviews_support'].includes(storedUser.role)) {
      setCurrentUser(storedUser);
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          if (db) {
            const adminDocRef = doc(db, 'admins', user.uid);
            try {
              const adminDoc = await getDoc(adminDocRef);
              if (adminDoc.exists()) {
                if (adminDoc.data().is_active === true) {
                  setCurrentUser({ ...user, role: adminDoc.data().role || 'admin' });
                } else {
                  console.warn('User is deactivated.');
                  setCurrentUser(null);
                  await signOut(auth);
                }
              } else if (user.email === 'admin@empirial.com' || user.email === 'admin@anurajfx.com') {
                setCurrentUser({ ...user, role: 'admin' });
              } else {
                setCurrentUser({ ...user, role: 'admin' });
              }
            } catch (firestoreErr) {
              setCurrentUser({ ...user, role: 'admin' });
            }
          } else {
            setCurrentUser({ ...user, role: 'admin' });
          }
        } catch (err) {
          console.error('Error verifying whitelist:', err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const allNavItems: AdminNavItem[] = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard, roles: ['admin', 'super_admin', 'data_entry', 'reviews_support'] },
    { name: 'Prop Firms Directory', href: '/admin/firms', icon: Building2, roles: ['admin', 'super_admin', 'data_entry'] },
    { name: 'Evaluation Challenges', href: '/admin/challenges', icon: Trophy, roles: ['admin', 'super_admin', 'data_entry'] },
    { name: 'Discount Promo Deals', href: '/admin/deals', icon: Tag, roles: ['admin', 'super_admin', 'data_entry'] },
    { name: 'Tournaments & Events', href: '/admin/events', icon: Calendar, roles: ['admin', 'super_admin', 'data_entry'] },
    { name: 'Reviews Moderation', href: '/admin/reviews', icon: Star, roles: ['admin', 'super_admin', 'reviews_support'] },
    { name: 'Support Inbox', href: '/admin/messages', icon: Mail, roles: ['admin', 'super_admin', 'reviews_support'] },
    { name: 'Home Page CMS', href: '/admin/page-builder', icon: Sliders, roles: ['admin', 'super_admin'] },
    { name: 'Media Library', href: '/admin/media', icon: ImageIcon, roles: ['admin', 'super_admin'] },
    { name: 'Staff & Role Profiles', href: '/admin/roles', icon: UserCheck, roles: ['admin', 'super_admin'] },
    { name: 'Audit Logs & Undo', href: '/admin/logs', icon: History, roles: ['admin', 'super_admin'] },
    { name: 'System Settings', href: '/admin/settings', icon: Settings, roles: ['admin', 'super_admin', 'data_entry'] },
  ];

  const userRole = currentUser?.role || 'admin';
  const allowedNav = allNavItems.filter((item) => item.roles.includes(userRole));

  // Route protection
  useEffect(() => {
    if (!loading) {
      if (!currentUser && pathname !== '/admin/login') {
        router.push('/admin/login');
        return;
      }

      if (currentUser && pathname !== '/admin/login') {
        const targetNav = allNavItems.find((item) => item.href === pathname);
        if (targetNav && !targetNav.roles.includes(userRole)) {
          const fallback = allowedNav[0]?.href || '/admin';
          router.push(fallback);
        }
      }
    }
  }, [currentUser, loading, pathname, router, userRole]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        <span className="text-xs text-zinc-500 font-mono">Authenticating session & role permissions...</span>
      </div>
    );
  }

  const handleLogout = async () => {
    logoutUser();
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {}
    }
    router.push('/admin/login');
  };

  const roleLabel = getRoleDisplayName(userRole);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row admin-portal-bw font-sans">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-black border-r border-zinc-800 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Top Admin Badge */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white text-black font-bold flex items-center justify-center text-xs">
                <Shield className="w-4 h-4 fill-black" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight block">EMPIRIAL PORTAL</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-300 inline-block mt-0.5 uppercase tracking-wider">
                  {roleLabel}
                </span>
              </div>
            </div>

            <Link href="/" className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-900 transition-colors" title="Exit to Public Site">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {allowedNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-black border border-white font-bold shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-zinc-800 text-white border border-zinc-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 truncate max-w-[140px]">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white border border-zinc-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {currentUser?.displayName?.substring(0, 2) || 'AD'}
            </div>
            <div className="truncate">
              <span className="font-bold text-white block truncate text-xs">{currentUser?.displayName || currentUser?.email || 'Staff'}</span>
              <span className="text-[10px] text-zinc-400 font-mono block truncate">{currentUser?.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors uppercase bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1.5 rounded-xl cursor-pointer shrink-0"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-5 sm:p-8 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
