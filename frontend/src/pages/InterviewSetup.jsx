import React, { useState, useEffect } from 'react';
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
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
            <Link to="/" className="text-xl font-bold text-gray-900">Interview<span className="text-blue-600">AI</span></Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm">Hi, {user?.name}</span>
            <button onClick={logout} className="btn-secondary text-sm py-2 px-3">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start a New Interview</h1>
        <p className="text-gray-600 mb-8">Configure your mock interview session</p>

        <div className="space-y-8">
          {/* Topic Selection */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Topic</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TOPICS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    topic === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">{t.name}</span>
                  <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Level</h2>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    difficulty === d.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">{d.name}</span>
                  <p className="text-xs text-gray-500 mt-1">{d.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Number of Questions</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="3"
                max="15"
                value={numQuestions}
                onChange={e => setNumQuestions(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-2xl font-bold text-blue-600 w-12 text-center">{numQuestions}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Each question has a time limit based on difficulty.</p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="btn-primary w-full py-4 text-lg"
          >
            {loading ? 'Starting Interview...' : 'Start Interview'}
          </button>
        </div>
      </div>
    </div>
  );
}
