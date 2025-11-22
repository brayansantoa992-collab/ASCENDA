
import React, { useState, useEffect } from 'react';
import { generateFinancialAudit } from '../services/geminiService';
import { FinanceEntry, FinancialAudit } from '../types';
import { ArrowLeftIcon, ArrowTrendingUpIcon, ArrowDownTrayIcon, TableCellsIcon, DocumentChartBarIcon, Cog6ToothIcon, SparklesIcon, LightBulbIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ChartPieIcon } from '@heroicons/react/24/solid';

interface FinanceManagerProps {
    onBack: () => void;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ onBack }) => {
    const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
    const [categories, setCategories] = useState<string[]>(['Trabalho', 'Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros']);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    
    const [newEntryDesc, setNewEntryDesc] = useState('');
    const [newEntryVal, setNewEntryVal] = useState('');
    const [newEntryCat, setNewEntryCat] = useState('Outros');
    const [newEntryType, setNewEntryType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0]);
    const [newEntryRecurring, setNewEntryRecurring] = useState(false);

    const [auditResult, setAuditResult] = useState<FinancialAudit | null>(null);
    const [auditLoading, setAuditLoading] = useState(false);

    useEffect(() => {
        const storedFinance = localStorage.getItem('ascenda_finance_sheet');
        if(storedFinance) {
            try { setFinanceEntries(JSON.parse(storedFinance)); } catch(e) {}
        }
        const storedSettings = localStorage.getItem('ascenda_finance_settings');
        if(storedSettings) {
            try {
                const settings = JSON.parse(storedSettings);
                if(settings.categories) setCategories(settings.categories);
            } catch(e) {}
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ascenda_finance_sheet', JSON.stringify(financeEntries));
    }, [financeEntries]);

    useEffect(() => {
        localStorage.setItem('ascenda_finance_settings', JSON.stringify({ categories }));
    }, [categories]);

    const addFinanceEntry = () => {
        if (!newEntryDesc || !newEntryVal) return;
        const val = parseFloat(newEntryVal.replace(',','.'));
        if(isNaN(val)) return;
        const newEntry: FinanceEntry = { id: Date.now().toString(), description: newEntryDesc, category: newEntryCat, type: newEntryType, value: val, status: 'PENDING', date: newEntryDate, isRecurring: newEntryRecurring };
        setFinanceEntries([...financeEntries, newEntry]);
        setNewEntryDesc(''); setNewEntryVal(''); setNewEntryRecurring(false);
    };

    const removeFinanceEntry = (id: string) => { setFinanceEntries(financeEntries.filter(e => e.id !== id)); };
    
    const addCategory = () => { 
        if(newCategoryName.trim() && !categories.includes(newCategoryName.trim())) { 
            setCategories([...categories, newCategoryName.trim()]); 
            setNewCategoryName(''); 
        } 
    };

    const getFinanceTotals = () => {
        const income = financeEntries.filter(e => e.type === 'INCOME').reduce((acc, curr) => acc + curr.value, 0);
        const expense = financeEntries.filter(e => e.type === 'EXPENSE').reduce((acc, curr) => acc + curr.value, 0);
        return { income, expense, balance: income - expense };
    };

    const runFinancialAudit = async () => {
        setAuditLoading(true);
        try {
            const audit = await generateFinancialAudit(financeEntries, 3000);
            setAuditResult(audit);
        } catch(e) { alert("Erro ao gerar auditoria."); } finally { setAuditLoading(false); }
    };

    const handleDownloadExcel = (templateOnly = false) => {
        let csvContent = "\uFEFFData;Descrição;Categoria;Tipo;Valor;Recorrente\n";
        const entriesToExport = templateOnly ? [] : financeEntries;
        entriesToExport.forEach(e => {
            const row = [e.date, `"${e.description}"`, e.category, e.type === 'INCOME' ? 'Receita' : 'Despesa', e.value.toString().replace('.', ','), e.isRecurring ? 'Sim' : 'Não'];
            csvContent += row.join(";") + "\n";
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "Financas_Ascenda.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totals = getFinanceTotals();

    return (
        <div className="pb-24 animate-fade-in px-4 pt-4">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white border border-slate-700"><ArrowLeftIcon className="w-5 h-5"/></button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">Gestão Financeira</h1>
                    <p className="text-purple-400 text-xs font-bold uppercase">Controle & Planejamento</p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Saldo Total</p>
                <div className="text-4xl font-black text-white tracking-tight mb-6">R$ {totals.balance.toFixed(2)}</div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
                    <div><p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><ArrowTrendingUpIcon className="w-3 h-3"/> Entradas</p><p className="text-green-400 font-bold text-lg">+ R$ {totals.income.toFixed(2)}</p></div>
                    <div><p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><ArrowDownTrayIcon className="w-3 h-3"/> Saídas</p><p className="text-red-400 font-bold text-lg">- R$ {totals.expense.toFixed(2)}</p></div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-4">
                <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h4 className="text-slate-300 font-bold text-xs flex items-center gap-2"><TableCellsIcon className="w-4 h-4"/> Extrato</h4>
                    <div className="flex gap-2">
                        <button onClick={() => handleDownloadExcel(true)} className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white border border-slate-700"><DocumentChartBarIcon className="w-4 h-4"/></button>
                        <button onClick={() => handleDownloadExcel(false)} className="p-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded font-bold text-xs flex items-center gap-1"><ArrowDownTrayIcon className="w-4 h-4"/> Excel</button>
                    </div>
                </div>
                
                <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-900 shadow-sm">
                            <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
                                <th className="p-3 bg-slate-900">Data</th>
                                <th className="p-3 bg-slate-900">Descrição</th>
                                <th className="p-3 bg-slate-900">Valor</th>
                                <th className="p-3 bg-slate-900"></th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-mono">
                            {financeEntries.map(entry => (
                                <tr key={entry.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-3 text-slate-400 text-xs whitespace-nowrap">{new Date(entry.date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</td>
                                    <td className="p-3 text-slate-200 font-medium">{entry.description}<br/><span className="text-[9px] text-slate-500 bg-slate-800 px-1 rounded">{entry.category}</span></td>
                                    <td className={`p-3 text-right font-bold ${entry.type === 'INCOME' ? 'text-green-400' : 'text-slate-300'}`}>{entry.type === 'EXPENSE' && '-'} {entry.value.toFixed(2)}</td>
                                    <td className="p-3 text-center"><button onClick={() => removeFinanceEntry(entry.id)} className="text-slate-600 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 bg-slate-950 border-t border-slate-800">
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <input type="date" value={newEntryDate} onChange={e => setNewEntryDate(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs w-32 outline-none" />
                            <input placeholder="Descrição" value={newEntryDesc} onChange={e => setNewEntryDesc(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                        <div className="flex gap-2">
                            <select value={newEntryCat} onChange={e => setNewEntryCat(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs outline-none w-28 truncate">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input type="number" placeholder="0.00" value={newEntryVal} onChange={e => setNewEntryVal(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                            <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-1">
                                <button onClick={() => setNewEntryType('INCOME')} className={`px-3 rounded-md text-xs font-bold transition-colors ${newEntryType === 'INCOME' ? 'bg-green-600 text-white' : 'text-slate-400'}`}>+</button>
                                <button onClick={() => setNewEntryType('EXPENSE')} className={`px-3 rounded-md text-xs font-bold transition-colors ${newEntryType === 'EXPENSE' ? 'bg-red-600 text-white' : 'text-slate-400'}`}>-</button>
                            </div>
                        </div>
                        <button onClick={addFinanceEntry} disabled={!newEntryDesc || !newEntryVal} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg">Adicionar Lançamento</button>
                    </div>
                </div>
            </div>

            <button onClick={runFinancialAudit} disabled={financeEntries.length === 0} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-6">
               <SparklesIcon className={`w-4 h-4 text-purple-400 ${auditLoading ? 'animate-spin' : ''}`} />
               {auditLoading ? 'Gerando Relatório...' : 'Auditoria IA'}
           </button>
           
           {auditResult && (
                <div className="bg-slate-800 border border-purple-500/30 rounded-2xl p-5 mb-6 animate-slide-up relative">
                    <div className="flex justify-between items-start mb-4">
                        <div><h3 className="text-white font-bold text-lg">Diagnóstico</h3><p className="text-slate-400 text-xs">{auditResult.summary}</p></div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 ${auditResult.score > 70 ? 'border-green-500 text-green-400' : 'border-yellow-500 text-yellow-400'}`}>{auditResult.score}</div>
                    </div>
                    <div className="space-y-2">
                        {auditResult.tips.map((tip, idx) => (
                            <div key={idx} className="flex gap-3 bg-slate-900/50 p-3 rounded-lg"><LightBulbIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" /><p className="text-slate-300 text-xs">{tip}</p></div>
                        ))}
                    </div>
                </div>
            )}
            
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-xs border border-slate-700">
                        <h3 className="text-white font-bold mb-4">Gerenciar Categorias</h3>
                        <div className="flex gap-2 mb-4">
                            <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nova categoria..." className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm"/>
                            <button onClick={addCategory} className="bg-purple-600 text-white px-3 rounded-lg font-bold">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <span key={cat} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">{cat}</span>
                            ))}
                        </div>
                        <button onClick={() => setShowCategoryModal(false)} className="w-full mt-4 text-slate-500 text-xs hover:text-white">Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceManager;
