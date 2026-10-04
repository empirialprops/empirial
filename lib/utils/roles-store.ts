export type StaffRole = 'admin' | 'data_entry' | 'reviews_support';

export interface StaffPermissions {
  manage_firms?: boolean;
  manage_platforms?: boolean;
  manage_challenges?: boolean;
  manage_deals?: boolean;
  manage_events?: boolean;
  manage_reviews?: boolean;
  manage_messages?: boolean;
  manage_cms?: boolean;
  manage_staff?: boolean;
  manage_settings?: boolean;
  manage_spreads?: boolean;
  manage_blog?: boolean;
}

export const DEFAULT_ROLE_PERMISSIONS: Record<StaffRole, StaffPermissions> = {
  admin: {
    manage_firms: true,
    manage_platforms: true,
    manage_challenges: true,
    manage_deals: true,
    manage_events: true,
    manage_reviews: true,
    manage_messages: true,
    manage_cms: true,
    manage_staff: true,
    manage_settings: true,
    manage_spreads: true,
    manage_blog: true,
  },
  data_entry: {
    manage_firms: true,
    manage_platforms: true,
    manage_challenges: true,
    manage_deals: true,
    manage_events: true,
    manage_reviews: false,
    manage_messages: false,
    manage_cms: false,
    manage_staff: false,
    manage_settings: false,
    manage_spreads: true,
    manage_blog: true,
  },
  reviews_support: {
    manage_firms: false,
    manage_platforms: false,
    manage_challenges: false,
    manage_deals: false,
    manage_events: false,
    manage_reviews: true,
    manage_messages: true,
    manage_cms: false,
    manage_staff: false,
    manage_settings: false,
    manage_spreads: false,
    manage_blog: false,
  },
};

export interface StaffProfile {
  id: string;
  email: string;
  password?: string;
  displayName: string;
  role: StaffRole;
  permissions?: StaffPermissions;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function hasStaffPermission(
  profile: StaffProfile | { role?: string; permissions?: StaffPermissions } | null | undefined,
  permission: keyof StaffPermissions
): boolean {
  if (!profile) return false;
  const role = (profile.role || 'data_entry') as StaffRole;
  if (role === 'admin' || (profile as any).role === 'super_admin') return true;
  if (profile.permissions && profile.permissions[permission] !== undefined) {
    return !!profile.permissions[permission];
  }
  return !!DEFAULT_ROLE_PERMISSIONS[role]?.[permission];
}

export const INITIAL_STAFF_PROFILES: StaffProfile[] = [
  {
    id: 'staff-001',
    email: 'admin@empirial.com',
    password: 'AdminMaster@2026',
    displayName: 'Super Admin',
    role: 'admin',
    permissions: DEFAULT_ROLE_PERMISSIONS.admin,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'staff-002',
    email: 'admin@anurajfx.com',
    password: 'Anuraj@admin12145',
    displayName: 'Master Admin (Anuraj)',
    role: 'admin',
    permissions: DEFAULT_ROLE_PERMISSIONS.admin,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'staff-003',
    email: 'dataentry@empirial.com',
    password: 'DataEntry@2026',
    displayName: 'Data Entry Officer',
    role: 'data_entry',
    permissions: DEFAULT_ROLE_PERMISSIONS.data_entry,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'staff-004',
    email: 'support@empirial.com',
    password: 'Support@2026',
    displayName: 'Reviews & Support Agent',
    role: 'reviews_support',
    permissions: DEFAULT_ROLE_PERMISSIONS.reviews_support,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function getStoredStaffProfiles(): StaffProfile[] {
  if (typeof window === 'undefined') return INITIAL_STAFF_PROFILES;
  const saved = localStorage.getItem('empirial_staff_profiles');
  if (!saved) {
    localStorage.setItem('empirial_staff_profiles', JSON.stringify(INITIAL_STAFF_PROFILES));
    return INITIAL_STAFF_PROFILES;
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_STAFF_PROFILES;
  } catch (e) {
    return INITIAL_STAFF_PROFILES;
  }
}

export function saveStaffProfiles(profiles: StaffProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('empirial_staff_profiles', JSON.stringify(profiles));
  window.dispatchEvent(new CustomEvent('staff-profiles-changed', { detail: profiles }));

  // Asynchronously sync staff roles to Firestore if available
  import('@/lib/firebase/config').then(({ db }) => {
    if (db) {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        profiles.forEach((profile) => {
          const docRef = doc(db, 'staff_roles', profile.id);
          setDoc(docRef, {
            id: profile.id,
            email: profile.email.toLowerCase(),
            displayName: profile.displayName,
            role: profile.role,
            is_active: profile.is_active,
            updated_at: profile.updated_at,
          }, { merge: true }).catch((err) => {
            console.warn('Silent Firestore staff profile sync failed:', err);
          });
        });
      });
    }
  }).catch((err) => {
    console.warn('Firebase config import error during staff sync:', err);
  });
}

export function authenticateStaffCredentials(emailInput: string, passwordInput: string): StaffProfile | null {
  const profiles = getStoredStaffProfiles();
  const normalizedEmail = emailInput.trim().toLowerCase();

  const found = profiles.find((p) => p.email.toLowerCase() === normalizedEmail);
  if (!found) return null;

  if (!found.is_active) return null;

  if (found.password && found.password !== passwordInput) {
    return null;
  }

  return found;
}

export function addStaffProfile(profileData: Omit<StaffProfile, 'id' | 'created_at' | 'updated_at'>): StaffProfile {
  const current = getStoredStaffProfiles();
  const newProfile: StaffProfile = {
    ...profileData,
    id: `staff-${Date.now()}`,
    email: profileData.email.trim().toLowerCase(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated = [newProfile, ...current];
  saveStaffProfiles(updated);
  return newProfile;
}

export function updateStaffProfile(id: string, updates: Partial<StaffProfile>): StaffProfile | null {
  const current = getStoredStaffProfiles();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedProfile: StaffProfile = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.email) {
    updatedProfile.email = updates.email.trim().toLowerCase();
  }

  current[index] = updatedProfile;
  saveStaffProfiles(current);
  return updatedProfile;
}

export function deleteStaffProfile(id: string): boolean {
  const current = getStoredStaffProfiles();
  const updated = current.filter((p) => p.id !== id);
  if (updated.length === current.length) return false;
  saveStaffProfiles(updated);
  return true;
}

export function getRoleDisplayName(role: StaffRole): string {
  switch (role) {
    case 'admin':
      return 'Super Admin';
    case 'data_entry':
      return 'Data Entry Officer';
    case 'reviews_support':
      return 'Reviews & Support';
    default:
      return 'Staff';
  }
}
