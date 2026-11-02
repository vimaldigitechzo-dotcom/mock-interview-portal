import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  Brain, Clock, Mic, BarChart3, Target, Shield, Menu, X, 
  Sparkles, ArrowRight, CheckCircle2, Code2, Cpu, Database, 
  Layers, Terminal, Zap, Star
} from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { 
      icon: Brain, 
      title: 'AI Question Generator', 
      desc: 'Dynamically generated coding, system design, and behavioral questions tailored to your target difficulty.',
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50 text-blue-600'
    },
    { 
      icon: Clock, 
      title: 'Timed Mock Sessions', 
      desc: 'Real-time countdown timer creates realistic pressure so you build poise and time management for real interviews.',
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 text-amber-600'
    },
    { 
      icon: Mic, 
      title: 'Speech-to-Text Voice', 
      desc: 'Speak your answers aloud using your microphone. Formulate your verbal communication just like in live tech rounds.',
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 text-emerald-600'
    },
    { 
      icon: Target, 
      title: 'Multi-Factor AI Scoring', 
      desc: 'Deep multi-dimensional analysis scoring your answers on Technical Correctness, Completeness, and Structural Clarity.',
      gradient: 'from-purple-500 to-pink-600',
      bgLight: 'bg-purple-50 text-purple-600'
    },
    { 
      icon: BarChart3, 
      title: 'Analytics & Trends', 
      desc: 'Track your growth across sessions with historical score charts, topic-wise strengths, and performance breakdown.',
      gradient: 'from-cyan-500 to-blue-600',
      bgLight: 'bg-cyan-50 text-cyan-600'
    },
    { 
      icon: Shield, 
      title: 'Smart Focus Advisor', 
      desc: 'Intelligent recommendations detect your weak areas and suggest high-yield topics to maximize your score.',
      gradient: 'from-rose-500 to-red-600',
      bgLight: 'bg-rose-50 text-rose-600'
    },
  ];

  const topics = [
    { name: 'Data Structures & Algorithms', icon: Code2, badge: 'Popular' },
    { name: 'System Design', icon: Cpu, badge: 'Hot' },
    { name: 'Database Architecture', icon: Database, badge: 'Core' },
    { name: 'Object-Oriented Design', icon: Layers, badge: 'OOP' },
    { name: 'Web & API Engineering', icon: Terminal, badge: 'Full-Stack' },
    { name: 'DevOps & Cloud (CI/CD)', icon: Zap, badge: 'Cloud' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative selection:bg-blue-600 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-20 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-slate-900 tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <span>Interview<span className="text-blue-600">AI</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors">Dashboard</Link>
                <Link to="/setup" className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors">New Interview</Link>
                <div className="h-4 w-px bg-slate-200"></div>
                <Link to="/profile" className="flex items-center gap-2 text-slate-700 font-medium text-sm hover:text-blue-600">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span>{user.name}</span>
                </Link>
                <button onClick={logout} className="btn-secondary text-xs py-1.5 px-3">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary text-xs py-2.5 px-5">
                  Get Started Free <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-5 pt-3 pb-5 space-y-2.5 shadow-xl animate-in slide-in-from-top-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm">Dashboard</Link>
                <Link to="/setup" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm">New Interview</Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm">Profile</Link>
                <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="w-full text-left px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center btn-primary text-sm py-3 mt-2">Get Started Free</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm shadow-blue-500/10">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            AI-Powered Technical Interview Simulator
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-6">
            Land Your Dream Job with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Realistic AI Mock Interviews
            </span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Practice actual technical and behavioral interview questions. Get instant multi-dimensional evaluation on correctness, completeness, and clarity.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md sm:max-w-none mx-auto mb-14">
            {user ? (
              <Link to="/setup" className="btn-primary w-full sm:w-auto text-base sm:text-lg px-8 py-3.5 sm:py-4">
                Start Interview Session <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            ) : (
              <Link to="/register" className="btn-primary w-full sm:w-auto text-base sm:text-lg px-8 py-3.5 sm:py-4">
                Start Free Practice <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            )}
            <Link to="/login" className="btn-secondary w-full sm:w-auto text-base sm:text-lg px-7 py-3.5 sm:py-4">
              Sign In to Account
            </Link>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-6 border-t border-slate-200/80 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">10+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Technical Domains</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">3-Factor</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">AI Scoring Criteria</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">Voice & Text</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Flexible Inputs</div>
            </div>
            <div className="p-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">Instant</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Detailed Feedback</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Simulation Preview Card */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="card p-5 sm:p-8 border-2 border-blue-500/20 bg-gradient-to-b from-white to-blue-50/30 shadow-xl shadow-blue-500/5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Live AI Evaluation Demo</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">DSA • Medium</span>
            </div>

            <div className="space-y-4">
              <div className="text-sm sm:text-base font-semibold text-slate-900">
                "Explain the time complexity of quicksort in the average and worst case. How can you mitigate the worst case?"
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-600 font-mono">
                Candidate: "Average case is O(n log n) with balanced partitions. Worst case is O(n²) when pivot is always smallest/largest. Mitigate using randomized pivot or median-of-three..."
              </div>

              {/* Evaluation score preview */}
              <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">AI Scoring Summary</span>
                  <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Score: 92/100</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="font-bold text-blue-600">95%</div>
                    <div className="text-[10px] text-slate-500">Correctness</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="font-bold text-emerald-600">90%</div>
                    <div className="text-[10px] text-slate-500">Completeness</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="font-bold text-purple-600">92%</div>
                    <div className="text-[10px] text-slate-500">Clarity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Engineered for Complete Interview Mastery
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Every feature is built around the rubrics used by top tech companies, from startups to FAANG.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {features.map((f, i) => (
              <div key={i} className="card hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.bgLight} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Topics Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">Master All Critical Domains</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-lg mx-auto">Practice across our comprehensive question banks curated with real industry patterns.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {topics.map((t, idx) => (
              <div key={idx} className="card p-4 flex items-center justify-between text-left hover:border-blue-400/50 hover:bg-blue-50/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center">
                    <t.icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-slate-800">{t.name}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {t.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto card bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white p-8 sm:p-12 text-center shadow-xl shadow-blue-500/20 border-none">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 text-white">Ready to Ace Your Next Interview?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Start right now with zero setup. Create an account in 15 seconds and experience realistic, AI-evaluated practice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-all text-sm sm:text-base shadow-lg">
              Start Free Today <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center text-white/90 hover:text-white px-6 py-3.5 font-semibold text-sm sm:text-base">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-200/80 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© 2026 InterviewAI Portal. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Powered by Gemini & AI</span>
            <span>•</span>
            <span>Fast & Secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
