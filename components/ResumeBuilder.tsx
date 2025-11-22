
import React, { useState } from 'react';
import { ResumeData, ResumeExperience, ResumeEducation, UserProfile } from '../types';
import { generateOptimizedResumeContent } from '../services/geminiService';
import { XMarkIcon, PlusIcon, TrashIcon, SparklesIcon, ArrowDownTrayIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ResumeBuilderProps {
    user: UserProfile;
    onSave: (data: ResumeData) => void;
    onClose: () => void;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ user, onSave, onClose }) => {
    // Initialize with existing data or defaults
    const [data, setData] = useState<ResumeData>(user.resumeData || {
        fullName: user.name,
        email: user.email,
        phone: user.phone || '',
        linkedin: '',
        location: '',
        summary: user.bio || '',
        experiences: [],
        education: [],
        skills: user.skills ? user.skills.split(',').map(s=>s.trim()).filter(s=>s) : [],
        generatedContent: ''
    });

    const [step, setStep] = useState<'BASIC' | 'EXPERIENCE' | 'EDUCATION' | 'PREVIEW'>('BASIC');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // --- Handlers for Lists ---
    const addExperience = () => {
        const newExp: ResumeExperience = {
            id: Date.now().toString(),
            company: '', role: '', startDate: '', endDate: '', current: false, description: ''
        };
        setData({...data, experiences: [...data.experiences, newExp]});
    };

    const updateExperience = (id: string, field: keyof ResumeExperience, value: any) => {
        setData({
            ...data,
            experiences: data.experiences.map(e => e.id === id ? {...e, [field]: value} : e)
        });
    };

    const removeExperience = (id: string) => {
        setData({...data, experiences: data.experiences.filter(e => e.id !== id)});
    };

    const addEducation = () => {
        const newEdu: ResumeEducation = {
            id: Date.now().toString(),
            school: '', degree: '', startDate: '', endDate: ''
        };
        setData({...data, education: [...data.education, newEdu]});
    };

    const updateEducation = (id: string, field: keyof ResumeEducation, value: any) => {
        setData({
            ...data,
            education: data.education.map(e => e.id === id ? {...e, [field]: value} : e)
        });
    };

    const removeEducation = (id: string) => {
        setData({...data, education: data.education.filter(e => e.id !== id)});
    };

    // --- AI Generation ---
    const handleGenerate = async () => {
        setLoading(true);
        try {
            const content = await generateOptimizedResumeContent(data);
            const newData = { ...data, generatedContent: content };
            setData(newData);
            onSave(newData); // Auto-save
            setStep('PREVIEW');
        } catch (e) {
            alert("Erro ao gerar currículo. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if(data.generatedContent) {
            navigator.clipboard.writeText(data.generatedContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg">
                <div>
                    <h2 className="text-white font-bold text-lg">Construtor de Currículo IA</h2>
                    <p className="text-slate-400 text-xs">Preencha seus dados e deixe a IA brilhar.</p>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <XMarkIcon className="w-6 h-6"/>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="flex w-full h-1 bg-slate-800">
                <div className={`h-full bg-brand-500 transition-all duration-500 ${step === 'BASIC' ? 'w-1/4' : step === 'EXPERIENCE' ? 'w-2/4' : step === 'EDUCATION' ? 'w-3/4' : 'w-full'}`}></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
                {step === 'BASIC' && (
                    <div className="max-w-lg mx-auto space-y-4 animate-slide-up">
                        <h3 className="text-white font-bold text-xl mb-4">Dados Pessoais</h3>
                        <div>
                            <label className="text-slate-400 text-xs uppercase font-bold">Nome Completo</label>
                            <input value={data.fullName} onChange={e => setData({...data, fullName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white mt-1"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-slate-400 text-xs uppercase font-bold">Email</label>
                                <input value={data.email} onChange={e => setData({...data, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white mt-1"/>
                            </div>
                            <div>
                                <label className="text-slate-400 text-xs uppercase font-bold">Telefone</label>
                                <input value={data.phone} onChange={e => setData({...data, phone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white mt-1"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-400 text-xs uppercase font-bold">LinkedIn / Portfólio</label>
                            <input value={data.linkedin} onChange={e => setData({...data, linkedin: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white mt-1"/>
                        </div>
                        <div>
                            <label className="text-slate-400 text-xs uppercase font-bold">Cidade/Estado</label>
                            <input value={data.location} onChange={e => setData({...data, location: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white mt-1"/>
                        </div>
                        <div>
                            <label className="text-slate-400 text-xs uppercase font-bold">Resumo Profissional (Rascunho)</label>
                            <textarea 
                                value={data.summary} 
                                onChange={e => setData({...data, summary: e.target.value})} 
                                placeholder="Escreva brevemente sobre você. A IA vai melhorar isso depois."
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white mt-1 h-32 resize-none"
                            />
                        </div>
                    </div>
                )}

                {step === 'EXPERIENCE' && (
                    <div className="max-w-lg mx-auto animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold text-xl">Experiência Profissional</h3>
                            <button onClick={addExperience} className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                <PlusIcon className="w-4 h-4"/> Adicionar
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {data.experiences.map((exp, idx) => (
                                <div key={exp.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 relative">
                                    <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <input placeholder="Empresa" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="bg-slate-800 border-slate-700 rounded-lg p-2 text-sm text-white"/>
                                        <input placeholder="Cargo" value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} className="bg-slate-800 border-slate-700 rounded-lg p-2 text-sm text-white"/>
                                    </div>
                                    <div className="flex gap-4 mb-3">
                                        <input placeholder="Início (mm/aaaa)" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="bg-slate-800 border-slate-700 rounded-lg p-2 text-sm text-white w-1/3"/>
                                        <input placeholder="Fim (mm/aaaa)" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} className="bg-slate-800 border-slate-700 rounded-lg p-2 text-sm text-white w-1/3" disabled={exp.current}/>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} className="rounded bg-slate-800 border-slate-600 text-brand-600"/>
                                            <label className="text-xs text-slate-400">Atual</label>
                                        </div>
                                    </div>
                                    <textarea 
                                        placeholder="O que você fez lá? Liste responsabilidades." 
                                        value={exp.description} 
                                        onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                                        className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-sm text-white h-24"
                                    />
                                </div>
                            ))}
                            {data.experiences.length === 0 && <div className="text-center text-slate-500 py-8">Nenhuma experiência adicionada.</div>}
                        </div>
                    </div>
                )}

                {step === 'EDUCATION' && (
                    <div className="max-w-lg mx-auto animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold text-xl">Educação & Cursos</h3>
                            <button onClick={addEducation} className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                <PlusIcon className="w-4 h-4"/> Adicionar
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {data.education.map((edu, idx) => (
                                <div key={edu.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 relative">
                                    <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                    <input placeholder="Instituição" value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-sm text-white mb-2"/>
                                    <input placeholder="Curso / Grau" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-sm text-white mb-2"/>
                                    <div className="flex gap-4">
                                        <input placeholder="Início" value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} className="bg-slate-800 border-slate-700 rounded-lg p-2 text-sm text-white flex-1"/>
                                        <input placeholder="Conclusão" value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} className="bg-slate-800 border-slate-700 rounded-lg p-2 text-sm text-white flex-1"/>
                                    </div>
                                </div>
                            ))}
                            {data.education.length === 0 && <div className="text-center text-slate-500 py-8">Nenhuma formação adicionada.</div>}
                        </div>
                    </div>
                )}

                {step === 'PREVIEW' && (
                    <div className="max-w-2xl mx-auto animate-slide-up h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-purple-400"/> Currículo Gerado
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={handleCopy} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
                                    {copied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <DocumentDuplicateIcon className="w-4 h-4"/>}
                                    {copied ? 'Copiado' : 'Copiar'}
                                </button>
                                <button onClick={() => alert("Em breve: Download PDF")} className="px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
                                    <ArrowDownTrayIcon className="w-4 h-4"/> PDF
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 bg-white text-slate-900 p-8 rounded-xl shadow-2xl overflow-y-auto font-serif text-sm leading-relaxed whitespace-pre-wrap">
                            {data.generatedContent}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between">
                {step === 'PREVIEW' ? (
                    <button onClick={() => setStep('EDUCATION')} className="text-slate-400 hover:text-white font-bold text-sm px-4">Voltar e Editar</button>
                ) : (
                    <button 
                        onClick={() => setStep(prev => prev === 'EXPERIENCE' ? 'BASIC' : prev === 'EDUCATION' ? 'EXPERIENCE' : 'BASIC')} 
                        disabled={step === 'BASIC'}
                        className="text-slate-400 hover:text-white font-bold text-sm px-4 disabled:opacity-30"
                    >
                        Voltar
                    </button>
                )}

                {step === 'EDUCATION' ? (
                    <button 
                        onClick={handleGenerate} 
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all"
                    >
                        {loading ? <span className="animate-spin">⏳</span> : <SparklesIcon className="w-5 h-5"/>}
                        {loading ? 'Otimizando...' : 'Gerar Currículo com IA'}
                    </button>
                ) : step !== 'PREVIEW' && (
                    <button 
                        onClick={() => setStep(prev => prev === 'BASIC' ? 'EXPERIENCE' : 'EDUCATION')} 
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                    >
                        Próximo
                    </button>
                )}
                
                {step === 'PREVIEW' && (
                    <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3 rounded-xl transition-colors">
                        Concluir
                    </button>
                )}
            </div>
        </div>
    );
};

export default ResumeBuilder;
