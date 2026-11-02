import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Brain, Clock, Mic, BarChart3, Target, Shield, Menu, X } from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: Brain, title: 'AI-Generated Questions', desc: 'Dynamic technical questions powered by AI across 10+ topics and difficulty levels.' },
    { icon: Clock, title: 'Timed Sessions', desc: 'Real-time countdown timer simulates actual interview pressure and time management.' },
    { icon: Mic, title: 'Voice Input', desc: 'Speak your answers aloud — speech is automatically transcribed for evaluation.' },
    { icon: Target, title: 'AI Evaluation', desc: 'Instant scoring on correctness, completeness, and clarity with detailed feedback.' },
    { icon: BarChart3, title: 'Performance Analytics', desc: 'Track your progress over time with charts, trends, and topic-wise breakdown.' },
    { icon: Shield, title: 'Smart Recommendations', desc: 'AI analyzes weak areas and suggests topics to focus on for maximum improvement.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
            Interview<span className="text-blue-600">AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Dashboard</Link>
                <Link to="/setup" className="text-gray-600 hover:text-gray-900 font-medium text-sm">New Interview</Link>
                <span className="text-gray-500 text-sm">Hi, {user.name}</span>
                <button onClick={logout} className="btn-secondary text-xs py-1.5 px-3">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-xs py-2 px-4">Start Interview</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2 shadow-lg">
            {user ? (
              <>
                <div className="text-xs text-gray-500 font-medium px-2 py-1">Signed in as {user.name}</div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  to="/setup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  New Interview
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  Profile
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center btn-primary text-sm py-2.5 mt-2"
                >
                  Start Interview
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-36 pb-14 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-5 sm:mb-6">
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Powered by AI
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.15] mb-4 sm:mb-6 tracking-tight break-words">
            Master Technical Interviews with{' '}
            <span className="text-blue-600 block sm:inline">AI-Powered</span> Practice
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Practice mock interviews with dynamically generated questions, get instant AI evaluation,
            track your performance, and improve faster with personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
            {user ? (
              <Link to="/setup" className="btn-primary w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4">
                Start Interview
              </Link>
            ) : (
              <Link to="/register" className="btn-primary w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4">
                Start Interview
              </Link>
            )}
            <Link to="/login" className="btn-secondary w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">Everything You Need</h2>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 max-w-xl mx-auto">
            A complete interview preparation platform with AI-driven evaluation and personalized insights.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Practice Any Topic</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-10">From Data Structures to System Design, we cover all major technical interview topics.</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {['DSA', 'System Design', 'Behavioral', 'Database', 'OOP', 'Web Dev', 'DevOps', 'Networking', 'OS', 'AI/ML'].map(t => (
              <span key={t} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Ready to Ace Your Next Interview?</h2>
          <p className="text-blue-100 mb-6 sm:mb-8 text-sm sm:text-lg">Join thousands of developers preparing smarter with AI-powered mock interviews.</p>
          {!user && (
            <Link to="/register" className="inline-block w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm sm:text-base">
              Create An Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
