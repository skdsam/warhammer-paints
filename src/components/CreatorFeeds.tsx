import { useState, useEffect } from 'react';
import { useFeedStore, CreatorChannel } from '../store/useFeedStore';
import { Play, ExternalLink, Video, Loader2, Trash2, Plus } from 'lucide-react';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { openUrl } from '@tauri-apps/plugin-opener';

interface VideoFeed {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  published: string;
  channelName: string;
  channelId: string;
}

export function CreatorFeeds() {
  const { channels, addChannel, removeChannel } = useFeedStore();
  const [videos, setVideos] = useState<VideoFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newChannelId, setNewChannelId] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fetchFeeds = async () => {
    setLoading(true);
    setError('');
    
    try {
      const allVideos: VideoFeed[] = [];
      
      await Promise.all(channels.map(async (channel) => {
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
        
        try {
          const response = await tauriFetch(feedUrl, {
            method: 'GET',
          });
          
          if (!response.ok) return;
          
          const xmlText = await response.text();
          const parser = new DOMParser();
          const xml = parser.parseFromString(xmlText, "text/xml");
        
        const entries = Array.from(xml.querySelectorAll('entry'));
        
        entries.forEach(entry => {
          // In Atom feeds, the tag is yt:videoId, but DOMParser might just see it as videoId
          const id = entry.getElementsByTagName('yt:videoId')[0]?.textContent || entry.querySelector('videoId')?.textContent || '';
          const title = entry.querySelector('title')?.textContent || '';
          const link = entry.querySelector('link')?.getAttribute('href') || '';
          const published = entry.querySelector('published')?.textContent || '';
          
          const mediaGroup = entry.getElementsByTagName('media:group')[0];
          let thumbnail = '';
          if (mediaGroup) {
            const thumbNode = mediaGroup.getElementsByTagName('media:thumbnail')[0];
            if (thumbNode) {
              thumbnail = thumbNode.getAttribute('url') || '';
            }
          }
          
          if (!thumbnail && id) {
             thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
          }

          if (id && title) {
            allVideos.push({
              id,
              title,
              link,
              thumbnail,
              published,
              channelName: channel.name,
              channelId: channel.id
            });
          }
        });
      } catch (e) {
        console.warn(`Failed to fetch channel ${channel.name}:`, e);
      }
      }));

      allVideos.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
      
      // Limit to 50 latest videos total
      setVideos(allVideos.slice(0, 50));
    } catch (err) {
      console.error('Failed to fetch feeds', err);
      setError('Failed to load video feeds. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, [channels]);

  const handleAddChannel = async () => {
    let finalId = newChannelId.trim();
    if (!finalId || !newChannelName.trim()) return;

    if (!finalId.startsWith('UC')) {
      setIsAdding(false);
      setLoading(true);
      
      try {
        let urlToFetch = finalId;
        if (finalId.startsWith('@')) {
          urlToFetch = `https://www.youtube.com/${finalId}`;
        } else if (!finalId.includes('youtube.com')) {
           urlToFetch = `https://www.youtube.com/@${finalId.replace('@', '')}`;
        }

        const response = await tauriFetch(urlToFetch, { method: 'GET' });
        const html = await response.text();
        
        const match = html.match(/"channelId":"(UC[^"]+)"/) || html.match(/itemprop="channelId"\s+content="(UC[^"]+)"/);
        
        if (match && match[1]) {
          finalId = match[1];
        } else {
          setError(`Could not resolve the channel ID. Please try finding the exact 'UC...' ID.`);
          setLoading(false);
          return;
        }
      } catch (err) {
        setError(`Network error resolving handle. Try the exact 'UC...' ID.`);
        setLoading(false);
        return;
      }
    }

    addChannel({
      id: finalId,
      name: newChannelName.trim()
    });
    setNewChannelId('');
    setNewChannelName('');
    setIsAdding(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Creator Feeds
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Latest tutorials and painting guides from top Warhammer creators
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-primary/90 transition-colors"
        >
          <Plus size={18} />
          Add Channel
        </button>
      </div>

      {isAdding && (
        <div className="bg-bg-surface border border-brand-primary/30 p-6 rounded-2xl mb-8 animate-in slide-in-from-top-2 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">Track New Creator</h3>
            <div className="text-xs text-text-muted max-w-sm text-right">
              Paste their <strong>@handle</strong> (e.g. @SquidmarMiniatures), their full URL, or their exact <strong>Channel ID</strong> (UC...).
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Creator Name</label>
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g. Dana Howl"
                className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div className="flex-1 min-w-[250px] space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">YouTube Handle or URL</label>
              <input
                type="text"
                value={newChannelId}
                onChange={(e) => setNewChannelId(e.target.value)}
                placeholder="e.g. @Ninjon or https://..."
                className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary font-mono text-sm"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 rounded-lg text-text-muted hover:bg-white/5 transition-colors font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChannel}
                disabled={!newChannelId.trim() || !newChannelName.trim()}
                className="px-6 py-2 bg-brand-primary text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/90 transition-colors"
              >
                Track
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracked Channels Row */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
        {channels.map(channel => {
          const isActive = activeFilter === channel.id;
          return (
            <button 
              key={channel.id} 
              onClick={() => setActiveFilter(isActive ? null : channel.id)}
              className={`flex items-center gap-2 border px-4 py-2 rounded-full flex-shrink-0 group transition-all ${
                isActive 
                  ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'bg-bg-surface border-border hover:border-brand-primary/50 text-text-muted hover:text-white'
              }`}
            >
              <Video size={14} className={isActive ? "text-white" : "text-brand-primary"} />
              <span className="text-sm font-bold">{channel.name}</span>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeFilter === channel.id) setActiveFilter(null);
                  removeChannel(channel.id);
                }}
                className={`ml-1 hover:text-red-500 transition-opacity ${isActive ? 'opacity-100 text-white/70' : 'opacity-0 group-hover:opacity-100'}`}
                title="Stop tracking"
              >
                <Trash2 size={14} />
              </div>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 size={48} className="text-brand-primary animate-spin" />
          <p className="text-text-muted font-medium animate-pulse">Scanning the warp for new tutorials...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-red-950/20 border border-red-900/50 rounded-2xl">
          <p className="text-red-400 font-bold">{error}</p>
          <button 
            onClick={fetchFeeds}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(activeFilter ? videos.filter(v => v.channelId === activeFilter) : videos).map(video => (
            <button  
              key={video.id + video.channelId}
              onClick={() => openUrl(video.link)}
              className="bg-bg-surface border border-border rounded-xl flex flex-col group relative transition-all hover:scale-[1.02] hover:border-brand-primary/50 overflow-hidden text-left"
            >
              <div className="aspect-video w-full bg-bg-dark relative overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 text-white pl-1">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
                  {video.title}
                </h3>
                
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-white/5 px-2 py-1 rounded truncate max-w-[60%]">
                    {video.channelName}
                  </span>
                  <span className="text-xs text-text-muted font-medium whitespace-nowrap">
                    {formatDate(video.published)}
                  </span>
                </div>
              </div>
            </button>
          ))}
          {(activeFilter ? videos.filter(v => v.channelId === activeFilter) : videos).length === 0 && (
            <div className="col-span-full h-48 flex items-center justify-center text-text-muted border border-dashed border-border rounded-2xl bg-white/5 italic">
              No recent videos found for this selection.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
