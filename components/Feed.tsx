
import React, { useState } from 'react';
import { FeedPost, FeedStory, SubscriptionPlan, FeedPollOption } from '../types';
import { HeartIcon, ChatBubbleOvalLeftIcon, ShareIcon, LockClosedIcon, StarIcon, CheckCircleIcon, PaperAirplaneIcon, EllipsisHorizontalIcon, UserIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid, HandThumbUpIcon } from '@heroicons/react/24/solid';
import AdBanner from './AdBanner';

interface FeedProps {
    plan: SubscriptionPlan;
    onSubscribe: () => void;
}

const STORIES: FeedStory[] = [
    { id: '1', companyName: 'Google', avatarUrl: 'G', hasUpdate: true },
    { id: '2', companyName: 'Amazon', avatarUrl: 'A', hasUpdate: true },
    { id: '3', companyName: 'Microsoft', avatarUrl: 'M', hasUpdate: false },
    { id: '4', companyName: 'Nubank', avatarUrl: 'N', hasUpdate: true },
    { id: '5', companyName: 'Tesla', avatarUrl: 'T', hasUpdate: false },
];

const INITIAL_POSTS: FeedPost[] = [
    {
        id: '1',
        companyName: 'TechCorp Brasil',
        companyAvatar: 'TC',
        content: 'Estamos expandindo nosso time de tecnologia! Procuramos Desenvolvedores React Senior para trabalho 100% remoto. Benefícios incluem saúde, academia e bônus anual. Se você tem paixão por código limpo e arquitetura escalável, venha fazer parte do nosso time. As entrevistas começam na próxima semana.',
        imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
        timestamp: '2h atrás',
        likes: 1240,
        comments: [
            { id: 'c1', user: 'Ana Silva', text: 'Enviando meu CV agora!', timestamp: '10m' },
            { id: 'c2', user: 'Carlos Dev', text: 'Vaga incrível.', timestamp: '1h' }
        ],
        isPremium: false,
        isJobAlert: true,
        likedByUser: false
    },
    {
        id: '2',
        companyName: 'Ascenda Career',
        companyAvatar: 'AC',
        content: 'Pesquisa rápida: Qual habilidade você acha mais importante desenvolver em 2025?',
        timestamp: '3h atrás',
        likes: 430,
        comments: [],
        isPremium: false,
        isJobAlert: false,
        poll: {
            question: 'Habilidade do Futuro',
            totalVotes: 1540,
            options: [
                { id: 'opt1', text: 'Inteligência Artificial', votes: 900 },
                { id: 'opt2', text: 'Liderança & Gestão', votes: 400 },
                { id: 'opt3', text: 'Finanças', votes: 240 }
            ]
        }
    },
    {
        id: '3',
        companyName: 'Executivos BR',
        companyAvatar: 'EX',
        content: 'Vaga Confidencial: Diretor de Marketing para Multinacional em São Paulo. Salário estimado: R$ 25.000 + Stock Options. Necessário inglês fluente, experiência em gestão de grandes equipes e track record comprovado em crescimento de receita. Exclusivo para assinantes.',
        timestamp: '4h atrás',
        likes: 56,
        comments: [],
        isPremium: true,
        isJobAlert: true,
        likedByUser: false
    },
    {
        id: '4',
        companyName: 'StartUp News',
        companyAvatar: 'SN',
        content: 'O mercado de IA está aquecido! Confira as 5 habilidades mais buscadas por recrutadores nesta semana. Python continua liderando, mas conhecimentos em LLMs e Engenharia de Prompt estão subindo rapidamente no ranking.',
        timestamp: '6h atrás',
        likes: 892,
        comments: [],
        isPremium: false,
        isJobAlert: false,
        likedByUser: true
    }
];

const Feed: React.FC<FeedProps> = ({ plan, onSubscribe }) => {
    const isPremiumUser = plan >= SubscriptionPlan.PREMIUM || plan === SubscriptionPlan.YEARLY;
    const [activeTab, setActiveTab] = useState<'FOR_YOU' | 'FOLLOWING'>('FOR_YOU');
    const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);
    const [expandedComments, setExpandedComments] = useState<string | null>(null);
    const [expandedPosts, setExpandedPosts] = useState<string[]>([]);

    const handleLike = (postId: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    likes: p.likedByUser ? p.likes - 1 : p.likes + 1,
                    likedByUser: !p.likedByUser
                };
            }
            return p;
        }));
    };

    const handleVote = (postId: string, optionId: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId && p.poll && !p.poll.userVotedId) {
                return {
                    ...p,
                    poll: {
                        ...p.poll,
                        totalVotes: p.poll.totalVotes + 1,
                        userVotedId: optionId,
                        options: p.poll.options.map(opt => 
                            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
                        )
                    }
                };
            }
            return p;
        }));
    };

    const toggleComments = (postId: string) => {
        if (expandedComments === postId) {
            setExpandedComments(null);
        } else {
            setExpandedComments(postId);
        }
    };

    const togglePostExpansion = (postId: string) => {
        if (expandedPosts.includes(postId)) {
            setExpandedPosts(expandedPosts.filter(id => id !== postId));
        } else {
            setExpandedPosts([...expandedPosts, postId]);
        }
    };

    const renderPoll = (post: FeedPost) => {
        if (!post.poll) return null;

        return (
            <div className="mt-3 space-y-2">
                {post.poll.options.map(opt => {
                    const percentage = post.poll!.totalVotes > 0 
                        ? Math.round((opt.votes / post.poll!.totalVotes) * 100) 
                        : 0;
                    
                    const isSelected = post.poll!.userVotedId === opt.id;

                    return (
                        <button 
                            key={opt.id}
                            onClick={() => handleVote(post.id, opt.id)}
                            disabled={!!post.poll!.userVotedId}
                            className="relative w-full h-10 rounded-lg border border-slate-700 overflow-hidden group"
                        >
                            <div 
                                className={`absolute top-0 left-0 h-full transition-all duration-500 ${isSelected ? 'bg-brand-600/40' : 'bg-slate-700/40'}`} 
                                style={{ width: post.poll!.userVotedId ? `${percentage}%` : '0%' }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                                <span className={`text-xs font-bold ${isSelected ? 'text-brand-400' : 'text-white'}`}>
                                    {opt.text} {isSelected && <CheckCircleIcon className="w-3 h-3 inline"/>}
                                </span>
                                {post.poll!.userVotedId && (
                                    <span className="text-xs text-slate-400">{percentage}%</span>
                                )}
                            </div>
                        </button>
                    );
                })}
                <p className="text-[10px] text-slate-500 mt-1">{post.poll.totalVotes} votos • {post.poll.userVotedId ? 'Votado' : 'Enquete aberta'}</p>
            </div>
        );
    };

    return (
        <div className="pb-24 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 mb-4">
                <h1 className="text-2xl font-bold text-white">Feed</h1>
                <button className="p-2 bg-slate-800 rounded-full text-white">
                    <PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Feed Tabs */}
            <div className="flex border-b border-slate-800 px-4 mb-4">
                <button 
                    onClick={() => setActiveTab('FOR_YOU')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'FOR_YOU' ? 'text-brand-400 border-brand-500' : 'text-slate-500 border-transparent'}`}
                >
                    Para Você
                </button>
                <button 
                    onClick={() => setActiveTab('FOLLOWING')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'FOLLOWING' ? 'text-brand-400 border-brand-500' : 'text-slate-500 border-transparent'}`}
                >
                    Seguindo
                </button>
            </div>

            {/* Stories */}
            <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar mb-2">
                 <div className="flex flex-col items-center gap-1 min-w-[64px] relative">
                    <div className="w-16 h-16 rounded-full p-[2px] bg-slate-700 border-2 border-dashed border-slate-600 flex items-center justify-center">
                       <span className="text-2xl">+</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate w-full text-center">Seu Story</span>
                </div>

                {STORIES.map(story => (
                    <div key={story.id} className="flex flex-col items-center gap-1 min-w-[64px]">
                        <div className={`w-16 h-16 rounded-full p-[2px] ${story.hasUpdate ? 'bg-gradient-to-tr from-brand-500 to-blue-500' : 'bg-slate-700'}`}>
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-2 border-slate-900 text-white font-bold text-xl overflow-hidden">
                                {story.avatarUrl.length > 1 ? <img src={story.avatarUrl} className="w-full h-full object-cover" /> : story.avatarUrl}
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate w-full text-center">{story.companyName}</span>
                    </div>
                ))}
            </div>

            {/* Feed Posts */}
            <div className="space-y-6 px-2">
                {posts.map((post, index) => {
                    const isLocked = post.isPremium && !isPremiumUser;
                    const isExpanded = expandedPosts.includes(post.id);
                    const isLongText = post.content.length > 150;

                    return (
                        <React.Fragment key={post.id}>
                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden relative shadow-lg">
                                {/* Post Header */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                                            {post.companyAvatar}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                                {post.companyName}
                                                {post.isJobAlert && <span className="bg-blue-900/30 text-blue-400 text-[9px] px-2 py-0.5 rounded border border-blue-500/20 font-bold">VAGA</span>}
                                                {post.isPremium && <span className="bg-yellow-900/30 text-yellow-500 text-[9px] px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1 font-bold"><StarSolid className="w-3 h-3"/> PREMIUM</span>}
                                            </h3>
                                            <p className="text-slate-500 text-xs">{post.timestamp} • <span className="text-slate-400">Seguindo</span></p>
                                        </div>
                                    </div>
                                    <button className="text-slate-500"><EllipsisHorizontalIcon className="w-6 h-6"/></button>
                                </div>

                                {/* Content */}
                                <div className={`px-4 pb-2 ${isLocked ? 'blur-sm select-none' : ''}`}>
                                    <p className={`text-slate-300 text-sm leading-relaxed whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''} ${!isLongText ? 'mb-3' : 'mb-1'}`}>
                                        {post.content}
                                    </p>
                                    
                                    {isLongText && !isLocked && (
                                        <button 
                                            onClick={() => togglePostExpansion(post.id)}
                                            className="text-xs text-brand-400 font-bold mb-3 hover:underline focus:outline-none"
                                        >
                                            {isExpanded ? 'Ver menos' : 'Ver mais'}
                                        </button>
                                    )}
                                    
                                    {renderPoll(post)}

                                    {post.imageUrl && !post.poll && (
                                        <img src={post.imageUrl} className="w-full h-56 object-cover rounded-xl mt-2" alt="Post" />
                                    )}
                                    
                                    {post.isJobAlert && !post.poll && !isLocked && (
                                        <button className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2">
                                            Candidatar-se Agora <PaperAirplaneIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Lock Overlay */}
                                {isLocked && (
                                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6 text-center">
                                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-bounce">
                                            <LockClosedIcon className="w-6 h-6 text-yellow-500" />
                                        </div>
                                        <h3 className="text-white font-bold text-lg">Oportunidade Exclusiva</h3>
                                        <p className="text-slate-300 text-sm mb-4 max-w-[250px]">Assine o plano Anual ou Premium para desbloquear vagas de alto nível e networking.</p>
                                        <button onClick={onSubscribe} className="bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl text-sm hover:bg-yellow-400 transition-colors shadow-lg">
                                            Desbloquear Agora
                                        </button>
                                    </div>
                                )}

                                {/* Stats & Actions */}
                                <div className="px-4 py-2 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-800/50 mt-2">
                                    <span className="flex items-center gap-1"><HandThumbUpIcon className="w-3 h-3 text-brand-500"/> {post.likes} curtidas</span>
                                    <span>•</span>
                                    <span>{post.comments.length} comentários</span>
                                </div>

                                <div className="px-2 pb-2 flex justify-between text-slate-400">
                                    <button 
                                        onClick={() => handleLike(post.id)} 
                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 transition-all ${post.likedByUser ? 'text-red-500 bg-red-500/10' : 'hover:bg-slate-800'}`}
                                    >
                                        {post.likedByUser ? <HeartSolid className="w-5 h-5 animate-pulse" /> : <HeartIcon className="w-5 h-5" />}
                                        <span className="text-xs font-bold">Gostei</span>
                                    </button>
                                    <button 
                                        onClick={() => toggleComments(post.id)}
                                        className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-slate-800 transition-colors"
                                    >
                                        <ChatBubbleOvalLeftIcon className="w-5 h-5" /> <span className="text-xs font-bold">Comentar</span>
                                    </button>
                                    <button className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-slate-800 transition-colors">
                                        <ShareIcon className="w-5 h-5" /> <span className="text-xs font-bold">Compartilhar</span>
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {expandedComments === post.id && (
                                    <div className="bg-black/30 p-4 border-t border-slate-800 animate-slide-down">
                                        <div className="space-y-3 mb-4">
                                            {post.comments.length > 0 ? post.comments.map(comment => (
                                                <div key={comment.id} className="flex gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                                                        {comment.user.charAt(0)}
                                                    </div>
                                                    <div className="bg-slate-800 p-2 rounded-lg rounded-tl-none">
                                                        <p className="text-xs font-bold text-white">{comment.user} <span className="text-[10px] font-normal text-slate-500">• {comment.timestamp}</span></p>
                                                        <p className="text-xs text-slate-300">{comment.text}</p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-xs text-slate-500 italic text-center">Seja o primeiro a comentar!</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input placeholder="Adicione um comentário..." className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500" />
                                            <button className="text-brand-500 font-bold text-xs px-2">Publicar</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Native Ad every 2 posts for Free/Basic users */}
                            {index === 1 && plan <= SubscriptionPlan.BASIC && (
                                <AdBanner format="NATIVE" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default Feed;
