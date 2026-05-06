import React from 'react';
import { motion } from 'motion/react';
import { ShieldBan, X } from 'lucide-react';

interface FocusZoneProtectorProps {
  blockedSites: string[];
  onAddSite: (site: string) => void;
  onRemoveSite: (site: string) => void;
}

export function FocusZoneProtector({ blockedSites, onAddSite, onRemoveSite }: FocusZoneProtectorProps) {
  const [newSite, setNewSite] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSite.trim()) {
      onAddSite(newSite.trim().toLowerCase());
      setNewSite('');
    }
  };

  return (
    <div className="bg-quest-card backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
          <ShieldBan size={20} />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold text-white">Focus Zone Active</h2>
          <p className="text-xs text-quest-muted uppercase tracking-wider">Distractions Blocked</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
        <div className="space-y-2">
          {blockedSites.map(site => (
            <div key={site} className="flex items-center justify-between bg-black/20 border border-red-500/10 px-4 py-2 rounded-xl group hover:border-red-500/30 transition-colors">
              <span className="text-sm font-mono text-white/80">{site}</span>
              <button 
                aria-label={`Remove ${site} from blocked sites`}
                onClick={() => onRemoveSite(site)}
                className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {blockedSites.length === 0 && (
            <div className="text-center text-sm text-quest-muted p-4">
              Block distracting sites to maintain focus.
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-auto flex gap-2">
        <input 
          aria-label="New blocked site URL"
          type="text" 
          value={newSite}
          onChange={(e) => setNewSite(e.target.value)}
          placeholder="e.g. reddit.com"
          className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-quest-muted focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/50"
        />
        <button 
          aria-label="Add site to blocked list"
          type="submit"
          disabled={!newSite.trim()}
          className="px-4 py-2 bg-white/5 border border-white/10 hover:border-red-400 text-white rounded-xl disabled:opacity-50 transition-colors text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Add
        </button>
      </form>
    </div>
  );
}
