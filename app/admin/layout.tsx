'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

const STAFF_ROLES = ['admin', 'super_admin', 'data_entry', 'reviews_support'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const stored = getStoredUser();
    return stored && STAFF_ROLES.includes(stored.role) ? stored : null;
  });
  const [loading, setLoading] = useState(true);

  const syncUserSession = useCallback(() => {
    const storedUser = getStoredUser();
    if (storedUser && STAFF_ROLES.includes(storedUser.role)) {
      setCurrentUser(storedUser);
      setLoading(false);
      return storedUser;
    }
    return null;
  }, []);

  useEffect(() => {
    // 1. Check local stored session first
    const local = syncUserSession();
    if (local) {
      setLoading(false);
    }

    // 2. Listen to custom auth events and storage events
    const handleAuthEvent = (e?: any) => {
      const updated = e?.detail || getStoredUser();
      if (updated && STAFF_ROLES.includes(updated.role)) {
        setCurrentUser(updated);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    window.addEventListener('auth-changed', handleAuthEvent);
    window.addEventListener('storage', handleAuthEvent);

    if (!auth) {
      setLoading(false);
      return () => {
        window.removeEventListener('auth-changed', handleAuthEvent);
        window.removeEventListener('storage', handleAuthEvent);
      };
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
          const fallback = getStoredUser();
          if (!fallback || !STAFF_ROLES.includes(fallback.role)) {
            setCurrentUser(null);
          }
        }
      } else {
        const fallback = getStoredUser();
        if (!fallback || !STAFF_ROLES.includes(fallback.role)) {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      window.removeEventListener('auth-changed', handleAuthEvent);
      window.removeEventListener('storage', handleAuthEvent);
      unsubscribe();
    };
  }, [pathname, syncUserSession]);

  const allNavItems: AdminNavItem[] = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard, roles: ['admin', 'super_admin', 'data_entry', 'reviews_support'] },
    { name: 'Prop Firms Directory', href: '/admin/firms', icon: Building2, roles: ['admin', 'super_admin', 'data_entry'] },
    { name: 'Evaluation Challenges', href: '/admin/challenges', icon: Trophy, badge: 'Portal', roles: ['admin', 'super_admin', 'data_entry'] },
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
      const activeUser = currentUser || getStoredUser();
      const isStaff = activeUser && STAFF_ROLES.includes(activeUser.role);

      if (!isStaff && pathname !== '/admin/login') {
        router.replace('/admin/login');
        return;
      }

      if (isStaff && pathname === '/admin/login') {
        router.replace('/admin');
        return;
      }

      if (isStaff && pathname !== '/admin/login') {
        const targetNav = allNavItems.find((item) => item.href === pathname);
        if (targetNav && !targetNav.roles.includes(activeUser.role)) {
          const fallback = allowedNav[0]?.href || '/admin';
          router.replace(fallback);
        }
      }
    }
  }, [currentUser, loading, pathname, router, userRole, allowedNav]);

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
    setCurrentUser(null);
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {}
    }
    router.replace('/admin/login');
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
