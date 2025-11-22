
import React, { useState, useEffect } from 'react';
import { ViewState, SubscriptionPlan, UserProfile } from './types';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import JobFinder from './components/JobFinder';
import IdeaGenerator from './components/IdeaGenerator';
import CourseFinder from './components/CourseFinder';
import FinancialQuiz from './components/FinancialQuiz';
import AiMentor from './components/AiMentor';
import ProfileSettings from './components/ProfileSettings';
import Feed from './components/Feed';
import StudentHub from './components/StudentHub';
import NearMe from './components/NearMe';
import FinanceManager from './components/FinanceManager';
import InvestmentSimulator from './components/InvestmentSimulator';
import LoginScreen from './components/LoginScreen';
import { XMarkIcon, CheckIcon, CreditCardIcon, QrCodeIcon, DocumentTextIcon, ShieldCheckIcon, ArrowLeftIcon, LockClosedIcon, CloudArrowDownIcon, StarIcon, BriefcaseIcon, SparklesIcon, RocketLaunchIcon, AcademicCapIcon, ChartBarIcon, UserGroupIcon, GlobeAmericasIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

// Configuração dos Códigos Pix Copia e Cola
// Nota: Para os planos Premium e Yearly, estamos usando um código padrão (Medium) como placeholder
// até que os códigos específicos de R$ 29,90 e R$ 99,99 sejam gerados no seu banco.
const PIX_PAYLOADS: Record<number, { code: string, value: string }> = {
    [SubscriptionPlan.STUDENT]: {
        code: "00020101021126580014br.gov.bcb.pix0136e8615822-69ed-4c94-a69b-5292e4bbffdb5204000053039865802BR5922BRAYAN DOS S FRIEDRICH6008VALINHOS62070503***63044332",
        value: "4,90"
    },
    [SubscriptionPlan.BASIC]: {
        code: "00020101021126580014br.gov.bcb.pix0136e8615822-69ed-4c94-a69b-5292e4bbffdb5204000053039865802BR5922BRAYAN DOS S FRIEDRICH6008VALINHOS62070503***63044332",
        value: "9,90"
    },
    [SubscriptionPlan.MEDIUM]: {
        code: "00020101021126870014br.gov.bcb.pix0136e8615822-69ed-4c94-a69b-5292e4bbffdb0225Assinatura mensal de 1490520400005303986540514.905802BR5922BRAYAN DOS S FRIEDRICH6008VALINHOS62070503***6304C350",
        value: "14,90"
    },
    [SubscriptionPlan.PREMIUM]: {
        // Placeholder - Substituir pelo código real de R$ 29,90
        code: "00020101021126870014br.gov.bcb.pix0136e8615822-69ed-4c94-a69b-5292e4bbffdb0225Assinatura mensal de 1490520400005303986540514.905802BR5922BRAYAN DOS S FRIEDRICH6008VALINHOS62070503***6304C350", 
        value: "29,90"
    },
    [SubscriptionPlan.YEARLY]: {
        // Placeholder - Substituir pelo código real de R$ 99,99
        code: "00020101021126870014br.gov.bcb.pix0136e8615822-69ed-4c94-a69b-5292e4bbffdb0225Assinatura mensal de 1490520400005303986540514.905802BR5922BRAYAN DOS S FRIEDRICH6008VALINHOS62070503***6304C350", 
        value: "99,99"
    }
};

type CheckoutStep = 'PLAN' | 'METHOD' | 'REVIEW' | 'PROCESSING' | 'SUCCESS';
type PaymentMethod = 'CREDIT_CARD' | 'PIX' | 'BOLETO';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN);
  const [plan, setPlan] = useState<SubscriptionPlan>(SubscriptionPlan.FREE);
  
  const [showSplash, setShowSplash] = useState(true);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('PLAN');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SubscriptionPlan.PREMIUM);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [processingStage, setProcessingStage] = useState<string>('');
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');

  const [incomingChatTarget, setIncomingChatTarget] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [initialJobFilters, setInitialJobFilters] = useState<{contract: string, level: string} | undefined>(undefined);

  useEffect(() => {
    const storedUser = localStorage.getItem('ascenda_user');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            if (parsedUser.role === 'Premium') setPlan(SubscriptionPlan.PREMIUM);
            else if (parsedUser.role === 'Pro') setPlan(SubscriptionPlan.MEDIUM);
            else if (parsedUser.role === 'Basic') setPlan(SubscriptionPlan.BASIC);
            else if (parsedUser.role === 'Estudante') setPlan(SubscriptionPlan.STUDENT);
            else setPlan(SubscriptionPlan.FREE);
        } catch (e) {}
    }

    const reviewStatus = localStorage.getItem('ascenda_app_reviewed');
    if (!reviewStatus) {
        const timer = setTimeout(() => {
            setShowReviewPrompt(true);
        }, 1000 * 60 * 10);
        return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
      const cleanNum = cardNumber.replace(/\D/g, '');
      if (cleanNum.startsWith('4')) setCardBrand('visa');
      else if (cleanNum.startsWith('5')) setCardBrand('mastercard');
      else if (cleanNum.startsWith('3')) setCardBrand('amex');
      else setCardBrand('unknown');
  }, [cardNumber]);

  const handleFormatCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '');
      val = val.replace(/(.{4})/g, '$1 ').trim();
      setCardNumber(val.substring(0, 19));
  };

  const handleFormatExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
      setCardExpiry(val.substring(0, 5));
  };

  const handleLogin = (loggedUser: UserProfile) => {
      setUser(loggedUser);
      localStorage.setItem('ascenda_user', JSON.stringify(loggedUser));
      setCurrentView(ViewState.DASHBOARD);
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('ascenda_user');
      setCurrentView(ViewState.LOGIN);
  };

  const handleOpenSubscribe = () => {
      setCheckoutStep('PLAN');
      setShowSubscribeModal(true);
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCVC('');
  };

  const handleSelectPlan = (p: SubscriptionPlan) => {
      setSelectedPlan(p);
      setCheckoutStep('METHOD');
  }

  const handleConfirmPayment = () => {
      setCheckoutStep('PROCESSING');
      setOrderId(`ORD-${Math.floor(Math.random() * 1000000)}`);
      
      const stages = [
          "Conectando ao gateway seguro...",
          "Verificando dados do cartão...",
          "Autenticando transação...",
          "Aprovando pagamento..."
      ];

      let currentStage = 0;
      setProcessingStage(stages[0]);

      const interval = setInterval(() => {
          currentStage++;
          if (currentStage < stages.length) {
              setProcessingStage(stages[currentStage]);
          } else {
              clearInterval(interval);
              setCheckoutStep('SUCCESS');
              setPlan(selectedPlan);
              setShowConfetti(true);
              
              if (user) {
                  const roleName = selectedPlan === SubscriptionPlan.PREMIUM ? 'Premium' : 
                                   selectedPlan === SubscriptionPlan.YEARLY ? 'Premium' : 
                                   selectedPlan === SubscriptionPlan.MEDIUM ? 'Pro' : 
                                   selectedPlan === SubscriptionPlan.STUDENT ? 'Estudante' : 'Basic';
                  const updated = { ...user, role: roleName };
                  setUser(updated);
                  localStorage.setItem('ascenda_user', JSON.stringify(updated));
              }

              setTimeout(() => setShowConfetti(false), 8000);
          }
      }, 1200);
  }

  const handleReviewSubmit = () => {
      localStorage.setItem('ascenda_app_reviewed', 'true');
      setShowReviewPrompt(false);
      alert("Obrigado pelo seu feedback! ⭐");
  }

  const getPrice = (p: SubscriptionPlan) => {
      switch(p) {
          case SubscriptionPlan.BASIC: return '9,90';
          case SubscriptionPlan.MEDIUM: return '14,90';
          case SubscriptionPlan.PREMIUM: return '29,90';
          case SubscriptionPlan.YEARLY: return '99,99';
          case SubscriptionPlan.STUDENT: return '4,90';
          default: return '0,00';
      }
  }

  const getPlanName = (p: SubscriptionPlan) => {
      switch(p) {
          case SubscriptionPlan.BASIC: return 'Plano Básico';
          case SubscriptionPlan.MEDIUM: return 'Plano Profissional';
          case SubscriptionPlan.PREMIUM: return 'Plano Empreendedor';
          case SubscriptionPlan.YEARLY: return 'Plano Anual (VIP)';
          case SubscriptionPlan.STUDENT: return 'Plano Universitário';
          default: return '';
      }
  }

  const getThemeClass = () => 'theme-blue';

  const Confetti = () => (
      <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
          {[...Array(50)].map((_, i) => (
              <div 
                key={i}
                className={`absolute w-2 h-2 rounded-full animate-float`}
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10px`,
                    backgroundColor: ['#f59e0b', '#2563eb', '#ffffff', '#10b981'][Math.floor(Math.random() * 4)],
                    animationDuration: `${2 + Math.random() * 3}s`,
                    animationDelay: `${Math.random()}s`
                }}
              ></div>
          ))}
      </div>
  )

  if (showSplash) {
      return (
          <div className="fixed inset-0 bg-[#050b14] flex flex-col items-center justify-between z-[100] overflow-hidden font-sans selection:bg-brand-500/30">
              <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" alt="World Connection" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/90 via-[#0f172a]/80 to-[#1e3a8a]/90"></div>
                  <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                  <div className="absolute bottom-[-10%] right-[-20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '2s'}}></div>
              </div>
              
              <div className="relative z-10 w-full h-full flex flex-col px-6 py-10 max-w-md mx-auto">
                  <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
                      <div className="relative mb-8 group">
                          <div className="absolute inset-[-20px] border border-white/10 rounded-full animate-spin-slow w-[160px] h-[160px] border-t-brand-500/50"></div>
                          <div className="absolute inset-[-10px] border border-white/5 rounded-full animate-spin-slow w-[140px] h-[140px] border-b-purple-500/50" style={{animationDirection: 'reverse', animationDuration: '12s'}}></div>
                          <div className="absolute inset-0 bg-brand-500 blur-3xl opacity-30 rounded-full animate-pulse"></div>
                          <div className="w-32 h-32 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 relative z-10 backdrop-blur-xl transform group-hover:scale-105 transition-transform duration-700">
                              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-transparent rounded-3xl"></div>
                              <BriefcaseIcon className="w-16 h-16 text-white drop-shadow-[0_0_25px_rgba(37,99,235,0.8)]" />
                              <div className="absolute -top-3 -right-3 bg-slate-800 p-2.5 rounded-2xl border border-slate-600 shadow-lg animate-float">
                                  <StarSolid className="w-5 h-5 text-amber-400" />
                              </div>
                              <div className="absolute -bottom-3 -left-3 bg-slate-800 p-2.5 rounded-2xl border border-slate-600 shadow-lg animate-float" style={{animationDelay: '1.5s'}}>
                                  <RocketLaunchIcon className="w-5 h-5 text-brand-400" />
                              </div>
                          </div>
                      </div>

                      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-brand-200 mb-2 tracking-tighter drop-shadow-xl text-center">
                          Ascenda
                      </h1>
                      <p className="text-brand-200 text-sm font-bold uppercase tracking-[0.3em] mb-8 opacity-80">O Futuro da sua Carreira</p>

                      <div className="grid grid-cols-2 gap-3 w-full">
                          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors duration-300">
                              <div className="bg-blue-500/20 p-2 rounded-full mb-2"><BriefcaseIcon className="w-5 h-5 text-blue-400"/></div>
                              <span className="text-white font-bold text-xs">Vagas IA</span>
                              <span className="text-[10px] text-slate-400">Curadoria Premium</span>
                          </div>
                          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors duration-300">
                              <div className="bg-green-500/20 p-2 rounded-full mb-2"><ChartBarIcon className="w-5 h-5 text-green-400"/></div>
                              <span className="text-white font-bold text-xs">Finanças</span>
                              <span className="text-[10px] text-slate-400">Gestão & Invest</span>
                          </div>
                          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors duration-300">
                              <div className="bg-purple-500/20 p-2 rounded-full mb-2"><AcademicCapIcon className="w-5 h-5 text-purple-400"/></div>
                              <span className="text-white font-bold text-xs">Cursos</span>
                              <span className="text-[10px] text-slate-400">Trilhas de Elite</span>
                          </div>
                          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors duration-300">
                              <div className="bg-amber-500/20 p-2 rounded-full mb-2"><GlobeAmericasIcon className="w-5 h-5 text-amber-400"/></div>
                              <span className="text-white font-bold text-xs">Network</span>
                              <span className="text-[10px] text-slate-400">Conexões Reais</span>
                          </div>
                      </div>
                  </div>

                  <div className="w-full pt-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
                      <button onClick={() => setShowSplash(false)} className="group w-full bg-gradient-to-r from-white to-slate-200 hover:to-white text-slate-950 font-black py-4 rounded-2xl text-lg shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent translate-x-[-100%] group-hover:animate-shimmer w-full h-full z-20"></div>
                          <span className="relative z-10 flex items-center gap-2">
                              INICIAR JORNADA <ArrowLeftIcon className="w-5 h-5 rotate-180 stroke-[3]" />
                          </span>
                      </button>
                      
                      <div className="mt-6 flex items-center justify-center gap-4 opacity-60">
                          <div className="flex -space-x-2">
                              {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900"></div>)}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">+15.000 Profissionais Ativos</p>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  if (!user || currentView === ViewState.LOGIN) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  return (
      <div className={`min-h-screen bg-slate-950 text-white pb-20 font-sans selection:bg-brand-500/30 ${getThemeClass()}`}>
          {showConfetti && <Confetti />}
          
          <main className="max-w-md mx-auto min-h-screen relative bg-slate-950 shadow-2xl overflow-hidden">
              <div className={`h-full p-4 overflow-y-auto no-scrollbar ${currentView === ViewState.MENTOR ? 'p-0' : ''}`}>
                
                {currentView === ViewState.DASHBOARD && (
                    <Dashboard onChangeView={setCurrentView} plan={plan} onSubscribe={handleOpenSubscribe} userName={user.name} />
                )}

                {currentView === ViewState.GENERATOR && (
                    <IdeaGenerator onBack={() => setCurrentView(ViewState.DASHBOARD)} userPlan={plan} />
                )}

                {currentView === ViewState.JOBS && (
                    <JobFinder 
                        plan={plan} 
                        onSubscribe={handleOpenSubscribe} 
                        onBack={() => { setCurrentView(ViewState.DASHBOARD); setInitialJobFilters(undefined); }} 
                        onChatWithCompany={(name) => { setIncomingChatTarget(name); setCurrentView(ViewState.MENTOR); }} 
                        user={user}
                        initialFilters={initialJobFilters} 
                    />
                )}

                {currentView === ViewState.FINANCE && (
                    <FinanceManager onBack={() => setCurrentView(ViewState.DASHBOARD)} />
                )}

                {currentView === ViewState.INVEST && (
                    <InvestmentSimulator onBack={() => setCurrentView(ViewState.DASHBOARD)} />
                )}

                {currentView === ViewState.COURSES && (
                     <CourseFinder plan={plan} onSubscribe={handleOpenSubscribe} onBack={() => setCurrentView(ViewState.DASHBOARD)} user={user} />
                )}

                {currentView === ViewState.QUIZ && (
                    <FinancialQuiz onBack={() => setCurrentView(ViewState.DASHBOARD)} />
                )}

                {currentView === ViewState.MENTOR && (
                    <AiMentor onBack={() => setCurrentView(ViewState.DASHBOARD)} wallpaper={user.settings.chatWallpaper} incomingChatTarget={incomingChatTarget} onUpdateSettings={(key, val) => { const updated = {...user, settings: {...user.settings, [key]: val}}; setUser(updated); localStorage.setItem('ascenda_user', JSON.stringify(updated)); }} />
                )}

                {currentView === ViewState.FEED && (
                    <Feed plan={plan} onSubscribe={handleOpenSubscribe} />
                )}

                {currentView === ViewState.STUDENTS && (
                    <StudentHub 
                        onBack={() => setCurrentView(ViewState.DASHBOARD)} 
                        onFindInternships={() => {
                            setInitialJobFilters({ contract: 'Estágio', level: 'Júnior' });
                            setCurrentView(ViewState.JOBS);
                        }}
                    />
                )}

                {currentView === ViewState.NEAR_ME && (
                    <NearMe onBack={() => setCurrentView(ViewState.DASHBOARD)} />
                )}

                {currentView === ViewState.PROFILE && (
                    <ProfileSettings user={user} onSave={(updated) => { setUser(updated); localStorage.setItem('ascenda_user', JSON.stringify(updated)); }} onLogout={handleLogout} onBack={() => setCurrentView(ViewState.DASHBOARD)} onRateApp={() => setShowReviewPrompt(true)} />
                )}
              </div>

              {currentView !== ViewState.LOGIN && (
                  <Navbar currentView={currentView} setView={setCurrentView} />
              )}

              {showSubscribeModal && (
                  <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fade-in">
                      <div className="bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-700 overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[95vh]">
                          <div className="bg-slate-950 px-4 py-2 flex justify-between items-center border-b border-slate-800">
                              <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-wider"><LockClosedIcon className="w-3 h-3" /> Ambiente Seguro SSL</div>
                              <button onClick={() => setShowSubscribeModal(false)} className="text-slate-500 hover:text-white"><XMarkIcon className="w-5 h-5"/></button>
                          </div>
                          {checkoutStep !== 'SUCCESS' && (<div className="flex w-full h-1 bg-slate-800"><div className={`h-full bg-brand-500 transition-all duration-500 ${checkoutStep === 'PLAN' ? 'w-1/4' : checkoutStep === 'METHOD' ? 'w-2/4' : checkoutStep === 'REVIEW' ? 'w-3/4' : 'w-full'}`}></div></div>)}
                          <div className="p-6 overflow-y-auto no-scrollbar bg-slate-900">
                              {checkoutStep !== 'SUCCESS' && (
                                  <div className="mb-6 flex items-center gap-3">
                                      {checkoutStep !== 'PLAN' && (<button onClick={() => setCheckoutStep(prev => prev === 'REVIEW' ? 'METHOD' : prev === 'METHOD' ? 'PLAN' : 'PLAN')} className="p-1 bg-slate-800 rounded-full text-slate-400 hover:text-white"><ArrowLeftIcon className="w-4 h-4"/></button>)}
                                      <h2 className="text-xl font-bold text-white">{checkoutStep === 'PLAN' ? 'Escolha seu Plano' : checkoutStep === 'METHOD' ? 'Forma de Pagamento' : checkoutStep === 'REVIEW' ? 'Revisar Pedido' : 'Processando...'}</h2>
                                  </div>
                              )}
                              {checkoutStep === 'PLAN' && (
                                  <div className="space-y-3">
                                      <div onClick={() => handleSelectPlan(SubscriptionPlan.YEARLY)} className="relative bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl group overflow-hidden">
                                          <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
                                          <div className="absolute -top-3 right-4 bg-amber-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-lg animate-pulse">Melhor Valor</div>
                                          <h3 className="text-xl font-black text-white mb-1 relative z-10">Anual VIP</h3>
                                          <p className="text-slate-400 text-xs mb-3 relative z-10">Acesso total por 12 meses.</p>
                                          <div className="text-2xl font-black text-amber-500 relative z-10">R$ 99,99 <span className="text-xs text-slate-500 font-normal">/ano</span></div>
                                      </div>
                                      {((user?.age && user.age <= 18) || plan === SubscriptionPlan.STUDENT) && (
                                          <div onClick={() => handleSelectPlan(SubscriptionPlan.STUDENT)} className="relative bg-gradient-to-br from-teal-900 to-slate-900 border border-teal-500/50 rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-transform shadow-xl group">
                                              <div className="absolute -top-3 right-4 bg-teal-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider shadow-lg">Exclusivo</div>
                                              <div className="flex items-center gap-2 mb-1"><h3 className="text-lg font-bold text-white">Plano Universitário</h3><AcademicCapIcon className="w-5 h-5 text-teal-400" /></div>
                                              <p className="text-teal-200 text-xs mb-2">Espaço do Estudante + IA Sem Anúncios</p>
                                              <div className="text-xl font-bold text-white">R$ 4,90 <span className="text-xs text-slate-500 font-normal">/mês</span></div>
                                          </div>
                                      )}
                                      {[{ id: SubscriptionPlan.PREMIUM, name: 'Empreendedor', price: '29,90', desc: 'Vagas Premium + IA Tools', color: 'border-brand-500' }, { id: SubscriptionPlan.MEDIUM, name: 'Profissional', price: '14,90', desc: 'Gestão Financeira + Cursos', color: 'border-purple-500' }, { id: SubscriptionPlan.BASIC, name: 'Básico', price: '9,90', desc: 'Sem anúncios', color: 'border-slate-500' }].map(p => (
                                          <div key={p.id} onClick={() => handleSelectPlan(p.id)} className={`relative bg-slate-800 border border-slate-700 rounded-2xl p-5 cursor-pointer hover:${p.color} transition-all hover:bg-slate-750`}>
                                              <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3><p className="text-slate-400 text-xs mb-2">{p.desc}</p><div className="text-xl font-bold text-white">R$ {p.price} <span className="text-xs text-slate-500 font-normal">/mês</span></div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                              {checkoutStep === 'METHOD' && (
                                  <div className="space-y-6 animate-fade-in">
                                      <div className="flex bg-slate-800 p-1 rounded-xl shadow-inner">
                                          <button onClick={() => setPaymentMethod('PIX')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${paymentMethod === 'PIX' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><QrCodeIcon className="w-4 h-4"/> Pix</button>
                                          <button onClick={() => setPaymentMethod('CREDIT_CARD')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${paymentMethod === 'CREDIT_CARD' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><CreditCardIcon className="w-4 h-4"/> Cartão</button>
                                          <button onClick={() => setPaymentMethod('BOLETO')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${paymentMethod === 'BOLETO' ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><DocumentTextIcon className="w-4 h-4"/> Boleto</button>
                                      </div>
                                      {paymentMethod === 'CREDIT_CARD' && (
                                          <div className="space-y-5">
                                              <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-6 rounded-2xl border border-white/10 relative overflow-hidden h-48 flex flex-col justify-between shadow-2xl transform transition-all hover:scale-[1.02]">
                                                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                                                  <div className="flex justify-between items-start z-10"><div className="w-12 h-8 bg-gradient-to-r from-amber-200 to-amber-500 rounded-md border border-amber-600 shadow-sm flex items-center justify-center"><div className="w-8 h-5 border border-amber-600/50 rounded-sm grid grid-cols-2 gap-1"></div></div><span className="text-white/80 font-bold italic text-lg uppercase tracking-wider">{cardBrand !== 'unknown' ? cardBrand : 'BANK'}</span></div>
                                                  <div className="z-10"><p className="text-xl font-mono text-white tracking-[0.15em] drop-shadow-md mb-4 h-8 flex items-center">{cardNumber || '•••• •••• •••• ••••'}</p><div className="flex justify-between text-slate-300 text-[10px] uppercase tracking-widest font-medium"><div className="flex flex-col"><span className="text-[8px] opacity-70">Titular</span><span className="text-white text-xs">{cardName || 'SEU NOME'}</span></div><div className="flex flex-col items-end"><span className="text-[8px] opacity-70">Validade</span><span className="text-white text-xs">{cardExpiry || 'MM/AA'}</span></div></div></div>
                                              </div>
                                              <div className="space-y-3">
                                                <input placeholder="Número do Cartão" value={cardNumber} onChange={handleFormatCardNumber} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-white text-sm outline-none focus:border-brand-500 font-mono"/>
                                                <input placeholder="Nome do Titular" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-white text-sm outline-none focus:border-brand-500 uppercase"/>
                                                <div className="grid grid-cols-2 gap-4"><input placeholder="Validade (MM/AA)" value={cardExpiry} onChange={handleFormatExpiry} className="bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-white text-sm outline-none focus:border-brand-500 text-center"/><div className="relative"><input placeholder="CVV" maxLength={4} type="password" value={cardCVC} onChange={e => setCardCVC(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-white text-sm outline-none focus:border-brand-500 text-center"/><LockClosedIcon className="w-4 h-4 text-slate-500 absolute right-3 top-3.5" /></div></div>
                                              </div>
                                          </div>
                                      )}
                                      {paymentMethod !== 'CREDIT_CARD' && (<div className="bg-blue-900/10 p-6 rounded-2xl border border-blue-500/20 text-center animate-fade-in"><div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">{paymentMethod === 'PIX' ? <QrCodeIcon className="w-6 h-6"/> : <DocumentTextIcon className="w-6 h-6"/>}</div><h3 className="text-white font-bold mb-1">Pagamento via {paymentMethod === 'PIX' ? 'Pix' : 'Boleto'}</h3><p className="text-sm text-slate-400 leading-relaxed mb-4">{paymentMethod === 'PIX' ? 'Aprovação imediata. QR Code gerado na próxima tela.' : 'Pode levar até 3 dias úteis para compensar.'}</p></div>)}
                                      <div className="pt-4"><button onClick={() => setCheckoutStep('REVIEW')} disabled={paymentMethod === 'CREDIT_CARD' && (!cardNumber || !cardName || !cardExpiry || !cardCVC)} className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-xl text-white font-bold shadow-xl shadow-brand-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2">Revisar Pedido <ArrowLeftIcon className="w-4 h-4 rotate-180" /></button><p className="text-center text-[10px] text-slate-500 mt-3 flex items-center justify-center gap-1"><ShieldCheckIcon className="w-3 h-3"/> Dados criptografados de ponta a ponta.</p></div>
                                  </div>
                              )}
                              {checkoutStep === 'REVIEW' && (
                                  <div className="space-y-6 animate-slide-up">
                                      <div className="bg-white text-slate-900 rounded-xl p-6 shadow-lg relative overflow-hidden">
                                          <div className="border-b border-slate-200 pb-4 mb-4 flex justify-between items-center"><span className="font-black tracking-tight text-lg">RESUMO</span><span className="text-xs text-slate-500 font-mono">{new Date().toLocaleDateString()}</span></div>
                                          <div className="space-y-3 mb-6"><div className="flex justify-between"><span className="text-sm font-medium text-slate-600">{getPlanName(selectedPlan)}</span><span className="text-sm font-bold">R$ {getPrice(selectedPlan)}</span></div><div className="flex justify-between"><span className="text-sm text-slate-500">Taxa de Serviço</span><span className="text-sm text-emerald-600 font-medium">Grátis</span></div><div className="flex justify-between text-xs text-slate-400"><span>Método</span><span className="uppercase">{paymentMethod}</span></div></div>
                                          <div className="border-t-2 border-slate-900 border-dashed pt-4 flex justify-between items-end"><span className="font-black text-xl">TOTAL</span><span className="font-black text-2xl text-brand-600">R$ {getPrice(selectedPlan)}</span></div>
                                          <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-900" style={{clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)'}}></div>
                                      </div>
                                      <button onClick={handleConfirmPayment} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl text-white font-black shadow-xl shadow-emerald-600/20 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"><ShieldCheckIcon className="w-5 h-5"/> Confirmar e Pagar</button>
                                  </div>
                              )}
                              {checkoutStep === 'PROCESSING' && (
                                  <div className="text-center py-12 animate-fade-in">
                                      {paymentMethod === 'PIX' ? (
                                          <div className="space-y-6"><div className="bg-white p-4 rounded-xl w-56 h-56 mx-auto shadow-2xl shadow-emerald-500/10"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(PIX_PAYLOADS[selectedPlan]?.code || PIX_PAYLOADS[SubscriptionPlan.BASIC].code)}`} alt="Pix QR" className="w-full h-full" /></div><div><div className="mb-2 bg-slate-800 p-2 rounded flex justify-between items-center border border-slate-700 text-xs text-slate-300"><span>Valor: <strong>R$ {getPrice(selectedPlan)}</strong></span><span>Plano: <strong>{getPlanName(selectedPlan).split(' ')[1]}</strong></span></div><h3 className="text-white font-bold text-lg mb-1">Escaneie para pagar</h3><p className="text-slate-400 text-sm mb-4">Aprovação automática em segundos.</p><button onClick={() => navigator.clipboard.writeText(PIX_PAYLOADS[selectedPlan]?.code)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-slate-700">Copiar Código Pix</button></div><div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-mono animate-pulse"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div>Aguardando confirmação do banco...</div></div>
                                      ) : (
                                          <div className="space-y-6"><div className="relative w-24 h-24 mx-auto"><div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div><div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div><ShieldCheckIcon className="absolute inset-0 m-auto w-10 h-10 text-brand-500 animate-pulse" /></div><div><h3 className="text-white font-bold text-lg">Processando...</h3><p className="text-slate-400 text-sm font-mono mt-2">{processingStage}</p></div></div>
                                      )}
                                  </div>
                              )}
                              {checkoutStep === 'SUCCESS' && (
                                  <div className="text-center py-8 animate-slide-up"><div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(16,185,129,0.6)] animate-bounce"><CheckIcon className="w-14 h-14 text-white stroke-[3]" /></div><h2 className="text-3xl font-black text-white mb-2">Pagamento Aprovado!</h2><p className="text-slate-300 mb-8 max-w-[250px] mx-auto">Sua assinatura <strong>{getPlanName(selectedPlan)}</strong> já está ativa.</p><div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-8 flex items-center justify-between"><div className="text-left"><p className="text-[10px] text-slate-500 uppercase font-bold">Número do Pedido</p><p className="text-white font-mono text-sm">{orderId}</p></div><button className="text-brand-400 hover:text-brand-300 text-xs font-bold flex items-center gap-1"><CloudArrowDownIcon className="w-4 h-4"/> Recibo</button></div><button onClick={() => setShowSubscribeModal(false)} className="w-full bg-white hover:bg-slate-200 text-slate-900 font-black py-4 rounded-xl shadow-xl transition-transform hover:scale-[1.02]">Acessar Funcionalidades Pro</button></div>
                              )}
                          </div>
                      </div>
                  </div>
              )}

              {currentView === ViewState.LOGIN && (<footer className="absolute bottom-2 w-full text-center text-[10px] text-slate-600 opacity-50">v3.1.0 (Pro Edition)</footer>)}
          </main>
      </div>
  );
};

export default App;
