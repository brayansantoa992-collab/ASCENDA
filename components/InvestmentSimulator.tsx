
import React, { useState, useEffect } from 'react';
import { generateInvestmentPortfolio } from '../services/geminiService';
import { InvestmentRecommendation } from '../types';
import { ArrowLeftIcon, PresentationChartLineIcon, SparklesIcon, GlobeAmericasIcon, WalletIcon, PlusIcon, BanknotesIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface InvestmentSimulatorProps {
    onBack: () => void;
}

const TickerTape = () => {
    const [tickers] = useState([
        { symbol: 'IBOV', val: '128.500', change: '+0.5%', up: true },
        { symbol: 'USD', val: '5.15', change: '-0.2%', up: false },
        { symbol: 'BTC', val: '350k', change: '+2.1%', up: true },
        { symbol: 'CDI', val: '10.65%', change: 'a.a.', up: true },
        { symbol: 'PETR4', val: '38.20', change: '+1.2%', up: true },
        { symbol: 'VALE3', val: '62.40', change: '-0.8%', up: false },
        { symbol: 'IFIX', val: '3.350', change: '+0.1%', up: true },
    ]);

    return (
        <div className="bg-slate-950 border-b border-slate-800 overflow-hidden py-2 relative">
            <div className="flex animate-slide-left whitespace-nowrap w-max gap-8">
                {[...tickers, ...tickers].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono">
                        <span className="font-bold text-slate-300">{t.symbol}</span>
                        <span className="text-white">{t.val}</span>
                        <span className={t.up ? 'text-green-500' : 'text-red-500'}>{t.change}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const InvestmentSimulator: React.FC<InvestmentSimulatorProps> = ({ onBack }) => {
    // Wallet State
    const [balance, setBalance] = useState(0);
    const [investedTotal, setInvestedTotal] = useState(0);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    
    // Simulator State
    const [investAmount, setInvestAmount] = useState('');
    const [investRisk, setInvestRisk] = useState<'Conservador' | 'Moderado' | 'Arrojado'>('Conservador');
    const [investGoal, setInvestGoal] = useState('');
    const [investmentRec, setInvestmentRec] = useState<InvestmentRecommendation | null>(null);
    const [investLoading, setInvestLoading] = useState(false);

    // Load Wallet
    useEffect(() => {
        const savedWallet = localStorage.getItem('ascenda_wallet');
        if (savedWallet) {
            try {
                const parsed = JSON.parse(savedWallet);
                setBalance(parsed.balance || 0);
                setInvestedTotal(parsed.invested || 0);
            } catch (e) {}
        }
    }, []);

    // Save Wallet
    useEffect(() => {
        localStorage.setItem('ascenda_wallet', JSON.stringify({ balance, invested: investedTotal }));
    }, [balance, investedTotal]);

    const TAX_RATE = 0.015; // 1.5% fee

    const handleDeposit = () => {
        const amount = parseFloat(depositAmount.replace(',', '.'));
        
        if (isNaN(amount)) return;
        
        if (amount < 5) {
            alert("O valor mínimo de depósito é R$ 5,00");
            return;
        }

        const fee = amount * TAX_RATE;
        const netAmount = amount - fee;

        setBalance(prev => prev + netAmount);
        setDepositAmount('');
        setShowDepositModal(false);
        alert(`Depósito realizado com sucesso!\nTaxa: R$ ${fee.toFixed(2)}\nEntrou na conta: R$ ${netAmount.toFixed(2)}`);
    };

    const handleGenerateInvestment = async () => {
      if (!investAmount || !investGoal) {
          alert("Preencha o valor e o objetivo.");
          return;
      }
      setInvestLoading(true);
      try {
          const amount = parseFloat(investAmount.replace(/\D/g,'')) / 100; 
          const rec = await generateInvestmentPortfolio(investRisk, amount, investGoal);
          setInvestmentRec(rec);
      } catch(e) { alert("Erro ao gerar carteira."); } finally { setInvestLoading(false); }
    }

    const handleExecuteOrder = () => {
        const amountNeeded = parseFloat(investAmount.replace(/\D/g,'')) / 100;
        
        if (balance < amountNeeded) {
            alert(`Saldo insuficiente. Você precisa de R$ ${amountNeeded.toFixed(2)} mas só tem R$ ${balance.toFixed(2)}.`);
            setShowDepositModal(true);
            return;
        }

        if (window.confirm(`Confirmar investimento de R$ ${amountNeeded.toFixed(2)} nesta carteira?`)) {
            setBalance(prev => prev - amountNeeded);
            setInvestedTotal(prev => prev + amountNeeded);
            alert("Ordem executada! Ativos adquiridos com sucesso.");
            setInvestmentRec(null);
            setInvestAmount('');
        }
    }

    // Format currency helper
    const toBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="pb-24 animate-fade-in">
            <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                <button onClick={onBack} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white border border-slate-700"><ArrowLeftIcon className="w-5 h-5"/></button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Bolsa & Investimentos</h1>
                    <p className="text-emerald-400 text-xs font-bold uppercase">Simulador de Mercado Real</p>
                </div>
            </div>

            <TickerTape />
            
            <div className="px-4 pt-6 pb-24">
                {/* WALLET CARD */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700 shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <WalletIcon className="w-3 h-3"/> Saldo em Carteira
                            </p>
                            <h2 className="text-3xl font-black text-white tracking-tight mt-1">{toBRL(balance)}</h2>
                        </div>
                        <button 
                            onClick={() => setShowDepositModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg transition-all"
                        >
                            <PlusIcon className="w-3 h-3"/> Depositar
                        </button>
                    </div>

                    <div className="pt-4 border-t border-slate-700/50 flex items-center gap-4">
                        <div>
                            <p className="text-slate-500 text-[9px] font-bold uppercase">Total Investido</p>
                            <p className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                                <BanknotesIcon className="w-3 h-3"/> {toBRL(investedTotal)}
                            </p>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-700"></div>
                        <div>
                            <p className="text-slate-500 text-[9px] font-bold uppercase">Rendimento (Est.)</p>
                            <p className="text-green-400 font-bold text-sm flex items-center gap-1">
                                + 1.2% <span className="text-[9px] text-slate-500 font-normal">/mês</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* SIMULATOR / ADVISOR */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-glow border border-emerald-500/20">
                            <PresentationChartLineIcon className="w-5 h-5 text-emerald-400"/>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Consultor IA</h2>
                            <p className="text-slate-400 text-[10px]">Análise de ativos da B3</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                        <div>
                            <label className="text-[9px] uppercase font-bold text-slate-500 mb-1 block ml-1">Valor do Aporte</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500 text-sm font-bold">R$</span>
                                <input 
                                value={investAmount}
                                onChange={e => setInvestAmount(e.target.value)}
                                placeholder="1.000,00"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-emerald-500 font-mono"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] uppercase font-bold text-slate-500 mb-1 block ml-1">Objetivo</label>
                            <input 
                            value={investGoal}
                            onChange={e => setInvestGoal(e.target.value)}
                            placeholder="Ex: Aposentadoria em 20 anos"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                            />
                        </div>
                        
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700 mt-2">
                            {['Conservador', 'Moderado', 'Arrojado'].map(r => (
                                <button 
                                key={r}
                                onClick={() => setInvestRisk(r as any)}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${investRisk === r ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <button 
                        onClick={handleGenerateInvestment}
                        disabled={!investAmount || !investGoal || investLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-900/30 mt-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {investLoading ? <span className="animate-spin">⏳</span> : <SparklesIcon className="w-5 h-5"/>}
                            {investLoading ? 'Analisando Mercado...' : 'Gerar Carteira'}
                        </button>
                    </div>
                </div>

                {investmentRec && (
                    <div className="space-y-4 animate-slide-up">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <h3 className="text-white font-bold flex items-center gap-2"><GlobeAmericasIcon className="w-5 h-5 text-emerald-400"/> Carteira Recomendada</h3>
                                <span className="text-emerald-400 font-bold text-xs bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/20">{investmentRec.estimatedReturn}</span>
                            </div>
                            <p className="text-slate-400 text-xs italic mb-4 border-l-2 border-emerald-500/30 pl-3">
                                "{investmentRec.marketOutlook}"
                            </p>
                            
                            <div className="grid grid-cols-1 gap-3 mb-6">
                                {investmentRec.allocation.map((item, idx) => (
                                    <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-colors flex justify-between items-start group">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-slate-800 text-white font-mono font-bold px-2 py-0.5 rounded text-xs border border-slate-700 group-hover:border-emerald-500/50 transition-colors">{item.ticker}</span>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.type}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm font-medium mb-1">{item.name}</p>
                                            <p className="text-slate-500 text-[10px] leading-relaxed max-w-[200px]">{item.reason}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-400 font-bold text-lg">{item.percentage}</p>
                                            <p className="text-slate-500 text-[9px] font-mono">{item.projectedYield}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={handleExecuteOrder}
                                className="w-full bg-white hover:bg-slate-200 text-slate-900 font-black py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <WalletIcon className="w-5 h-5" />
                                Executar Ordem (Comprar)
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xs p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold text-lg">Depósito</h3>
                            <button onClick={() => setShowDepositModal(false)} className="text-slate-500 hover:text-white"><XMarkIcon className="w-6 h-6"/></button>
                        </div>
                        
                        <p className="text-slate-400 text-xs mb-4">Adicione fundos para simular investimentos reais.</p>
                        
                        <div className="mb-4">
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Valor (Min R$ 5,00)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500 text-sm font-bold">R$</span>
                                <input 
                                    type="number"
                                    value={depositAmount}
                                    onChange={e => setDepositAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-white font-mono focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        {depositAmount && !isNaN(parseFloat(depositAmount)) && (
                            <div className="bg-slate-800/50 p-3 rounded-lg mb-4 border border-slate-700 space-y-1">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Valor Bruto:</span>
                                    <span>R$ {parseFloat(depositAmount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-red-400">
                                    <span>Taxa (1.5%):</span>
                                    <span>- R$ {(parseFloat(depositAmount) * 0.015).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-700 my-1"></div>
                                <div className="flex justify-between text-sm font-bold text-emerald-400">
                                    <span>Total a receber:</span>
                                    <span>R$ {(parseFloat(depositAmount) * 0.985).toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <button onClick={handleDeposit} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold">
                            Confirmar Depósito
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestmentSimulator;
