import { useState, useEffect, useRef } from 'react';
import { useFeedStore } from '../store/useFeedStore';
import { Play, Video, Loader2, Trash2, Plus, Search, X, AlertCircle, Pencil, Check } from 'lucide-react';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { openUrl } from '@tauri-apps/plugin-opener';

interface VideoItem {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  published: string;
  channelName: string;
  channelId: string;
}

// Build all the RSS URLs we should try for a given channel entry
function getRssUrls(channelId: string): string[] {
  const cleaned = channelId.trim();

  if (cleaned.startsWith('UC')) {
    // Direct channel ID — one definitive URL
    return [`https://www.youtube.com/feeds/videos.xml?channel_id=${cleaned}`];
  }

  // Strip https://www.youtube.com/ prefix if the user pasted the full URL
  let handle = cleaned;
  try {
    const url = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    handle = url.pathname.replace(/^\//, ''); // e.g. "@PlayOnTabletop" or "c/ChannelName"
  } catch {
    // not a URL, use as-is
  }

  // Strip leading @
  const bare = handle.replace(/^@/, '');

  return [
    // Modern handle-based feed
    `https://www.youtube.com/feeds/videos.xml?channel_id=@${bare}`,
    // Legacy user-based feed (still works for many older channels)
    `https://www.youtube.com/feeds/videos.xml?user=${bare}`,
  ];
}

async function fetchChannelVideos(channel: { id: string; name: string }): Promise<VideoItem[]> {
  const urls = getRssUrls(channel.id);

  for (const feedUrl of urls) {
    try {
      const response = await tauriFetch(feedUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/atom+xml, text/xml, */*' },
      });

      if (!response.ok) continue;

      const xmlText = await response.text();
      if (!xmlText.includes('<entry>') && !xmlText.includes('<entry ')) continue;

      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'text/xml');
      const entries = Array.from(xml.querySelectorAll('entry'));
      if (entries.length === 0) continue;

      const videos: VideoItem[] = [];

      entries.forEach(entry => {
        // yt:videoId is a namespaced tag — try both getter styles
        const id =
          entry.getElementsByTagName('yt:videoId')[0]?.textContent ||
          entry.querySelector('[localName="videoId"]')?.textContent ||
          // fallback: extract from the link href
          entry.querySelector('link')?.getAttribute('href')?.match(/v=([^&]+)/)?.[1] ||
          '';

        const title = entry.querySelector('title')?.textContent?.trim() || '';
        const link = entry.querySelector('link')?.getAttribute('href') || '';
        const published = entry.querySelector('published')?.textContent || '';

        // thumbnail from media:group > media:thumbnail
        const mediaGroup = entry.getElementsByTagName('media:group')[0];
        let thumbnail = '';
        if (mediaGroup) {
          const thumbNode = mediaGroup.getElementsByTagName('media:thumbnail')[0];
          thumbnail = thumbNode?.getAttribute('url') || '';
        }
        // Always have a fallback thumbnail from the video ID
        if (!thumbnail && id) {
          thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        }

        if (title && link) {
          videos.push({ id, title, link, thumbnail, published, channelName: channel.name, channelId: channel.id });
        }
      });

      return videos; // success — return what we got
    } catch {
      continue; // try next URL
    }
  }

  return []; // all URLs failed silently
}

export function CreatorFeeds() {
  const { channels, addChannel, removeChannel, updateChannel } = useFeedStore();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [failedChannels, setFailedChannels] = useState<Set<string>>(new Set());
  const [globalLoading, setGlobalLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Add channel form
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [addError, setAddError] = useState('');

  // Edit channel
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editError, setEditError] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Load all feeds
  const loadAllFeeds = async (channelList = channels) => {
    if (channelList.length === 0) { setGlobalLoading(false); setVideos([]); return; }
    setGlobalLoading(true);
    setFailedChannels(new Set());

    const results = await Promise.all(channelList.map(async ch => {
      const vids = await fetchChannelVideos(ch);
      if (vids.length === 0) {
        setFailedChannels(prev => new Set([...prev, ch.id]));
      }
      return vids;
    }));

    const allVideos = results.flat();
    allVideos.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
    setVideos(allVideos);
    setGlobalLoading(false);
  };

  useEffect(() => {
    loadAllFeeds();
  }, [channels]);

  useEffect(() => {
    if (isAdding) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [isAdding]);

  const handleAdd = () => {
    const name = newName.trim();
    const raw = newHandle.trim();
    if (!name || !raw) return;

    setAddError('');

    // Extract UC... ID from whatever the user pasted
    let channelId = raw;

    // If they pasted a full URL like youtube.com/channel/UCxxx, extract just the ID
    const ucMatch = raw.match(/(UC[a-zA-Z0-9_-]{20,})/);
    if (ucMatch) {
      channelId = ucMatch[1];
    } else {
      setAddError(
        `Only YouTube Channel IDs (starting with "UC") are supported. ` +
        `See the guide below to find the ID for this channel.`
      );
      return;
    }

    addChannel({ id: channelId, name });
    setNewName('');
    setNewHandle('');
    setIsAdding(false);
  };

  const openEdit = (ch: { id: string; name: string }) => {
    setEditingId(ch.id);
    setEditName(ch.name);
    setEditHandle(ch.id);
    setEditError('');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    const raw = editHandle.trim();
    if (!name || !raw) return;

    const ucMatch = raw.match(/(UC[a-zA-Z0-9_-]{20,})/);
    if (!ucMatch) {
      setEditError('Channel ID must start with "UC". See the add guide for help finding it.');
      return;
    }
    const newId = ucMatch[1];
    // If the ID changed, remove old + add new; otherwise just update name
    if (newId !== editingId) {
      removeChannel(editingId);
      addChannel({ id: newId, name });
    } else {
      updateChannel(editingId, { name });
    }
    setEditingId(null);
    setEditError('');
  };

  const toggleFilter = (id: string) => {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const displayedVideos = videos.filter(v => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || v.title.toLowerCase().includes(q) || v.channelName.toLowerCase().includes(q);
    const matchFilter = activeFilters.length === 0 || activeFilters.includes(v.channelId);
    return matchSearch && matchFilter;
  });

  const formatDate = (ds: string) => {
    if (!ds) return '';
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(ds));
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Creator Feeds</h2>
          <p className="text-text-muted text-sm mt-1">Latest videos from your tracked Warhammer channels</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full bg-bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          {/* Add channel */}
          <button
            onClick={() => { setIsAdding(!isAdding); setAddError(''); }}
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-primary/90 transition-colors whitespace-nowrap text-sm"
          >
            <Plus size={16} />
            Add Channel
          </button>
        </div>
      </div>

      {/* Add channel form */}
      {isAdding && (
        <div className="bg-bg-surface border border-brand-primary/30 p-5 rounded-2xl mb-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Track a YouTube Channel</h3>
            <button onClick={() => setIsAdding(false)} className="text-text-muted hover:text-white"><X size={18} /></button>
          </div>

          {/* How-to guide */}
          <div className="mb-5 bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-text-muted leading-relaxed space-y-2">
            <p className="text-white font-bold text-sm">📋 How to find a YouTube Channel ID</p>
            <ol className="list-decimal list-inside space-y-1.5 text-text-muted">
              <li>Go to the channel's YouTube page (e.g. <span className="text-white font-mono">youtube.com/@PlayOnTabletop</span>)</li>
              <li>Click <strong className="text-white">More</strong></li>
              <li>Click the <strong className="text-white">Share</strong> icon → <strong className="text-white">Copy channel ID</strong></li>
              <li>The ID starts with <span className="text-brand-primary font-mono font-bold">UC</span> and looks like: <span className="font-mono text-brand-primary">UCJ4-WFTrD_G_8gH8-88jX2w</span></li>
            </ol>
            <p className="text-yellow-400/80">⚠ @handles and profile URLs <strong>won't work</strong> — you must use the UC... ID.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Creator Name</label>
              <input
                ref={nameInputRef}
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Play On Tabletop"
                className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">YouTube Channel ID (UC...)</label>
              <input
                type="text"
                value={newHandle}
                onChange={e => { setNewHandle(e.target.value); setAddError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="UCJ4-WFTrD_G_8gH8-88jX2w"
                className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {addError && (
            <div className="flex items-start gap-2 text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/30 px-4 py-3 rounded-lg">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{addError}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button onClick={() => setIsAdding(false)} className="px-5 py-2 text-text-muted hover:text-white text-sm font-bold transition-colors">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newHandle.trim()}
              className="px-5 py-2 bg-brand-primary text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-brand-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus size={14} />
              Track Channel
            </button>
          </div>
        </div>
      )}

      {/* Channel chips + edit */}
      {channels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveFilters([])}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeFilters.length === 0
                ? 'bg-brand-primary text-white'
                : 'bg-bg-surface border border-border text-text-muted hover:text-white'
            }`}
          >
            All
          </button>
          {channels.map(ch => {
            const isActive = activeFilters.includes(ch.id);
            const failed = failedChannels.has(ch.id);
            const isEditing = editingId === ch.id;

            if (isEditing) {
              return (
                <div key={ch.id} className="flex flex-col gap-2 bg-bg-surface border border-brand-primary/40 rounded-2xl p-4 w-full md:w-auto md:min-w-[420px] shadow-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">Edit Creator</span>
                    <button onClick={() => { setEditingId(null); setEditError(''); }} className="text-text-muted hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Creator Name</label>
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                        className="w-full bg-bg-dark border border-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Channel ID (UC...)</label>
                      <input
                        type="text"
                        value={editHandle}
                        onChange={e => { setEditHandle(e.target.value); setEditError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                        className="w-full bg-bg-dark border border-border rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                  {editError && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-900/30 px-3 py-2 rounded-lg">
                      <AlertCircle size={12} />{editError}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setEditingId(null); setEditError(''); }}
                      className="px-4 py-1.5 text-text-muted hover:text-white text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { removeChannel(ch.id); setEditingId(null); }}
                      className="px-4 py-1.5 bg-red-900/40 hover:bg-red-900/70 border border-red-900/50 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={!editName.trim() || !editHandle.trim()}
                      className="px-4 py-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                    >
                      <Check size={11} /> Save
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={ch.id}
                onClick={() => toggleFilter(ch.id)}
                className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-full text-xs flex-shrink-0 group transition-all ${
                  isActive
                    ? 'bg-brand-primary border-brand-primary text-white'
                    : failed
                    ? 'bg-bg-surface border-red-900/50 text-red-400'
                    : 'bg-bg-surface border-border text-text-muted hover:text-white hover:border-brand-primary/50'
                }`}
              >
                <Video size={11} className={isActive ? 'text-white' : failed ? 'text-red-400' : 'text-brand-primary'} />
                <span className="font-bold">{ch.name}</span>
                {failed && <AlertCircle size={10} title="No videos loaded" />}
                <span
                  onClick={e => { e.stopPropagation(); openEdit(ch); }}
                  className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-blue-400 transition-opacity"
                  title="Edit channel"
                >
                  <Pencil size={11} />
                </span>
              </button>
            );
          })}
          <button
            onClick={() => loadAllFeeds()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-border text-text-muted hover:text-white hover:border-brand-primary/50 transition-all"
          >
            <Loader2 size={11} className={globalLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      )}

      {/* Content */}
      {globalLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 size={40} className="text-brand-primary animate-spin" />
          <p className="text-text-muted animate-pulse">Loading feeds from the warp...</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 border border-dashed border-border rounded-2xl text-text-muted">
          <Video size={40} className="opacity-30" />
          <p className="font-medium">No channels tracked yet</p>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-primary/90 transition-colors"
          >
            <Plus size={14} /> Add Your First Channel
          </button>
        </div>
      ) : displayedVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2 border border-dashed border-border rounded-2xl text-text-muted italic">
          <p>No videos found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
          {failedChannels.size > 0 && (
            <p className="text-xs text-red-400 not-italic">
              {failedChannels.size} channel(s) failed to load — the channel ID/handle may be incorrect.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedVideos.map(video => (
            <button
              key={video.id + video.channelId}
              onClick={() => openUrl(video.link)}
              className="bg-bg-surface border border-border rounded-xl flex flex-col group transition-all hover:scale-[1.02] hover:border-brand-primary/50 overflow-hidden text-left"
            >
              <div className="aspect-video w-full bg-bg-dark relative overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg text-white pl-1">
                    <Play size={22} fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
                  {video.title}
                </h3>
                <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-white/5 px-2 py-1 rounded truncate">
                    {video.channelName}
                  </span>
                  <span className="text-xs text-text-muted whitespace-nowrap flex-shrink-0">
                    {formatDate(video.published)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
