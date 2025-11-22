import React, { useState, useEffect, useRef } from 'react';
import { findFreeCourses, findPremiumCourses } from '../services/geminiService';
import { CourseRecommendation, LoadingState, SubscriptionPlan, UserProfile, Podcast } from '../types';
import { AcademicCapIcon, PlayCircleIcon, MagnifyingGlassIcon, ArrowTopRightOnSquareIcon, BookmarkIcon, TrashIcon, StarIcon, LockClosedIcon, ArrowLeftIcon, LightBulbIcon, SparklesIcon, CheckBadgeIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, StarIcon as StarSolidIcon, PlayIcon as PlaySolid } from '@heroicons/react/24/solid';

interface CourseFinderProps {
    plan: SubscriptionPlan;
    onSubscribe: () => void;
    onBack: () => void;
    user?: UserProfile | null;
}

const TOPICS = [
    "Marketing Digital", "Programação Python", "Desenvolvimento Web", "Design Gráfico", 
    "Gestão de Projetos", "Finanças Pessoais", "Inglês para Negócios", "Excel Avançado",
    "Power BI", "Data Science", "Inteligência Artificial", "Vendas", "Liderança",
    "Empreendedorismo", "Criação de Conteúdo", "SEO"
];

const PODCAST_DATA: Podcast[] = [
    {
        id: '1',
        title: 'PrimoCast',
        host: 'Thiago Nigro',
        description: 'Empreendedorismo, finanças e negócios com grandes convidados.',
        category: 'Finanças',
        spotifyUrl: 'https://open.spotify.com/show/0DL28N35rZ1h0l2T4sO96k',
        youtubeUrl: 'https://www.youtube.com/@PrimoCast',
        coverUrl: 'https://i.scdn.co/image/ab6765630000ba8a1c92494730577288917a6d5c'
    },
    {
        id: '2',
        title: 'Jovem Nerd (NerdCast)',
        host: 'Jovem Nerd & Azaghal',
        description: 'Cultura pop, tecnologia, história e empreendedorismo.',
        category: 'Tecnologia',
        spotifyUrl: 'https://open.spotify.com/show/22W40hF2E6Vd945K0Qz0c9',
        youtubeUrl: 'https://www.youtube.com/user/JovemNerd',
        coverUrl: 'https://i.scdn.co/image/ab6765630000ba8a77814735660c078409614685'
    },
    {
        id: '3',
        title: 'TED Talks Daily',
        host: 'Elise Hu',
        description: 'Ideias inspiradoras sobre todos os assuntos imagináveis.',
        category: 'Carreira',
        spotifyUrl: 'https://open.spotify.com/show/1VXcH8QHkjRCTCEd88U5ti',
        youtubeUrl: 'https://www.youtube.com/user/TEDtalksDirector',
        coverUrl: 'https://i.scdn.co/image/ab6765630000ba8a8176615453a3307df4b79476'
    },
    {
        id: '4',
        title: 'ResumoCast',
        host: 'Gustavo Carriconde',
        description: 'Livros de negócios resumidos para empreendedores.',
        category: 'Livros',
        spotifyUrl: 'https://open.spotify.com/show/5hHq9p8Y4m4t9a9o3w3j6g',
        youtubeUrl: 'https://www.youtube.com/channel/UC3j3a5j5m5j5m5j5m5j5m5j',
        coverUrl: 'https://i.scdn.co/image/ab6765630000ba8a5f3c2d4a1b8a6b6c7d6e5f4g'
    }
];

const CourseFinder: React.FC<CourseFinderProps> = ({ plan, onSubscribe, onBack, user }) => {
  const [activeTab, setActiveTab] = useState<'SEARCH' | 'TRENDING' | 'SAVED' | 'PODCASTS'>('SEARCH');
  const [topic, setTopic] = useState('');
  const [isRecommendationView, setIsRecommendationView] = useState(false);
  
  // Autocomplete
  const [filteredTopics, setFilteredTopics] = useState<string[]>([]);
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
  
  const [courses, setCourses] = useState<CourseRecommendation[]>([]);
  const [premiumCourses, setPremiumCourses] = useState<CourseRecommendation[]>([]);
  const [savedCourses, setSavedCourses] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle' });
  
  const inputRef = useRef<HTMLDivElement>(null);

  // Extract user skills for recommendations
  const userSkills = user?.skills 
    ? user.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) 
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowTopicSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load Saved Courses from LocalStorage on Mount
  useEffect(() => {
    const stored = localStorage.getItem('ascenda_saved_courses');
    if (stored) {
      try {
        setSavedCourses(JSON.parse(stored));
      } catch(e) { console.error("Error loading saved courses"); }
    }
  }, []);

  // Load trending courses if tab is selected and allowed
  useEffect(() => {
      if (activeTab === 'TRENDING' && plan >= SubscriptionPlan.MEDIUM && premiumCourses.length === 0) {
          handleLoadTrending();
      }
  }, [activeTab, plan]);

  // Auto-load recommendations based on first skill if available and list is empty
  useEffect(() => {
      if (activeTab === 'SEARCH' && courses.length === 0 && userSkills.length > 0 && loading.status === 'idle') {
          setIsRecommendationView(true);
          handleSearch(userSkills[0]);
      }
  }, [activeTab]);

  const handleLoadTrending = async () => {
      setLoading({ status: 'loading', message: 'Buscando cursos em alta...' });
      try {
          const res = await findPremiumCourses();
          // Merge with saved rating if exists
          const coursesWithRatings = res.map(c => {
              const saved = savedCourses.find(s => s.searchUrl === c.searchUrl);
              return saved ? { ...c, userRating: saved.userRating } : c;
          });
          setPremiumCourses(coursesWithRatings);
          setLoading({ status: 'success' });
      } catch(e) {
          setLoading({ status: 'error', message: 'Erro ao carregar.' });
      }
  }

  const toggleSaveCourse = (course: CourseRecommendation) => {
    const isSaved = savedCourses.some(c => c.searchUrl === course.searchUrl);
    let newSavedList;

    if (isSaved) {
      newSavedList = savedCourses.filter(c => c.searchUrl !== course.searchUrl);
    } else {
      newSavedList = [...savedCourses, course];
    }

    setSavedCourses(newSavedList);
    localStorage.setItem('ascenda_saved_courses', JSON.stringify(newSavedList));
  };

  const handleRateCourse = (course: CourseRecommendation, rating: number) => {
      // Update local lists
      const updateList = (list: CourseRecommendation[]) => list.map(c => 
          c.searchUrl === course.searchUrl ? {...c, userRating: rating} : c
      );
      
      setCourses(updateList(courses));
      setPremiumCourses(updateList(premiumCourses));
      
      // Handle persistence
      // If it's saved, update the saved record. If not, maybe we should auto-save? 
      // For now, let's just update if it IS saved, or find it in savedCourses.
      const isSaved = savedCourses.some(c => c.searchUrl === course.searchUrl);
      let newSavedList = [...savedCourses];
      
      if (isSaved) {
          newSavedList = updateList(savedCourses);
      } else {
          // If user rates a course, we usually want to save it implicitly or just track it.
          // Let's toggle save if they rate it high (optional UX choice), but here we keep simple.
          // Just update saved state if it exists.
      }
      
      setSavedCourses(newSavedList);
      localStorage.setItem('ascenda_saved_courses', JSON.stringify(newSavedList));
  }

  const isCourseSaved = (course: CourseRecommendation) => {
    return savedCourses.some(c => c.searchUrl === course.searchUrl);
  };

  const getCourseRating = (course: CourseRecommendation) => {
      // Check current list first
      if (course.userRating) return course.userRating;
      // Fallback to saved list
      const saved = savedCourses.find(s => s.searchUrl === course.searchUrl);
      return saved?.userRating || 0;
  }

  const handleSearch = async (overrideTopic?: string) => {
    const searchTerm = overrideTopic || topic;
    if (!searchTerm.trim()) return;
    
    if (overrideTopic) setTopic(overrideTopic);
    
    setShowTopicSuggestions(false);
    if (!overrideTopic) setIsRecommendationView(false); // Manual search is not recommendation view
    
    setLoading({ status: 'loading', message: `Buscando melhores cursos sobre "${searchTerm}"...` });
    try {
      const res = await findFreeCourses(searchTerm);
      // Merge ratings
      const coursesWithRatings = res.map(c => {
          const saved = savedCourses.find(s => s.searchUrl === c.searchUrl);
          return saved ? { ...c, userRating: saved.userRating } : c;
      });
      setCourses(coursesWithRatings);
      setLoading({ status: 'success' });
    } catch (e) {
      setLoading({ status: 'error', message: 'Erro ao buscar cursos.' });
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setTopic(val);
      if(val.length > 0) {
          const filtered = TOPICS.filter(t => t.toLowerCase().includes(val.toLowerCase()));
          setFilteredTopics(filtered);
          setShowTopicSuggestions(true);
      } else {
          setShowTopicSuggestions(false);
      }
  }

  const selectTopic = (t: string) => {
      setTopic(t);
      setShowTopicSuggestions(false);
      handleSearch(t);
  };

  const renderCourseCard = (course: CourseRecommendation, idx: number) => {
    const saved = isCourseSaved(course);
    const currentRating = getCourseRating(course);

    return (
      <div key={idx} className={`bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border ${course.isPremiumTrend ? 'border-amber-500/40 shadow-xl shadow-amber-500/10' : 'border-slate-700/50'} hover:border-brand-500/50 transition-all group relative animate-slide-up hover:-translate-y-1`} style={{animationDelay: `${idx * 100}ms`}}>
        <div className="p-5 relative">
          {/* Decorative Blur - Blue for standard, Gold for Premium */}
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none ${course.isPremiumTrend ? 'bg-amber-500/10' : 'bg-brand-500/10'}`}></div>

          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="flex flex-wrap gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                {course.platform}
                </span>
                {course.isFree && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/30 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    Gratuito
                </span>
                )}
                {course.isPremiumTrend && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-900/30 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1">
                    <StarSolidIcon className="w-3 h-3"/> Em Alta
                </span>
                )}
                 {/* Employability Badge */}
                 {!course.isPremiumTrend && (
                     <span className="text-[9px] font-bold uppercase tracking-wider text-brand-300 bg-brand-900/30 px-2.5 py-1 rounded-md border border-brand-500/20 flex items-center gap-1">
                        <CheckBadgeIcon className="w-3 h-3"/> Certificado
                    </span>
                 )}
            </div>
          </div>
          
          <button 
            onClick={() => toggleSaveCourse(course)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700/50 transition-colors z-10 group/btn"
            title={saved ? "Remover dos Salvos" : "Salvar para depois"}
          >
            {saved ? (
              <BookmarkSolidIcon className="w-6 h-6 text-brand-500 drop-shadow-lg" />
            ) : (
              <BookmarkIcon className="w-6 h-6 text-slate-400 group-hover/btn:text-brand-400 transition-colors" />
            )}
          </button>

          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors pr-8 leading-tight">{course.title}</h3>
          <div className="flex items-center text-xs text-slate-400 mb-4 bg-slate-950/50 w-fit px-2 py-1 rounded-lg border border-slate-700/50">
            <PlayCircleIcon className="w-4 h-4 mr-1.5 text-brand-500" />
            {course.duration} • Conteúdo Verificado
          </div>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed line-clamp-3">{course.description}</p>
          
          {/* Star Rating System */}
          <div className="flex items-center gap-2 mb-5 bg-slate-950/30 p-2 rounded-xl w-fit border border-white/5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">
                  Avaliar
              </span>
              <div className="flex">
                  {[1,2,3,4,5].map(star => (
                      <button 
                        key={star} 
                        onClick={() => handleRateCourse(course, star)}
                        className="p-0.5 hover:scale-110 transition-transform focus:outline-none"
                      >
                          {currentRating >= star ? (
                              <StarSolidIcon className="w-4 h-4 text-amber-400 drop-shadow-sm"/>
                          ) : (
                              <StarIcon className="w-4 h-4 text-slate-600 hover:text-amber-400"/>
                          )}
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex gap-3">
            <a 
              href={course.searchUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex-1 ${course.isPremiumTrend ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black' : 'bg-brand-600 hover:bg-brand-500 text-white'} text-center py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg`}
            >
              Acessar Conteúdo
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </a>
            
            {saved && (
               <button 
                  onClick={() => toggleSaveCourse(course)}
                  className="px-4 bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl transition-colors flex items-center justify-center"
                  title="Remover da lista"
               >
                 <TrashIcon className="w-5 h-5" />
               </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24 animate-fade-in h-full flex flex-col">
       {/* Header */}
       <div className="mb-4 flex items-start gap-3 pt-2">
            <button onClick={onBack} className="mt-0.5 bg-slate-800/50 p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50 active:scale-95 shadow-lg">
                <ArrowLeftIcon className="w-5 h-5"/>
            </button>
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-none">Academia</h1>
                <p className="text-brand-400 text-xs font-bold mt-1 uppercase tracking-wider">Desenvolvimento Profissional</p>
            </div>
       </div>

      {/* Tabs */}
      <div className="bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-2xl mb-6 border border-slate-800 shadow-lg flex relative overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('SEARCH')} className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-xl transition-all z-10 ${activeTab === 'SEARCH' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Explorar</button>
        <button onClick={() => setActiveTab('TRENDING')} className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-xl transition-all z-10 flex items-center justify-center gap-1 ${activeTab === 'TRENDING' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><StarIcon className="w-3 h-3" /> Premium</button>
        <button onClick={() => setActiveTab('PODCASTS')} className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-xl transition-all z-10 flex items-center justify-center gap-1 ${activeTab === 'PODCASTS' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><MicrophoneIcon className="w-3 h-3" /> Audio</button>
        <button onClick={() => setActiveTab('SAVED')} className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-xl transition-all z-10 flex items-center justify-center gap-1 ${activeTab === 'SAVED' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <BookmarkIcon className="w-3 h-3" /> Salvos
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'SEARCH' && (
            <>
                <div className="relative group mb-4" ref={inputRef}>
                    <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    <input
                        type="text"
                        value={topic}
                        onChange={handleTopicChange}
                        onFocus={() => topic && setShowTopicSuggestions(true)}
                        placeholder="O que você quer aprender hoje?"
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-24 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none placeholder-slate-500 shadow-lg transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button 
                        onClick={() => handleSearch()}
                        className="absolute right-2 top-2 bottom-2 bg-slate-700 hover:bg-brand-600 text-white px-4 rounded-xl font-bold text-xs transition-all"
                    >
                        Buscar
                    </button>

                    {showTopicSuggestions && filteredTopics.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                            {filteredTopics.map((t, idx) => (
                                <div key={idx} onClick={() => selectTopic(t)} className="px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer border-b border-slate-700/50 last:border-0">
                                    {t}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Skills Quick Action */}
                {userSkills.length > 0 && (
                    <div className="mb-4 animate-fade-in">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-1 tracking-wider">
                            <LightBulbIcon className="w-3 h-3"/> Recomendado para suas Skills
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {userSkills.map((skill) => (
                                <button 
                                    key={skill}
                                    onClick={() => handleSearch(skill)}
                                    className="flex-shrink-0 bg-slate-800 hover:bg-brand-900 hover:border-brand-500/50 border border-slate-700 text-slate-300 text-xs font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap"
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading.status === 'loading' ? (
                    <div className="flex flex-col items-center justify-center py-12 animate-pulse">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                            <AcademicCapIcon className="w-8 h-8 text-brand-500 animate-bounce" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">
                             {loading.message || "Pesquisando conteúdo..."}
                        </p>
                    </div>
                ) : (
                    courses.length > 0 ? (
                        <>
                           {isRecommendationView && (
                               <div className="mb-2 px-1">
                                   <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                       <SparklesIcon className="w-4 h-4 text-amber-500"/> Seleção Inteligente
                                   </h3>
                               </div>
                           )}
                           
                           {!isRecommendationView && topic && (
                               <div className="mb-2 px-1">
                                   <h3 className="text-white font-bold text-sm">Resultados da busca</h3>
                                   <p className="text-slate-400 text-xs">Tópico: {topic}</p>
                               </div>
                           )}

                           <div className="space-y-4">
                                {courses.map((c, i) => renderCourseCard(c, i))}
                           </div>
                        </>
                    ) : (
                         <div className="text-center py-16 opacity-50">
                            <AcademicCapIcon className="w-16 h-16 mx-auto text-slate-600 mb-2" />
                            <p className="text-slate-500 text-sm font-medium">Busque por um tema para começar.</p>
                        </div>
                    )
                )}
            </>
        )}

        {activeTab === 'TRENDING' && (
            <>
                {plan < SubscriptionPlan.MEDIUM ? (
                    <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center border border-amber-500/20">
                        <div className="bg-amber-500/10 p-4 rounded-full mb-4 shadow-glow-gold">
                            <LockClosedIcon className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Conteúdo Executivo</h3>
                        <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                            Assine o plano <span className="text-amber-400 font-bold">Profissional</span> para acessar a curadoria de cursos e certificações em alta no mercado.
                        </p>
                        <button onClick={onSubscribe} className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold py-3 px-8 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105">
                            Desbloquear Agora
                        </button>
                    </div>
                ) : (
                    loading.status === 'loading' ? (
                         <div className="flex flex-col items-center justify-center py-10 animate-pulse">
                            <StarIcon className="w-10 h-10 text-amber-600 mb-2" />
                            <p className="text-slate-500 text-sm">Buscando tendências...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {premiumCourses.map((c, i) => renderCourseCard(c, i))}
                        </div>
                    )
                )}
            </>
        )}

        {activeTab === 'PODCASTS' && (
             <div className="space-y-4 animate-slide-up">
                 <div className="px-1">
                     <h3 className="text-white font-bold text-sm mb-1">Podcasts de Carreira</h3>
                     <p className="text-slate-400 text-xs">Aprenda ouvindo os especialistas.</p>
                 </div>
                 {PODCAST_DATA.map((pod) => (
                     <div key={pod.id} className="bg-slate-800/60 rounded-2xl p-4 flex gap-4 items-center border border-slate-700/50 hover:border-brand-500/30 transition-colors">
                         <img src={pod.coverUrl || 'https://via.placeholder.com/150'} alt={pod.title} className="w-16 h-16 rounded-xl object-cover bg-slate-700 shadow-lg"/>
                         <div className="flex-1 min-w-0">
                             <h4 className="text-white font-bold text-sm truncate">{pod.title}</h4>
                             <p className="text-slate-400 text-xs truncate mb-2">{pod.host}</p>
                             <div className="flex gap-2">
                                 <a href={pod.spotifyUrl} target="_blank" className="bg-[#1DB954]/10 text-[#1DB954] px-2 py-1 rounded text-[10px] font-bold hover:bg-[#1DB954]/20 transition-colors flex items-center gap-1 border border-[#1DB954]/20">
                                     Spotify
                                 </a>
                                  <a href={pod.youtubeUrl} target="_blank" className="bg-[#FF0000]/10 text-[#FF0000] px-2 py-1 rounded text-[10px] font-bold hover:bg-[#FF0000]/20 transition-colors flex items-center gap-1 border border-[#FF0000]/20">
                                     YouTube
                                 </a>
                             </div>
                         </div>
                         <button className="p-3 bg-slate-900 rounded-full text-white hover:text-brand-400 transition-colors border border-slate-700">
                             <PlaySolid className="w-5 h-5"/>
                         </button>
                     </div>
                 ))}
             </div>
        )}

        {activeTab === 'SAVED' && (
            <div className="animate-slide-up min-h-[50vh]">
                {savedCourses.length > 0 ? (
                    <div className="space-y-4">
                        {savedCourses.map((c, i) => renderCourseCard(c, i))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                            <BookmarkIcon className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="font-bold text-slate-400">Sua lista está vazia.</p>
                        <p className="text-xs mt-1 text-slate-600">Salve cursos importantes para assistir depois.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default CourseFinder;