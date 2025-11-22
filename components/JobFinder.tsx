
import React, { useState, useEffect, useRef } from 'react';
import { findJobOpportunities, generateResume, generateSpontaneousApplication, generateNegotiationScript, recommendTargetCompanies } from '../services/geminiService';
import { JobOpportunity, LoadingState, SubscriptionPlan, GeneratedResume, SpontaneousApplication, UserProfile } from '../types';
import { playSound } from '../services/soundService';
import { BriefcaseIcon, MagnifyingGlassIcon, SparklesIcon, DocumentTextIcon, PaperAirplaneIcon, BuildingOfficeIcon, ArrowLeftIcon, CurrencyDollarIcon, BookmarkIcon, LockClosedIcon, BellIcon, XMarkIcon, BuildingLibraryIcon, BoltIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon, StarIcon as StarSolidIcon, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import AdBanner from './AdBanner';

interface JobFinderProps {
  plan: SubscriptionPlan;
  onSubscribe: () => void;
  onBack: () => void;
  onChatWithCompany: (companyName: string) => void;
  user?: UserProfile | null;
  initialFilters?: { contract: string; level: string; };
}

const BR_CITIES = [
    "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Brasília, DF", "Curitiba, PR",
    "Salvador, BA", "Fortaleza, CE", "Manaus, AM", "Recife, PE", "Porto Alegre, RS",
    "Goiânia, GO", "Belém, PA", "Guarulhos, SP", "Campinas, SP", "Valinhos, SP", "Santos, SP"
];

const COMMON_ROLES = [
    "Desenvolvedor Frontend", "Desenvolvedor Backend", "Designer Gráfico", "Gerente de Projetos", 
    "Analista de Dados", "Marketing Digital", "Assistente Administrativo", "Vendedor"
];

const JobFinder: React.FC<JobFinderProps> = ({ plan, onSubscribe, onBack, onChatWithCompany, user, initialFilters }) => {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'SAVED' | 'TOOLS'>('SEARCH');
  const showAds = plan <= SubscriptionPlan.BASIC;

  const [role, setRole] = useState('');
  const [specificSkills, setSpecificSkills] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredRoles, setFilteredRoles] = useState<string[]>([]);
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  
  const [contract, setContract] = useState('Qualquer');
  const [level, setLevel] = useState('Qualquer');
  const [modality, setModality] = useState('Qualquer');
  const [minSalary, setMinSalary] = useState(0);

  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle' });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newJobAlert, setNewJobAlert] = useState(false);

  const [toolType, setToolType] = useState<'RESUME' | 'EMAIL' | 'NEGOTIATION' | 'COMPANIES' | null>(null);
  const [resumeData, setResumeData] = useState<GeneratedResume | null>(null);
  const [emailData, setEmailData] = useState<SpontaneousApplication | null>(null);
  const [negotiationScript, setNegotiationScript] = useState<string>('');
  const [targetCompanies, setTargetCompanies] = useState<Array<{name: string, reason: string}>>([]);
  
  const [toolRole, setToolRole] = useState('');
  const [toolLocation, setToolLocation] = useState('');
  const [toolCompany, setToolCompany] = useState('');
  const [toolCurrentSalary, setToolCurrentSalary] = useState('');
  
  const [showFlashApplyModal, setShowFlashApplyModal] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobOpportunity | null>(null);
  const [flashApplyLoading, setFlashApplyLoading] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) { setShowCitySuggestions(false); }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) { setShowRoleSuggestions(false); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  useEffect(() => {
    const savedProfile = localStorage.getItem('ascenda_profile');
    if (savedProfile && specificSkills.length === 0) {
        try {
            const p = JSON.parse(savedProfile);
            if (p.skills) {
                const skillsArray = p.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
                if (skillsArray.length > 0) setSpecificSkills(prev => [...prev, ...skillsArray]);
            }
            if(p.role) setToolRole(p.role);
        } catch (e) { }
    }

    const storedJobs = localStorage.getItem('ascenda_saved_jobs');
    if (storedJobs) {
        try { setSavedJobs(JSON.parse(storedJobs)); } catch (e) {}
    }

    if (initialFilters) {
        setContract(initialFilters.contract);
        setLevel(initialFilters.level);
        setActiveTab('SEARCH');
    }

    const timer = setTimeout(() => {
        setNewJobAlert(true);
        playSound('RECEIVE');
        setTimeout(() => setNewJobAlert(false), 5000);
    }, 15000);

    return () => clearTimeout(timer);
  }, [initialFilters]);

  const toggleSaveJob = (job: JobOpportunity) => {
      const isSaved = savedJobs.some(j => j.id === job.id);
      const newSavedList = isSaved ? savedJobs.filter(j => j.id !== job.id) : [...savedJobs, job];
      setSavedJobs(newSavedList);
      localStorage.setItem('ascenda_saved_jobs', JSON.stringify(newSavedList));
  };

  const isJobSaved = (id: string) => savedJobs.some(j => j.id === id);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocation(val);
      if (val.length > 0) {
          setFilteredCities(BR_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())));
          setShowCitySuggestions(true);
      } else { setShowCitySuggestions(false); }
  };

  const selectCity = (city: string) => { setLocation(city); setShowCitySuggestions(false); };

  const handleUseCurrentLocation = () => {
      if (!navigator.geolocation) { alert("Geolocalização não suportada."); return; }
      setLoading({ status: 'loading', message: 'Obtendo localização...' });
      navigator.geolocation.getCurrentPosition(async (position) => {
          try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await response.json();
              const city = data.address.city || data.address.town || "Sua Localização";
              setLocation(city);
              setLoading({ status: 'idle' });
          } catch (error) { setLocation("Localização Atual"); setLoading({ status: 'idle' }); }
      }, () => { setLoading({ status: 'idle' }); alert("Permissão negada."); });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setRole(val);
      if (val.length > 0) {
          setFilteredRoles(COMMON_ROLES.filter(r => r.toLowerCase().includes(val.toLowerCase())));
          setShowRoleSuggestions(true);
      } else { setShowRoleSuggestions(false); }
  };

  const selectRole = (r: string) => { setRole(r); setShowRoleSuggestions(false); };

  const handleSearch = async () => {
    if (!role && specificSkills.length === 0) return;
    setLoading({ status: 'loading', message: 'Buscando oportunidades...' });
    try {
      const filtersToUse = plan >= SubscriptionPlan.PREMIUM ? { contract, level, modality } : { contract: 'Qualquer', level: 'Qualquer', modality: 'Qualquer' };
      const isPremiumSearch = plan >= SubscriptionPlan.PREMIUM;
      let results = await findJobOpportunities(role, specificSkills, location, filtersToUse, isPremiumSearch);
      if (minSalary > 0) results = results.filter(j => j.salaryValue >= minSalary);
      const processedResults = results.map((job, idx) => ({
          ...job,
          isPremium: plan < SubscriptionPlan.PREMIUM ? (idx === 0) : false,
          matchScore: job.matchScore || 80
      }));
      setJobs(processedResults);
      setLoading({ status: 'success' });
    } catch (e) { setLoading({ status: 'error', message: 'Erro ao buscar.' }); }
  };

  const handleGenerateTool = async () => {
      if (!toolType) return;
      setLoading({ status: 'loading', message: 'Gerando documento IA...' });
      try {
          if (toolType === 'RESUME') {
              if (!toolRole) { alert("Defina o cargo."); setLoading({status:'idle'}); return; }
              const res = await generateResume(specificSkills, toolRole, toolCurrentSalary);
              setResumeData(res);
          } else if (toolType === 'EMAIL') {
              if (!toolCompany || !toolRole) { alert("Preencha os dados."); setLoading({status:'idle'}); return; }
              const res = await generateSpontaneousApplication(specificSkills, toolCompany, toolRole);
              setEmailData(res);
          } else if (toolType === 'NEGOTIATION') {
               if (!toolRole || !toolCurrentSalary) { alert("Preencha os dados."); setLoading({status:'idle'}); return; }
              const res = await generateNegotiationScript(toolRole, toolCurrentSalary);
              setNegotiationScript(res);
          } else if (toolType === 'COMPANIES') {
              if (!toolRole) { alert("Defina o cargo."); setLoading({status:'idle'}); return; }
              const loc = toolLocation || location || 'Brasil';
              const res = await recommendTargetCompanies(loc, toolRole, undefined, specificSkills);
              setTargetCompanies(res);
          }
          setLoading({ status: 'success' });
      } catch(e) { setLoading({ status: 'error', message: 'Erro na geração.' }); }
  }
  
  const optimizeResumeForJob = (job: JobOpportunity) => {
      setToolType('RESUME');
      setActiveTab('TOOLS');
      setToolRole(job.role);
      setToolCurrentSalary(job.avgSalary);
      alert(`A IA vai otimizar seu currículo para a vaga na ${job.companyName}.`);
  }

  const openFlashApply = (job: JobOpportunity) => { setSelectedJobForApply(job); setShowFlashApplyModal(true); }
  const confirmFlashApply = (method: 'PROFILE' | 'AI') => {
      if(!selectedJobForApply) return;
      setFlashApplyLoading(true);
      setTimeout(() => {
          setFlashApplyLoading(false);
          setShowFlashApplyModal(false);
          alert("Candidatura enviada com sucesso!");
          onChatWithCompany(selectedJobForApply.companyName);
      }, method === 'AI' ? 3000 : 1500);
  }

  const renderJobCard = (job: JobOpportunity, idx: number) => {
      const isTopVacancy = idx === 0 && activeTab === 'SEARCH';
      const isLocked = job.isPremium && activeTab === 'SEARCH' && plan < SubscriptionPlan.PREMIUM;
      const saved = isJobSaved(job.id);
      const matchScore = job.matchScore || 80;
      const isPremiumUser = plan >= SubscriptionPlan.PREMIUM;

      return (
        <React.Fragment key={job.id + idx}>
            <div className={`relative bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border transition-all ${isTopVacancy ? (isLocked ? 'border-yellow-500/30' : 'border-yellow-500 bg-yellow-950/10') : 'border-slate-700/50'}`}>
                {isLocked && (
                    <div className="absolute inset-0 backdrop-blur-xl bg-slate-950/80 z-20 flex flex-col items-center justify-center text-center p-8 border border-yellow-500/20 rounded-3xl m-[-1px]">
                        <LockClosedIcon className="w-8 h-8 text-yellow-500 mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">Vaga Premium</h3>
                        <button onClick={onSubscribe} className="bg-yellow-500 text-slate-950 font-bold px-6 py-2 rounded-xl text-sm mt-2">Desbloquear</button>
                    </div>
                )}
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 pr-4">
                            {isTopVacancy && (
                                <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider flex items-center gap-1.5 mb-2 w-fit ${isLocked ? 'bg-slate-700 text-slate-400' : 'bg-yellow-500 text-slate-950'}`}>
                                    <StarSolidIcon className="w-3 h-3" /> {isLocked ? 'BLOQUEADA' : 'RECOMENDAÇÃO IA'}
                                </span>
                            )}
                            <h3 className="text-lg font-bold text-white leading-tight">{job.role}</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase mt-1 flex items-center gap-1"><BuildingOfficeIcon className="w-3 h-3"/> {job.companyName}</p>
                        </div>
                        {!isLocked && (
                            <button onClick={() => toggleSaveJob(job)} className="p-2 rounded-full bg-slate-800 text-slate-400">
                                {saved ? <BookmarkSolid className="w-5 h-5 text-blue-400" /> : <BookmarkIcon className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                    
                    {!isLocked && (
                        <div className="mb-4">
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-1">
                                <span>Match</span>
                                <span className={matchScore > 85 ? 'text-green-400' : 'text-blue-400'}>{matchScore}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${matchScore > 85 ? 'bg-green-500' : 'bg-blue-500'}`} style={{width: `${matchScore}%`}}></div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="bg-emerald-900/30 text-emerald-400 text-xs font-bold px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
                            <CurrencyDollarIcon className="w-3 h-3" /> {job.avgSalary}
                        </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-5 line-clamp-3">{job.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                        <button onClick={() => openFlashApply(job)} className="col-span-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2">
                            <BoltIcon className="w-4 h-4" /> Candidatura Flash
                        </button>
                        <button onClick={() => onChatWithCompany(job.companyName)} className="bg-slate-700 text-white py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2">
                            <PaperAirplaneIcon className="w-3 h-3" /> Chat
                        </button>
                        <button onClick={() => optimizeResumeForJob(job)} className="bg-purple-900/30 text-purple-300 py-2 rounded-xl text-[10px] font-bold border border-purple-500/30 flex items-center justify-center gap-2">
                            <SparklesIcon className="w-3 h-3" /> Otimizar CV
                        </button>
                    </div>
                </div>
            </div>
            {showAds && (idx % 3 === 2) && <div className="my-2"><AdBanner format="NATIVE" /></div>}
        </React.Fragment>
    );
  }

  return (
    <div className="pb-24 animate-fade-in relative">
       {newJobAlert && (
           <div className="fixed top-20 right-4 left-4 z-50 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-down cursor-pointer" onClick={() => {setNewJobAlert(false); setActiveTab('SEARCH'); handleSearch();}}>
               <BellSolidIcon className="w-6 h-6 animate-bounce" />
               <div className="flex-1"><p className="text-sm font-black">Vaga Detectada!</p></div>
               <XMarkIcon className="w-5 h-5 opacity-70" onClick={(e) => {e.stopPropagation(); setNewJobAlert(false)}} />
           </div>
       )}

       <div className="mb-6 flex justify-between items-center pt-2 px-1">
        <div className="flex gap-3 items-center">
             <button onClick={onBack} className="bg-slate-800/50 p-2.5 rounded-full text-slate-400 hover:text-white"><ArrowLeftIcon className="w-5 h-5"/></button>
            <div><h1 className="text-2xl font-bold text-white">Vagas & Carreira</h1></div>
        </div>
        <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`p-2.5 rounded-full border ${notificationsEnabled ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-slate-800/50 text-slate-400 border-slate-700/50'}`}>
            {notificationsEnabled ? <BellSolidIcon className="w-6 h-6" /> : <BellIcon className="w-6 h-6" />}
        </button>
      </div>

      <div className="bg-slate-900/50 p-1 rounded-xl mb-6 border border-slate-800/50 flex">
        <button onClick={() => setActiveTab('SEARCH')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'SEARCH' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Buscar</button>
        <button onClick={() => setActiveTab('SAVED')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'SAVED' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Salvas ({savedJobs.length})</button>
        <button onClick={() => setActiveTab('TOOLS')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'TOOLS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><SparklesIcon className="w-4 h-4" /> IA Tools</button>
      </div>

      {activeTab === 'SEARCH' && (
          <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-3">
                  <div className="relative" ref={roleRef}>
                      <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                      <input value={role} onChange={handleRoleChange} onFocus={() => setShowRoleSuggestions(true)} placeholder="Cargo desejado (ex: Dev React)" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-blue-500 outline-none" />
                      {showRoleSuggestions && filteredRoles.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-700 mt-1 rounded-lg z-50 max-h-40 overflow-y-auto shadow-xl">{filteredRoles.map((r,i)=><div key={i} onClick={()=>selectRole(r)} className="p-2 hover:bg-slate-700 text-xs cursor-pointer">{r}</div>)}</div>
                      )}
                  </div>
                  <div className="relative" ref={cityRef}>
                      <input value={location} onChange={handleLocationChange} placeholder="Localização" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-4 pr-10 text-white text-sm focus:border-blue-500 outline-none" />
                      <button onClick={handleUseCurrentLocation} className="absolute right-3 top-2.5 text-slate-500 hover:text-blue-400"><PaperAirplaneIcon className="w-5 h-5"/></button>
                      {showCitySuggestions && filteredCities.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-700 mt-1 rounded-lg z-50 max-h-40 overflow-y-auto shadow-xl">{filteredCities.map((c,i)=><div key={i} onClick={()=>selectCity(c)} className="p-2 hover:bg-slate-700 text-xs cursor-pointer">{c}</div>)}</div>
                      )}
                  </div>
                  <button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg">Buscar Vagas</button>
              </div>

              {loading.status === 'loading' ? (
                  <div className="py-12 text-center animate-pulse">
                      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4"><BriefcaseIcon className="w-8 h-8 text-blue-500 animate-bounce"/></div>
                      <p className="text-slate-400 text-sm">{loading.message}</p>
                  </div>
              ) : (
                  jobs.length > 0 ? jobs.map((job, idx) => renderJobCard(job, idx)) : <div className="text-center py-10 text-slate-500 text-sm">Use os filtros para encontrar vagas.</div>
              )}
          </div>
      )}

      {activeTab === 'TOOLS' && (
           <div className="animate-fade-in">
               {!toolType ? (
                   <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => setToolType('RESUME')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 flex items-center gap-4"><DocumentTextIcon className="w-6 h-6 text-blue-400" /><span className="font-bold text-white">Criar Currículo IA</span></button>
                        <button onClick={() => setToolType('COMPANIES')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-yellow-500 flex items-center gap-4"><BuildingLibraryIcon className="w-6 h-6 text-yellow-400" /><span className="font-bold text-white">Sugerir Empresas</span></button>
                        <button onClick={() => setToolType('EMAIL')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-purple-500 flex items-center gap-4"><PaperAirplaneIcon className="w-6 h-6 text-purple-400" /><span className="font-bold text-white">Gerar Cold E-mail</span></button>
                   </div>
               ) : (
                   <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
                       <button onClick={() => setToolType(null)} className="absolute top-4 right-4 text-slate-500"><XMarkIcon className="w-5 h-5"/></button>
                       <h3 className="text-white font-bold mb-4">Ferramenta IA</h3>
                       <div className="space-y-3 mb-4">
                            <input value={toolRole} onChange={e => setToolRole(e.target.value)} placeholder="Cargo" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"/>
                            {toolType === 'EMAIL' && <input value={toolCompany} onChange={e => setToolCompany(e.target.value)} placeholder="Empresa" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"/>}
                       </div>
                       <button onClick={handleGenerateTool} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">{loading.status === 'loading' ? 'Gerando...' : 'Gerar'}</button>
                       {resumeData && toolType === 'RESUME' && <div className="mt-4 bg-slate-800 p-3 rounded text-slate-300 text-xs">{resumeData.summary}</div>}
                       {targetCompanies.length > 0 && toolType === 'COMPANIES' && <div className="mt-4 space-y-2">{targetCompanies.map((c,i) => <div key={i} className="bg-slate-800 p-2 rounded border border-slate-700"><p className="text-white font-bold text-xs">{c.name}</p><p className="text-slate-400 text-[10px]">{c.reason}</p></div>)}</div>}
                   </div>
               )}
           </div>
      )}
    </div>
  );
};

export default JobFinder;
