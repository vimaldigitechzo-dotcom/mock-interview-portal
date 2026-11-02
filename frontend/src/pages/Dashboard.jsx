import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Plus, TrendingUp, Trophy, Target, Brain, ArrowLeft } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [topicStats, setTopicStats] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsData, sessionsData, topicData, recData, historyData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getSessions(),
        dashboardApi.getTopicStats(),
        dashboardApi.getRecommendations(),
        dashboardApi.getScoreHistory(),
      ]);
      setStats(statsData);
      setSessions(sessionsData);
      setTopicStats(topicData);
      setRecommendations(recData);
      setScoreHistory(historyData.slice(0, 10).reverse());
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load dashboard');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const formatScore = (score) => Math.round(score);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
            <Link to="/" className="text-xl font-bold text-gray-900">Interview<span className="text-blue-600">AI</span></Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/setup" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Interview
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Profile</Link>
            <button onClick={logout} className="btn-secondary text-sm py-2 px-3">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.totalSessions || 0}</div>
                <div className="text-xs text-gray-500">Total Sessions</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatScore(stats?.averageScore || 0)}</div>
                <div className="text-xs text-gray-500">Average Score</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.bestScore || 0}</div>
                <div className="text-xs text-gray-500">Best Score</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats?.currentStreak || 0}</div>
                <div className="text-xs text-gray-500">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Score Trend Chart */}
          <div className="lg:col-span-2 card">
            <h3 className="font-semibold text-gray-900 mb-4">Score Trend</h3>
            {scoreHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scoreHistory.map((s, i) => ({ name: `#${i + 1}`, score: s.overallScore, topic: s.topic }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">Complete interviews to see your score trend</div>
            )}
          </div>

          {/* Topic Performance */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Topic Performance</h3>
            {topicStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topicStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, 100]} fontSize={10} />
                  <YAxis type="category" dataKey="topic" fontSize={10} width={80} />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">No topic data yet</div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-8 card">
            <h3 className="font-semibold text-gray-900 mb-4">Recommended Topics</h3>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{rec.recommendedTopic}</span>
                    <p className="text-sm text-gray-500 mt-1">{rec.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>{rec.priority}</span>
                    <div className="text-xs text-gray-500 mt-1">{Math.round(rec.confidence)}% confidence</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          {sessions.length > 0 ? (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-sm font-medium text-gray-500 p-3">Topic</th>
                    <th className="text-left text-sm font-medium text-gray-500 p-3">Difficulty</th>
                    <th className="text-left text-sm font-medium text-gray-500 p-3">Score</th>
                    <th className="text-left text-sm font-medium text-gray-500 p-3">Questions</th>
                    <th className="text-left text-sm font-medium text-gray-500 p-3">Date</th>
                    <th className="text-left text-sm font-medium text-gray-500 p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 10).map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-sm font-medium text-gray-900">{s.topic}</td>
                      <td className="p-3 text-sm text-gray-600">{s.difficulty}</td>
                      <td className="p-3">
                        <span className={`text-sm font-bold ${
                          s.overallScore >= 80 ? 'text-green-600' :
                          s.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{Math.round(s.overallScore)}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{s.answeredQuestions}/{s.totalQuestions}</td>
                      <td className="p-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <Link to={`/results/${s.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">No sessions yet. Start your first interview!</p>
              <Link to="/setup" className="btn-primary mt-4 inline-block">Start Interview</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
