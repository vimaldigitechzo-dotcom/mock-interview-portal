import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Brain, Clock, Mic, BarChart3, Target, Shield } from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();

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
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            Interview<span className="text-blue-600">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">Dashboard</Link>
                <Link to="/setup" className="text-gray-600 hover:text-gray-900 font-medium">New Interview</Link>
                <span className="text-gray-500">Hi, {user.name}</span>
                <button onClick={logout} className="btn-secondary text-sm py-2 px-4">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Start Interview</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            Powered by AI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Master Technical Interviews with{' '}
            <span className="text-blue-600">AI-Powered</span> Practice
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Practice mock interviews with dynamically generated questions, get instant AI evaluation,
            track your performance, and improve faster with personalized recommendations.
          </p>
          <div className="flex items-center justify-center gap-4">
            {user ? 
              (
              <Link to="/setup" className="btn-primary text-lg px-8 py-4">
                Start Interview
              </Link>
            ) : (
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Start Interview
              </Link>
            )}
            <Link to="/login" className="btn-secondary text-lg px-8 py-4">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything You Need</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            A complete interview preparation platform with AI-driven evaluation and personalized insights.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Practice Any Topic</h2>
          <p className="text-gray-600 mb-10">From Data Structures to System Design, we cover all major technical interview topics.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['DSA', 'System Design', 'Behavioral', 'Database', 'OOP', 'Web Dev', 'DevOps', 'Networking', 'OS', 'AI/ML'].map(t => (
              <span key={t} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Ace Your Next Interview?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of developers preparing smarter with AI-powered mock interviews.</p>
          {!user && (
            <Link to="/register" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Create An Account
            </Link>
          )}
        </div>
      </section>

     {/*  Footer 
      <footer className="py-8 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-gray-500 text-sm">AI Mock Interview Portal 2024</span>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Terms</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Contact</a>
          </div>
        </div>
      </footer>
      */}
    </div>
  );
}
