'use client';

import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, Database, AlertTriangle, Globe, Shield, ShieldCheck } from 'lucide-react';
import { seedDatabase } from '@/lib/firebase/seeder';
import { getSiteSettings, updateSiteSettings, invalidateSiteSettingsCache } from '@/lib/firebase/services';
import { syncAllExistingUsersToGoogleSheet, DEFAULT_SHEETS_WEBHOOK_URL } from '@/lib/firebase/sheets-sync';

export default function AdminSettingsPage() {
  const [sheetsSyncing, setSheetsSyncing] = useState(false);
  const [sheetsSyncMsg, setSheetsSyncMsg] = useState('');
  const [sheetsWebhookInput, setSheetsWebhookInput] = useState('');
  const [brandName, setBrandName] = useState('EMPIRIAL');
  const [shortName, setShortName] = useState('EMP');
  const [tagline, setTagline] = useState('Prop Trading Intelligence Matrix');
  const [copyrightText, setCopyrightText] = useState('© 2026 EMPIRIAL. All rights reserved.');
  const [contactEmail, setContactEmail] = useState('support@empirial.com');
  const [contactWhatsapp, setContactWhatsapp] = useState('+1 (555) 890-3674');
  const [contactWhatsappLink, setContactWhatsappLink] = useState('https://wa.me/15558903674');
  const [twitterUrl, setTwitterUrl] = useState('https://x.com/empirial');
  const [githubUrl, setTwitterGithub] = useState('https://github.com/empirial');
  const [discordUrl, setDiscordUrl] = useState('https://discord.gg/empirial');
  
  const [logoDark, setLogoDark] = useState('/logos/empirial-trident-dark.png');
  const [logoLight, setLogoLight] = useState('/logos/empirial-trident-light.png');
  const [favicon, setFavicon] = useState('/favicon.ico');

  const [maintenance, setMaintenance] = useState(false);
  const [eventPopup, setEventPopup] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Stats block states
  const [stat1Value, setStat1Value] = useState(50);
  const [stat1Suffix, setStat1Suffix] = useState('K+');
  const [stat1Label, setStat1Label] = useState('Active Traders');

  const [stat2Value, setStat2Value] = useState(40);
  const [stat2Suffix, setStat2Suffix] = useState('+');
  const [stat2Label, setStat2Label] = useState('Listed Firms');

  const [stat3Value, setStat3Value] = useState(12);
  const [stat3Suffix, setStat3Suffix] = useState('K+');
  const [stat3Label, setStat3Label] = useState('Community Reviews');

  const [stat4Value, setStat4Value] = useState(150);
  const [stat4Suffix, setStat4Suffix] = useState('+');
  const [stat4Label, setStat4Label] = useState('Active Challenges');

  // Contact Page Query Categories State
  const DEFAULT_QUERY_CATEGORIES = [
    'Prop Firm Audit Request',
    'Advertising & Promo Listing',
    'Payout Proof Dispute Verification',
    'Careers / Join EMPIRIAL Team',
    'General Support & Inquiry',
  ];
  const [queryCategories, setQueryCategories] = useState<string[]>(DEFAULT_QUERY_CATEGORIES);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getSiteSettings();
        if (settings) {
          setBrandName(settings.brandName || settings.footer?.brandName || 'EMPIRIAL');
          setShortName(settings.shortName || 'EMP');
          setTagline(settings.tagline || settings.footer?.tagline || 'Prop Trading Intelligence Matrix');
          setCopyrightText(settings.copyrightText || settings.footer?.copyrightText || '© 2026 EMPIRIAL. All rights reserved.');
          setContactEmail(settings.contactEmail || settings.contactPage?.email || 'support@empirial.com');
          setContactWhatsapp(settings.contactWhatsapp || settings.contactPage?.whatsapp || '+1 (555) 890-3674');
          setContactWhatsappLink(settings.contactWhatsappLink || settings.contactPage?.whatsappLink || 'https://wa.me/15558903674');
          setTwitterUrl(settings.twitterUrl || 'https://x.com/empirial');
          setTwitterGithub(settings.githubUrl || 'https://github.com/empirial');
          setDiscordUrl(settings.discordUrl || settings.contactPage?.discordUrl || 'https://discord.gg/empirial');
          setLogoDark(settings.logoDarkUrl || '/logos/empirial-trident-dark.png');
          setLogoLight(settings.logoLightUrl || '/logos/empirial-trident-light.png');
          setFavicon(settings.faviconUrl || '/favicon.ico');
          setMaintenance(settings.maintenanceMode ?? false);
          setEventPopup(settings.eventPopupEnabled ?? true);

          if (settings.sheetsWebhookUrl) {
            setSheetsWebhookInput(settings.sheetsWebhookUrl);
          }

          if (settings.contactPage?.queryCategories && settings.contactPage.queryCategories.length > 0) {
            setQueryCategories(settings.contactPage.queryCategories);
          }

          if (settings.stats && settings.stats.length >= 4) {
            setStat1Value(settings.stats[0].value);
            setStat1Suffix(settings.stats[0].suffix);
            setStat1Label(settings.stats[0].label);

            setStat2Value(settings.stats[1].value);
            setStat2Suffix(settings.stats[1].suffix);
            setStat2Label(settings.stats[1].label);

            setStat3Value(settings.stats[2].value);
            setStat3Suffix(settings.stats[2].suffix);
            setStat3Label(settings.stats[2].label);

            setStat4Value(settings.stats[3].value);
            setStat4Suffix(settings.stats[3].suffix);
            setStat4Label(settings.stats[3].label);
          }
        }
      } catch (err) {
        console.error('Failed to load site settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'dark' | 'light' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds the 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (target === 'dark') setLogoDark(base64String);
      else if (target === 'light') setLogoLight(base64String);
      else if (target === 'favicon') setFavicon(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      invalidateSiteSettingsCache();
      await updateSiteSettings({
        brandName,
        shortName,
        tagline,
        copyrightText,
        contactEmail,
        contactWhatsapp,
        contactWhatsappLink,
        twitterUrl,
        githubUrl,
        discordUrl,
        logoDarkUrl: logoDark,
        logoLightUrl: logoLight,
        faviconUrl: favicon,
        sheetsWebhookUrl: sheetsWebhookInput.trim(),
        footer: {
          brandName,
          tagline,
          copyrightText
        },
        contactPage: {
          email: contactEmail,
          whatsapp: contactWhatsapp,
          whatsappLink: contactWhatsappLink,
          discordUrl: discordUrl,
          queryCategories: queryCategories,
        },
        maintenanceMode: maintenance,
        eventPopupEnabled: eventPopup,
        stats: [
          { value: Number(stat1Value), suffix: stat1Suffix, label: stat1Label },
          { value: Number(stat2Value), suffix: stat2Suffix, label: stat2Label },
          { value: Number(stat3Value), suffix: stat3Suffix, label: stat3Label },
          { value: Number(stat4Value), suffix: stat4Suffix, label: stat4Label }
        ]
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleSyncExistingUsersToSheet = async () => {
    const targetUrl = sheetsWebhookInput.trim() || DEFAULT_SHEETS_WEBHOOK_URL;
    if (!targetUrl) {
      alert('Please enter your Google Apps Script Webhook URL first.');
      return;
    }
    setSheetsSyncing(true);
    setSheetsSyncMsg('');
    try {
      const res = await syncAllExistingUsersToGoogleSheet(targetUrl);
      if (res.success) {
        setSheetsSyncMsg(`Successfully exported ${res.count} existing user(s) to Google Sheet!`);
      } else {
        setSheetsSyncMsg(`Sync failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setSheetsSyncMsg(`Sync failed: ${err.message}`);
    } finally {
      setSheetsSyncing(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      await seedDatabase();
      setSeedSuccess(true);
    } catch (err) {
      console.error('Seeding failed:', err);
      alert('Firestore seeding failed. Please check console for configuration details.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Loading system parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold sm:text-2xl text-white">System Settings & Configuration</h1>
        <p className="text-xs text-slate-400 font-mono">Configure site branding, logos, social networks, and database seeder utilities.</p>
      </div>

      <form onSubmit={handleSave} className="bg-elevation-surface border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        
        {/* Core Site Brand Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Site Identity & Contact Channels</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Short Name</label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                required
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Contact & Support Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">WhatsApp Display Number</label>
              <input
                type="text"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                required
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">WhatsApp Chat Link (wa.me/...)</label>
              <input
                type="text"
                value={contactWhatsappLink}
                onChange={(e) => setContactWhatsappLink(e.target.value)}
                required
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Discord Server Link</label>
              <input
                type="text"
                value={discordUrl}
                onChange={(e) => setDiscordUrl(e.target.value)}
                required
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Tagline / Mission statement</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                required
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Copyright Footer Text</label>
              <input
                type="text"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                required
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Contact Page Inquiry Categories */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Contact Page Inquiry Categories (Select Dropdown Options)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure the categories available in the "Inquiry Category" select dropdown on the public Contact Page.
          </p>

          <div className="space-y-2 max-w-2xl">
            {queryCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-elevation-base border border-white/10 px-3 py-2 rounded-xl text-xs">
                <span className="flex-1 text-white font-medium">{cat}</span>
                <button
                  type="button"
                  onClick={() => setQueryCategories(queryCategories.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 font-semibold cursor-pointer transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-2xl">
            <input
              type="text"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="e.g. Sponsorship & Event Partnerships"
              className="flex-1 bg-elevation-base border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/30"
            />
            <button
              type="button"
              onClick={() => {
                if (newCategoryInput.trim()) {
                  setQueryCategories([...queryCategories, newCategoryInput.trim()]);
                  setNewCategoryInput('');
                }
              }}
              className="px-4 py-2 bg-white text-black font-semibold rounded-xl text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Add Category
            </button>
          </div>
        </div>

        {/* Dynamic Logo Management with Previews */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Logo & Favicon Asset Management</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Logo Light */}
            <div className="p-4 rounded-xl bg-elevation-base border border-white/10 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Logo Light Theme</span>
              <div className="w-full h-16 bg-white border border-zinc-200 rounded-lg flex items-center justify-center overflow-hidden p-2">
                <img src={logoLight} alt="Light Logo Preview" className="object-contain max-h-full" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'light')}
                className="w-full text-xs text-slate-300"
              />
            </div>

            {/* Logo Dark */}
            <div className="p-4 rounded-xl bg-elevation-base border border-white/10 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Logo Dark Theme</span>
              <div className="w-full h-16 bg-black border border-white/10 rounded-lg flex items-center justify-center overflow-hidden p-2">
                <img src={logoDark} alt="Dark Logo Preview" className="object-contain max-h-full" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'dark')}
                className="w-full text-xs text-slate-300"
              />
            </div>

            {/* Favicon */}
            <div className="p-4 rounded-xl bg-elevation-base border border-white/10 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Browser Favicon</span>
              <div className="w-full h-16 bg-elevation-card border border-white/10 rounded-lg flex items-center justify-center overflow-hidden p-2">
                <img src={favicon} alt="Favicon Preview" className="object-contain w-8 h-8" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'favicon')}
                className="w-full text-xs text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Social Networks Links */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Social Network URLs</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Twitter / X URL</label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">GitHub Organization URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setTwitterGithub(e.target.value)}
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">Discord Server URL</label>
              <input
                type="url"
                value={discordUrl}
                onChange={(e) => setDiscordUrl(e.target.value)}
                className="bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Homepage Statistics Block */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Homepage Statistics Block</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-xs">
            {/* Stat 1 */}
            <div className="p-4 rounded-xl bg-elevation-base border border-white/10 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Traders (Stat #1)</span>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Value (Number)</label>
                <input
                  type="number"
                  value={stat1Value}
                  onChange={(e) => setStat1Value(Number(e.target.value))}
                  required
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Suffix (e.g. K+, +)</label>
                <input
                  type="text"
                  value={stat1Suffix}
                  onChange={(e) => setStat1Suffix(e.target.value)}
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Label (Description)</label>
                <input
                  type="text"
                  value={stat1Label}
                  onChange={(e) => setStat1Label(e.target.value)}
                  required
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            {/* Stat 2 */}
            <div className="p-4 rounded-xl bg-elevation-base border border-white/10 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Listed Firms (Stat #2)</span>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Value (Number)</label>
                <input
                  type="number"
                  value={stat2Value}
                  onChange={(e) => setStat2Value(Number(e.target.value))}
                  required
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Suffix (e.g. +, %)</label>
                <input
                  type="text"
                  value={stat2Suffix}
                  onChange={(e) => setStat2Suffix(e.target.value)}
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Label (Description)</label>
                <input
                  type="text"
                  value={stat2Label}
                  onChange={(e) => setStat2Label(e.target.value)}
                  required
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            {/* Stat 3 */}
            <div className="p-4 rounded-xl bg-elevation-base border border-white/10 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Community Reviews (Stat #3)</span>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Value (Number)</label>
                <input
                  type="number"
                  value={stat3Value}
                  onChange={(e) => setStat3Value(Number(e.target.value))}
                  required
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Suffix (e.g. K+, +)</label>
                <input
                  type="text"
                  value={stat3Suffix}
                  onChange={(e) => setStat3Suffix(e.target.value)}
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Label (Description)</label>
                <input
                  type="text"
                  value={stat3Label}
                  onChange={(e) => setStat3Label(e.target.value)}
                  required
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            {/* Stat 4 */}
            <div className="p-4 rounded-xl bg-elevation-base border border-white/10 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Challenges (Stat #4)</span>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Value (Number)</label>
                <input
                  type="number"
                  value={stat4Value}
                  onChange={(e) => setStat4Value(Number(e.target.value))}
                  required
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Suffix (e.g. +, %)</label>
                <input
                  type="text"
                  value={stat4Suffix}
                  onChange={(e) => setStat4Suffix(e.target.value)}
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-medium">Label (Description)</label>
                <input
                  type="text"
                  value={stat4Label}
                  onChange={(e) => setStat4Label(e.target.value)}
                  required
                  className="bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Popup Settings & Maintenance */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Security & Interactivity Controls</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Event Popup Modal</span>
                <span className="text-[11px] text-slate-400">Show tournament registration banner on homepage load.</span>
              </div>
              <input
                type="checkbox"
                checked={eventPopup}
                onChange={(e) => setEventPopup(e.target.checked)}
                className="w-4 h-4 accent-white rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Maintenance Mode</span>
                <span className="text-[11px] text-slate-400">Temporarily restrict public access during scheduled database migrations.</span>
              </div>
              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
                className="w-4 h-4 accent-white rounded"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          {saved && (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs ml-auto shadow cursor-pointer transition-colors"
          >
            Save System Settings
          </button>
        </div>
      </form>

      {/* Database Seeding Utility */}
      <div className="bg-elevation-surface border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-white">Database & Seeding Utilities</h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          If your Cloud Firestore database collections are empty, trigger the automated seeding pipeline below to populate it with all pre-structured mock records for Firms, Challenges, Blog Guides, Tournaments, and Spread telemetry.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
          <div className="flex items-start gap-2 text-amber-400/90 leading-normal max-w-xl">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Seeding will automatically create collections and write documents. It will check if documents already exist before writing to avoid duplicate keys.
            </span>
          </div>

          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap shadow cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 ${
              seeding
                ? 'bg-amber-800 text-amber-300 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-black font-bold'
            }`}
          >
            {seeding ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                <span>Seeding Database...</span>
              </>
            ) : (
              <span>Seed Firestore Database</span>
            )}
          </button>
        </div>

        {seedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>All mock records successfully seeded into Firestore!</span>
          </div>
        )}
      </div>

      {/* Google Sheets Bulk Export Utility */}
      <div className="bg-elevation-surface border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Google Sheets User Export & Sync</h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Export all previously registered users from Firestore to your Google Sheet (<code className="text-white font-mono">1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA</code>) using your deployed Google Apps Script Webhook.
        </p>

        <div className="space-y-3">
          <label className="text-xs text-slate-400 font-medium block">Google Apps Script Webhook URL</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={sheetsWebhookInput}
              onChange={(e) => setSheetsWebhookInput(e.target.value)}
              placeholder={DEFAULT_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/.../exec"}
              className="flex-1 bg-elevation-base border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-white/30"
            />
            <button
              type="button"
              onClick={handleSyncExistingUsersToSheet}
              disabled={sheetsSyncing}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap shadow cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                sheetsSyncing
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-white hover:bg-zinc-200 text-black font-bold'
              }`}
            >
              {sheetsSyncing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                  <span>Exporting Users...</span>
                </>
              ) : (
                <span>Sync All Existing Users to Sheet</span>
              )}
            </button>
          </div>
        </div>

        {sheetsSyncMsg && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
            sheetsSyncMsg.includes('Successfully')
              ? 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/5 border border-red-500/20 text-red-400'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>{sheetsSyncMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
