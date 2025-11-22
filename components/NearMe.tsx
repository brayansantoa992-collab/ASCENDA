
import React, { useState, useEffect } from 'react';
import { scanNearbyOpportunities } from '../services/geminiService';
import { NearbyItem, LoadingState } from '../types';
import { MapPinIcon, BriefcaseIcon, UserGroupIcon, BuildingOfficeIcon, WifiIcon, ArrowPathIcon, ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';

interface NearMeProps {
    onBack: () => void;
}

const NearMe: React.FC<NearMeProps> = ({ onBack }) => {
    const [items, setItems] = useState<NearbyItem[]>([]);
    const [loading, setLoading] = useState<LoadingState>({ status: 'idle' });
    const [location, setLocation] = useState<string>('Localizando...');
    const [filter, setFilter] = useState<'ALL' | 'JOB' | 'EVENT' | 'COMPANY'>('ALL');

    const handleScan = () => {
        setLoading({ status: 'loading', message: 'Calibrando radar...' });
        
        if (!navigator.geolocation) {
            alert("Geolocalização não suportada.");
            setLoading({ status: 'idle' });
            return;
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                // Reverse Geocode to get city name for context
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                const data = await response.json();
                const city = data.address.city || data.address.town || "Sua Região";
                setLocation(city);

                setLoading({ status: 'loading', message: `Escaneando oportunidades em ${city}...` });
                
                const results = await scanNearbyOpportunities(city);
                setItems(results);
                setLoading({ status: 'success' });
            } catch (error) {
                setLoading({ status: 'error', message: 'Erro ao escanear.' });
            }
        }, (err) => {
            alert("Permita o acesso à localização para usar o radar.");
            setLoading({ status: 'idle' });
        });
    };

    // Auto-scan on mount if empty
    useEffect(() => {
        if (items.length === 0 && loading.status === 'idle') {
            // Optional: Auto-trigger or wait for user
        }
    }, []);

    const getIcon = (type: string) => {
        switch(type) {
            case 'JOB': return <BriefcaseIcon className="w-5 h-5 text-blue-400"/>;
            case 'EVENT': return <UserGroupIcon className="w-5 h-5 text-purple-400"/>;
            case 'COMPANY': return <BuildingOfficeIcon className="w-5 h-5 text-orange-400"/>;
            case 'COWORKING': return <WifiIcon className="w-5 h-5 text-green-400"/>;
            default: return <MapPinIcon className="w-5 h-5 text-slate-400"/>;
        }
    };

    const filteredItems = filter === 'ALL' ? items : items.filter(i => i.type === filter);

    return (
        <div className="pb-24 animate-fade-in h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pt-2 px-1">
                <button onClick={onBack} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white border border-slate-700">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Perto de Mim</h1>
                    <p className="text-emerald-400 text-xs font-bold uppercase flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3"/> {location}
                    </p>
                </div>
            </div>

            {/* Radar Visual */}
            <div className="relative w-full h-64 bg-slate-900 rounded-3xl mb-6 border border-emerald-900/50 overflow-hidden flex items-center justify-center shadow-2xl shadow-emerald-900/20">
                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_rgba(16,185,129,0.3)_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
                
                {/* Pulse Circles */}
                <div className={`absolute w-full h-full border border-emerald-500/20 rounded-full animate-ping ${loading.status === 'loading' ? 'opacity-100' : 'opacity-20'}`} style={{animationDuration: '3s'}}></div>
                <div className={`absolute w-3/4 h-3/4 border border-emerald-500/30 rounded-full animate-ping ${loading.status === 'loading' ? 'opacity-100' : 'opacity-30'}`} style={{animationDuration: '2s', animationDelay: '0.5s'}}></div>
                
                {/* Center Point */}
                <div className="relative z-10 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,1)] animate-pulse"></div>
                <div className="absolute z-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl"></div>

                {/* Scan Line */}
                <div className={`absolute top-1/2 left-1/2 w-[150%] h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent origin-left -translate-y-1/2 ${loading.status === 'loading' ? 'animate-spin' : 'hidden'}`}></div>

                {/* Start Button Overlay */}
                {items.length === 0 && loading.status !== 'loading' && (
                    <button 
                        onClick={handleScan}
                        className="absolute z-20 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 transform hover:scale-105 transition-all"
                    >
                        <ArrowPathIcon className="w-5 h-5" /> Escanear Redores
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            {items.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar px-1">
                    {['ALL', 'JOB', 'EVENT', 'COMPANY'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${filter === f ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                        >
                            {f === 'ALL' ? 'Tudo' : f === 'JOB' ? 'Vagas' : f === 'EVENT' ? 'Eventos' : 'Empresas'}
                        </button>
                    ))}
                </div>
            )}

            {/* Results List */}
            <div className="space-y-3 flex-1 overflow-y-auto px-1">
                {loading.status === 'loading' ? (
                    <div className="text-center py-8 text-emerald-500/50 text-sm animate-pulse font-mono">
                        [ RASTREADO SINAL... ]
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <div key={item.id} className={`bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border ${item.isPremium ? 'border-yellow-500/30 shadow-lg shadow-yellow-500/10' : 'border-slate-700'} flex items-start gap-4 animate-slide-up`}>
                            <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex-shrink-0 flex flex-col items-center justify-center w-16">
                                {getIcon(item.type)}
                                <span className="text-[10px] font-bold text-slate-400 mt-1">{item.distance}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-white font-bold text-sm">{item.name}</h3>
                                    {item.isPremium && <StarIcon className="w-4 h-4 text-yellow-500" />}
                                </div>
                                <p className="text-slate-400 text-xs mb-2">{item.address}</p>
                                <p className="text-slate-300 text-xs leading-relaxed mb-2">{item.description}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-slate-900 text-slate-400 text-[9px] rounded border border-slate-700 uppercase font-bold">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NearMe;
