
import React, { useState, useEffect } from 'react';
import { generateBusinessIdeas, generateBusinessPlan } from '../services/geminiService';
import { BusinessIdea, BusinessPlan, LoadingState, UserProfile, SubscriptionPlan } from '../types';
import { CheckCircleIcon, CurrencyDollarIcon, ClockIcon, WrenchScrewdriverIcon, ArchiveBoxArrowDownIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import AdBanner from './AdBanner';

interface IdeaGeneratorProps {
  onBack: () => void;
  userPlan?: SubscriptionPlan;
}

const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ onBack, userPlan = SubscriptionPlan.FREE }) => {
  const [step, setStep] = useState<'FORM' | 'LIST' | 'PLAN'>('FORM');
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle' });
  const showAds = userPlan <= SubscriptionPlan.BASIC;
  
  const [profile, setProfile] = useState<UserProfile>({
    skills: '',
    budget: '',
    timeAvailable: '',
    interests: ''
  } as any);

  // Carregar perfil salvo
  useEffect(() => {
    const saved = localStorage.getItem('ascenda_profile');
    if (saved) {
        try {
            setProfile(JSON.parse(saved));
        } catch (e) {}
    }
  }, []);

  const saveProfile = () => {
      localStorage.setItem('ascenda_profile', JSON.stringify(profile));
      alert("Perfil salvo! Usaremos essas habilidades em todo o app.");
  };

  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [plan, setPlan] = useState<BusinessPlan | null>(null);

  const handleGenerateIdeas = async () => {
    if (!profile.skills || !profile.timeAvailable) return;
    
    setLoading({ status: 'loading', message: 'Analisando o mercado e suas skills...' });
    try {
      const result = await generateBusinessIdeas(profile);
      setIdeas(result);
      setStep('LIST');
      setLoading({ status: 'success' });
      // Auto-save on generate
      localStorage.setItem('ascenda_profile', JSON.stringify(profile));
    } catch (e) {
      setLoading({ status: 'error', message: 'Falha ao gerar ideias. Tente novamente.' });
    }
  };

  const handleGeneratePlan = async (idea: BusinessIdea) => {
    setSelectedIdea(idea);
    setLoading({ status: 'loading', message: `Criando estratégia para ${idea.title}...` });
    try {
      const result = await generateBusinessPlan(idea.title);
      setPlan(result);
      setStep('PLAN');
      setLoading({ status: 'success' });
    } catch (e) {
      setLoading({ status: 'error', message: 'Erro ao criar o plano.' });
    }
  };

  if (loading.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-pulse">
        <div className="w-20 h-20 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-400 font-medium text-center px-4">{loading.message}</p>
        {showAds && <div className="mt-8 w-full px-4"><AdBanner format="NATIVE"/></div>}
      </div>
    );
  }

  if (step === 'PLAN' && plan && selectedIdea) {
    return (
      <div className="pb-24 animate-fade-in">
        <button 
          onClick={() => setStep('LIST')}
          className="mb-4 text-sm text-slate-400 hover:text-brand-500 flex items-center gap-2"
        >
          ← Voltar para Ideias
        </button>
        
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl mb-6">
          <h2 className="text-2xl font-bold text-brand-400 mb-2">{selectedIdea.title}</h2>
          <p className="text-slate-300 mb-6 italic border-l-2 border-brand-500 pl-4">{plan.summary}</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-brand-500" /> 
                Passos Iniciais
              </h3>
              <ul className="space-y-2">
                {plan.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-slate-300 text-sm">
                    <span className="bg-slate-700 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">{i+1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-white font-semibold mb-2">Estratégia de Marketing</h3>
              <p className="text-slate-400 text-sm">{plan.marketingStrategy}</p>
            </div>

            <div className="bg-brand-900/20 p-4 rounded-xl border border-brand-500/20">
              <h3 className="text-brand-400 font-semibold mb-2 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                Como Ganhar Dinheiro
              </h3>
              <p className="text-slate-300 text-sm">{plan.monetizationModel}</p>
            </div>
          </div>
        </div>
        
        {showAds && <AdBanner format="NATIVE" />}
      </div>
    );
  }

  if (step === 'LIST') {
    return (
      <div className="pb-24 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Resultados Encontrados</h2>
          <button onClick={() => setStep('FORM')} className="text-sm text-slate-400 underline">Refazer</button>
        </div>
        
        <div className="space-y-4">
          {ideas.map((idea, idx) => (
            <React.Fragment key={idx}>
                <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-brand-500/50 transition-all shadow-lg">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{idea.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    idea.difficulty === 'Fácil' ? 'bg-green-500/20 text-green-400' : 
                    idea.difficulty === 'Médio' ? 'bg-yellow-500/20 text-yellow-400' : 
                    'bg-red-500/20 text-red-400'
                    }`}>
                    {idea.difficulty}
                    </span>
                </div>
                <p className="text-slate-400 text-sm mb-4">{idea.description}</p>
                
                <div className="flex items-center gap-2 text-xs text-brand-400 mb-4 bg-brand-950/50 p-2 rounded-lg inline-block">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    {idea.estimatedIncome}
                </div>

                <button 
                    onClick={() => handleGeneratePlan(idea)}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-brand-600/20"
                >
                    Ver Plano de Ação
                </button>
                </div>
                {/* Insert Ad between items if Free user */}
                {showAds && idx === 1 && <AdBanner format="NATIVE" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fade-in">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1 -ml-2 text-slate-400 hover:text-white">
                 <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-white mb-0.5">Gerador de Ideias</h1>
                <p className="text-slate-400 text-sm">A IA criará um negócio baseado no seu perfil.</p>
            </div>
        </div>
        <button onClick={saveProfile} className="text-slate-500 hover:text-brand-500 transition-colors" title="Salvar Perfil">
            <ArchiveBoxArrowDownIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Suas Habilidades</label>
          <div className="relative">
            <WrenchScrewdriverIcon className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={profile.skills}
              onChange={(e) => setProfile({...profile, skills: e.target.value})}
              placeholder="Ex: Design, culinária, escrita..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Tempo Disponível</label>
          <div className="relative">
            <ClockIcon className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <select
              value={profile.timeAvailable}
              onChange={(e) => setProfile({...profile, timeAvailable: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none appearance-none"
            >
              <option value="">Selecione...</option>
              <option value="2-5 horas/semana">2-5 horas/semana</option>
              <option value="10-20 horas/semana">10-20 horas/semana</option>
              <option value="Tempo Integral">Tempo Integral</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Orçamento Inicial (Opcional)</label>
          <div className="relative">
            <CurrencyDollarIcon className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={profile.budget}
              onChange={(e) => setProfile({...profile, budget: e.target.value})}
              placeholder="Ex: Zero, R$ 100, R$ 5.000"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Interesses (Opcional)</label>
          <textarea
            value={profile.interests}
            onChange={(e) => setProfile({...profile, interests: e.target.value})}
            placeholder="O que você gosta de fazer no tempo livre?"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-slate-500 h-24 resize-none"
          />
        </div>

        <button
          onClick={handleGenerateIdeas}
          disabled={!profile.skills || !profile.timeAvailable}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all mt-4 ${
            !profile.skills || !profile.timeAvailable
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30 hover:shadow-brand-500/40 transform hover:-translate-y-1'
          }`}
        >
          Gerar Oportunidades
        </button>

        {/* Empty Space filled with Ad */}
        {showAds && (
            <div className="mt-8 pt-4 border-t border-slate-800">
                <p className="text-center text-[10px] text-slate-500 uppercase font-bold mb-2">Patrocinado</p>
                <AdBanner format="NATIVE" />
            </div>
        )}
      </div>
    </div>
  );
};

export default IdeaGenerator;
