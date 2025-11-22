
import React, { useState } from 'react';
import { generateStudentResume } from '../services/geminiService';
import { GeneratedResume, LoadingState } from '../types';
import { ArrowLeftIcon, AcademicCapIcon, BriefcaseIcon, DocumentTextIcon, SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface StudentHubProps {
    onBack: () => void;
    onFindInternships: () => void;
}

const StudentHub: React.FC<StudentHubProps> = ({ onBack, onFindInternships }) => {
    const [loading, setLoading] = useState<LoadingState>({ status: 'idle' });
    const [resumeData, setResumeData] = useState<GeneratedResume | null>(null);
    const [studentArea, setStudentArea] = useState('');
    const [studentSkills, setStudentSkills] = useState('');

    const handleGenerateCV = async () => {
        if (!studentArea) {
            alert("Informe a área desejada.");
            return;
        }
        setLoading({ status: 'loading', message: 'Criando currículo para primeiro emprego...' });
        try {
            const skillsArray = studentSkills.split(',').map(s => s.trim()).filter(s => s);
            const result = await generateStudentResume(studentArea, skillsArray);
            setResumeData(result);
            setLoading({ status: 'success' });
        } catch (e) {
            setLoading({ status: 'error', message: 'Erro ao gerar currículo.' });
        }
    };

    return (
        <div className="pb-24 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Espaço do Estudante</h1>
                    <p className="text-teal-400 text-xs font-bold uppercase">Início de Carreira & Estágios</p>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-6 mb-8 border border-teal-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h2 className="text-xl font-bold text-white mb-2 relative z-10">Comece sua Jornada</h2>
                <p className="text-teal-100 text-sm mb-6 max-w-[85%] relative z-10">
                    Não tem experiência? Não tem problema. O Ascenda te ajuda a conseguir seu primeiro "Sim".
                </p>
                
                <button 
                    onClick={onFindInternships}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-black py-3 rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 relative z-10"
                >
                    <BriefcaseIcon className="w-5 h-5" />
                    Buscar Vagas de Estágio
                </button>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 gap-4 mb-8">
                {/* First Job Resume Generator */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="bg-purple-500/20 p-2 rounded-lg">
                            <DocumentTextIcon className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Currículo: Primeiro Emprego</h3>
                            <p className="text-slate-400 text-xs mt-1">A IA cria um CV focado em potencial e aprendizado, ideal para quem não tem experiência.</p>
                        </div>
                    </div>

                    {!resumeData ? (
                        <div className="space-y-3">
                            <input 
                                value={studentArea}
                                onChange={e => setStudentArea(e.target.value)}
                                placeholder="Área de Interesse (ex: Marketing, ADM)"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm focus:border-purple-500 outline-none"
                            />
                            <input 
                                value={studentSkills}
                                onChange={e => setStudentSkills(e.target.value)}
                                placeholder="Habilidades ou pontos fortes (ex: Inglês, Proativo)"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm focus:border-purple-500 outline-none"
                            />
                            <button 
                                onClick={handleGenerateCV}
                                disabled={loading.status === 'loading'}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                {loading.status === 'loading' ? 'Gerando...' : 'Gerar Currículo'}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-900 rounded-xl p-4 text-left border border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-purple-400 text-xs font-bold uppercase">Resultado IA</span>
                                <button onClick={() => setResumeData(null)} className="text-slate-500 text-xs hover:text-white">Novo</button>
                            </div>
                            <h4 className="text-white font-bold text-sm mb-1">Resumo Sugerido:</h4>
                            <p className="text-slate-300 text-xs mb-3 italic">"{resumeData.summary}"</p>
                            
                            <h4 className="text-white font-bold text-sm mb-1">O que destacar:</h4>
                            <ul className="list-disc list-inside text-slate-300 text-xs space-y-1">
                                {resumeData.experienceStructure.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Career Tips */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <LightBulbIcon className="w-5 h-5 text-yellow-400"/> Dicas para Iniciantes
                    </h3>
                    <div className="space-y-2 text-xs text-slate-300">
                        <p>• <strong>Portfólio:</strong> Crie projetos fictícios para mostrar o que sabe fazer.</p>
                        <p>• <strong>LinkedIn:</strong> Siga empresas que admira e interaja com os posts.</p>
                        <p>• <strong>Entrevista:</strong> Pesquise sobre a empresa antes de ir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHub;
