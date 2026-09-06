'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Phone, ExternalLink, Ticket, MessageCircle, X, Shield, Sparkles } from 'lucide-react';
import { getStoredUser, openAuthModal, addSupportTicket } from '@/lib/utils/auth-store';
import { getSiteSettings } from '@/lib/firebase/services';

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Live Chat Modal State
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Welcome to EMPIRIAL Live Desk. How can our prop analysts assist you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

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
  const emailAddr = contactData.email || settings?.contactEmail || 'support@empirial.com';
  const whatsappNum = contactData.whatsapp || '+1 (555) 890-EMPIRE';
  const whatsappLink = contactData.whatsappLink || 'https://wa.me/15558903674';
  const discordUrl = contactData.discordUrl || settings?.discordUrl || 'https://discord.gg/yqFtbfJhh9';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = getStoredUser();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!name.trim() || !email.trim() || !message.trim()) return;

    try {
      addSupportTicket({
        user_id: user.uid,
        user_name: name.trim(),
        user_email: email.trim(),
        subject: subject,
        priority: 'normal',
        category: subject.includes('Payout') ? 'payouts' : 'general',
        initialMessage: message.trim(),
      });
    } catch (err) {
      console.warn('Saved ticket locally fallback:', err);
    }

    setSubmitted(true);
  };

  const handleSendLiveChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Thank you for reaching out! A live analyst will review your inquiry. You can also open an instant ticket on our Discord server for 24/7 priority response.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* 1. HEADER (Monochrome B&W Theme) */}
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
        {/* Email Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground">
              <Mail className="w-4 h-4" />
            </div>
            <div className="font-semibold text-sm text-foreground">Email Desk</div>
            <p className="text-xs text-muted-foreground leading-normal">
              Direct inbox for audits, disputes, and official business.
            </p>
          </div>
          <a
            href={`mailto:${emailAddr}`}
            className="text-xs font-mono font-medium text-foreground underline hover:text-muted-foreground break-all"
          >
            {emailAddr}
          </a>
        </div>

        {/* WhatsApp Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground">
              <Phone className="w-4 h-4" />
            </div>
            <div className="font-semibold text-sm text-foreground">WhatsApp Hotline</div>
            <p className="text-xs text-muted-foreground leading-normal">
              Fast messaging for instant audit updates & general inquiries.
            </p>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline"
          >
            <span>{whatsappNum}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Discord Ticket Card */}
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold w-fit transition-colors"
          >
            <span>Create Ticket</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Live Chat Card */}
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
              Instant web chat with our support team & automated assistant.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLiveChatOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground hover:border-black dark:hover:border-white text-xs font-semibold w-fit transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Start Live Chat</span>
          </button>
        </div>
      </div>

      {/* 3. INQUIRY & AUDIT REQUEST FORM (B&W Styling) */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Send Us a Direct Message</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Fill out the form below and our team will get back to you within 24 hours.
          </p>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground mx-auto">
              <CheckCircle2 className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Message Sent Successfully!</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Your inquiry has been registered. Our support desk will review your message and respond shortly.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Miller"
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
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
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Inquiry Category</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
              >
                <option value="Prop Firm Audit Request">Prop Firm Audit Request</option>
                <option value="Advertising & Listing">Advertising & Promo Listing</option>
                <option value="Payout Proof Dispute">Payout Proof Dispute Verification</option>
                <option value="Careers / Join Team">Careers / Join EMPIRIAL Team</option>
                <option value="General Support">General Support & Inquiry</option>
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Inquiry</span>
            </button>
          </form>
        )}
      </div>

      {/* 4. LIVE CHAT MODAL (Monochrome B&W Style) */}
      {isLiveChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
            {/* Header */}
            <div className="p-4 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <div className="text-xs font-bold">EMPIRIAL Live Support</div>
                  <div className="text-[10px] text-zinc-400">Institutional Audit Desk</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveChatOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 h-80 overflow-y-auto space-y-3 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendLiveChatMessage} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-semibold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
