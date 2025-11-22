


import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserBadge, ResumeData } from '../types';
import { UserCircleIcon, CameraIcon, BellIcon, MoonIcon, ShieldCheckIcon, LanguageIcon, ArrowRightOnRectangleIcon, TrashIcon, ChevronRightIcon, ArrowLeftIcon, LockClosedIcon, EnvelopeIcon, DevicePhoneMobileIcon, EyeSlashIcon, FingerPrintIcon, DocumentTextIcon, SwatchIcon, BanknotesIcon, BriefcaseIcon, PlusIcon, XMarkIcon, PaperClipIcon, PencilSquareIcon, QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, TrophyIcon, FireIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import ResumeBuilder from './ResumeBuilder';

interface ProfileSettingsProps {
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onBack: () => void;
  onRateApp?: () => void;
}

type ModalType = 'PASSWORD' | 'EMAIL' | 'PHONE' | 'PRIVACY' | 'SUPPORT' | null;

const INITIAL_BADGES: UserBadge[] = [
    { id: '1', name: 'Iniciante', icon: '🚀', description: 'Criou a conta no Ascenda', unlocked: true, color: 'bg-blue-500' },
    { id: '2', name: 'Networker', icon: '🤝', description: 'Adicionou 5 contatos', unlocked: false, color: 'bg-purple-500' },
    { id: '3', name: 'Economista', icon: '💰', description: 'Usou a planilha financeira', unlocked: true, color: 'bg-green-500' },
    { id: '4', name: 'Estudioso', icon: '📚', description: 'Salvou 3 cursos', unlocked: false, color: 'bg-yellow-500' },
    { id: '5', name: 'Pro Hunter', icon: '🎯', description: 'Aplicou para uma vaga Premium', unlocked: false, color: 'bg-red-500' },
];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onSave, onLogout, onBack, onRateApp }) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  
  // Gamification State
  const [level, setLevel] = useState(5);
  const [xp, setXp] = useState(750);
  const nextLevelXp = 1000;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Immediate effect for live preview of color changes
  const updateSetting = (setting: keyof typeof user.settings, value: any) => {
    const newData = {
      ...formData,
      settings: {
        ...formData.settings,
        [setting]: value
      }
    };
    setFormData(newData);
    setHasChanges(true);
    
    // Special case: if changing accent color, save immediately to trigger app refresh
    if (setting === 'accentColor') {
        onSave(newData); 
        setHasChanges(false);
    }
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleResumeDataSave = (data: ResumeData) => {
      const newData = { ...formData, resumeData: data };
      setFormData(newData);
      onSave(newData); // Auto save when resume is updated
  }

  // Parse skills string to array for tag management
  const getSkillsArray = () => {
      return formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
    alert("Perfil atualizado com sucesso!");
  };

  const handleDeleteAccount = () => {
      if(window.confirm("Tem certeza absoluta? Todos os seus dados serão apagados permanentemente.")) {
          localStorage.removeItem('ascenda_user');
          localStorage.removeItem('ascenda_profile');
          localStorage.removeItem('ascenda_saved_jobs');
          onLogout();
          alert("Sua conta foi excluída.");
      }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              updateField('avatarUrl', reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          updateField('resumeUrl', file.name);
          alert(`Currículo "${file.name}" anexado com sucesso!`);
      }
  };

  const addSkill = () => {
      if (skillInput.trim()) {
          const currentSkills = getSkillsArray();
          if (!currentSkills.includes(skillInput.trim())) {
              const newSkills = [...currentSkills, skillInput.trim()].join(', ');
              updateField('skills', newSkills);
          }
          setSkillInput('');
      }
  };

  const removeSkill = (skillToRemove: string) => {
      const currentSkills = getSkillsArray();
      const newSkills = currentSkills.filter(s => s !== skillToRemove).join(', ');
      updateField('skills', newSkills);
  };

  const closeModal = () => setActiveModal(null);

  // Helper components
  const SettingToggle = ({ label, icon: Icon, value, onChange, color = 'bg-brand-600' }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
      <div className="flex items-center gap-3 text-slate-300">
        <div className="bg-slate-700/50 p-2 rounded-lg">
            <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <button 
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative ${value ? color : 'bg-slate-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'left-7' : 'left-1'}`}></div>
      </button>
    </div>
  );

  const SettingLink = ({ label, icon: Icon, action, subtext }: any) => (
    <button onClick={action} className="w-full flex items-center justify-between py-3 border-b border-slate-700 last:border-0 group">
      <div className="flex items-center gap-3 text-slate-300">
        <div className="bg-slate-700/50 p-2 rounded-lg group-hover:bg-slate-600 transition-colors">
            <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <div className="text-left">
            <span className="text-sm font-medium block">{label}</span>
            {subtext && <span className="text-[10px] text-slate-500">{subtext}</span>}
        </div>
      </div>
      <ChevronRightIcon className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
    </button>
  );

  return (
    <div className="pb-24 animate-fade-in relative">
      <div className="mb-6 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-slate-400 hover:text-white"><ArrowLeftIcon className="w-6 h-6"/></button>
            <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
         </div>
        {hasChanges && (
            <button onClick={handleSave} className="text-brand-400 text-sm font-bold hover:text-brand-300 bg-brand-900/30 px-4 py-1.5 rounded-full border border-brand-500/30 animate-pulse">
                Salvar Alterações
            </button>
        )}
      </div>

      {/* GAMIFICATION: Level & Badges */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-1 mb-6 border border-slate-700/50 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl"></div>
          <div className="p-4 relative z-10">
             <div className="flex justify-between items-center mb-2">
                 <h3 className="text-white font-bold flex items-center gap-2">
                     <TrophyIcon className="w-5 h-5 text-yellow-400"/> Nível {level} - Estrategista
                 </h3>
                 <span className="text-xs font-bold text-brand-400">{xp} / {nextLevelXp} XP</span>
             </div>
             {/* Progress Bar */}
             <div className="h-2.5 w-full bg-slate-700 rounded-full overflow-hidden mb-4">
                 <div className="h-full bg-gradient-to-r from-brand-500 to-yellow-400 rounded-full" style={{ width: `${(xp/nextLevelXp)*100}%` }}></div>
             </div>
             
             {/* Badges Grid */}
             <div>
                 <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">Minhas Conquistas</p>
                 <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                     {INITIAL_BADGES.map(badge => (
                         <div key={badge.id} className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl border relative group ${badge.unlocked ? 'bg-slate-800 border-slate-600' : 'bg-slate-900 border-slate-800 opacity-50 grayscale'}`}>
                            <span>{badge.icon}</span>
                            {badge.unlocked && (
                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${badge.color}`}></div>
                            )}
                         </div>
                     ))}
                 </div>
             </div>
          </div>
      </div>

      {/* PERSONAL INFO */}
      <div className="flex flex-col items-center mb-8 relative">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden flex items-center justify-center relative">
                {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                    <UserCircleIcon className="w-20 h-20 text-slate-500" />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CameraIcon className="w-8 h-8 text-white" />
                </div>
            </div>
            <div className="absolute bottom-1 right-1 bg-brand-600 p-1.5 rounded-full border-2 border-slate-900 shadow-lg">
                <PencilSquareIcon className="w-4 h-4 text-white" />
            </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
        
        <div className="mt-4 w-full text-center space-y-2">
            <input 
                className="bg-transparent text-2xl font-black text-white text-center focus:outline-none border-b border-transparent focus:border-brand-500 pb-1 w-full"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Seu Nome"
            />
            <div className="flex items-center justify-center gap-2 text-slate-400">
                <BriefcaseIcon className="w-4 h-4" />
                <input 
                    className="bg-transparent text-sm text-slate-400 text-center focus:outline-none focus:text-white w-40"
                    value={formData.role || ''}
                    onChange={(e) => updateField('role', e.target.value)}
                    placeholder="Seu Cargo (ex: Dev)"
                />
            </div>
             <div className="text-center">
                <textarea 
                    className="bg-slate-800/50 text-xs text-slate-300 text-center focus:outline-none rounded-xl p-2 w-full max-w-xs resize-none border border-slate-700/50 focus:border-brand-500 transition-colors"
                    value={formData.bio || ''}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="Escreva uma bio curta sobre seus objetivos profissionais..."
                    rows={2}
                />
            </div>
        </div>
      </div>

      {/* RESUME MANAGEMENT */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-blue-400"/> Currículo
              </h3>
          </div>
          
          <div className="space-y-3">
              {/* Resume Builder Button */}
              <button 
                onClick={() => setShowResumeBuilder(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-brand-600 hover:from-blue-500 hover:to-brand-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
              >
                  <PencilSquareIcon className="w-5 h-5"/>
                  Gerenciar Currículo com IA
              </button>

              {/* File Upload Fallback */}
              <div className="relative flex items-center py-2">
                   <div className="flex-grow border-t border-slate-700"></div>
                   <span className="flex-shrink-0 mx-3 text-slate-500 text-[10px] uppercase font-bold">Ou envie arquivo</span>
                   <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <button 
                onClick={() => resumeInputRef.current?.click()}
                className={`w-full p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${formData.resumeUrl ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
              >
                  {formData.resumeUrl ? <CheckCircleIcon className="w-4 h-4 text-green-500"/> : <PaperClipIcon className="w-4 h-4"/>}
                  {formData.resumeUrl ? `Arquivo: ${formData.resumeUrl}` : 'Upload PDF/DOC'}
              </button>
              <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} className="hidden" accept=".pdf,.doc,.docx" />
          </div>
      </div>

      {/* SKILLS TAGS */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-orange-400"/> Habilidades & Tags
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
              {getSkillsArray().map((skill, idx) => (
                  <span key={idx} className="bg-slate-700 text-slate-200 px-2 py-1 rounded-lg text-xs flex items-center gap-1 group">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="text-slate-500 group-hover:text-red-400"><XMarkIcon className="w-3 h-3"/></button>
                  </span>
              ))}
              {getSkillsArray().length === 0 && <span className="text-xs text-slate-500 italic">Adicione skills para a IA te ajudar.</span>}
          </div>
          <div className="flex gap-2">
              <input 
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
                placeholder="Adicionar habilidade..."
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
              <button onClick={addSkill} className="bg-slate-700 hover:bg-brand-600 px-3 rounded-lg text-white transition-colors"><PlusIcon className="w-5 h-5"/></button>
          </div>
      </div>
      
      {/* PERSONALIZATION - ACCENT COLOR */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <SwatchIcon className="w-5 h-5 text-purple-400"/> Cor do Tema
          </h3>
          <div className="flex justify-around">
              {[
                  { id: 'green', bg: 'bg-green-500' },
                  { id: 'blue', bg: 'bg-blue-500' },
                  { id: 'purple', bg: 'bg-purple-500' },
                  { id: 'orange', bg: 'bg-orange-500' }
              ].map(color => (
                  <button 
                    key={color.id}
                    onClick={() => updateSetting('accentColor', color.id)}
                    className={`w-10 h-10 rounded-full ${color.bg} border-2 transition-all ${formData.settings.accentColor === color.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'}`}
                  ></button>
              ))}
          </div>
      </div>

      {/* DATA SECTION */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700 space-y-2">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-yellow-400"/> Dados de Negócio
          </h3>
          <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold">Orçamento Inicial</label>
              <input 
                 className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm mt-1"
                 value={formData.budget || ''}
                 onChange={(e) => updateField('budget', e.target.value)}
              />
          </div>
          <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold">Tempo Disponível</label>
              <input 
                 className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-sm mt-1"
                 value={formData.timeAvailable || ''}
                 onChange={(e) => updateField('timeAvailable', e.target.value)}
              />
          </div>
      </div>

      {/* SETTINGS LIST */}
      <div className="space-y-6">
        {/* Account */}
        <div className="bg-slate-800/50 rounded-2xl p-2 border border-slate-700">
            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Conta & Segurança</div>
            <div className="px-2">
                <SettingLink label="Alterar Senha" icon={LockClosedIcon} action={() => setActiveModal('PASSWORD')} />
                <SettingLink label="Alterar E-mail" icon={EnvelopeIcon} subtext={formData.email} action={() => setActiveModal('EMAIL')} />
                <SettingLink label="Telefone" icon={DevicePhoneMobileIcon} subtext={formData.phone || 'Não informado'} action={() => setActiveModal('PHONE')} />
                <SettingLink label="Privacidade e Dados" icon={ShieldCheckIcon} action={() => setActiveModal('PRIVACY')} />
            </div>
        </div>

        {/* App Preferences */}
        <div className="bg-slate-800/50 rounded-2xl p-2 border border-slate-700">
            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Preferências</div>
            <div className="px-2">
                <SettingToggle 
                    label="Notificações Push" 
                    icon={BellIcon} 
                    value={formData.settings.notifications} 
                    onChange={(v: boolean) => updateSetting('notifications', v)} 
                />
                <SettingToggle 
                    label="Modo Escuro" 
                    icon={MoonIcon} 
                    value={formData.settings.darkMode} 
                    onChange={(v: boolean) => updateSetting('darkMode', v)} 
                />
                 <SettingToggle 
                    label="Sons do Chat" 
                    icon={ChatBubbleLeftRightIcon} 
                    value={formData.settings.chatSounds} 
                    onChange={(v: boolean) => updateSetting('chatSounds', v)} 
                />
                <SettingLink label="Idioma" icon={LanguageIcon} subtext="Português (BR)" action={() => {}} />
            </div>
        </div>

        {/* Support */}
        <div className="bg-slate-800/50 rounded-2xl p-2 border border-slate-700">
            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Ajuda</div>
            <div className="px-2">
                <SettingLink label="Suporte & Contato" icon={QuestionMarkCircleIcon} action={() => setActiveModal('SUPPORT')} />
                {onRateApp && <SettingLink label="Avalie-nos na Loja" icon={StarIcon} action={onRateApp} subtext="Gostou do app? Deixe 5 estrelas." />}
            </div>
        </div>
        
        {/* Logout / Danger Zone */}
        <div className="space-y-3">
            <button onClick={onLogout} className="w-full bg-slate-800 border border-slate-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700">
                <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sair da Conta
            </button>
            <button onClick={handleDeleteAccount} className="w-full text-red-500 text-xs font-bold hover:text-red-400 py-2 flex items-center justify-center gap-1">
                <TrashIcon className="w-3 h-3" /> Excluir minha conta permanentemente
            </button>
        </div>
      </div>

      {/* --- MODALS --- */}
      {showResumeBuilder && (
          <ResumeBuilder 
            user={formData} 
            onClose={() => setShowResumeBuilder(false)}
            onSave={handleResumeDataSave}
          />
      )}

      {activeModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-slide-up">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold text-lg">
                          {activeModal === 'PASSWORD' && 'Alterar Senha'}
                          {activeModal === 'EMAIL' && 'Novo E-mail'}
                          {activeModal === 'PHONE' && 'Novo Telefone'}
                          {activeModal === 'PRIVACY' && 'Privacidade'}
                          {activeModal === 'SUPPORT' && 'Suporte'}
                      </h3>
                      <button onClick={closeModal} className="text-slate-500 hover:text-white"><XMarkIcon className="w-6 h-6"/></button>
                  </div>

                  {activeModal === 'PASSWORD' && (
                      <div className="space-y-4">
                          <input type="password" placeholder="Senha Atual" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"/>
                          <input type="password" placeholder="Nova Senha" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"/>
                          <button onClick={closeModal} className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold">Atualizar Senha</button>
                      </div>
                  )}

                  {activeModal === 'EMAIL' && (
                       <div className="space-y-4">
                          <p className="text-sm text-slate-400">Um código de verificação será enviado.</p>
                          <input type="email" placeholder="Novo E-mail" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"/>
                          <button onClick={closeModal} className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold">Enviar Código</button>
                      </div>
                  )}

                  {activeModal === 'PHONE' && (
                       <div className="space-y-4">
                          <input type="tel" placeholder="(00) 00000-0000" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"/>
                          <button onClick={closeModal} className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold">Salvar Telefone</button>
                      </div>
                  )}
                  
                  {activeModal === 'PRIVACY' && (
                      <div className="space-y-4">
                           <SettingToggle 
                                label="Perfil Público" 
                                icon={EyeSlashIcon} 
                                value={formData.settings.publicProfile} 
                                onChange={(v: boolean) => updateSetting('publicProfile', v)} 
                            />
                            <SettingToggle 
                                label="Modo Fantasma (Recrutadores não veem)" 
                                icon={UserCircleIcon} 
                                value={formData.settings.ghostMode} 
                                onChange={(v: boolean) => updateSetting('ghostMode', v)} 
                                color="bg-purple-600"
                            />
                            <SettingToggle 
                                label="Compartilhar dados com IA" 
                                icon={FingerPrintIcon} 
                                value={formData.settings.shareDataWithAI} 
                                onChange={(v: boolean) => updateSetting('shareDataWithAI', v)} 
                            />
                      </div>
                  )}

                  {activeModal === 'SUPPORT' && (
                      <div className="space-y-4 text-center">
                          <div className="bg-slate-800 p-4 rounded-xl">
                              <p className="text-xs text-slate-400 mb-1 uppercase font-bold">Telefone / WhatsApp</p>
                              <a href="https://wa.me/5511978260351" target="_blank" rel="noreferrer" className="text-white font-bold text-lg hover:text-green-400 transition-colors block py-2 border border-dashed border-slate-600 rounded-lg">
                                  (11) 97826-0351
                              </a>
                          </div>
                          <div className="bg-slate-800 p-4 rounded-xl">
                              <p className="text-xs text-slate-400 mb-1 uppercase font-bold">E-mail</p>
                              <a href="mailto:suporte@ascenda.app" className="text-white font-bold text-lg hover:text-blue-400 transition-colors">
                                  suporte@ascenda.app
                              </a>
                          </div>
                          <p className="text-xs text-slate-500 mt-4">Horário de atendimento: Seg-Sex, 9h às 18h.</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default ProfileSettings;
