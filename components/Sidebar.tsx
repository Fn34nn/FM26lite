import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Users, Trophy, PlayCircle, Calendar, Settings, Mail, Briefcase, Lock } from 'lucide-react';
import { playClick } from '../utils/audio';

interface SidebarProps {
  currentView: ViewState;
  setView: (v: ViewState) => void;
  teamName: string;
  unreadCount?: number;
  isLocked?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, teamName, unreadCount = 0, isLocked = false }) => {
  const NavItem = ({ view, icon: Icon, label, badge }: { view: ViewState, icon: any, label: string, badge?: number }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
            if (isLocked && !isActive) return;
            playClick();
            setView(view);
        }}
        disabled={isLocked && !isActive}
        className={`w-full group relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
          isActive 
            ? 'text-white' 
            : isLocked 
                ? 'text-slate-700 cursor-not-allowed' 
                : 'text-slate-400 hover:text-white'
        }`}
      >
        {isActive && (
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent rounded-lg border-l-2 border-emerald-500"></div>
        )}
        <div className={`relative z-10 p-2 rounded-md transition-colors ${isActive ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]' : isLocked ? 'bg-slate-900 text-slate-700' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
             {isLocked && !isActive ? <Lock size={18} /> : <Icon size={18} />}
        </div>
        <span className={`relative z-10 font-bold text-sm tracking-wide ${isActive ? 'text-emerald-100' : ''}`}>{label}</span>
        
        {badge ? (
            <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                {badge}
            </span>
        ) : null}

        {/* Glow sweep on hover if not active */}
        {!isActive && !isLocked && <div className="absolute inset-0 rounded-lg overflow-hidden shine-effect opacity-0 group-hover:opacity-100"></div>}
      </button>
    );
  };

  return (
    <div className="w-72 bg-[#020617] h-screen flex flex-col border-r border-slate-800/50 flex-shrink-0 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="p-8 relative z-10">
        <h1 className="text-2xl font-black text-white tracking-tighter leading-none mb-1">
          EREDIVISIE
        </h1>
        <h2 className="text-xl font-light text-emerald-500 tracking-widest flex items-center gap-2">
            MANAGER <span className="text-[10px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-bold">'26</span>
        </h2>
        <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Current Club</div>
            <div className="text-white font-bold truncate">{teamName}</div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 relative z-10 overflow-y-auto">
        <div className="text-xs font-bold text-slate-600 uppercase tracking-widest px-4 mb-2 mt-4">Main Menu</div>
        <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem view="inbox" icon={Mail} label="Inbox" badge={unreadCount > 0 ? unreadCount : undefined} />
        <NavItem view="squad" icon={Users} label="Squad & Tactics" />
        <NavItem view="transfers" icon={Briefcase} label="Transfer Market" />
        <NavItem view="league" icon={Trophy} label="Competition" />
        <NavItem view="results" icon={Calendar} label="Results & Fixtures" />
        
        <div className="text-xs font-bold text-slate-600 uppercase tracking-widest px-4 mb-2 mt-8">Match Day</div>
        <NavItem view="match" icon={PlayCircle} label="Next Match" />
      </nav>

      <div className="p-6 relative z-10 border-t border-slate-800/50">
          <button className="w-full text-xs text-slate-500 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2">
              <Settings size={12} /> Game Settings
          </button>
      </div>
    </div>
  );
};
