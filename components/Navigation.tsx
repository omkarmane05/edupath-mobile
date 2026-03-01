
import React from 'react';
import { Compass, FileText, Bell, BookOpen, Users, Activity, StickyNote, FlaskConical } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  setTab: (tab: string) => void;
  isAdmin: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab, isAdmin }) => {
  const tabs = isAdmin
    ? [{ id: 'users', label: 'Users', icon: Users }]
    : [
      { id: 'explore', label: 'Explore', icon: Compass },
      { id: 'jobs', label: 'Match', icon: FileText },
      { id: 'labs', label: 'Labs', icon: FlaskConical },
      { id: 'library', label: 'Hub', icon: BookOpen },
      { id: 'updates', label: 'Pulse', icon: Bell },
      { id: 'notes', label: 'Notes', icon: StickyNote },
      { id: 'applied', label: 'Log', icon: Activity },
    ];


  return (
    <nav className="bg-white/95 backdrop-blur-2xl border-t border-slate-100 px-3 pb-[env(safe-area-inset-bottom,12px)] pt-3 flex justify-around items-center z-[100] h-[calc(70px+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (window.navigator.vibrate) window.navigator.vibrate(12);
              setTab(tab.id);
            }}
            className={`flex flex-col items-center justify-center w-full gap-1.5 transition-all relative ${isActive ? 'text-blue-600' : 'text-slate-300'
              }`}
          >
            {isActive && <div className="absolute -top-[14px] w-8 h-1 bg-blue-600 rounded-full animate-in fade-in zoom-in duration-300" />}
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
            <span className="text-[8px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
