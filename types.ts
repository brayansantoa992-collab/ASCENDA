
export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
  PLANNER = 'PLANNER',
  COURSES = 'COURSES',
  JOBS = 'JOBS',
  MENTOR = 'MENTOR',
  QUIZ = 'QUIZ',
  PROFILE = 'PROFILE',
  FEED = 'FEED',
  STUDENTS = 'STUDENTS',
  NEAR_ME = 'NEAR_ME',
  FINANCE = 'FINANCE', // Separated
  INVEST = 'INVEST',   // Separated
}

export enum SubscriptionPlan {
  FREE = 0,
  BASIC = 1, // Remove Anúncios
  MEDIUM = 2, // + Cursos Premium
  PREMIUM = 3, // + Vagas Premium, Currículo IA, Carta Espontânea
  YEARLY = 4, // R$ 99,99/ano (Tudo incluso + desconto)
  STUDENT = 5 // R$ 4,90/mês (Especial para Estudantes)
}

export interface UserSettings {
  notifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  publicProfile: boolean;
  language: 'pt-BR' | 'en-US';
  accentColor: 'green' | 'blue' | 'purple' | 'orange';
  shareDataWithAI: boolean;
  ghostMode: boolean;
  biometricAuth: boolean;
  chatWallpaper: 'DEFAULT' | 'GALAXY' | 'MINIMAL' | 'NEON' | 'FOREST' | 'SUNSET';
  chatSounds: boolean;
}

export interface UserBadge {
    id: string;
    name: string;
    icon: string;
    description: string;
    unlocked: boolean;
    color: string;
}

export interface ResumeExperience {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface ResumeEducation {
    id: string;
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
}

export interface ResumeData {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    location: string;
    summary: string;
    experiences: ResumeExperience[];
    education: ResumeEducation[];
    skills: string[];
    generatedContent?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  cpf?: string;
  idDocumentUrl?: string;
  avatarUrl?: string;
  role?: string;
  signature?: string;
  bio?: string;
  resumeUrl?: string;
  skills: string;
  experience?: string;
  resumeData?: ResumeData;
  budget: string;
  timeAvailable: string;
  interests: string;
  settings: UserSettings;
  termsAccepted?: boolean;
  termsAcceptedDate?: Date;
  level?: number;
  xp?: number;
  badges?: UserBadge[];
}

export interface ChatCustomAction {
    label: string;
    actionType: 'LINK' | 'MESSAGE';
    value: string;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  type: 'AI' | 'RECRUITER' | 'COMPANY';
  lastMessage?: string;
  timestamp: Date;
  unread: number;
  isFavorite?: boolean;
  tags?: string[];
  inviteLink?: string;
  customAction?: ChatCustomAction;
  roleDescription?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'recruiter';
  text: string;
  timestamp: Date;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'audio' | 'video' | 'document' | 'location';
  isCall?: boolean;
  status?: 'sending' | 'sent' | 'read';
  rating?: 'up' | 'down';
}

export interface BusinessIdea {
  title: string;
  description: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  estimatedIncome: string;
  requiredSkills: string[];
}

export interface BusinessPlan {
  summary: string;
  steps: string[];
  marketingStrategy: string;
  monetizationModel: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface JobOpportunity {
  id: string;
  role: string;
  companyName: string;
  description: string;
  salaryValue: number;
  avgSalary: string;
  matchReason: string;
  searchQuery: string;
  isPremium?: boolean;
  matchScore?: number;
}

export interface CourseRecommendation {
  title: string;
  platform: string;
  duration: string;
  description: string;
  isFree: boolean;
  searchUrl: string;
  isPremiumTrend?: boolean;
  userRating?: number;
}

export interface Podcast {
    id: string;
    title: string;
    host: string;
    description: string;
    spotifyUrl: string;
    youtubeUrl: string;
    coverUrl: string;
    category: string;
}

export interface MentorResource {
  type: 'Podcast' | 'Livro' | 'Dica';
  title: string;
  authorOrHost: string;
  description: string;
}

export interface GeneratedResume {
  summary: string;
  experienceStructure: string[];
  skillsHighlight: string[];
}

export interface SpontaneousApplication {
  subject: string;
  emailBody: string;
}

export interface LoadingState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export interface FinanceEntry {
    id: string;
    description: string;
    category: string;
    type: 'INCOME' | 'EXPENSE';
    value: number;
    status: 'PAID' | 'PENDING';
    date: string;
    isRecurring?: boolean;
}

export interface FinancialAudit {
    score: number;
    summary: string;
    tips: string[];
    savingsPotential: string;
}

export interface InvestmentAsset {
    ticker: string;
    name: string;
    type: 'ACAO' | 'FII' | 'RENDA_FIXA' | 'CRYPTO';
    percentage: string;
    reason: string;
    projectedYield: string;
}

export interface InvestmentRecommendation {
    riskProfile: 'Conservador' | 'Moderado' | 'Arrojado';
    allocation: InvestmentAsset[];
    estimatedReturn: string;
    marketOutlook: string;
}

export interface FeedPollOption {
    id: string;
    text: string;
    votes: number;
}

export interface FeedPoll {
    question: string;
    options: FeedPollOption[];
    totalVotes: number;
    userVotedId?: string;
}

export interface FeedComment {
    id: string;
    user: string;
    text: string;
    timestamp: string;
}

export interface FeedPost {
    id: string;
    companyName: string;
    companyAvatar: string;
    content: string;
    imageUrl?: string;
    timestamp: string;
    likes: number;
    comments: FeedComment[];
    isPremium: boolean;
    isJobAlert: boolean;
    poll?: FeedPoll;
    likedByUser?: boolean;
}

export interface FeedStory {
    id: string;
    companyName: string;
    avatarUrl: string;
    hasUpdate: boolean;
}

export interface NearbyItem {
    id: string;
    name: string;
    type: 'JOB' | 'COMPANY' | 'EVENT' | 'COWORKING';
    distance: string;
    address: string;
    description: string;
    tags: string[];
    isPremium?: boolean;
}
