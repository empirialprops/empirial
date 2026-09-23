'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Shield,
  Lock,
  Mail,
  User,
  Key,
  Save,
  Search,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  StaffProfile,
  StaffRole,
  getStoredStaffProfiles,
  saveStaffProfiles,
  addStaffProfile,
  updateStaffProfile,
  deleteStaffProfile,
  getRoleDisplayName,
} from '@/lib/utils/roles-store';
import { logAdminAction } from '@/lib/utils/audit-log-store';

export default function AdminRolesPage() {
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<StaffProfile | null>(null);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Form fields state
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<StaffRole>('data_entry');
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    setProfiles(getStoredStaffProfiles());

    const handleStaffChanged = (e: CustomEvent) => {
      if (e.detail) setProfiles(e.detail);
    };
    window.addEventListener('staff-profiles-changed' as any, handleStaffChanged);
    return () => window.removeEventListener('staff-profiles-changed' as any, handleStaffChanged);
  }, []);

  const handleOpenAddModal = () => {
    setEditingProfile(null);
    setFormEmail('');
    setFormPassword('');
    setFormName('');
    setFormRole('data_entry');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (profile: StaffProfile) => {
    setEditingProfile(profile);
    setFormEmail(profile.email);
    setFormPassword(profile.password || '');
    setFormName(profile.displayName);
    setFormRole(profile.role);
    setFormActive(profile.is_active);
    setIsModalOpen(true);
  };

  const handleSaveModalForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) return;

    if (editingProfile) {
      const updatedItem = {
        ...editingProfile,
        email: formEmail.trim().toLowerCase(),
        password: formPassword.trim() || editingProfile.password,
        displayName: formName.trim(),
        role: formRole,
        is_active: formActive,
        updated_at: new Date().toISOString(),
      };
      const updatedList = profiles.map((p) => (p.id === editingProfile.id ? updatedItem : p));
      setProfiles(updatedList);
      logAdminAction({
        action: `Updated Staff Role Profile: ${formName}`,
        module: 'roles',
        target_id: editingProfile.id,
        entity_name: formName,
        previous_state: editingProfile,
        new_state: updatedItem,
      });
    } else {
      const newStaff: StaffProfile = {
        id: `staff-${Date.now()}`,
        email: formEmail.trim().toLowerCase(),
        password: formPassword.trim() || 'EmpirialStaff@2026',
        displayName: formName.trim(),
        role: formRole,
        is_active: formActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfiles([newStaff, ...profiles]);
      logAdminAction({
        action: `Created Staff Role Profile: ${formName} (${formRole})`,
        module: 'roles',
        target_id: newStaff.id,
        entity_name: formName,
        previous_state: null,
        new_state: newStaff,
      });
    }

    setIsUnsaved(true);
    setIsModalOpen(false);
  };

  const handleDeleteProfile = (id: string) => {
    if (confirm('Are you sure you want to delete this staff profile?')) {
      const updated = profiles.filter((p) => p.id !== id);
      setProfiles(updated);
      setIsUnsaved(true);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = profiles.map((p) => {
      if (p.id === id) {
        return { ...p, is_active: !p.is_active, updated_at: new Date().toISOString() };
      }
      return p;
    });
    setProfiles(updated);
    setIsUnsaved(true);
  };

  const handleSaveChanges = () => {
    saveStaffProfiles(profiles);
    setIsUnsaved(false);
    setSaveSuccessMsg('Staff role profiles saved successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      {/* Top Header Section with Save Changes Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Staff & Role Profiles Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create logins and assign access powers for Admin, Data Entry, and Reviews Support teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isUnsaved && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Unsaved Changes
            </span>
          )}

          <button
            onClick={handleSaveChanges}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 shadow cursor-pointer ${
              isUnsaved
                ? 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Create Staff Profile</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>Total Accounts: {profiles.length}</span>
        </div>
      </div>

      {/* Roles Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Admin Card */}
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground border border-zinc-200 dark:border-zinc-700">
              Full Access
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">SUPER ADMIN</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Full master control across all system settings, CMS, firms, challenges, deals, and staff management.
            </p>
          </div>
        </div>

        {/* Data Entry Card */}
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground border border-zinc-200 dark:border-zinc-700">
              Content & Directory
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">DATA ENTRY</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Authorized to update & manage Prop Firms, Challenges, Offers, Events/Giveaways & Contact/About information.
            </p>
          </div>
        </div>

        {/* Reviews Support Card */}
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground border border-zinc-200 dark:border-zinc-700">
              User Support
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground">REVIEWS SUPPORT</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Authorized to view user support tickets, reply to messages, and moderate trader reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Staff Profiles Table */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Registered Staff Profiles</h2>
          <span className="text-xs text-muted-foreground">Showing {filteredProfiles.length} profiles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Login Email</th>
                <th className="p-4">Password</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-foreground font-medium">
              {filteredProfiles.map((profile) => {
                const isPasswordVisible = !!showPasswordMap[profile.id];
                return (
                  <tr key={profile.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold flex items-center justify-center text-xs">
                          {profile.displayName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold block text-sm">{profile.displayName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">ID: {profile.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-mono text-xs text-foreground">{profile.email}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-mono text-xs">
                          {isPasswordVisible ? profile.password || '••••••••' : '••••••••••••'}
                        </span>
                        <button
                          onClick={() => toggleShowPassword(profile.id)}
                          className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                          title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                        >
                          {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                          profile.role === 'admin'
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                            : profile.role === 'data_entry'
                            ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700'
                            : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 border-zinc-400 dark:border-zinc-700'
                        }`}
                      >
                        {getRoleDisplayName(profile.role)}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(profile.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                          profile.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {profile.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(profile)}
                          className="p-1.5 text-muted-foreground hover:text-foreground bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="p-1.5 text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Staff Profile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {editingProfile ? 'Edit Staff Profile' : 'Create Staff Profile'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Set up credentials and assign role permissions.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalForm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Staff Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Data Entry Officer - John"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Login Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="staff@empirial.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Login Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Set secure password..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Assigned Staff Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as StaffRole)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="data_entry">DATA ENTRY (Firms, Challenges, Deals, Events, Contact/About)</option>
                  <option value="reviews_support">REVIEWS SUPPORT (Support Inbox & Reviews Moderation)</option>
                  <option value="admin">SUPER ADMIN (Full Portal Master Access)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 accent-black dark:accent-white cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-foreground cursor-pointer">
                  Account Active & Enabled for Login
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-foreground font-medium text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs transition-all cursor-pointer shadow flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
