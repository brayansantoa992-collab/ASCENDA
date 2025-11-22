
import React from 'react';
import { ViewState } from '../types';
import { HomeIcon, BriefcaseIcon, ChatBubbleLeftRightIcon, ChartPieIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, BriefcaseIcon as BriefcaseSolid, ChatBubbleLeftRightIcon as ChatSolid, ChartPieIcon as ChartSolid, ArrowTrendingUpIcon as ArrowSolid } from '@heroicons/react/24/solid';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  // Reorganized Navigation based on User Request
  // Removed Profile and NearMe from bottom bar to fit Finance and Invest
  const navItems = [
    { view: ViewState.DASHBOARD, label: 'Início', icon: HomeIcon, activeIcon: HomeSolid },
    { view: ViewState.FINANCE, label: 'Gestão', icon: ChartPieIcon, activeIcon: ChartSolid },
    { view: ViewState.MENTOR, label: 'Conversas', icon: ChatBubbleLeftRightIcon, activeIcon: ChatSolid, isMain: true },
    { view: ViewState.INVEST, label: 'Bolsa', icon: ArrowTrendingUpIcon, activeIcon: ArrowSolid },
    { view: ViewState.JOBS, label: 'Vagas', icon: BriefcaseIcon, activeIcon: BriefcaseSolid },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 pb-safe pt-2 px-1 h-[80px] z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-end max-w-md mx-auto h-full pb-4 px-2">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          if (item.isMain) {
              return (
                <button
                    key={item.view}
                    onClick={() => setView(item.view)}
                    className="relative -top-6 group"
                >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${isActive ? 'bg-brand-500 text-white shadow-brand-500/50 scale-110' : 'bg-slate-800 text-brand-400 border border-slate-600 shadow-lg'}`}>
                        <Icon className="h-7 w-7" />
                    </div>
                    <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap ${isActive ? 'text-brand-400' : 'text-slate-500'}`}>Chat</span>
                </button>
              )
          }

          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center w-full transition-all duration-200 ${
                isActive ? 'text-white -translate-y-1' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isActive ? 'drop-shadow-glow text-brand-400' : ''}`} />
              <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;
