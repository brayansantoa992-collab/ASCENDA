

import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { EnvelopeIcon, DevicePhoneMobileIcon, LockClosedIcon, UserIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon, PaintBrushIcon, ExclamationCircleIcon, BriefcaseIcon, CalendarDaysIcon, IdentificationIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'THEME_CONSENT' | 'ID_VERIFICATION';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [authMethod, setAuthMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [resetSent, setResetSent] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState<string | null>(null);
  
  const idInputRef = useRef<HTMLInputElement>(null);
  const [idImage, setIdImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    age: '',
    cpf: ''
  });

  const [errors, setErrors] = useState({
      email: '',
      password: '',
      terms: '',
      age: '',
      cpf: ''
  });

  const validateEmail = (email: string) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
  };

  const handleSocialLogin = (provider: string) => {
      setLoadingSocial(provider);
      setTimeout(() => {
          const mockUser: UserProfile = {
            id: `social-${Date.now()}`,
            name: 'Usuário Social',
            email: `usuario@${provider.toLowerCase()}.com`,
            age: 22, // Default mock age
            cpf: '000.000.000-00',
            role: 'Iniciante',
            signature: 'Entusiasta de Tecnologia',
            skills: '',
            budget: '',
            timeAvailable: '',
            interests: '',
            termsAccepted: true,
            termsAcceptedDate: new Date(),
            settings: {
                notifications: true, emailAlerts: true, darkMode: true, publicProfile: false, language: 'pt-BR', accentColor: 'blue',
                shareDataWithAI: true, ghostMode: false, biometricAuth: false, chatWallpaper: 'DEFAULT', chatSounds: true
            }
          };
          onLogin(mockUser);
          setLoadingSocial(null);
      }, 1500);
  }

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onloadend = () => setIdImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  }

  const completeRegistration = () => {
      if (pendingUser) {
          if (idImage) {
              pendingUser.idDocumentUrl = idImage; // Store RG
          }
          setView('THEME_CONSENT');
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: '', password: '', terms: '', age: '', cpf: '' });

    // Validation
    let hasError = false;
    
    if (authMethod === 'EMAIL') {
        if (!formData.email) {
            setErrors(prev => ({...prev, email: 'E-mail é obrigatório.'}));
            hasError = true;
        } else if (!validateEmail(formData.email)) {
            setErrors(prev => ({...prev, email: 'Formato de e-mail inválido.'}));
            hasError = true;
        }
    }

    if (!formData.password) {
        setErrors(prev => ({...prev, password: 'Senha é obrigatória.'}));
        hasError = true;
    }

    if (view === 'REGISTER') {
        if (!formData.age) {
            setErrors(prev => ({...prev, age: 'Idade obrigatória.'}));
            hasError = true;
        }
        if (!formData.cpf || formData.cpf.length < 11) {
            setErrors(prev => ({...prev, cpf: 'CPF inválido.'}));
            hasError = true;
        }
        if (!termsAccepted) {
            setErrors(prev => ({...prev, terms: 'Você deve aceitar os termos.'}));
            hasError = true;
        }
    }

    if (hasError) return;

    // Simulating API Call / Auth
    setTimeout(() => {
      const ageInt = formData.age ? parseInt(formData.age) : 18;
      
      const mockUser: UserProfile = {
        id: '123',
        name: formData.name || 'Usuário Ascenda',
        email: formData.email || 'user@example.com',
        age: ageInt,
        cpf: formData.cpf,
        role: 'Explorador',
        signature: 'Transformando ideias em negócios',
        bio: 'Buscando crescimento profissional.',
        avatarUrl: '',
        skills: '',
        budget: '',
        timeAvailable: '',
        interests: '',
        termsAccepted: true,
        termsAcceptedDate: new Date(),
        settings: {
          notifications: true,
          emailAlerts: true,
          darkMode: true,
          publicProfile: false,
          language: 'pt-BR',
          accentColor: 'blue', // Default to blue theme
          shareDataWithAI: true,
          ghostMode: false,
          biometricAuth: false,
          chatWallpaper: 'DEFAULT',
          chatSounds: true
        }
      };

      if (view === 'REGISTER') {
          setPendingUser(mockUser);
          // Check Age for Minor verification
          if (ageInt < 18) {
              setView('ID_VERIFICATION');
          } else {
              setView('THEME_CONSENT');
          }
      } else {
          // Direct login
          onLogin(mockUser);
      }
    }, 800);
  };

  const handleConsent = (accepted: boolean) => {
      if (pendingUser) {
          if (accepted) {
              // Apply intelligent theme (simulate by picking blue)
              pendingUser.settings.accentColor = 'blue';
          }
          onLogin(pendingUser);
      }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.email) {
          setErrors(prev => ({...prev, email: 'Digite seu e-mail para recuperar a senha.'}));
          return;
      }
      if (!validateEmail(formData.email)) {
          setErrors(prev => ({...prev, email: 'E-mail inválido.'}));
          return;
      }

      setTimeout(() => {
          setResetSent(true);
          setErrors(prev => ({...prev, email: ''}));
      }, 1000);
  }

  // SVGs for Social Icons
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
  
  const AppleIcon = () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
          <path d="M17.05 19.06c-.99 1.44-2.05 2.86-3.69 2.88-1.6.03-2.12-.95-3.96-.95-1.84 0-2.42.92-3.94.98-1.59.07-2.8-1.59-3.82-3.06-2.08-3.01-3.67-8.5.77-10.78 2.14-1.11 4.19-.09 5.28-.09.75 0 2.15-1.03 4.02-.88 1.36.11 2.58.68 3.32 1.77-2.96 1.79-2.48 6.37.45 7.85.01.01.02.01.02.02-.23.73-.54 1.46-.88 2.14zm-4.06-15.7c.83-1.01 1.38-2.41 1.23-3.81-1.19.05-2.62.79-3.47 1.79-.74.87-1.39 2.27-1.22 3.6.05.01 1.33.03 3.46-1.58z" />
      </svg>
  );

  const FacebookIcon = () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
           <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl mx-auto mb-4 shadow-2xl shadow-brand-500/20 flex items-center justify-center border border-white/10 transform hover:scale-105 transition-transform duration-500">
             <BriefcaseIcon className="w-10 h-10 text-white drop-shadow-md" />
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-200 to-brand-400 mb-2 tracking-tighter drop-shadow-sm">
              Ascenda
          </h1>
          <p className="text-slate-400 text-sm tracking-wide font-medium uppercase">Gestão de Carreira Profissional</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-brand-300"></div>

          {/* Social Login Section */}
          {view === 'LOGIN' && (
              <div className="mb-6">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                      <button onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center gap-2 bg-white py-2.5 rounded-xl text-slate-700 text-xs font-bold hover:bg-gray-100 transition-colors shadow-md">
                          <GoogleIcon /> Google
                      </button>
                      <button onClick={() => handleSocialLogin('Apple')} className="flex items-center justify-center gap-2 bg-black py-2.5 rounded-xl text-white text-xs font-bold border border-slate-700 hover:bg-slate-900 transition-colors shadow-md">
                          <AppleIcon /> Apple
                      </button>
                  </div>
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleSocialLogin('Facebook')} className="flex items-center justify-center gap-2 bg-[#1877F2] py-2.5 rounded-xl text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-md">
                          <FacebookIcon /> Facebook
                      </button>
                      <button onClick={() => handleSocialLogin('Microsoft')} className="flex items-center justify-center gap-2 bg-[#2f2f2f] py-2.5 rounded-xl text-white text-xs font-bold border border-slate-700 hover:bg-black transition-colors shadow-md">
                           <span className="w-5 h-5 flex items-center justify-center text-lg">❖</span> Microsoft
                      </button>
                  </div>
                  
                  <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                      <div className="relative flex justify-center text-xs font-medium uppercase"><span className="bg-slate-900 px-2 text-slate-500">Ou continue com</span></div>
                  </div>
              </div>
          )}

          {/* Tabs for Login/Register */}
          {view !== 'FORGOT_PASSWORD' && view !== 'THEME_CONSENT' && view !== 'ID_VERIFICATION' && (
            <div className="flex mb-6 bg-black/40 p-1 rounded-xl">
                <button 
                onClick={() => { setView('LOGIN'); setErrors({email:'', password:'', terms:'', age:'', cpf:''}); }}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${view === 'LOGIN' ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                >
                Entrar
                </button>
                <button 
                onClick={() => { setView('REGISTER'); setErrors({email:'', password:'', terms:'', age:'', cpf:''}); }}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${view === 'REGISTER' ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                >
                Criar Conta
                </button>
            </div>
          )}

          {view === 'ID_VERIFICATION' ? (
              <div className="animate-slide-up text-center">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 animate-pulse">
                      <IdentificationIcon className="w-10 h-10 text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Verificação de Menor</h2>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      Como você é menor de 18 anos, precisamos da foto do seu RG ou documento para autorizar o uso do app.
                  </p>
                  
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 cursor-pointer hover:border-brand-500 transition-colors" onClick={() => idInputRef.current?.click()}>
                      <input type="file" ref={idInputRef} onChange={handleIdUpload} className="hidden" accept="image/*" />
                      {idImage ? (
                          <div className="relative">
                              <img src={idImage} className="w-full h-32 object-cover rounded-lg opacity-50" alt="RG" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <CheckCircleIcon className="w-10 h-10 text-green-500" />
                              </div>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center py-4 text-slate-500">
                              <DocumentArrowUpIcon className="w-8 h-8 mb-2" />
                              <span className="text-xs font-bold uppercase">Enviar Foto do RG</span>
                          </div>
                      )}
                  </div>

                  <button 
                      onClick={completeRegistration}
                      disabled={!idImage}
                      className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition-all ${idImage ? 'bg-brand-600 text-white hover:bg-brand-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                  >
                      Confirmar e Continuar
                  </button>
              </div>
          ) : view === 'THEME_CONSENT' ? (
              <div className="animate-slide-up text-center">
                  <div className="w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-float border border-brand-500/30">
                      <PaintBrushIcon className="w-10 h-10 text-brand-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Personalização Inteligente</h2>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                      Podemos ajustar as cores e a interface do app com base no seu perfil profissional? Isso torna a experiência mais imersiva.
                  </p>
                  
                  <button 
                      onClick={() => handleConsent(true)}
                      className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/30 mb-3 transition-all"
                  >
                      Sim, personalizar tema
                  </button>
                  <button 
                      onClick={() => handleConsent(false)}
                      className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold border border-slate-700 transition-all"
                  >
                      Não, manter padrão
                  </button>
              </div>
          ) : view === 'FORGOT_PASSWORD' ? (
              // Forgot Password View
              <div className="animate-slide-up">
                  <button onClick={() => { setView('LOGIN'); setResetSent(false); setErrors({email:'',password:'',terms:'', age:'', cpf:''}) }} className="text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold mb-6">
                      <ArrowLeftIcon className="w-4 h-4" /> Voltar
                  </button>
                  
                  <h2 className="text-xl font-bold text-white mb-2">Redefinir Senha</h2>
                  
                  {!resetSent ? (
                      <>
                        <p className="text-slate-400 text-sm mb-6">Informe seu e-mail cadastrado (obrigatório). Enviaremos um link para você criar uma nova senha.</p>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="relative group">
                                <EnvelopeIcon className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${errors.email ? 'text-red-500' : 'text-slate-500 group-focus-within:text-brand-400'}`} />
                                <input 
                                type="email" 
                                placeholder="seu@email.com" 
                                value={formData.email}
                                onChange={e => { setFormData({...formData, email: e.target.value}); if(errors.email) setErrors({...errors, email: ''}); }}
                                className={`w-full bg-black/30 border rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:outline-none placeholder-slate-600 text-sm transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-brand-500'}`}
                                />
                            </div>
                             {errors.email && <p className="text-red-500 text-xs ml-2 flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.email}</p>}

                            <button 
                            type="submit"
                            className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg transition-all"
                            >
                            Enviar Link de Recuperação
                            </button>
                        </form>
                      </>
                  ) : (
                      <div className="text-center py-6">
                          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                              <CheckCircleIcon className="w-10 h-10" />
                          </div>
                          <h3 className="text-white font-bold text-lg mb-2">E-mail Enviado!</h3>
                          <p className="text-slate-400 text-sm mb-6">Verifique sua caixa de entrada (e spam) para redefinir sua senha.</p>
                          <button onClick={() => setView('LOGIN')} className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold">
                              Voltar para o Login
                          </button>
                      </div>
                  )}
              </div>
          ) : (
              // Login/Register Form
            <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
                {view === 'REGISTER' && (
                <div className="relative group">
                    <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    <input 
                    required
                    type="text" 
                    placeholder="Nome Completo" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/30 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-slate-600 text-sm transition-all"
                    />
                </div>
                )}

                {/* Toggle Auth Method (Only manual if not using social) */}
                {view === 'LOGIN' && (
                    <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        <button type="button" onClick={() => setAuthMethod('EMAIL')} className={`hover:text-white transition-colors ${authMethod === 'EMAIL' ? 'text-brand-400 border-b border-brand-400 pb-0.5' : ''}`}>E-mail</button>
                        <button type="button" onClick={() => setAuthMethod('PHONE')} className={`hover:text-white transition-colors ${authMethod === 'PHONE' ? 'text-brand-400 border-b border-brand-400 pb-0.5' : ''}`}>Telefone</button>
                    </div>
                )}

                {authMethod === 'EMAIL' ? (
                    <div className="space-y-1">
                        <div className="relative group">
                            <EnvelopeIcon className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${errors.email ? 'text-red-500' : 'text-slate-500 group-focus-within:text-brand-400'}`} />
                            <input 
                            type="email" 
                            placeholder="seu@email.com" 
                            value={formData.email}
                            onChange={e => { setFormData({...formData, email: e.target.value}); if(errors.email) setErrors({...errors, email: ''}); }}
                            className={`w-full bg-black/30 border rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:outline-none placeholder-slate-600 text-sm transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-brand-500'}`}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs ml-2 flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.email}</p>}
                    </div>
                ) : (
                    <div className="relative group">
                        <DevicePhoneMobileIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                        <input 
                        required
                        type="tel" 
                        placeholder="(00) 90000-0000" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-black/30 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-slate-600 text-sm transition-all"
                        />
                    </div>
                )}

                {/* Age & CPF for Register */}
                {view === 'REGISTER' && (
                    <>
                    <div className="relative group">
                        <CalendarDaysIcon className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${errors.age ? 'text-red-500' : 'text-slate-500 group-focus-within:text-brand-400'}`} />
                        <input 
                        required
                        type="number" 
                        placeholder="Idade" 
                        value={formData.age}
                        onChange={e => { setFormData({...formData, age: e.target.value}); if(errors.age) setErrors({...errors, age: ''}); }}
                        className={`w-full bg-black/30 border rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:outline-none placeholder-slate-600 text-sm transition-all ${errors.age ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-brand-500'}`}
                        />
                        {errors.age && <p className="text-red-500 text-xs ml-2 mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.age}</p>}
                    </div>
                    <div className="relative group">
                        <IdentificationIcon className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${errors.cpf ? 'text-red-500' : 'text-slate-500 group-focus-within:text-brand-400'}`} />
                        <input 
                        required
                        type="text" 
                        placeholder="CPF (000.000.000-00)" 
                        value={formData.cpf}
                        onChange={e => { setFormData({...formData, cpf: e.target.value}); if(errors.cpf) setErrors({...errors, cpf: ''}); }}
                        className={`w-full bg-black/30 border rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:outline-none placeholder-slate-600 text-sm transition-all ${errors.cpf ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-brand-500'}`}
                        />
                        {errors.cpf && <p className="text-red-500 text-xs ml-2 mt-1 flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.cpf}</p>}
                    </div>
                    </>
                )}

                <div className="space-y-1">
                    <div className="relative group">
                        <LockClosedIcon className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${errors.password ? 'text-red-500' : 'text-slate-500 group-focus-within:text-brand-400'}`} />
                        <input 
                            type="password" 
                            placeholder="Senha" 
                            value={formData.password}
                            onChange={e => { setFormData({...formData, password: e.target.value}); if(errors.password) setErrors({...errors, password: ''}); }}
                            className={`w-full bg-black/30 border rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-2 focus:outline-none placeholder-slate-600 text-sm transition-all ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-brand-500'}`}
                        />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs ml-2 flex items-center gap-1"><ExclamationCircleIcon className="w-3 h-3"/> {errors.password}</p>}
                </div>

                {view === 'REGISTER' && (
                    <div className="mt-2">
                        <div className="flex items-start gap-2">
                            <div className="relative flex items-center pt-1">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={termsAccepted}
                                    onChange={(e) => { setTermsAccepted(e.target.checked); if(errors.terms) setErrors({...errors, terms: ''}); }}
                                    className="h-4 w-4 rounded border-slate-600 bg-black/30 text-brand-600 focus:ring-brand-500"
                                />
                            </div>
                            <label htmlFor="terms" className="text-xs text-slate-400 leading-tight">
                                Li e concordo com os <button type="button" onClick={() => setShowTermsModal(true)} className="text-brand-400 hover:underline font-bold">Termos de Uso</button> e Política de Privacidade.
                            </label>
                        </div>
                        {errors.terms && <p className="text-red-500 text-xs ml-6 mt-1">{errors.terms}</p>}
                    </div>
                )}

                {view === 'LOGIN' && (
                    <div className="text-right">
                        <button 
                            type="button" 
                            onClick={() => { setView('FORGOT_PASSWORD'); setErrors({email:'',password:'',terms:'', age:'', cpf:''}); }}
                            className="text-xs text-slate-500 hover:text-brand-400 transition-colors font-medium"
                        >
                            Esqueceu a senha?
                        </button>
                    </div>
                )}

                <button 
                type="submit"
                className={`w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group ${loadingSocial ? 'opacity-70 cursor-wait' : ''}`}
                >
                {loadingSocial ? 'Processando...' : (view === 'REGISTER' ? 'Continuar' : 'Acessar Conta')}
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </form>
          )}
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slide-up max-h-[80vh] flex flex-col">
                  <h2 className="text-xl font-bold text-white mb-4">Termos de Serviço</h2>
                  <div className="overflow-y-auto flex-1 text-slate-300 text-sm space-y-3 pr-2 mb-4">
                      <p>Bem-vindo ao Ascenda. Ao usar nosso aplicativo, você concorda com estes termos.</p>
                      <h3 className="font-bold text-white">1. Uso de Dados</h3>
                      <p>Coletamos informações básicas para personalizar sua experiência. Ao usar a IA, seus prompts podem ser processados para gerar respostas.</p>
                      <h3 className="font-bold text-white">2. Conteúdo Gerado</h3>
                      <p>O conteúdo gerado pela IA (planos, dicas) é apenas para fins informativos. Não nos responsabilizamos por decisões financeiras.</p>
                      <h3 className="font-bold text-white">3. Privacidade</h3>
                      <p>Respeitamos sua privacidade. Você pode excluir sua conta e dados a qualquer momento nas configurações.</p>
                  </div>
                  <button 
                    onClick={() => {setTermsAccepted(true); setShowTermsModal(false); setErrors(prev => ({...prev, terms: ''}));}}
                    className="w-full py-3 rounded-xl bg-brand-600 text-white font-bold"
                  >
                      Concordar e Fechar
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default LoginScreen;