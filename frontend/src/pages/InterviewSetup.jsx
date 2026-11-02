import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { interviewApi } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const TOPICS = [
  { id: 'dsa', name: 'Data Structures & Algorithms', description: 'Arrays, trees, graphs, sorting, dynamic programming' },
  { id: 'system-design', name: 'System Design', description: 'Scalability, databases, caching, load balancing' },
  { id: 'behavioral', name: 'Behavioral', description: 'Leadership, teamwork, conflict resolution' },
  { id: 'database', name: 'Database Design', description: 'SQL, normalization, indexing, transactions' },
  { id: 'oop', name: 'Object-Oriented Programming', description: 'SOLID principles, design patterns, polymorphism' },
  { id: 'web-dev', name: 'Web Development', description: 'Frontend, backend, APIs, security' },
  { id: 'devops', name: 'DevOps & Cloud', description: 'CI/CD, Docker, Kubernetes, AWS/GCP' },
  { id: 'networking', name: 'Computer Networks', description: 'HTTP, TCP/IP, DNS, security protocols' },
  { id: 'operating-systems', name: 'Operating Systems', description: 'Processes, threads, memory management' },
  { id: 'ai-ml', name: 'AI & Machine Learning', description: 'Neural networks, algorithms, data pipelines' },
];

const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', description: 'Fundamental concepts, basic problems' },
  { id: 'medium', name: 'Medium', description: 'Intermediate problems, real-world scenarios' },
  { id: 'hard', name: 'Hard', description: 'Advanced topics, complex problem-solving' },
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
      toast.success('Interview started!');
      navigate(`/session/${result.sessionId}`);
    } catch (err) {
      toast.error('Failed to start interview: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/dashboard" className="p-1 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
            <Link to="/" className="text-lg sm:text-xl font-bold text-gray-900 truncate">Interview<span className="text-blue-600">AI</span></Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="text-gray-500 text-xs sm:text-sm hidden xs:inline sm:inline truncate max-w-[120px]">Hi, {user?.name}</span>
            <button onClick={logout} className="btn-secondary text-xs sm:text-sm py-1.5 px-3">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">Start a New Interview</h1>
        <p className="text-sm text-gray-600 mb-6 sm:mb-8">Configure your mock interview session</p>

        <div className="space-y-6 sm:space-y-8">
          {/* Topic Selection */}
          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Select Topic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {TOPICS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={`text-left p-3.5 sm:p-4 rounded-lg border-2 transition-all ${
                    topic === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-sm sm:text-base text-gray-900 block">{t.name}</span>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty: 1 col on compact mobile, 3 cols on tablet/desktop */}
          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Difficulty Level</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`p-3.5 sm:p-4 rounded-lg border-2 text-left sm:text-center transition-all ${
                    difficulty === d.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-sm sm:text-base text-gray-900 block">{d.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Number of Questions</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="3"
                max="15"
                value={numQuestions}
                onChange={e => setNumQuestions(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-xl sm:text-2xl font-bold text-blue-600 w-10 text-center">{numQuestions}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Each question has a time limit based on difficulty.</p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="btn-primary w-full py-3.5 sm:py-4 text-base sm:text-lg"
          >
            {loading ? 'Starting Interview...' : 'Start Interview'}
          </button>
        </div>
      </div>
    </div>
  );
}
