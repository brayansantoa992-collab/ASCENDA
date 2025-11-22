
import React, { useEffect, useState } from 'react';
import { generateDailyTip } from '../services/geminiService';
import { ViewState, SubscriptionPlan } from '../types';
import { ArrowRightIcon, BriefcaseIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, PuzzlePieceIcon, StarIcon, RocketLaunchIcon, SparklesIcon, PlayCircleIcon, GiftIcon, MapPinIcon, UserCircleIcon, FireIcon } from '@heroicons/react/24/outline';
import AdBanner from './AdBanner';

interface DashboardProps {
  onChangeView: (view: ViewState) => void;
  plan: SubscriptionPlan;
  onSubscribe: () => void;
  userName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView, plan, onSubscribe, userName }) => {
  const [tip, setTip] = useState<string>('Analisando tendências de mercado...');
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  useEffect(() => {
    const fetchTip = async () => {
      const result = await generateDailyTip();
      setTip(result);
    };
    fetchTip();
  }, []);

  const handleAdReward = () => {
      alert("Obrigado por apoiar o Ascenda! Você ganhou +50 XP.");
  };

  const getPlanBadge = () => {
    if (plan === SubscriptionPlan.PREMIUM) {
        return (
            <div className="h-8 px-4 rounded-full bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-[length:200%_auto] animate-gradient border border-yellow-400/30 flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-amber-500/20 gap-2 tracking-wide uppercase">
                <StarIcon className="w-3 h-3" /> Empreendedor
            </div>
        );
    }
    // ... other plans (omitted for brevity if unchanged, but keeping structure)
    return (
        <button 
            onClick={onSubscribe}
            className="h-8 px-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-full flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-all transform hover:scale-105 border border-brand-400/20 group"
        >
            <StarIcon className="h-3 w-3 text-white group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black text-white uppercase tracking-wide">Seja Pro</span>
        </button>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {showRewardedAd && (
          <AdBanner format="REWARDED" onClose={() => setShowRewardedAd(false)} onReward={handleAdReward} />
      )}

      <header className="flex items-center justify-between pt-2 mb-2">
        <div onClick={() => onChangeView(ViewState.PROFILE)} className="cursor-pointer">
          <p className="text-slate-400 text-xs font-semibold mb-1 tracking-wide">Bem-vindo de volta,</p>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1 flex items-center gap-2">
              {userName ? userName.split(' ')[0] : 'Visitante'} <UserCircleIcon className="w-6 h-6 text-slate-500"/>
          </h1>
        </div>
        {getPlanBadge()}
      </header>

      {/* ÁREA JOVEM - DESTAQUE PRINCIPAL */}
      <div 
        onClick={() => onChangeView(ViewState.STUDENTS)}
        className="relative overflow-hidden rounded-3xl cursor-pointer group border border-teal-500/30 shadow-2xl shadow-teal-900/20"
      >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-emerald-800 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
          {/* Decorative Elements */}
          <div className="absolute -right-5 -top-5 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          
          <div className="relative z-10 p-6 flex items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-black/30 text-teal-200 text-[9px] font-black px-2 py-0.5 rounded backdrop-blur-md border border-white/10 uppercase tracking-wider flex items-center gap-1">
                        <FireIcon className="w-3 h-3"/> Em Alta
                    </span>
                </div>
                <h3 className="text-white font-black text-2xl leading-none mb-2">Área Jovem</h3>
                <p className="text-teal-50 text-xs font-medium max-w-[200px] leading-relaxed">
                    Primeiro emprego, estágios e trilhas de carreira para quem está começando.
                </p>
                <button className="mt-4 bg-white text-teal-800 text-xs font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-teal-50 transition-colors flex items-center gap-2">
                    Acessar Espaço <ArrowRightIcon className="w-3 h-3"/>
                </button>
            </div>
            <div className="bg-white/10 p-4 rounded-full shadow-xl backdrop-blur-sm border border-white/20 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <RocketLaunchIcon className="w-8 h-8 text-white" />
            </div>
          </div>
      </div>

      {/* Daily Bonus */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900 p-4 rounded-2xl border border-indigo-500/30 flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
              <h3 className="text-white font-bold text-sm flex items-center gap-2"><GiftIcon className="w-4 h-4 text-indigo-400"/> Bônus Diário</h3>
              <p className="text-indigo-200 text-xs mt-0.5">Ganhe XP apoiando o projeto.</p>
          </div>
          <button 
            onClick={() => setShowRewardedAd(true)}
            className="relative z-10 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2"
          >
              <PlayCircleIcon className="w-4 h-4"/> Assistir
          </button>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-3 px-1">
            Acesso Rápido
        </h3>
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onChangeView(ViewState.NEAR_ME)} className="glass-panel hover:bg-slate-800/60 p-4 rounded-2xl flex flex-col items-center text-center border border-slate-700/50 hover:border-emerald-500/40 transition-all">
                <MapPinIcon className="h-6 w-6 text-emerald-400 mb-2" />
                <h3 className="text-white font-bold text-sm">Perto de Mim</h3>
            </button>

            <button onClick={() => onChangeView(ViewState.COURSES)} className="glass-panel hover:bg-slate-800/60 p-4 rounded-2xl flex flex-col items-center text-center border border-slate-700/50 hover:border-purple-500/40 transition-all">
                <AcademicCapIcon className="h-6 w-6 text-purple-400 mb-2" />
                <h3 className="text-white font-bold text-sm">Educação</h3>
            </button>

            <button onClick={() => onChangeView(ViewState.QUIZ)} className="glass-panel hover:bg-slate-800/60 p-4 rounded-2xl flex flex-col items-center text-center border border-slate-700/50 hover:border-orange-500/40 transition-all">
                <PuzzlePieceIcon className="h-6 w-6 text-orange-400 mb-2" />
                <h3 className="text-white font-bold text-sm">Quiz</h3>
            </button>

            <button onClick={() => onChangeView(ViewState.GENERATOR)} className="glass-panel hover:bg-slate-800/60 p-4 rounded-2xl flex flex-col items-center text-center border border-slate-700/50 hover:border-blue-500/40 transition-all">
                <SparklesIcon className="h-6 w-6 text-blue-400 mb-2" />
                <h3 className="text-white font-bold text-sm">Gerador Ideias</h3>
            </button>
        </div>
      </div>
      
      {/* Tip */}
      <div className="relative glass-panel rounded-3xl p-6 mt-4">
        <div className="flex items-start gap-4 relative z-10">
            <span className="text-2xl">💡</span>
            <div>
                <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Dica do Dia</h2>
                <p className="text-slate-200 text-sm font-medium leading-relaxed italic">"{tip}"</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
