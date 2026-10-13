
import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit,
  Trophy,
  Gift,
  ShieldCheck,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Crop,
  ZoomIn,
  Move,
  Search,
  Sparkles,
  ExternalLink,
  Layers,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/data/events-data';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { Event, EventCategory, EventEntryType, Firm } from '@/lib/types';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getFirms,
  sanitizeForFirestore,
} from '@/lib/firebase/services';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [firmsList, setFirmsList] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: EventCategory;
    sub_category: string;
    entry_type: EventEntryType;
    entry_fee: number;
    is_firm_sponsored: boolean;
    firm_id: string;
    independent_host_name: string;
    prize_pool: string;
    poster_url: string;
    description: string;
    start_date: string;
    countdown_label: string;
    requires_discord: boolean;
    discord_url: string;
    enable_tasks: boolean;
    tasks: string[];
  }>({
    title: '',
    category: 'giveaway',
    sub_category: 'tournament',
    entry_type: 'free',
    entry_fee: 0,
    is_firm_sponsored: true,
    firm_id: 'nys',
    independent_host_name: 'EMPIRIAL Official',
    prize_pool: '$100,000 in Accounts + $10,000 Cash',
    poster_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
    description: 'Official audited prop trading tournament with instant allocation prizes.',
    start_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    countdown_label: 'Starts in 7 Days',
    requires_discord: true,
    discord_url: 'https://discord.gg/empirial',
    enable_tasks: true,
    tasks: ['Join Official Discord Server', 'Submit Platform Account ID & Verification'],
  });

  // PC Photo Upload & Landscape Cropper Modal State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [cropRatio, setCropRatio] = useState<'16:9' | '21:9' | '4:3'>('16:9');
  const [positionX, setPositionX] = useState(50); // 0% to 100%
  const [positionY, setPositionY] = useState(50); // 0% to 100%
  const [zoomScale, setZoomScale] = useState(100); // 100% to 250%
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [eventsData, firmsData] = await Promise.all([getEvents(), getFirms()]);
        setEvents(eventsData);
        const resolvedFirms = firmsData.length > 0 ? firmsData : MOCK_FIRMS;
        setFirmsList(resolvedFirms);
        if (resolvedFirms.length > 0) {
          setFormData((prev) => ({
            ...prev,
            firm_id: resolvedFirms[0].id,
          }));
        }
      } catch (err) {
        console.error('Failed to load events data:', err);
        setEvents([]);
        setFirmsList(MOCK_FIRMS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle PC File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setRawImageSrc(event.target.result as string);
        setPositionX(50);
        setPositionY(50);
        setZoomScale(100);
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Export Landscape Canvas Crop
  const handleApplyLandscapeCrop = () => {
    if (!rawImageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = cropRatio === '21:9' ? 1260 : cropRatio === '16:9' ? 1280 : 1024;
      const targetHeight = cropRatio === '21:9' ? 540 : cropRatio === '16:9' ? 720 : 768;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (editingEvent) {
          setEditingEvent({ ...editingEvent, poster_url: rawImageSrc });
        } else {
          setFormData({ ...formData, poster_url: rawImageSrc });
        }
        setIsCropperOpen(false);
        return;
      }

      const imgAspect = img.width / img.height;
      const targetAspect = targetWidth / targetHeight;
      const scale = Math.max(1, zoomScale / 100);

      let sw: number;
      let sh: number;

      if (imgAspect > targetAspect) {
        sh = img.height / scale;
        sw = (img.height * targetAspect) / scale;
      } else {
        sw = img.width / scale;
        sh = (img.width / targetAspect) / scale;
      }

      const maxSx = Math.max(0, img.width - sw);
      const maxSy = Math.max(0, img.height - sh);

      const sx = Math.max(0, Math.min(maxSx, maxSx * (positionX / 100)));
      const sy = Math.max(0, Math.min(maxSy, maxSy * (positionY / 100)));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
      const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);

      if (editingEvent) {
        setEditingEvent({ ...editingEvent, poster_url: croppedUrl });
      } else {
        setFormData({ ...formData, poster_url: croppedUrl });
      }
      setIsCropperOpen(false);
    };
    img.onerror = () => {
      if (editingEvent) {
        setEditingEvent({ ...editingEvent, poster_url: rawImageSrc });
      } else {
        setFormData({ ...formData, poster_url: rawImageSrc });
      }
      setIsCropperOpen(false);
    };
    img.src = rawImageSrc;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event/giveaway?')) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
      setEvents(events.filter((e) => e.id !== id));
    }
  };

  const handleStartAdd = () => {
    const defaultFirm = firmsList[0] || { id: 'nys', name: 'NYS Capital', logo_url: '/logos/nys.png' };
    setFormData({
      title: '',
      category: 'giveaway',
      sub_category: 'tournament',
      entry_type: 'free',
      entry_fee: 0,
      is_firm_sponsored: true,
      firm_id: defaultFirm.id,
      independent_host_name: 'EMPIRIAL Official',
      prize_pool: '$100,000 in Accounts + $10,000 Cash',
      poster_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
      description: 'Official audited prop trading tournament with instant allocation prizes.',
      start_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
      countdown_label: 'Starts in 7 Days',
      requires_discord: true,
      discord_url: 'https://discord.gg/empirial',
      enable_tasks: true,
      tasks: ['Join Official Discord Server', 'Submit Platform Account ID & Verification'],
    });
    setEditingEvent(null);
    setIsAdding(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const firmObj = formData.is_firm_sponsored
      ? firmsList.find((f) => f.id === formData.firm_id)
      : undefined;

    const startDateIso = formData.start_date
      ? new Date(formData.start_date).toISOString()
      : new Date(Date.now() + 7 * 86400000).toISOString();

    const newEv: Omit<Event, 'id'> = {
      title: formData.title.trim(),
      slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: formData.category,
      sub_category: formData.sub_category,
      type: formData.sub_category as any,
      entry_type: formData.entry_type,
      entry_fee: formData.entry_type === 'paid' ? Number(formData.entry_fee) : 0,
      is_firm_sponsored: formData.is_firm_sponsored,
      firm_id: formData.is_firm_sponsored ? formData.firm_id : undefined,
      firm_name: formData.is_firm_sponsored ? firmObj?.name : undefined,
      firm_logo: formData.is_firm_sponsored ? firmObj?.logo_url : undefined,
      host_name: formData.is_firm_sponsored
        ? firmObj?.name || 'Partner Firm'
        : formData.independent_host_name.trim() || 'EMPIRIAL Official',
      host_firm: formData.is_firm_sponsored ? firmObj?.name || 'Partner Firm' : undefined,
      prize_pool: formData.prize_pool.trim(),
      poster_url:
        formData.poster_url.trim() ||
        'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1200&auto=format&fit=crop&q=80',
      start_date: startDateIso,
      end_date: new Date(new Date(startDateIso).getTime() + 14 * 86400000).toISOString(),
      countdown_label: formData.countdown_label.trim() || 'Active Now',
      participants_count: 0,
      max_participants: 2000,
      popularity_score: 85,
      created_at: new Date().toISOString().split('T')[0],
      registration_url: '#',
      is_active: true,
      description: formData.description.trim() || 'Official prop trading opportunity.',
      requires_discord: formData.requires_discord,
      discord_url: formData.requires_discord ? formData.discord_url.trim() : undefined,
      registration_tasks:
        formData.enable_tasks && formData.tasks.length > 0
          ? formData.tasks.map((t, idx) => ({
              id: `t-admin-${Date.now()}-${idx}`,
              title: t,
              type: t.toLowerCase().includes('discord') ? 'discord' : 'form',
              action_url: t.toLowerCase().includes('discord') ? formData.discord_url : undefined,
            }))
          : undefined,
    };

    const sanitizedEv = sanitizeForFirestore(newEv);

    try {
      const id = await createEvent(sanitizedEv);
      setEvents([{ id, ...sanitizedEv }, ...events]);
    } catch (err) {
      console.error('Failed to create event:', err);
      setEvents([{ id: 'ev-' + Date.now(), ...sanitizedEv }, ...events]);
    }

    setIsAdding(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const firmObj = editingEvent.is_firm_sponsored
      ? firmsList.find((f) => f.id === editingEvent.firm_id)
      : undefined;

    const startDateIso = editingEvent.start_date
      ? new Date(editingEvent.start_date).toISOString()
      : editingEvent.start_date;

    const updatedData: Partial<Event> = {
      title: editingEvent.title,
      slug: editingEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: editingEvent.category,
      sub_category: editingEvent.sub_category,
      entry_type: editingEvent.entry_type,
      entry_fee: editingEvent.entry_type === 'paid' ? Number(editingEvent.entry_fee) : 0,
      is_firm_sponsored: editingEvent.is_firm_sponsored,
      firm_id: editingEvent.is_firm_sponsored ? editingEvent.firm_id : undefined,
      firm_name: editingEvent.is_firm_sponsored ? firmObj?.name : undefined,
      firm_logo: editingEvent.is_firm_sponsored ? firmObj?.logo_url : undefined,
      host_name: editingEvent.is_firm_sponsored
        ? firmObj?.name || 'Partner Firm'
        : editingEvent.host_name || 'EMPIRIAL Official',
      prize_pool: editingEvent.prize_pool,
      poster_url: editingEvent.poster_url,
      start_date: startDateIso,
      countdown_label: editingEvent.countdown_label,
      description: editingEvent.description,
      requires_discord: editingEvent.requires_discord,
      discord_url: editingEvent.requires_discord ? editingEvent.discord_url : undefined,
    };

    const sanitizedUpdated = sanitizeForFirestore(updatedData);

    try {
      await updateEvent(editingEvent.id, sanitizedUpdated);
      setEvents(events.map((ev) => (ev.id === editingEvent.id ? { ...ev, ...sanitizedUpdated } : ev)));
      setEditingEvent(null);
    } catch (err) {
      console.error('Failed to update event:', err);
      setEvents(events.map((ev) => (ev.id === editingEvent.id ? { ...ev, ...sanitizedUpdated } : ev)));
      setEditingEvent(null);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchHost = (ev.host_name || '').toLowerCase().includes(q);
      const matchPrize = (ev.prize_pool || '').toLowerCase().includes(q);
      if (!matchTitle && !matchHost && !matchPrize) return false;
    }
    if (categoryFilter !== 'all' && ev.category !== categoryFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-mono">Loading events & giveaways database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-background text-foreground transition-colors duration-200">
      
      {/* Hidden File Input for PC Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Header (RULE:BW Typography) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            EVENTS & GIVEAWAYS CMS
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground mt-1">
            Configure trading tournaments, gaming contests, bootcamps, live sessions, and upload custom landscape banners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert('All events and giveaways updates have been saved!')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          <button
            type="button"
            onClick={handleStartAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-foreground text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event / Giveaway</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, host firm, or prize pool..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-black dark:focus:border-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'giveaway', 'event'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* CREATE NEW EVENT MODAL / FORM */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Create New Event / Giveaway</span>
                </h3>
                <p className="text-xs text-muted-foreground">Upload landscape photo from PC or pick focal point.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Event / Giveaway Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="World Prop Trading League 2026"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-bold text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Main Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value as EventCategory;
                      setFormData({
                        ...formData,
                        category: cat,
                        sub_category: cat === 'giveaway' ? 'tournament' : 'live-session',
                      });
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold focus:outline-none"
                  >
                    <option value="giveaway">Giveaway</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Subcategory
                  </label>
                  <select
                    value={formData.sub_category}
                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold focus:outline-none"
                  >
                    {formData.category === 'giveaway' ? (
                      <>
                        <option value="tournament">Trading Tournaments</option>
                        <option value="gaming">Gaming Contests</option>
                        <option value="learn-crack">Learn & Crack</option>
                      </>
                    ) : (
                      <>
                        <option value="live-session">Live Sessions</option>
                        <option value="bootcamp">Bootcamps</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Entry Type
                  </label>
                  <select
                    value={formData.entry_type}
                    onChange={(e) => setFormData({ ...formData, entry_type: e.target.value as EventEntryType })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold focus:outline-none"
                  >
                    <option value="free">Free Entry</option>
                    <option value="paid">Paid Entry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Entry Fee ($ USD)
                  </label>
                  <input
                    type="number"
                    disabled={formData.entry_type === 'free'}
                    value={formData.entry_fee}
                    onChange={(e) => setFormData({ ...formData, entry_fee: Number(e.target.value) })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-mono font-bold text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Prize Pool Description
                  </label>
                  <input
                    type="text"
                    value={formData.prize_pool}
                    onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Tournament Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-mono text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Countdown / Status Label
                  </label>
                  <input
                    type="text"
                    value={formData.countdown_label}
                    onChange={(e) => setFormData({ ...formData, countdown_label: e.target.value })}
                    placeholder="Starts in 7 Days / Live Now"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Requirement 1: Photo Uploader from PC & Landscape Shaping */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
                    Banner Photo (Upload from PC & Shape into Landscape)
                  </span>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo from PC</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={formData.poster_url}
                      onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                      placeholder="Image URL or uploaded file Data URL..."
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-mono text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  {formData.poster_url && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black flex items-center justify-center">
                      <img
                        src={formData.poster_url}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description & Discord Rules */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Event Description & Rules
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white text-zinc-900 dark:bg-card dark:text-foreground text-xs font-semibold hover:bg-zinc-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDITING EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  <span>Edit Event: {editingEvent.title}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-bold text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Prize Pool Description
                  </label>
                  <input
                    type="text"
                    value={editingEvent.prize_pool}
                    onChange={(e) => setEditingEvent({ ...editingEvent, prize_pool: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      editingEvent.start_date
                        ? editingEvent.start_date.length > 16
                          ? new Date(editingEvent.start_date).toISOString().slice(0, 16)
                          : editingEvent.start_date
                        : ''
                    }
                    onChange={(e) => setEditingEvent({ ...editingEvent, start_date: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-mono text-xs text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Countdown Label
                  </label>
                  <input
                    type="text"
                    value={editingEvent.countdown_label}
                    onChange={(e) => setEditingEvent({ ...editingEvent, countdown_label: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground"
                  />
                </div>
              </div>

              {/* Requirement 1: Upload / Landscape Crop for Editing */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
                    Banner Photo (Upload & Shape Landscape)
                  </span>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={editingEvent.poster_url}
                      onChange={(e) => setEditingEvent({ ...editingEvent, poster_url: e.target.value })}
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-mono text-xs text-foreground"
                    />
                  </div>

                  {editingEvent.poster_url && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black flex items-center justify-center">
                      <img
                        src={editingEvent.poster_url}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Description Text
                </label>
                <textarea
                  rows={2}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white text-zinc-900 dark:bg-card dark:text-foreground text-xs font-semibold hover:bg-zinc-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LANDSCAPE IMAGE CROPPER & FOCAL POINT MODAL */}
      {isCropperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 max-w-3xl w-full space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Crop className="w-5 h-5 text-foreground" />
                <h3 className="text-base font-bold text-foreground">Landscape Photo Cropper & Framing</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCropperOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Framing Ratio Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-muted-foreground uppercase text-[10px]">Aspect Ratio:</span>
              {(['16:9', '21:9', '4:3'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setCropRatio(r)}
                  className={`px-3 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                    cropRatio === r
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'border-zinc-200 dark:border-zinc-800 text-muted-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Interactive Landscape Preview Container */}
            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-black flex items-center justify-center min-h-[260px] max-h-[380px]">
              {rawImageSrc && (
                <div
                  className="w-full h-full relative overflow-hidden"
                  style={{
                    aspectRatio: cropRatio === '21:9' ? '21/9' : cropRatio === '16:9' ? '16/9' : '4/3',
                  }}
                >
                  <img
                    src={rawImageSrc}
                    alt="Uploaded Crop Source"
                    className="w-full h-full object-cover transition-all duration-75 select-none"
                    style={{
                      objectPosition: `${positionX}% ${positionY}%`,
                      transform: `scale(${zoomScale / 100})`,
                    }}
                  />
                  
                  {/* Guideline Grid Overlay */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20">
                    <div className="border-r border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-b border-white/10" />
                  </div>
                </div>
              )}
            </div>

            {/* Adjustment Controls Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                  <span>Horizontal Focus (X)</span>
                  <span className="font-mono text-foreground font-bold">{positionX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={positionX}
                  onChange={(e) => setPositionX(Number(e.target.value))}
                  className="w-full accent-black dark:accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                  <span>Vertical Focus (Y)</span>
                  <span className="font-mono text-foreground font-bold">{positionY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={positionY}
                  onChange={(e) => setPositionY(Number(e.target.value))}
                  className="w-full accent-black dark:accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                  <span>Zoom Level</span>
                  <span className="font-mono text-foreground font-bold">{zoomScale}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="250"
                  value={zoomScale}
                  onChange={(e) => setZoomScale(Number(e.target.value))}
                  className="w-full accent-black dark:accent-white cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCropperOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyLandscapeCrop}
                className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold shadow-xs cursor-pointer"
              >
                Apply Crop & Use Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENTS TABLE SYSTEM (Strict RULE:BW) */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-foreground" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground">
              Active Events & Giveaways Matrix ({filteredEvents.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                <th className="p-4">Opportunity & Banner</th>
                <th className="p-4">Category</th>
                <th className="p-4">Host / Firm</th>
                <th className="p-4">Prize Pool / Value</th>
                <th className="p-4 text-center">Entry Fee</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-foreground">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                    
                    {/* 1. Title & Banner Preview */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 bg-black">
                          <img
                            src={ev.poster_url || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=300&auto=format&fit=crop&q=80'}
                            alt={ev.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-foreground">{ev.title}</div>
                          <span className="text-[10px] text-muted-foreground font-mono">{ev.countdown_label}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Category */}
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200 dark:border-zinc-800">
                        {ev.category} • {ev.sub_category}
                      </span>
                    </td>

                    {/* 3. Host / Firm */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {ev.is_firm_sponsored && ev.firm_logo ? (
                          <img src={ev.firm_logo} alt={ev.host_name} className="w-4 h-4 object-contain rounded-md" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                        <span className="font-bold text-foreground">{ev.host_name}</span>
                      </div>
                    </td>

                    {/* 4. Prize Pool */}
                    <td className="p-4 font-mono font-bold text-foreground">
                      {ev.prize_pool}
                    </td>

                    {/* 5. Entry Fee */}
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${
                        ev.entry_type === 'free'
                          ? 'bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200 dark:border-zinc-800'
                          : 'bg-black text-white dark:bg-white dark:text-black font-extrabold'
                      }`}>
                        {ev.entry_type === 'free' ? 'Free Entry' : `$${ev.entry_fee}`}
                      </span>
                    </td>

                    {/* 6. Actions */}
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingEvent(ev)}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shadow-2xs cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    No events or giveaways found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
