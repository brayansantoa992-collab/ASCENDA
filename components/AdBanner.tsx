
import React, { useState, useEffect } from 'react';
import { ArrowTopRightOnSquareIcon, XMarkIcon, PlayCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

interface AdBannerProps {
  format?: 'BANNER' | 'RECTANGLE' | 'NATIVE' | 'REWARDED';
  onClose?: () => void;
  onReward?: () => void;
}

const ADS = [
    {
        title: "Invista com Inteligência",
        desc: "Aprenda a operar Day Trade com os melhores do mercado. Curso Gratuito.",
        cta: "Começar Agora",
        color: "from-slate-800 to-slate-900",
        border: "border-green-900/50",
        icon: "📈",
        videoColor: "bg-green-900"
    },
    {
        title: "Inglês em 8 Semanas",
        desc: "Método revolucionário para destravar sua fala. Aulas ao vivo 24h.",
        cta: "Ver Oferta",
        color: "from-blue-900 to-slate-900",
        border: "border-blue-800/50",
        icon: "🇺🇸",
        videoColor: "bg-blue-900"
    },
    {
        title: "Game: Dragon War",
        desc: "Jogue agora o RPG mais baixado do ano. Grátis para jogar.",
        cta: "Baixar Agora",
        color: "from-red-900 to-slate-900",
        border: "border-red-800/50",
        icon: "🐉",
        videoColor: "bg-red-900"
    },
    {
        title: "Maquininha Ton",
        desc: "As menores taxas do mercado para seu negócio. Receba em 1 dia.",
        cta: "Pedir a Minha",
        color: "from-green-900 to-emerald-950",
        border: "border-green-600/30",
        icon: "💳",
        videoColor: "bg-emerald-900"
    }
];

const AdBanner: React.FC<AdBannerProps> = ({ format = 'BANNER', onClose, onReward }) => {
  const [ad] = useState(() => ADS[Math.floor(Math.random() * ADS.length)]);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds for video ad
  const [canClose, setCanClose] = useState(false);
  const [muted, setMuted] = useState(true);

  // Timer Logic for Rewarded Ads
  useEffect(() => {
      if (format === 'REWARDED') {
          const timer = setInterval(() => {
              setTimeLeft((prev) => {
                  if (prev <= 1) {
                      clearInterval(timer);
                      setCanClose(true);
                      if (onReward) onReward();
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
          return () => clearInterval(timer);
      }
  }, [format, onReward]);

  if (format === 'REWARDED') {
      return (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-fade-in">
              {/* Header */}
              <div className="flex justify-between items-center p-4 absolute top-0 w-full z-20 bg-gradient-to-b from-black/80 to-transparent">
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                      <span className="text-xs text-white font-bold">Anúncio</span>
                      <span className="text-xs text-slate-300">|</span>
                      <span className="text-xs text-white font-mono">{timeLeft > 0 ? `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}` : 'Terminado'}</span>
                  </div>
                  <button 
                    onClick={() => setMuted(!muted)}
                    className="p-2 bg-black/40 rounded-full text-white backdrop-blur-md border border-white/10"
                  >
                      {muted ? <SpeakerXMarkIcon className="w-5 h-5"/> : <SpeakerWaveIcon className="w-5 h-5"/>}
                  </button>
              </div>

              {/* Close Button (Hidden initially) */}
              {canClose && (
                  <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-30 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white backdrop-blur-md transition-all border border-white/20 animate-scale-in"
                  >
                      <XMarkIcon className="w-6 h-6" />
                  </button>
              )}

              {/* Video Simulation Area */}
              <div className={`flex-1 relative flex items-center justify-center ${ad.videoColor} overflow-hidden`}>
                  {/* Background Animation */}
                  <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse-slow"></div>
                  </div>
                  
                  <div className="text-center z-10 p-8">
                      <div className="text-8xl mb-6 animate-bounce">{ad.icon}</div>
                      <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">{ad.title}</h2>
                      <p className="text-white/80 text-lg font-medium max-w-md mx-auto">{ad.desc}</p>
                  </div>

                  {/* Fake Video Progress Bar */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                      <div 
                        className="h-full bg-white transition-all duration-1000 ease-linear" 
                        style={{ width: `${((10 - timeLeft) / 10) * 100}%` }}
                      ></div>
                  </div>
              </div>

              {/* Bottom CTA */}
              <div className="bg-slate-900 p-6 pb-10 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl border border-slate-700">
                          {ad.icon}
                      </div>
                      <div>
                          <h4 className="text-white font-bold text-sm">{ad.title}</h4>
                          <p className="text-slate-400 text-xs">Patrocinado</p>
                      </div>
                  </div>
                  <button className="bg-brand-600 hover:bg-brand-500 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-brand-600/20 animate-pulse">
                      {ad.cta}
                  </button>
              </div>
          </div>
      );
  }

  if (format === 'NATIVE') {
      return (
        <div className={`relative w-full bg-gradient-to-br ${ad.color} border ${ad.border} p-4 rounded-xl my-4 shadow-lg group overflow-hidden`}>
            <div className="absolute top-2 right-2 text-[9px] bg-black/40 text-slate-400 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-wider">
                Patrocinado
            </div>
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl shadow-inner">
                    {ad.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                        {ad.title} <ArrowTopRightOnSquareIcon className="w-3 h-3 text-slate-400"/>
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-3">{ad.desc}</p>
                    <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold py-2 rounded-lg transition-all">
                        {ad.cta}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="w-full bg-slate-950 border-y border-slate-800 p-3 flex items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-3">
            <div className="bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-500 border border-slate-700 uppercase">
                Ad
            </div>
            <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">
                {ad.title}: {ad.desc}
            </span>
        </div>
        <button className="text-brand-400 text-xs font-bold whitespace-nowrap hover:underline flex items-center gap-1">
            {ad.cta} <ArrowTopRightOnSquareIcon className="w-3 h-3"/>
        </button>
        {onClose && (
            <button onClick={onClose} className="text-slate-600 hover:text-white">
                <XMarkIcon className="w-4 h-4"/>
            </button>
        )}
    </div>
  );
};

export default AdBanner;
