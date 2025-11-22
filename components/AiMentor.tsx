
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { askMentorChat } from '../services/geminiService';
import { playSound, stopSound } from '../services/soundService';
import { ChatMessage, ChatContact } from '../types';
import { ArrowLeftIcon, PhotoIcon, MicrophoneIcon, FaceSmileIcon, XMarkIcon, VideoCameraIcon, PhoneIcon, EllipsisVerticalIcon, LinkIcon, TagIcon, CommandLineIcon, PlusIcon, DocumentTextIcon, MapPinIcon, PaintBrushIcon, PlayCircleIcon, PauseCircleIcon, HandThumbUpIcon, HandThumbDownIcon, TrashIcon, StarIcon, MicrophoneIcon as MicOutline, VideoCameraSlashIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { MicrophoneIcon as MicSolid, PlayIcon as PlaySolid, StopIcon as StopSolid, HandThumbUpIcon as ThumbUpSolid, HandThumbDownIcon as ThumbDownSolid, MapPinIcon as MapSolid, StarIcon as StarSolid, PaperAirplaneIcon, VideoCameraIcon as VideoSolid } from '@heroicons/react/24/solid';

interface AiMentorProps {
    onBack: () => void;
    wallpaper?: 'DEFAULT' | 'GALAXY' | 'MINIMAL' | 'NEON' | 'FOREST' | 'SUNSET';
    onUpdateSettings?: (setting: string, value: any) => void;
    incomingChatTarget?: string | null;
}

const emojis = ['😀', '😂', '😍', '🚀', '💡', '💰', '📈', '🤝', '🔥', '✨', '👍', '💼', '📚', '🤖', '🎯'];

const initialContacts: ChatContact[] = [
    { id: 'ai', name: 'Ascenda AI', type: 'AI', timestamp: new Date(), unread: 0, avatar: '🤖', inviteLink: 'ascenda.app/chat/ai', tags: ['Assistente'], roleDescription: 'Mentor de Carreira Virtual' },
    { id: 'rec1', name: 'TechCorp Recruiter', type: 'RECRUITER', timestamp: new Date(Date.now() - 100000), unread: 2, avatar: 'TC', tags: ['Entrevista'], inviteLink: 'ascenda.app/chat/rec1', customAction: { label: 'Agendar', actionType: 'LINK', value: 'https://cal.com/techcorp' }, roleDescription: 'Talent Acquisition Manager' },
    { id: 'rec2', name: 'Global Solutions', type: 'COMPANY', timestamp: new Date(Date.now() - 500000), unread: 0, avatar: 'GS', tags: ['Pendente'], inviteLink: 'ascenda.app/chat/rec2', roleDescription: 'Processo Seletivo' }
];

const themes = [
    { id: 'DEFAULT', name: 'Padrão', bg: 'bg-slate-900', color: '#0f172a' },
    { id: 'GALAXY', name: 'Galáxia', bg: 'bg-[url("https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?q=80&w=2072&auto=format&fit=crop")]', color: '#312e81' },
    { id: 'MINIMAL', name: 'Dark', bg: 'bg-black', color: '#000' },
    { id: 'NEON', name: 'Neon', bg: 'bg-gradient-to-br from-slate-900 to-purple-900', color: '#581c87' },
    { id: 'FOREST', name: 'Floresta', bg: 'bg-gradient-to-b from-emerald-950 to-slate-950', color: '#022c22' },
    { id: 'SUNSET', name: 'Pôr do Sol', bg: 'bg-gradient-to-tr from-orange-900 to-slate-900', color: '#7c2d12' },
];

const quickPrompts = [
    { label: '💡 Dica do Dia', text: 'Me dê uma dica rápida e prática de carreira para hoje.' },
    { label: '🎧 Sugerir Podcast', text: 'Me recomende um podcast interessante sobre negócios ou tecnologia.' },
    { label: '💰 Conselho Financeiro', text: 'Como posso começar a organizar minhas finanças pessoais?' },
    { label: '📚 Livro para Ler', text: 'Indique um livro essencial para desenvolvimento profissional.' },
];

// --- OPTIMIZED MESSAGE COMPONENT (MEMOIZED) ---
const MessageBubble = memo(({ msg, isPlaying, audioProgress, onPlayAudio, onVote }: { 
    msg: ChatMessage, 
    isPlaying: boolean, 
    audioProgress: number,
    onPlayAudio: (id: string) => void,
    onVote: (id: string, type: 'up' | 'down') => void
}) => {
    return (
        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
            <div 
                className={`max-w-[85%] p-3 rounded-xl text-sm shadow-md relative group ${
                    msg.role === 'user' 
                    ? 'bg-[#005c4b] text-white rounded-tr-none' 
                    : 'bg-[#202c33]/90 backdrop-blur-sm text-slate-200 rounded-tl-none border border-white/5'
                }`}
            >
                {msg.isCall && (
                    <div className="flex items-center gap-2 text-slate-300 italic px-2 py-1">
                        <PhoneIcon className="w-4 h-4" /> {msg.text}
                    </div>
                )}
                
                {/* Attachment Renderers */}
                {msg.attachmentType === 'location' && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                        <div className="bg-slate-700 h-24 w-48 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 opacity-50"></div>
                            <MapSolid className="w-8 h-8 text-red-500 z-10 drop-shadow-lg"/>
                        </div>
                        <div className="bg-slate-800 p-2 text-xs text-slate-300 font-bold flex items-center gap-1">
                            <MapPinIcon className="w-3 h-3"/> {msg.attachmentUrl}
                        </div>
                    </div>
                )}
                {msg.attachmentType === 'image' && (
                    <img src={msg.attachmentUrl} alt="attachment" className="w-full h-48 object-cover rounded-lg mb-2 border border-white/10" loading="lazy" />
                )}
                {msg.attachmentType === 'document' && (
                    <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg mb-2 border border-white/5">
                        <DocumentTextIcon className="w-6 h-6 text-red-400"/>
                        <span className="text-xs font-bold text-slate-200 truncate max-w-[150px]">{msg.attachmentUrl}</span>
                    </div>
                )}
                {msg.attachmentType === 'audio' && (
                    <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-lg min-w-[180px] select-none">
                        <button onClick={() => onPlayAudio(msg.id)}>
                            {isPlaying ? (
                                <PauseCircleIcon className="w-8 h-8 text-brand-400" />
                            ) : (
                                <PlayCircleIcon className="w-8 h-8 text-slate-300 hover:text-brand-400" />
                            )}
                        </button>
                        <div className="flex-1 flex flex-col justify-center gap-1">
                            <div className="h-1 w-full bg-slate-600 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-brand-400 transition-all duration-100 ease-linear"
                                    style={{ width: isPlaying ? `${audioProgress}%` : '0%' }}
                                ></div>
                            </div>
                            <span className="text-[10px] text-slate-400">
                                {isPlaying ? 'Reproduzindo...' : '0:05'}
                            </span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-500/30 flex items-center justify-center">
                            <MicSolid className="w-3 h-3 text-slate-300"/>
                        </div>
                    </div>
                )}
                
                {!msg.isCall && msg.text && <p className="whitespace-pre-wrap leading-relaxed px-1">{msg.text}</p>}
                
                <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                    <span className="text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {msg.role === 'user' && (
                        <span className="text-[10px]">
                            {msg.status === 'sending' && '🕒'}
                            {msg.status === 'sent' && '✓'}
                            {msg.status === 'read' && <span className="text-blue-300">✓✓</span>}
                        </span>
                    )}
                </div>
            </div>

            {/* Vote Actions */}
            {msg.role !== 'user' && !msg.isCall && (
                <div className="flex gap-2 mt-1 px-2 opacity-50 hover:opacity-100 transition-opacity">
                    <button onClick={() => onVote(msg.id, 'up')} className={`p-1 rounded hover:bg-slate-800 ${msg.rating === 'up' ? 'text-green-500' : 'text-slate-500'}`}>
                        {msg.rating === 'up' ? <ThumbUpSolid className="w-3.5 h-3.5"/> : <HandThumbUpIcon className="w-3.5 h-3.5"/>}
                    </button>
                    <button onClick={() => onVote(msg.id, 'down')} className={`p-1 rounded hover:bg-slate-800 ${msg.rating === 'down' ? 'text-red-500' : 'text-slate-500'}`}>
                        {msg.rating === 'down' ? <ThumbDownSolid className="w-3.5 h-3.5"/> : <HandThumbDownIcon className="w-3.5 h-3.5"/>}
                    </button>
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.msg === nextProps.msg && 
        prevProps.isPlaying === nextProps.isPlaying && 
        prevProps.audioProgress === nextProps.audioProgress
    );
});

const AiMentor: React.FC<AiMentorProps> = ({ onBack, wallpaper = 'DEFAULT', onUpdateSettings, incomingChatTarget }) => {
  const [view, setView] = useState<'LIST' | 'CHAT'>('LIST');
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [contacts, setContacts] = useState<ChatContact[]>(initialContacts);
  const [showOptions, setShowOptions] = useState(false);
  
  // UX States
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Audio Player
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);

  // Modals
  const [showTagModal, setShowTagModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showRateSessionModal, setShowRateSessionModal] = useState(false);

  const [tagInput, setTagInput] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [actionValue, setActionValue] = useState('');

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
      'ai': [{ id: 'intro', role: 'ai', text: 'Olá! Sou a inteligência do Ascenda. Como posso ajudar na sua carreira hoje?', timestamp: new Date() }],
      'rec1': [{ id: 'r1', role: 'recruiter', text: 'Olá! Vimos seu perfil e gostaríamos de agendar uma conversa.', timestamp: new Date(Date.now() - 100000) }]
  });
  
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState<{url: string, type: 'image' | 'audio' | 'video' | 'document' | 'location'} | null>(null);
  
  // --- OPTIMIZED CALL SYSTEM STATE ---
  const [callState, setCallState] = useState<'IDLE' | 'RINGING' | 'CONNECTED'>('IDLE');
  const [callType, setCallType] = useState<'AUDIO' | 'VIDEO'>('AUDIO');
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  // Video Call Refs & Stream Management
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Incoming Chat Redirects
  useEffect(() => {
      if (incomingChatTarget) {
          const existing = contacts.find(c => c.name === incomingChatTarget);
          if (existing) {
              handleSelectContact(existing);
          } else {
              const newId = `comp-${Date.now()}`;
              const newContact: ChatContact = {
                  id: newId,
                  name: incomingChatTarget,
                  type: 'COMPANY',
                  timestamp: new Date(),
                  unread: 0,
                  avatar: incomingChatTarget.substring(0,2).toUpperCase(),
                  tags: ['Candidatura'],
                  roleDescription: 'Processo de Seleção'
              };
              setContacts(prev => [newContact, ...prev]);
              setMessages(prev => ({
                  ...prev,
                  [newId]: [{
                      id: 'init',
                      role: 'ai',
                      text: `Candidatura iniciada para ${incomingChatTarget}. Envie seu currículo ou uma mensagem de apresentação.`,
                      timestamp: new Date()
                  }]
              }));
              handleSelectContact(newContact);
          }
      }
  }, [incomingChatTarget]);

  useEffect(() => {
    if (view === 'CHAT' && !isLoadingHistory) scrollToBottom();
  }, [messages, view, attachment, isTyping, isLoadingHistory]);

  // Audio Timer Logic
  useEffect(() => {
      let interval: any;
      if (playingAudioId) {
          setAudioProgress(prev => prev >= 100 ? 0 : prev);
          interval = setInterval(() => {
              setAudioProgress(prev => {
                  if (prev >= 100) {
                      setPlayingAudioId(null);
                      return 0;
                  }
                  return prev + 1; 
              });
          }, 50);
      }
      return () => clearInterval(interval);
  }, [playingAudioId]);

  // Call Timer
  useEffect(() => {
      let timer: any;
      if (callState === 'CONNECTED') {
          timer = setInterval(() => {
              setCallDuration(prev => prev + 1);
          }, 1000);
      }
      return () => clearInterval(timer);
  }, [callState]);

  // Optimized Camera Logic
  useEffect(() => {
      if (callState === 'CONNECTED' && callType === 'VIDEO') {
          // Request Camera with improved constraints
          navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true })
            .then(stream => {
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Camera access denied", err);
                alert("Não foi possível acessar sua câmera. Verifique as permissões do navegador.");
                setCallType('AUDIO'); // Fallback to audio
            });
      } else {
          // Strict Cleanup
          if (localStream) {
              localStream.getTracks().forEach(track => track.stop());
              setLocalStream(null);
          }
      }
      return () => {
          // Component Unmount Cleanup
          if (localStream) localStream.getTracks().forEach(track => track.stop());
      };
  }, [callState, callType]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectContact = useCallback((contact: ChatContact) => {
      setActiveContact(contact);
      setView('CHAT');
      setIsLoadingHistory(true);
      setShowOptions(false);
      if(contact.customAction) {
          setActionLabel(contact.customAction.label);
          setActionValue(contact.customAction.value);
      } else {
          setActionLabel('');
          setActionValue('');
      }
      setTimeout(() => setIsLoadingHistory(false), 300);
  }, []);

  const handleVoteMessage = useCallback((msgId: string, vote: 'up' | 'down') => {
      setActiveContact(prevContact => {
        if (!prevContact) return null;
        setMessages(prev => ({
            ...prev,
            [prevContact.id]: prev[prevContact.id].map(m => 
                m.id === msgId ? { ...m, rating: vote } : m
            )
        }));
        return prevContact;
      });
  }, []);

  const handlePlayAudio = useCallback((msgId: string) => {
      setPlayingAudioId(prev => prev === msgId ? null : msgId);
  }, []);

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || input;
    
    if ((!textToSend.trim() && !attachment) || !activeContact) return;

    playSound('SEND');

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: textToSend,
        timestamp: new Date(),
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
        status: 'sending'
    };

    const chatId = activeContact.id;
    
    setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), userMsg]
    }));

    setInput('');
    setAttachment(null);
    setShowEmoji(false);
    setShowAttachmentMenu(false);
    setIsTyping(true); 
    
    setTimeout(() => {
        setMessages(prev => {
            const msgs = prev[chatId] || [];
            return {
                ...prev,
                [chatId]: msgs.map(m => m.id === userMsg.id ? {...m, status: 'sent'} : m)
            };
        });
    }, 600);

    try {
      const context = activeContact.type === 'AI' ? 'AI' : 'RECRUITER';
      const responseText = await askMentorChat(textToSend, context, activeContact.name);
      
      const replyMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: activeContact.type === 'AI' ? 'ai' : 'recruiter',
          text: responseText,
          timestamp: new Date()
      };

      setTimeout(() => {
          setIsTyping(false); 
          setMessages(prev => {
             const currentMsgs = prev[chatId] || [];
             const updatedMsgs = currentMsgs.map(m => m.role === 'user' ? {...m, status: 'read'} : m);
             return {
                 ...prev,
                 [chatId]: [...updatedMsgs, replyMsg]
             };
          });
        playSound('RECEIVE');
      }, 1500 + Math.random() * 1000); 

    } catch (err) {
      setIsTyping(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const type = file.type.startsWith('video') ? 'video' : 'image';
              setAttachment({ url: reader.result as string, type });
          };
          reader.readAsDataURL(file);
      }
      setShowAttachmentMenu(false);
  };
  
  const handleFakeAttachment = (type: 'document' | 'location') => {
      if(type === 'location') {
          setAttachment({ url: 'São Paulo, Brasil', type: 'location' });
      } else {
          setAttachment({ url: 'Currículo_2024.pdf', type: 'document' });
      }
      setShowAttachmentMenu(false);
  };

  const startCall = (type: 'AUDIO' | 'VIDEO' = 'AUDIO') => {
      setCallType(type);
      playSound('RINGING'); 
      setCallState('RINGING');
      // Reset States
      setIsMuted(false);
      setIsVideoOff(false);
      
      setTimeout(() => {
           stopSound();
           setCallState('CONNECTED');
           setCallDuration(0);
      }, 3000);
  };

  const endCall = () => {
      stopSound();
      
      // Force stream stop
      if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
      }
      
      if(activeContact) {
         const callMsg: ChatMessage = {
             id: Date.now().toString(),
             role: 'user',
             text: `${callType === 'VIDEO' ? 'Videochamada' : 'Chamada de Voz'} - ${formatDuration(callDuration)}`,
             timestamp: new Date(),
             isCall: true
         };
         setMessages(prev => ({ ...prev, [activeContact.id]: [...(prev[activeContact.id] || []), callMsg] }));
      }
      setCallState('IDLE');
  };
  
  const toggleRecording = () => {
      if (isRecording) {
          setIsRecording(false);
          playSound('RECORD_END');
          setAttachment({ url: 'audio-msg', type: 'audio' });
      } else {
          setIsRecording(true);
          playSound('RECORD_START');
      }
  };

  const handleAddTag = () => {
      if (tagInput.trim() && activeContact) {
          const updatedContact = { ...activeContact, tags: [...(activeContact.tags || []), tagInput.trim()] };
          setContacts(prev => prev.map(c => c.id === activeContact.id ? updatedContact : c));
          setActiveContact(updatedContact);
          setTagInput('');
      }
  };

  const handleRemoveTag = (tag: string) => {
      if (activeContact) {
          const updatedContact = { ...activeContact, tags: (activeContact.tags || []).filter(t => t !== tag) };
          setContacts(prev => prev.map(c => c.id === activeContact.id ? updatedContact : c));
          setActiveContact(updatedContact);
      }
  };

  const handleCopyLink = () => {
      if (activeContact?.inviteLink) {
          navigator.clipboard.writeText(`https://${activeContact.inviteLink}`);
          alert("Link copiado!");
          setShowOptions(false);
      }
  };

  const handleConfigureAction = () => {
      if (activeContact) {
          const updatedContact = { 
              ...activeContact, 
              customAction: { label: actionLabel || 'Ação', actionType: 'LINK' as const, value: actionValue } 
          };
          setContacts(prev => prev.map(c => c.id === activeContact.id ? updatedContact : c));
          setActiveContact(updatedContact);
          setShowActionModal(false);
      }
  };

  const handleClearChat = () => {
      if (activeContact && window.confirm("Apagar histórico?")) {
          setMessages(prev => {
              const newState = { ...prev };
              delete newState[activeContact.id];
              return newState;
          });
          setShowOptions(false);
      }
  };

  const handleSessionRate = (rating: number) => {
      alert("Obrigado pela avaliação! Usaremos isso para melhorar.");
      setShowRateSessionModal(false);
  }

  const formatDuration = (secs: number) => {
      const mins = Math.floor(secs / 60);
      const s = secs % 60;
      return `${mins}:${s < 10 ? '0' : ''}${s}`;
  }

  const getBgStyle = () => {
      const theme = themes.find(t => t.id === wallpaper) || themes[0];
      return theme.bg.startsWith('bg-[url') ? `${theme.bg} bg-cover bg-center` : theme.bg;
  };

  if (view === 'LIST') {
      return (
          <div className="pb-20 animate-fade-in h-[calc(100vh-80px)] flex flex-col bg-[#0b141a]">
              <div className="flex items-center gap-3 p-4 bg-[#202c33] border-b border-[#2f3b43]">
                   <button onClick={onBack} className="text-slate-400 hover:text-white p-2 -ml-2 rounded-full hover:bg-slate-700/50 transition-colors"><ArrowLeftIcon className="w-6 h-6"/></button>
                   <h1 className="text-xl font-bold text-white">Conversas</h1>
              </div>
              <div className="flex-1 overflow-y-auto">
                  {contacts.map(contact => (
                      <div key={contact.id} onClick={() => handleSelectContact(contact)} className="flex items-center gap-4 p-4 hover:bg-[#202c33] cursor-pointer border-b border-[#2f3b43] transition-colors">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${contact.type === 'AI' ? 'bg-brand-600' : 'bg-blue-600'}`}>
                              {contact.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                  <h3 className="text-white font-semibold truncate">{contact.name}</h3>
                                  <span className="text-xs text-slate-500">{contact.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                              </div>
                              <p className="text-slate-400 text-sm truncate">{contact.type === 'AI' ? 'Assistente Virtual' : contact.roleDescription || 'Recrutador'}</p>
                          </div>
                          {contact.unread > 0 && <div className="w-5 h-5 rounded-full bg-green-500 text-[#0b141a] text-xs font-bold flex items-center justify-center">{contact.unread}</div>}
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  const isAI = activeContact?.type === 'AI';

  return (
    <div className={`pb-20 animate-fade-in h-[calc(100vh-80px)] flex flex-col relative overflow-hidden transition-all duration-500 ${getBgStyle()}`}>
       <div className="absolute inset-0 bg-black/30 pointer-events-none z-0"></div>

       {/* Optimized Call Overlay */}
       {callState !== 'IDLE' && (
           <div className="absolute inset-0 z-[60] bg-[#0b141a] flex flex-col items-center justify-center animate-fade-in overflow-hidden">
               {/* Video Call Interface */}
               {callType === 'VIDEO' && callState === 'CONNECTED' ? (
                   <div className="relative w-full h-full flex flex-col">
                       {/* Remote Video (Simulated) */}
                       <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
                           {/* Fake Remote Stream Effect */}
                           <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-black opacity-50"></div>
                           <div className="flex flex-col items-center z-10">
                               <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-7xl border-4 border-slate-500/50 shadow-2xl mb-6 relative">
                                   {activeContact?.avatar}
                                   <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-800"></div>
                               </div>
                               <p className="text-white font-bold text-2xl tracking-tight">{activeContact?.name}</p>
                               <p className="text-emerald-400 text-sm font-mono mt-2 flex items-center gap-2">
                                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
                                   Sinal Estável
                               </p>
                           </div>
                       </div>

                       {/* Self View (Local Camera) */}
                       <div className="absolute top-16 right-4 w-32 h-48 bg-black rounded-2xl border-2 border-slate-700/50 shadow-2xl overflow-hidden z-20 transform transition-transform hover:scale-105">
                           {isVideoOff ? (
                               <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 gap-2">
                                   <VideoCameraSlashIcon className="w-8 h-8 opacity-50"/>
                                   <span className="text-[9px] font-bold uppercase">Câmera Off</span>
                               </div>
                           ) : (
                               <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                           )}
                           <div className="absolute bottom-2 left-0 right-0 text-center">
                                <span className="text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">Você</span>
                           </div>
                       </div>
                   </div>
               ) : (
                   /* Audio Call Interface */
                   <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden">
                       {/* Background Pulse Animation */}
                       <div className="absolute w-[500px] h-[500px] bg-brand-500/5 rounded-full animate-pulse-slow blur-3xl"></div>
                       
                       <div className="relative z-10 flex flex-col items-center">
                           <div className="w-36 h-36 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(59,130,246,0.3)] border border-white/10">
                               <span className="text-6xl drop-shadow-lg">{activeContact?.avatar}</span>
                           </div>
                           <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{activeContact?.name}</h2>
                           <p className="text-slate-400 text-lg font-medium mb-8">
                               {callState === 'RINGING' ? 'Chamando...' : formatDuration(callDuration)}
                           </p>
                           
                           {callState === 'CONNECTED' && (
                                <div className="flex items-center justify-center gap-1.5 h-8 mb-8">
                                    {[1,2,3,4,5,6,7].map(i => (
                                        <div key={i} className="w-1.5 bg-brand-500 rounded-full animate-pulse" style={{height: `${Math.random() * 30 + 10}px`, animationDuration: `${Math.random() * 0.5 + 0.5}s`}}></div>
                                    ))}
                                </div>
                           )}
                       </div>
                   </div>
               )}

               {/* Controls Bar */}
               <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-6 z-30 px-6">
                   <button 
                        onClick={() => setIsMuted(!isMuted)} 
                        className={`p-4 rounded-full backdrop-blur-md transition-all shadow-lg border ${isMuted ? 'bg-white text-black border-white' : 'bg-slate-800/80 text-white border-slate-600 hover:bg-slate-700'}`}
                   >
                       {isMuted ? <MicOutline className="w-7 h-7" /> : <MicSolid className="w-7 h-7" />}
                   </button>
                   
                   {callType === 'VIDEO' && (
                       <button 
                            onClick={() => setIsVideoOff(!isVideoOff)} 
                            className={`p-4 rounded-full backdrop-blur-md transition-all shadow-lg border ${isVideoOff ? 'bg-white text-black border-white' : 'bg-slate-800/80 text-white border-slate-600 hover:bg-slate-700'}`}
                       >
                           {isVideoOff ? <VideoCameraSlashIcon className="w-7 h-7" /> : <VideoSolid className="w-7 h-7" />}
                       </button>
                   )}

                   <button onClick={() => endCall()} className="bg-red-600 p-5 rounded-full text-white hover:bg-red-500 shadow-[0_0_30px_rgba(220,38,38,0.5)] transform hover:scale-110 transition-all active:scale-95">
                       <PhoneIcon className="w-9 h-9 rotate-[135deg]" />
                   </button>
               </div>
           </div>
       )}

       {/* Chat Header */}
       <div className="flex flex-col bg-[#202c33]/95 backdrop-blur-md border-b border-[#2f3b43] shadow-md z-30 relative">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => setView('LIST')} className="text-slate-400 hover:text-white p-2 -ml-2 rounded-full hover:bg-slate-700/50 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6"/>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold">
                        {activeContact?.avatar}
                    </div>
                    <div>
                        <h1 className="text-white font-bold leading-none text-sm">{activeContact?.name}</h1>
                        <div className="flex flex-col mt-0.5">
                             {activeContact?.roleDescription && (
                                 <span className="text-[10px] text-brand-400 font-medium mb-0.5">{activeContact.roleDescription}</span>
                             )}
                             <div className="flex items-center gap-2">
                                {isTyping ? (
                                    <span className="text-brand-400 text-[10px] font-bold animate-pulse">Digitando...</span>
                                ) : (
                                    <span className="text-slate-400 text-[10px]">{isAI ? 'Online' : 'Visto por último hoje'}</span>
                                )}
                                {activeContact?.tags?.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[9px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded">{tag}</span>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 text-slate-400 items-center">
                    {activeContact?.customAction && (
                        <button onClick={() => window.open(activeContact.customAction?.value, '_blank')} className="bg-brand-600 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-brand-500 shadow-lg shadow-brand-900/20">
                            {activeContact.customAction.label}
                        </button>
                    )}
                    
                    <button onClick={() => startCall('VIDEO')} className="hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"><VideoCameraIcon className="w-6 h-6"/></button>
                    <button onClick={() => startCall('AUDIO')} className="hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"><PhoneIcon className="w-5 h-5"/></button>
                    
                    <div className="relative">
                        <button onClick={() => setShowOptions(!showOptions)} className="hover:text-white p-1"><EllipsisVerticalIcon className="w-6 h-6"/></button>
                        {showOptions && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 animate-fade-in z-50">
                                <button onClick={() => {setShowTagModal(true); setShowOptions(false);}} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2"><TagIcon className="w-4 h-4"/> Etiquetas</button>
                                <button onClick={() => {setShowRateSessionModal(true); setShowOptions(false);}} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2"><StarIcon className="w-4 h-4"/> Avaliar Sessão</button>
                                <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Copiar Link</button>
                                
                                {!isAI && (
                                    <button onClick={() => {setShowActionModal(true); setShowOptions(false);}} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2"><CommandLineIcon className="w-4 h-4"/> Botão de Ação</button>
                                )}
                                
                                <button onClick={() => {setShowThemeSelector(true); setShowOptions(false);}} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2"><PaintBrushIcon className="w-4 h-4"/> Mudar Tema</button>
                                <div className="border-t border-slate-700 my-1"></div>
                                <button onClick={handleClearChat} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"><TrashIcon className="w-4 h-4"/> Limpar Chat</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {showThemeSelector && (
                <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 animate-slide-down">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400">ESCOLHA UM TEMA</span>
                        <button onClick={() => setShowThemeSelector(false)}><XMarkIcon className="w-4 h-4 text-slate-500"/></button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {themes.map(theme => (
                            <button 
                                key={theme.id}
                                onClick={() => {onUpdateSettings?.('chatWallpaper', theme.id);}}
                                className={`flex-shrink-0 w-20 h-28 rounded-lg border-2 relative overflow-hidden transition-all flex flex-col ${wallpaper === theme.id ? 'border-brand-500 scale-105 ring-2 ring-brand-500/50' : 'border-transparent opacity-80 hover:opacity-100'}`}
                            >
                                <div className={`absolute inset-0 ${theme.bg.startsWith('bg-[url') ? 'bg-cover bg-center' : theme.bg}`}></div>
                                <div className="absolute bottom-0 w-full bg-black/60 text-white text-[9px] font-bold py-1 text-center backdrop-blur-sm">
                                    {theme.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
       </div>

       {/* Messages Area (Memoized) */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
           {isLoadingHistory ? (
               <div className="space-y-4 pt-4">
                   {[1, 2, 3].map(i => (
                       <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} opacity-50 animate-pulse`}>
                           <div className={`h-12 rounded-2xl bg-slate-700 w-[60%]`}></div>
                       </div>
                   ))}
               </div>
           ) : (
               (activeContact && messages[activeContact.id])?.map((msg) => (
                   <MessageBubble 
                        key={msg.id} 
                        msg={msg} 
                        isPlaying={playingAudioId === msg.id} 
                        audioProgress={playingAudioId === msg.id ? audioProgress : 0}
                        onPlayAudio={handlePlayAudio}
                        onVote={handleVoteMessage}
                   />
               ))
           )}
           
           {/* Enhanced Typing Indicator */}
           {isTyping && !isLoadingHistory && (
               <div className="flex justify-start animate-slide-up pl-2">
                   <div className="bg-[#202c33]/90 backdrop-blur-sm p-3 rounded-xl rounded-tl-none flex items-center gap-1.5 shadow-md w-fit border border-white/5">
                       <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                       <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                   </div>
               </div>
           )}
           <div ref={messagesEndRef} />
       </div>

        {/* Attachment Preview Bar */}
        {attachment && (
            <div className="bg-[#111b21] px-4 py-3 flex items-center justify-between border-t border-slate-800 z-20 animate-slide-up">
                <div className="flex items-center gap-3">
                    {attachment.type === 'image' ? (
                        <img src={attachment.url} className="w-12 h-12 rounded-lg object-cover border border-slate-600 shadow-lg" />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-brand-900/50 flex items-center justify-center text-brand-400 uppercase font-bold text-xs border border-brand-500/30">
                            {attachment.type.substring(0,3)}
                        </div>
                    )}
                    <div>
                        <p className="text-xs text-white font-bold">Anexando arquivo...</p>
                        <span className="text-[10px] text-slate-400 uppercase">{attachment.type}</span>
                    </div>
                </div>
                <button onClick={() => setAttachment(null)} className="p-2 bg-slate-800 rounded-full hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"><XMarkIcon className="w-4 h-4"/></button>
            </div>
        )}

       {/* Emoji Picker */}
       {showEmoji && (
           <div className="bg-[#202c33] p-3 grid grid-cols-8 gap-2 border-t border-[#2f3b43] h-40 overflow-y-auto z-20 relative animate-slide-up">
               {emojis.map(e => (
                   <button key={e} onClick={() => setInput(prev => prev + e)} className="text-xl hover:bg-white/10 rounded p-1 transition-colors">{e}</button>
               ))}
           </div>
       )}

       {/* Input Bar */}
       <div className="bg-[#202c33] p-2 z-20 relative pb-6 sm:pb-2">
          {/* Quick Action Chips for AI */}
          {activeContact?.type === 'AI' && (
              <div className="absolute bottom-full left-0 right-0 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-gradient-to-t from-[#202c33] to-transparent pointer-events-auto">
                  {quickPrompts.map((p, i) => (
                      <button 
                          key={i}
                          onClick={() => handleSend(undefined, p.text)}
                          className="whitespace-nowrap bg-slate-800/80 backdrop-blur-md border border-slate-600 text-slate-300 text-xs px-3 py-1.5 rounded-full hover:bg-brand-900/50 hover:border-brand-500 hover:text-brand-400 transition-all shadow-lg"
                      >
                          {p.label}
                      </button>
                  ))}
              </div>
          )}

          {/* Enhanced Attachment Menu */}
          {showAttachmentMenu && (
              <div className="absolute bottom-20 left-4 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-5 grid grid-cols-4 gap-4 animate-slide-up z-50 w-[90%] max-w-[340px]">
                   <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group hover:bg-white/5 p-2 rounded-xl transition-colors">
                       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                           <PhotoIcon className="w-7 h-7 text-white"/>
                       </div>
                       <span className="text-[10px] font-bold text-slate-300">Galeria</span>
                   </button>
                   <button onClick={() => handleFakeAttachment('document')} className="flex flex-col items-center gap-2 group hover:bg-white/5 p-2 rounded-xl transition-colors">
                       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                           <DocumentTextIcon className="w-7 h-7 text-white"/>
                       </div>
                       <span className="text-[10px] font-bold text-slate-300">Doc</span>
                   </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group hover:bg-white/5 p-2 rounded-xl transition-colors">
                       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                           <VideoCameraIcon className="w-7 h-7 text-white"/>
                       </div>
                       <span className="text-[10px] font-bold text-slate-300">Câmera</span>
                   </button>
                   <button onClick={() => handleFakeAttachment('location')} className="flex flex-col items-center gap-2 group hover:bg-white/5 p-2 rounded-xl transition-colors">
                       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                           <MapPinIcon className="w-7 h-7 text-white"/>
                       </div>
                       <span className="text-[10px] font-bold text-slate-300">Local</span>
                   </button>
              </div>
          )}

          <div className="flex items-center gap-2">
              <button 
                onClick={() => { setShowAttachmentMenu(!showAttachmentMenu); playSound('SEND'); }} 
                className={`p-2 rounded-full transition-all duration-300 ${showAttachmentMenu ? 'rotate-45 bg-red-500/20 text-red-400' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
              >
                   <PlusIcon className="w-6 h-6" />
              </button>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />

              <form onSubmit={(e) => handleSend(e)} className="flex-1 bg-[#2a3942] rounded-2xl flex items-center px-2 border border-transparent focus-within:border-slate-600 transition-colors">
                <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-slate-400 hover:text-yellow-400 transition-colors">
                   <FaceSmileIcon className="w-6 h-6" />
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isRecording ? "Gravando áudio..." : "Mensagem"}
                    disabled={isRecording}
                    className={`w-full bg-transparent text-white py-3 px-2 focus:outline-none placeholder-slate-500 text-sm ${isRecording ? 'animate-pulse text-red-400 font-bold' : ''}`}
                />
              </form>

              {input.trim() || attachment ? (
                <button
                    onClick={() => handleSend()}
                    className="bg-[#005c4b] w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#00755e] transition-all transform hover:scale-110 active:scale-95"
                >
                    <PaperAirplaneIcon className="w-5 h-5 -ml-0.5" />
                </button>
              ) : (
                <button
                    onClick={toggleRecording}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all ${isRecording ? 'bg-red-600 scale-110 shadow-red-500/50' : 'bg-[#005c4b] hover:bg-[#00755e]'}`}
                >
                    {isRecording ? <StopSolid className="w-4 h-4"/> : <MicSolid className="w-5 h-5" />}
                </button>
              )}
          </div>
       </div>

       {/* Modals (Tags & Action) - Kept unchanged for brevity, they are simple overlays */}
       {showTagModal && (
           <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in">
               <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-xs border border-slate-800">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="text-white font-bold">Etiquetas</h3>
                       <button onClick={() => setShowTagModal(false)}><XMarkIcon className="w-5 h-5 text-slate-500"/></button>
                   </div>
                   <div className="flex flex-wrap gap-2 mb-4">
                       {activeContact?.tags?.map(tag => (
                           <span key={tag} className="bg-brand-900/30 text-brand-400 px-2 py-1 rounded-lg text-xs flex items-center gap-1 border border-brand-500/20">
                               {tag} <button onClick={() => handleRemoveTag(tag)}><XMarkIcon className="w-3 h-3 hover:text-white"/></button>
                           </span>
                       ))}
                   </div>
                   <div className="flex gap-2">
                       <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Nova etiqueta..." className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"/>
                       <button onClick={handleAddTag} className="bg-brand-600 px-3 rounded-lg text-white"><PlusIcon className="w-5 h-5"/></button>
                   </div>
               </div>
           </div>
       )}
       {showActionModal && (
           <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in">
               <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-xs border border-slate-800">
                   <h3 className="text-white font-bold mb-4">Botão de Ação</h3>
                   <input value={actionLabel} onChange={e => setActionLabel(e.target.value)} placeholder="Nome (ex: Pagar)" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-3"/>
                   <input value={actionValue} onChange={e => setActionValue(e.target.value)} placeholder="Link (https://...)" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-4"/>
                   <div className="flex gap-2">
                       <button onClick={() => setShowActionModal(false)} className="flex-1 bg-slate-800 py-2 rounded text-slate-400">Cancelar</button>
                       <button onClick={handleConfigureAction} className="flex-1 bg-brand-600 py-2 rounded text-white font-bold">Salvar</button>
                   </div>
               </div>
           </div>
       )}

       {showRateSessionModal && (
           <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in">
               <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-xs border border-slate-800 text-center">
                   <h3 className="text-white font-bold mb-2">Avaliar Sessão</h3>
                   <p className="text-xs text-slate-400 mb-4">Como foi o atendimento da IA?</p>
                   <div className="flex justify-center gap-2 mb-4">
                       {[1,2,3,4,5].map(s => (
                           <button key={s} onClick={() => handleSessionRate(s)} className="text-yellow-500 hover:scale-110 transition-transform">
                               <StarSolid className="w-8 h-8"/>
                           </button>
                       ))}
                   </div>
                   <button onClick={() => setShowRateSessionModal(false)} className="text-sm text-slate-500 underline">Cancelar</button>
               </div>
           </div>
       )}
    </div>
  );
};

export default AiMentor;
