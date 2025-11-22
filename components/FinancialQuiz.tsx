import React, { useState, useEffect, useCallback } from 'react';
import { generateQuizQuestion } from '../services/geminiService';
import { QuizQuestion, LoadingState } from '../types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface FinancialQuizProps {
    onBack: () => void;
}

const FinancialQuiz: React.FC<FinancialQuizProps> = ({ onBack }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ status: 'loading' });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const fetchNewQuestion = useCallback(async () => {
    setLoading({ status: 'loading' });
    setSelectedOption(null);
    try {
      const q = await generateQuizQuestion();
      setQuestion(q);
      setLoading({ status: 'success' });
    } catch (e) {
      setLoading({ status: 'error', message: 'Erro ao carregar quiz.' });
    }
  }, []);

  useEffect(() => {
    fetchNewQuestion();
  }, [fetchNewQuestion]);

  const handleAnswer = (index: number) => {
    if (selectedOption !== null || !question) return;
    
    setSelectedOption(index);
    if (index === question.correctAnswerIndex) {
      setScore(s => s + 10);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  if (loading.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse relative">
        <button onClick={onBack} className="absolute top-0 left-0 text-slate-400 flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" /> Voltar
        </button>
        <div className="text-6xl mb-4">🎓</div>
        <p className="text-slate-400">Gerando desafio inteligente...</p>
      </div>
    );
  }

  if (!question) return <div className="text-center text-red-400 mt-10">Erro ao carregar. <button onClick={onBack}>Voltar</button></div>;

  return (
    <div className="pb-24 animate-fade-in">
      <button 
        onClick={onBack} 
        className="mb-4 text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Voltar ao Início
      </button>

      <div className="flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div>
          <p className="text-xs text-slate-400 uppercase font-bold">Pontos</p>
          <p className="text-xl font-bold text-brand-400">{score}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase font-bold">Sequência</p>
          <p className="text-xl font-bold text-orange-400">🔥 {streak}</p>
        </div>
      </div>

      <div className="mb-8">
        <span className="inline-block px-3 py-1 bg-brand-900/30 text-brand-400 rounded-full text-xs font-semibold mb-4 border border-brand-500/20">
          Educação Financeira
        </span>
        <h2 className="text-xl font-bold text-white leading-snug">{question.question}</h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option, idx) => {
          let btnClass = "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750";
          
          if (selectedOption !== null) {
            if (idx === question.correctAnswerIndex) {
              btnClass = "bg-green-600 border-green-500 text-white";
            } else if (idx === selectedOption) {
              btnClass = "bg-red-600 border-red-500 text-white";
            } else {
              btnClass = "bg-slate-800/50 border-slate-800 text-slate-500";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 font-medium ${btnClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selectedOption !== null && (
        <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700 animate-slide-up">
          <p className="text-sm text-slate-300">
            <strong className="text-white block mb-1">Explicação:</strong>
            {question.explanation}
          </p>
          <button 
            onClick={fetchNewQuestion}
            className="mt-4 w-full bg-brand-600 text-white py-3 rounded-lg font-semibold shadow-lg"
          >
            Próxima Pergunta
          </button>
        </div>
      )}
    </div>
  );
};

export default FinancialQuiz;