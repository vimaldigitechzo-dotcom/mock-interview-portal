import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { interviewApi } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, Brain, Code2, Cpu, Database, Layers, Terminal, 
  Zap, Network, HardDrive, Sparkles, Check, Rocket, ShieldAlert, 
  HelpCircle, Gauge
} from 'lucide-react';

const TOPICS = [
  { id: 'dsa', name: 'Data Structures & Algorithms', icon: Code2, desc: 'Arrays, Trees, Dynamic Programming, Graphs' },
  { id: 'system-design', name: 'System Design & Architecture', icon: Cpu, desc: 'Scalability, Load Balancing, Caching, Sharding' },
  { id: 'behavioral', name: 'Behavioral & Leadership (STAR)', icon: HelpCircle, desc: 'Teamwork, Conflict, Decision Making, STAR Method' },
  { id: 'database', name: 'Database & SQL Engineering', icon: Database, desc: 'Indexing, ACID, Normalization, Query Tuning' },
  { id: 'oop', name: 'Object-Oriented Design & SOLID', icon: Layers, desc: 'Design Patterns, Abstraction, Polymorphism' },
  { id: 'web-dev', name: 'Web Dev & API Architecture', icon: Terminal, desc: 'REST, React, Performance, Security & Auth' },
  { id: 'devops', name: 'DevOps, Docker & Cloud', icon: Zap, desc: 'CI/CD, Kubernetes, Monitoring, Infrastructure' },
  { id: 'networking', name: 'Computer Networks & HTTP', icon: Network, desc: 'TCP/IP, DNS, HTTPS, WebSockets, OSI Model' },
  { id: 'operating-systems', name: 'Operating Systems & Concurrency', icon: HardDrive, desc: 'Processes, Threads, Mutex, Memory Management' },
  { id: 'ai-ml', name: 'AI, LLMs & Machine Learning', icon: Sparkles, desc: 'Model Evaluation, Prompting, Embeddings, RAG' },
];

const DIFFICULTIES = [
  { 
    id: 'easy', 
    name: 'Junior / Entry', 
    badge: 'Fundamental',
    color: 'border-emerald-400 bg-emerald-50/50 text-emerald-800',
    activeColor: 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30',
    desc: 'Core definitions, foundational syntax & common principles'
  },
  { 
    id: 'medium', 
    name: 'Mid-Level', 
    badge: 'Recommended',
    color: 'border-blue-400 bg-blue-50/50 text-blue-800',
    activeColor: 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30',
    desc: 'Real-world problem solving, trade-offs & practical implementations'
  },
  { 
    id: 'hard', 
    name: 'Senior / Staff', 
    badge: 'Advanced',
    color: 'border-purple-400 bg-purple-50/50 text-purple-800',
    activeColor: 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/30',
    desc: 'Deep architecture, edge cases, failure recovery & scale'
  },
];

export default function InterviewSetup() {
  const [topic, setTopic] = useState('dsa');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleStart = async () => {
    setLoading(true);
    try {
      const result = await interviewApi.startSession({ topic, difficulty, numQuestions: String(numQuestions) });
      toast.success('Interview session prepared!');
      navigate(`/session/${result.sessionId}`);
    } catch (err) {
      toast.error('Failed to start interview: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const estimatedMinutes = numQuestions * (difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/dashboard" className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Brain className="w-4 h-4" />
              </div>
              <span>Interview<span className="text-blue-600">AI</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs sm:text-sm text-slate-500 hidden sm:inline">Hi, {user?.name}</span>
            <button onClick={logout} className="btn-secondary text-xs sm:text-sm py-1.5 px-3">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Title */}
        <div className="mb-8">
          <span className="badge-primary mb-2">Step-by-Step Configuration</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Configure Your Mock Interview</h1>
          <p className="text-sm text-slate-500 mt-1">Select your domain, target seniority, and number of questions to begin.</p>
        </div>

        <div className="space-y-8">
          {/* 1. Topic Selection */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Choose Technical Domain</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">10 Available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOPICS.map(t => {
                const IconComponent = t.icon;
                const isSelected = topic === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTopic(t.id)}
                    className={`text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{t.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Difficulty Level */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Select Difficulty / Seniority</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DIFFICULTIES.map(d => {
                const isSelected = difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected ? d.activeColor : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-sm sm:text-base text-slate-900">{d.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.id === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                        d.id === 'medium' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {d.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{d.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Question Count & Duration */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Number of Questions</h2>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                ~{estimatedMinutes} Minutes Session
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={numQuestions}
                  onChange={e => setNumQuestions(parseInt(e.target.value))}
                  className="flex-1 h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-2xl font-black text-blue-600 w-12 text-center bg-blue-50 py-1 rounded-lg">
                  {numQuestions}
                </span>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium mr-1">Quick Select:</span>
                {[3, 5, 8, 10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNumQuestions(val)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      numQuestions === val
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {val} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start CTA */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="btn-primary w-full py-4 text-base sm:text-lg shadow-xl shadow-blue-500/25 justify-center"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating AI Questions...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                <span>Launch Mock Interview ({numQuestions} Questions)</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
