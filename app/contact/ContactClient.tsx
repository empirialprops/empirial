'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Send, CheckCircle2, MessageSquare, Phone, ExternalLink, Ticket, MessageCircle, X, Shield, Sparkles } from 'lucide-react';
import { getStoredUser, openAuthModal, addSupportTicket } from '@/lib/utils/auth-store';
import { getSiteSettings } from '@/lib/firebase/services';

const DEFAULT_QUERY_CATEGORIES = [
  'Prop Firm Audit Request',
  'Advertising & Promo Listing',
  'Payout Proof Dispute Verification',
  'Careers / Join EMPIRIAL Team',
  'General Support & Inquiry',
];

export function ContactClient() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSiteSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error('Failed to load settings on Contact page:', err);
      }
    }
    loadData();
  }, []);

  const contactData = settings?.contactPage || {};
  const pageTitle = contactData.title || 'Contact EMPIRIAL Desk';
  const pageSubtitle = contactData.subtitle || 'Have an inquiry, partnership proposal, or want your prop firm audited? Reach out directly to our team through any of our official channels.';
  const emailAddr = contactData.email || settings?.contactEmail || 'support@empirialprops.com';
  const whatsappNum = contactData.whatsapp || '+1 (555) 890-EMPIRE';
  const whatsappLink = contactData.whatsappLink || 'https://wa.me/15558903674';
  const discordUrl = contactData.discordUrl || settings?.discordUrl || 'https://discord.gg/ww4dkeeZdp';

  const queryCategories = (contactData.queryCategories && contactData.queryCategories.length > 0)
    ? contactData.queryCategories
    : DEFAULT_QUERY_CATEGORIES;

  // Set default selected query category if not already set
  useEffect(() => {
    if (!subject && queryCategories.length > 0) {
      setSubject(queryCategories[0]);
    }
  }, [queryCategories, subject]);

  const openEmailClient = (toEmail: string, subjectStr = '', bodyStr = '') => {
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(subjectStr)}&body=${encodeURIComponent(bodyStr)}`;
    const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subjectStr)}&body=${encodeURIComponent(bodyStr)}`;

    if (isMobile) {
      window.location.href = mailtoUrl;
    } else {
      window.open(gmailUrl, '_blank');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = getStoredUser();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const formattedSubject = `[EMPIRIAL Inquiry: ${subject || queryCategories[0]}] - From ${name.trim()}`;
    const formattedBody = `Hello EMPIRIAL Support Desk,\n\nName: ${name.trim()}\nUser Email: ${email.trim()}\nInquiry Category: ${subject || queryCategories[0]}\n\nQuery & Message:\n${message.trim()}\n\n---\nSubmitted via EMPIRIAL Contact Hub`;

    try {
      addSupportTicket({
        user_id: user.uid,
        user_name: name.trim(),
        user_email: email.trim(),
        subject: subject || queryCategories[0],
        priority: 'normal',
        category: subject.toLowerCase().includes('payout') ? 'payouts' : 'general',
        initialMessage: message.trim(),
      });
    } catch (err) {
      console.warn('Saved ticket locally fallback:', err);
    }

    // Redirect to Gmail web tab or native mobile mail app with details prefilled
    openEmailClient(emailAddr, formattedSubject, formattedBody);

    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* 1. HEADER (Monochrome B&W Theme - RULE:BW) */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground text-xs font-semibold">
          <Mail className="w-3.5 h-3.5" />
          <span>CONTACT & SUPPORT HUB</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {pageSubtitle}
        </p>
      </div>

      {/* 2. CONTACT OPTIONS GRID (Email, WhatsApp, Discord Ticket, Live Chat) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Email Card (Requirement 1: Redirects to Gmail tab / mobile mail app) */}
        <div 
          onClick={() => openEmailClient(emailAddr, 'EMPIRIAL Official Inquiry', 'Hello EMPIRIAL Team,\n\n')}
          className="p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <div className="font-semibold text-sm text-foreground">Email Desk</div>
            <p className="text-xs text-muted-foreground leading-normal">
              Direct inbox for audits, disputes, and official business.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-xs font-mono font-medium text-foreground group-hover:underline break-all">
            <span>{emailAddr}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </div>
        </div>

        {/* WhatsApp Card (Requirement 2: Redirects to WhatsApp wa.me link) */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <Phone className="w-4 h-4" />
            </div>
            <div className="font-semibold text-sm text-foreground">WhatsApp Hotline</div>
            <p className="text-xs text-muted-foreground leading-normal">
              Fast messaging for instant audit updates & general inquiries.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground group-hover:underline">
            <span>{whatsappNum}</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </a>

        {/* Discord Ticket Card (Requirement 3: Kept as is) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground">
              <Ticket className="w-4 h-4" />
            </div>
            <div className="font-semibold text-sm text-foreground">Discord Ticket</div>
            <p className="text-xs text-muted-foreground leading-normal">
              Create a private support ticket in our official Discord server.
            </p>
          </div>
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold w-fit transition-colors"
          >
            <span>Create Ticket</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Live Chat Card (Requirement 4: Redirects to Traders Dashboard Contact Support) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Live Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Instant web chat with our support desk & live analysts.
            </p>
          </div>
          <Link
            href="/profile?tab=support"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground hover:border-black dark:hover:border-white text-xs font-semibold w-fit transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Start Live Chat</span>
          </Link>
        </div>
      </div>

      {/* 3. INQUIRY & AUDIT REQUEST FORM (Requirement 5: B&W Styling + Prefilled Gmail/Mail App Redirect) */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Send Us a Direct Message</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Fill out the details below. Submitting will register your inquiry and open a pre-filled email draft to our support desk.
          </p>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground mx-auto">
              <CheckCircle2 className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Inquiry Registered & Email Prepared!</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your inquiry has been recorded. Your browser/device mail app has opened with your query prefilled to <strong className="text-foreground">{emailAddr}</strong>.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openEmailClient(emailAddr, `[EMPIRIAL Inquiry: ${subject}] - From ${name}`, `Hello EMPIRIAL Support Desk,\n\nName: ${name}\nUser Email: ${email}\nInquiry Category: ${subject}\n\nQuery:\n${message}\n`)}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-foreground text-xs font-semibold hover:border-black dark:hover:border-white transition-colors"
              >
                Re-open Gmail / Mail App
              </button>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Send Another Message
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Miller"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@example.com"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Select Your Query Dropdown (Enhanced B&W Theme styling & admin-customizable options) */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Select Your Query Category</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-medium text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer shadow-xs"
              >
                {queryCategories.map((cat: string, idx: number) => (
                  <option key={idx} value={cat} className="bg-white dark:bg-zinc-900 text-foreground py-1">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Message Details</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Provide detailed information regarding your request..."
                required
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Mail & Open Gmail</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
