import React from 'react';
import { LayoutDashboard, Building2, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  hasProfile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, hasProfile }) => {
  return (
    <div className="w-72 h-full flex flex-col bg-white/20 backdrop-blur-2xl border border-white/30 rounded-[2rem] shadow-xl text-slate-700 overflow-hidden shrink-0">
      
      {/* Brand Header */}
      <div className="p-8 flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-800 tracking-tight leading-none">WinningOffer</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">AI Workspace</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-3">
        <button
          onClick={() => onChangeView(AppView.DASHBOARD)}
          className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
            currentView === AppView.DASHBOARD 
                ? 'bg-white shadow-lg text-indigo-600' 
                : 'hover:bg-white/40 text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard size={20} className={currentView === AppView.DASHBOARD ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-800'} />
          <span className="font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => onChangeView(AppView.ONBOARDING)}
          className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
            currentView === AppView.ONBOARDING 
                ? 'bg-white shadow-lg text-indigo-600' 
                : 'hover:bg-white/40 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 size={20} className={currentView === AppView.ONBOARDING ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-800'} />
          <span className="font-medium">Business Profile</span>
        </button>

        <button
          disabled={!hasProfile}
          onClick={() => onChangeView(AppView.OFFER_CREATION)}
          className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
            currentView === AppView.OFFER_CREATION 
                ? 'bg-white shadow-lg text-indigo-600' 
                : 'hover:bg-white/40 text-slate-600 hover:text-slate-900'
          } ${!hasProfile ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}`}
        >
          <Send size={20} className={currentView === AppView.OFFER_CREATION ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-800'} />
          <span className="font-medium">Create Offer</span>
        </button>
      </nav>

      {/* User Footer */}
      <div className="p-6 mt-auto">
        <div className="bg-white/30 rounded-2xl p-4 border border-white/40 backdrop-blur-md flex items-center space-x-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-300 shadow-sm border border-white"></div>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Demo User</span>
                <span className="text-[10px] text-slate-500">Pro Plan Active</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;