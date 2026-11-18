'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit, X } from 'lucide-react';
import { MOCK_BLOG_POSTS } from '@/lib/data/blog-data';
import { BlogPost } from '@/lib/types';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/firebase/services';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Strategy & Risk');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [authorName, setAuthorName] = useState('EMPIRIAL Editorial Desk');
  const [authorRole, setAuthorRole] = useState('Market Analyst');

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getBlogPosts();
        if (data && data.length > 0) {
          setPosts(data);
        } else {
          setPosts(MOCK_BLOG_POSTS);
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
        setPosts(MOCK_BLOG_POSTS);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteBlogPost(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newPost: Omit<BlogPost, 'id'> = {
      slug: title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
      title,
      excerpt,
      content: content || excerpt,
      author: {
        name: authorName,
        role: authorRole,
        avatar: '',
      },
      read_time: readTime,
      category,
      published_at: new Date().toISOString().split('T')[0],
      cover_image: coverImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
    };

    try {
      const id = await createBlogPost(newPost);
      setPosts([{ id, ...newPost }, ...posts]);
    } catch (err) {
      console.error('Failed to create post:', err);
      setPosts([{ id: 'blog-' + Date.now(), ...newPost }, ...posts]);
    }

    setIsAdding(false);
    resetForm();
  };

  const handleStartEdit = (post: BlogPost) => {
    setEditingPost(post);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const updatedData: Partial<BlogPost> = {
      title: editingPost.title,
      slug: editingPost.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
      excerpt: editingPost.excerpt,
      content: editingPost.content,
      read_time: editingPost.read_time,
      category: editingPost.category,
      cover_image: editingPost.cover_image,
      author: {
        name: editingPost.author?.name || 'EMPIRIAL Editorial Desk',
        role: editingPost.author?.role || 'Market Analyst',
        avatar: editingPost.author?.avatar || '',
      }
    };

    try {
      await updateBlogPost(editingPost.id, updatedData);
      setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...updatedData } : p));
      setEditingPost(null);
    } catch (err) {
      console.error('Failed to update post:', err);
      setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...updatedData } : p));
      setEditingPost(null);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Strategy & Risk');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setReadTime('5 min read');
    setAuthorName('EMPIRIAL Editorial Desk');
    setAuthorRole('Market Analyst');
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Loading blog posts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl text-white">Educational Blog Article CMS</h1>
          <p className="text-xs text-slate-400">Publish guides, risk management strategies, and market analysis reviews.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-elevation-surface border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Draft New Educational Article</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How to Manage Drawdown"
                required
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Rules & Compliance"
                required
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Read Time</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="5 min read"
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Author Role</label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Cover Image URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="text-slate-400 font-semibold">Article Summary / Excerpt</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary displayed on listings..."
              required
              className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="text-slate-400 font-semibold">Content (Markdown / Text)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full body of the educational article here..."
              rows={6}
              required
              className="w-full bg-elevation-base border border-white/10 rounded-xl p-3 text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-elevation-card hover:bg-elevation-raised text-xs text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors"
            >
              Publish Article
            </button>
          </div>
        </form>
      )}

      {/* Editing Blog Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveEdit}
            className="bg-elevation-modal border border-white/15 rounded-3xl p-6 max-w-3xl w-full space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Edit Blog Article: {editingPost.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Title</label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  required
                  className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Category</label>
                <input
                  type="text"
                  value={editingPost.category}
                  onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                  required
                  className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Read Time</label>
                <input
                  type="text"
                  value={editingPost.read_time}
                  onChange={(e) => setEditingPost({ ...editingPost, read_time: e.target.value })}
                  className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Author Name</label>
                <input
                  type="text"
                  value={editingPost.author?.name || ''}
                  onChange={(e) => setEditingPost({
                    ...editingPost,
                    author: { ...(editingPost.author || { role: '', avatar: '' }), name: e.target.value }
                  })}
                  className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Author Role</label>
                <input
                  type="text"
                  value={editingPost.author?.role || ''}
                  onChange={(e) => setEditingPost({
                    ...editingPost,
                    author: { ...(editingPost.author || { name: '', avatar: '' }), role: e.target.value }
                  })}
                  className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Cover Image URL</label>
                <input
                  type="text"
                  value={editingPost.cover_image}
                  onChange={(e) => setEditingPost({ ...editingPost, cover_image: e.target.value })}
                  className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 font-semibold">Article Summary / Excerpt</label>
              <input
                type="text"
                value={editingPost.excerpt}
                onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                required
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 font-semibold">Content (Markdown / Text)</label>
              <textarea
                value={editingPost.content}
                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                rows={6}
                required
                className="w-full bg-elevation-base border border-white/10 rounded-xl p-3 text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="px-3 py-1.5 rounded-lg bg-elevation-card hover:bg-elevation-raised text-xs text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-elevation-surface border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-elevation-card text-slate-400 uppercase font-bold text-[10px]">
              <th className="p-4">Article Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Author</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-elevation-raised/60">
                <td className="p-4 font-bold text-white max-w-sm truncate">{p.title}</td>
                <td className="p-4 text-cyan-400 font-semibold">{p.category}</td>
                <td className="p-4 text-slate-300">{p.author?.name || 'EMPIRIAL Editorial'}</td>
                <td className="p-4 text-slate-400 font-mono">{p.published_at}</td>
                <td className="p-4 text-right space-x-1.5">
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="p-1.5 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
