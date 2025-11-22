

import { GoogleGenAI, Type } from "@google/genai";
import { BusinessIdea, BusinessPlan, QuizQuestion, UserProfile, JobOpportunity, CourseRecommendation, MentorResource, GeneratedResume, SpontaneousApplication, FinanceEntry, FinancialAudit, InvestmentRecommendation, ResumeData, NearbyItem } from "../types";

// Helper to get the client instance
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDailyTip = async (): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Dê uma dica curta, motivacional e prática sobre finanças ou empreendedorismo para alguém que quer começar a ganhar dinheiro hoje. Máximo de 2 frases.",
    });
    return response.text || "Foque em resolver problemas reais, e o dinheiro virá como consequência.";
  } catch (error) {
    console.error("Erro ao gerar dica:", error);
    return "O sucesso começa com o primeiro passo. Comece hoje!";
  }
};

export const generateBusinessIdeas = async (profile: UserProfile): Promise<BusinessIdea[]> => {
  const ai = getAiClient();
  
  const prompt = `
    Com base no seguinte perfil, sugira 3 ideias de negócios ou "side hustles" (renda extra) viáveis:
    - Habilidades: ${profile.skills}
    - Orçamento Inicial: ${profile.budget}
    - Tempo Disponível: ${profile.timeAvailable}
    - Interesses: ${profile.interests}
    
    Seja realista e foque em lucro.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['Fácil', 'Médio', 'Difícil'] },
              estimatedIncome: { type: Type.STRING, description: "Estimativa de ganhos (ex: R$ 500 - R$ 2000/mês)" },
              requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'description', 'difficulty', 'estimatedIncome', 'requiredSkills']
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as BusinessIdea[];
    }
    return [];
  } catch (error) {
    console.error("Erro ao gerar ideias:", error);
    throw error;
  }
};

export const generateBusinessPlan = async (ideaTitle: string): Promise<BusinessPlan> => {
  const ai = getAiClient();
  const prompt = `Crie um mini plano de negócios prático para: "${ideaTitle}". O foco é execução rápida e baixo custo.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumo executivo de 1 parágrafo" },
            steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de 5 passos práticos para começar" },
            marketingStrategy: { type: Type.STRING, description: "Como conseguir os primeiros clientes" },
            monetizationModel: { type: Type.STRING, description: "Como exatamente o dinheiro entra" }
          },
          required: ['summary', 'steps', 'marketingStrategy', 'monetizationModel']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as BusinessPlan;
    }
    throw new Error("Não foi possível gerar o plano.");
  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    throw error;
  }
};

export const generateQuizQuestion = async (): Promise<QuizQuestion> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Gere uma pergunta de múltipla escolha sobre educação financeira, investimentos ou empreendedorismo. Nível iniciante/intermediário.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exatamente 4 opções" },
            correctAnswerIndex: { type: Type.INTEGER, description: "Índice 0-3 da resposta correta" },
            explanation: { type: Type.STRING, description: "Breve explicação do porquê está correto" }
          },
          required: ['question', 'options', 'correctAnswerIndex', 'explanation']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizQuestion;
    }
    throw new Error("Falha ao gerar quiz");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const findJobOpportunities = async (
  role: string, 
  specificSkills: string[],
  location: string,
  filters: { contract: string; level: string; modality: string },
  isPremiumSearch: boolean
): Promise<JobOpportunity[]> => {
  const ai = getAiClient();
  
  const skillsString = specificSkills.length > 0 ? specificSkills.join(', ') : 'Não especificadas';

  const prompt = `
    Atue como um recrutador especialista headhunter. O usuário busca emprego com o seguinte perfil:
    - Cargo/Área Desejada: "${role}"
    - Habilidades Técnicas/Específicas (Tags): "${skillsString}"
    - Localização Base: "${location || 'Brasil'}"
    - Tipo de Contrato: "${filters.contract}"
    - Nível de Experiência: "${filters.level}"
    - Modalidade: "${filters.modality}"
    
    ${isPremiumSearch ? 'O usuário é PREMIUM. Foque exclusivamente em vagas com altos salários e empresas renomadas.' : 'Sugira vagas padrão de mercado.'}

    Sugira 4 cargos ou oportunidades.
    
    CRÍTICO: 
    A PRIMEIRA vaga (índice 0) DEVE ser a "Melhor Vaga Disponível na Localização" (Alto salário, empresa renomada).
    Inclua um "salaryValue" numérico aproximado para filtros.
    Inclua um "matchScore" de 0 a 100 baseado nas skills.
    
    Retorne no formato JSON especificado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Gere um ID único curto" },
              role: { type: Type.STRING, description: "Nome do cargo + Nível" },
              companyName: { type: Type.STRING, description: "Nome de uma empresa fictícia ou real que contrata para isso" },
              description: { type: Type.STRING, description: "Breve descrição da função" },
              avgSalary: { type: Type.STRING, description: "Média salarial formatada (ex: R$ 5.000)" },
              salaryValue: { type: Type.NUMBER, description: "Valor numérico do salário para filtros" },
              matchReason: { type: Type.STRING, description: "Por que atende aos filtros" },
              searchQuery: { type: Type.STRING, description: "Termos otimizados para busca" },
              isPremium: { type: Type.BOOLEAN, description: "Sempre true" },
              matchScore: { type: Type.INTEGER, description: "0 a 100" }
            },
            required: ['id', 'role', 'companyName', 'description', 'avgSalary', 'salaryValue', 'matchReason', 'searchQuery', 'isPremium', 'matchScore']
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as JobOpportunity[];
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar vagas:", error);
    throw error;
  }
};

export const findFreeCourses = async (topic: string): Promise<CourseRecommendation[]> => {
  const ai = getAiClient();
  const prompt = `
    Aja como um orientador educacional. O usuário quer aprender sobre: "${topic}".
    Liste 4 cursos ou recursos educacionais GRATUITOS.
    Para o campo 'searchUrl', crie uma URL de busca direta no Google ou YouTube.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING },
              isFree: { type: Type.BOOLEAN },
              searchUrl: { type: Type.STRING }
            },
            required: ['title', 'platform', 'duration', 'description', 'isFree', 'searchUrl']
          }
        }
      }
    });
    
    if (response.text) return JSON.parse(response.text);
    return [];
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    throw error;
  }
};

export const findPremiumCourses = async (): Promise<CourseRecommendation[]> => {
  const ai = getAiClient();
  const prompt = `
    Liste 5 cursos ou certificações "EM ALTA" (Trending) no mercado profissional atual (Tech, Negócios, Marketing).
    Foque em certificações renomadas (Google, AWS, Harvard, MBA rápidos, Alura, Rocketseat, etc).
    Estes são cursos Premium (podem ser pagos).
    Marque isPremiumTrend como true.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING },
              isFree: { type: Type.BOOLEAN },
              searchUrl: { type: Type.STRING },
              isPremiumTrend: { type: Type.BOOLEAN }
            },
            required: ['title', 'platform', 'duration', 'description', 'isFree', 'searchUrl', 'isPremiumTrend']
          }
        }
      }
    });
    
    if (response.text) return JSON.parse(response.text);
    return [];
  } catch (error) {
    return [];
  }
};

export const askMentorChat = async (userMessage: string, context: 'AI' | 'RECRUITER' = 'AI', companyName?: string): Promise<string> => {
    const ai = getAiClient();
    
    let systemInstruction = "";
    if (context === 'RECRUITER') {
        systemInstruction = `
            Você é um recrutador da empresa ${companyName || 'Confidencial'}.
            Seja profissional, direto, mas encorajador. O usuário está interessado em uma vaga.
            Pergunte sobre experiência ou disponibilidade para entrevista.
        `;
    } else {
        systemInstruction = `
            Você é a IA central do app "Ascenda". Seu objetivo é ajudar o usuário a crescer profissionalmente.
            Se a mensagem indicar uma imagem, analise criativamente.
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${systemInstruction}\n\nUsuário: "${userMessage}"`,
        });
        return response.text || "Mensagem recebida.";
    } catch (error) {
        console.error(error);
        return "Erro de conexão.";
    }
}

export const generateResume = async (skills: string[], role: string, salaryContext?: string): Promise<GeneratedResume> => {
    const ai = getAiClient();
    const prompt = `
      Crie uma estrutura de currículo otimizada para a vaga de "${role}" considerando as skills: "${skills.join(', ')}".
      
      ${salaryContext ? `IMPORTANTE - NÍVEL/SALÁRIO ALVO: "${salaryContext}".` : ''}
      
      Instruções de Otimização:
      - Se o contexto salarial indicar um cargo Sênior/Alto (ex: > 10k), use linguagem executiva, foque em liderança, ROI e gestão.
      - Se for Júnior/Início (ex: < 3k), foque em aprendizado rápido, projetos acadêmicos e soft skills.
      - Adapte o "Resumo Profissional" para refletir exatamente essa senioridade desejada.
      
      Gere um Resumo Profissional impactante, sugestão de estrutura de experiências (o que destacar) e uma lista de skills formatadas.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Texto de resumo profissional para colocar no topo do CV" },
                        experienceStructure: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 bullet points do que escrever nas experiências passadas para impressionar nesta vaga" },
                        skillsHighlight: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista das skills principais formatadas para destaque" }
                    },
                    required: ['summary', 'experienceStructure', 'skillsHighlight']
                }
            }
        });
        if (response.text) return JSON.parse(response.text);
        throw new Error("Falha ao gerar CV");
    } catch (error) {
        throw error;
    }
}

// New Function for Full Resume Generation
export const generateOptimizedResumeContent = async (data: ResumeData): Promise<string> => {
    const ai = getAiClient();
    const experienceText = data.experiences.map(exp => 
        `- Empresa: ${exp.company}\n  Cargo: ${exp.role}\n  Período: ${exp.startDate} - ${exp.endDate}\n  Descrição Original: ${exp.description}`
    ).join('\n');

    const educationText = data.education.map(edu => 
        `- Instituição: ${edu.school}\n  Curso: ${edu.degree}\n  Período: ${edu.startDate} - ${edu.endDate}`
    ).join('\n');

    const prompt = `
        Aja como um consultor de carreira de elite. 
        Reescreva e otimize o currículo abaixo para que ele fique altamente profissional, focado em resultados e compatível com ATS (sistemas de recrutamento).
        
        DADOS DO CANDIDATO:
        Nome: ${data.fullName}
        Email: ${data.email} | Tel: ${data.phone} | LinkedIn: ${data.linkedin} | Local: ${data.location}
        Skills: ${data.skills.join(', ')}
        
        RESUMO ORIGINAL: "${data.summary}"
        
        EXPERIÊNCIA:
        ${experienceText}
        
        EDUCAÇÃO:
        ${educationText}
        
        INSTRUÇÕES:
        1. Melhore o Resumo Profissional para ser impactante.
        2. Reescreva as descrições das experiências usando verbos de ação (ex: Liderou, Otimizou, Criou) e, se possível, quantifique resultados.
        3. Mantenha a formatação limpa e organizada.
        4. Retorne APENAS o conteúdo do currículo formatado (pode usar Markdown leve para negrito e listas).
        
        IMPORTANTE: Não use Markdown complexo (tabelas), use listas e espaçamento para facilitar a leitura.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Erro ao gerar currículo.";
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// New Function for Students
export const generateStudentResume = async (area: string, skills: string[]): Promise<GeneratedResume> => {
    const ai = getAiClient();
    const prompt = `
      Crie um currículo para um ESTUDANTE sem experiência profissional, buscando estágio na área de "${area}".
      Skills: ${skills.join(', ')}.
      
      FOCO:
      - Destaque "Objetivo Profissional" em vez de experiência.
      - Enfatize "Projetos Acadêmicos", "Voluntariado" e "Soft Skills" (vontade de aprender, proatividade).
      - O Resumo deve mostrar paixão pela área e busca pela primeira oportunidade.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING, description: "Objetivo e Resumo focados em aprendizado" },
                        experienceStructure: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sugestões do que colocar (Projetos da faculdade, bicos, cursos)" },
                        skillsHighlight: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Skills técnicas e comportamentais" }
                    },
                    required: ['summary', 'experienceStructure', 'skillsHighlight']
                }
            }
        });
        if (response.text) return JSON.parse(response.text);
        throw new Error("Falha ao gerar CV de Estudante");
    } catch (error) {
        throw error;
    }
}

export const generateSpontaneousApplication = async (skills: string[], company: string, role: string): Promise<SpontaneousApplication> => {
    const ai = getAiClient();
    const prompt = `
      Escreva um e-mail de candidatura espontânea (Cold Email) para a empresa "${company}" para a vaga de "${role}".
      Minhas skills: ${skills.join(', ')}.
      O tom deve ser profissional, persuasivo e direto.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING, description: "Assunto do email" },
                        emailBody: { type: Type.STRING, description: "Corpo do email" }
                    },
                    required: ['subject', 'emailBody']
                }
            }
        });
        if (response.text) return JSON.parse(response.text);
        throw new Error("Falha ao gerar email");
    } catch (error) {
        throw error;
    }
}

export const generateNegotiationScript = async (role: string, currentOffer: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `
      Crie um roteiro de negociação salarial para o cargo de "${role}".
      A oferta atual ou pretensão é: ${currentOffer}.
      O objetivo é aumentar esse valor em 15-20%.
      Gere um texto em primeira pessoa, educado, profissional e baseado em valor, para falar em uma reunião ou email.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Erro ao gerar script.";
    } catch (error) {
        return "Erro ao conectar com a IA.";
    }
}

// Updated to accept optional sector and skills for better recommendations
export const recommendTargetCompanies = async (location: string, role: string, sector?: string, skills?: string[]): Promise<Array<{ name: string; reason: string }>> => {
    const ai = getAiClient();
    const prompt = `
      Atue como um consultor de carreira sênior.
      Liste 3 empresas reais (ou tipos de empresas detalhados) em "${location}" que costumam contratar para a função de "${role}".
      
      Contexto Adicional:
      ${sector ? `- Setor de Atuação sugerido: ${sector}` : ''}
      ${skills ? `- Habilidades do candidato: ${skills.join(', ')}` : ''}

      Considere empresas em crescimento ou com histórico recente de vagas.
      Para cada uma, dê uma razão estratégica do porquê ela é um bom alvo para candidatura espontânea (Cold Apply).
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        },
                        required: ['name', 'reason']
                    }
                }
            }
        });
        if (response.text) return JSON.parse(response.text);
        return [];
    } catch (error) {
        return [];
    }
}

// Nova função: Auditoria Financeira
export const generateFinancialAudit = async (entries: FinanceEntry[], budget: number): Promise<FinancialAudit> => {
    const ai = getAiClient();
    const entriesText = entries.map(e => `${e.type === 'INCOME' ? '+' : '-'} R$${e.value} (${e.category}) - ${e.description}`).join('\n');
    
    const prompt = `
        Analise as seguintes transações financeiras de um usuário:
        ${entriesText}
        
        Orçamento Mensal Inicial: R$ ${budget}
        
        1. Calcule mentalmente os gastos por categoria.
        2. Dê uma nota de 0 a 100 para a saúde financeira (Score).
        3. Escreva um resumo curto de 1 frase.
        4. Dê 3 dicas táticas para economizar ou investir melhor com base nesses dados.
        5. Estime quanto ele poderia economizar se otimizar (savingsPotential).
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER },
                        summary: { type: Type.STRING },
                        tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                        savingsPotential: { type: Type.STRING }
                    },
                    required: ['score', 'summary', 'tips', 'savingsPotential']
                }
            }
        });
        if (response.text) return JSON.parse(response.text);
        throw new Error("Falha na auditoria");
    } catch (error) {
        throw error;
    }
}

// Nova função: Recomendação de Investimentos
export const generateInvestmentPortfolio = async (
    riskProfile: string, 
    amount: number, 
    goal: string
): Promise<InvestmentRecommendation> => {
    const ai = getAiClient();
    const prompt = `
        Atue como um analista de investimentos brasileiro (CNPI).
        O usuário quer investir R$ ${amount}.
        Perfil de Risco: ${riskProfile}.
        Objetivo: ${goal}.
        
        Gere uma carteira RECOMENDADA com ativos reais da B3 e Renda Fixa.
        SEMPRE inclua pelo menos 4 ativos diferentes.
        
        Use TICKERS reais (Ex: PETR4, VALE3, WEGE3, ITUB4, MXRF11, HGLG11, BOVA11, IVVB11, Tesouro Selic 2029).
        
        Preencha os campos:
        - ticker: O código do ativo.
        - name: Nome curto.
        - type: 'ACAO', 'FII', 'RENDA_FIXA' ou 'CRYPTO'.
        - percentage: Quanto da carteira (ex: "25%").
        - projectedYield: Rentabilidade estimada (ex: "Dividend Yield 12%").
        - reason: Por que comprar isso agora.
        - marketOutlook: Resumo de 1 frase sobre o mercado atual.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        riskProfile: { type: Type.STRING, enum: ['Conservador', 'Moderado', 'Arrojado'] },
                        marketOutlook: { type: Type.STRING },
                        estimatedReturn: { type: Type.STRING },
                        allocation: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    ticker: { type: Type.STRING },
                                    name: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['ACAO', 'FII', 'RENDA_FIXA', 'CRYPTO'] },
                                    percentage: { type: Type.STRING },
                                    projectedYield: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                },
                                required: ['ticker', 'name', 'type', 'percentage', 'projectedYield', 'reason']
                            }
                        }
                    },
                    required: ['riskProfile', 'allocation', 'estimatedReturn', 'marketOutlook']
                }
            }
        });
        if (response.text) return JSON.parse(response.text);
        throw new Error("Falha ao gerar investimentos");
    } catch (error) {
        throw error;
    }
}

// Nova função: Perto de Mim (Radar)
export const scanNearbyOpportunities = async (location: string): Promise<NearbyItem[]> => {
    const ai = getAiClient();
    const prompt = `
        Atue como um radar de oportunidades local.
        O usuário está na região de: "${location}".
        
        Gere 5 oportunidades FICTÍCIAS (mas realistas) próximas a esta localização que ajudem na carreira.
        Inclua:
        - 2 Vagas de emprego em empresas locais (JOB)
        - 1 Evento de Networking ou Meetup (EVENT)
        - 1 Espaço de Coworking popular (COWORKING)
        - 1 Grande empresa na região para visitar (COMPANY)
        
        Para cada item:
        - Nome realista
        - Distância aproximada (ex: "800m", "2.5km")
        - Endereço curto
        - Tags (ex: #Tech, #Vendas, #Gratuito)
        - Marque a melhor oportunidade como "isPremium: true"
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['JOB', 'COMPANY', 'EVENT', 'COWORKING'] },
                            distance: { type: Type.STRING },
                            address: { type: Type.STRING },
                            description: { type: Type.STRING },
                            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                            isPremium: { type: Type.BOOLEAN }
                        },
                        required: ['id', 'name', 'type', 'distance', 'address', 'description', 'tags', 'isPremium']
                    }
                }
            }
        });
        if (response.text) return JSON.parse(response.text);
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
}