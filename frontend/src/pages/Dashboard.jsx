import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Plus, TrendingUp, Trophy, Target, Brain, ArrowLeft, User } from 'lucide-react';

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
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/" className="p-1 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
            <Link to="/" className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              Interview<span className="text-blue-600">AI</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link to="/setup" className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> <span className="hidden xs:inline sm:inline">New Interview</span><span className="inline xs:hidden sm:hidden">New</span>
            </Link>
            <Link to="/profile" className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={logout} className="btn-secondary text-xs sm:text-sm py-2 px-2.5 sm:px-3">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Cards: 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="card">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stats?.totalSessions || 0}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 truncate">Total Sessions</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{formatScore(stats?.averageScore || 0)}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 truncate">Average Score</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stats?.bestScore || 0}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 truncate">Best Score</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stats?.currentStreak || 0}</div>
                <div className="text-[11px] sm:text-xs text-gray-500 truncate">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Score Trend Chart */}
          <div className="lg:col-span-2 card">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base">Score Trend</h3>
            {scoreHistory.length > 0 ? (
              <div className="w-full h-[220px] sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={scoreHistory.map((s, i) => ({ name: `#${i + 1}`, score: s.overallScore, topic: s.topic }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis domain={[0, 100]} fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">Complete interviews to see your score trend</div>
            )}
          </div>

          {/* Topic Performance */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base">Topic Performance</h3>
            {topicStats.length > 0 ? (
              <div className="w-full h-[220px] sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicStats} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} fontSize={10} />
                    <YAxis type="category" dataKey="topic" fontSize={10} width={70} />
                    <Tooltip />
                    <Bar dataKey="averageScore" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">No topic data yet</div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-6 sm:mt-8 card">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base">Recommended Topics</h3>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2">
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{rec.recommendedTopic}</span>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{rec.reason}</p>
                  </div>
                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-1 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>{rec.priority}</span>
                    <div className="text-[11px] text-gray-500">{Math.round(rec.confidence)}% confidence</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="mt-6 sm:mt-8">
          <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base">Recent Sessions</h3>
          {sessions.length > 0 ? (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="text-left text-xs font-medium text-gray-500 p-3">Topic</th>
                      <th className="text-left text-xs font-medium text-gray-500 p-3">Difficulty</th>
                      <th className="text-left text-xs font-medium text-gray-500 p-3">Score</th>
                      <th className="text-left text-xs font-medium text-gray-500 p-3">Questions</th>
                      <th className="text-left text-xs font-medium text-gray-500 p-3">Date</th>
                      <th className="text-left text-xs font-medium text-gray-500 p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 10).map((s) => (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 text-xs sm:text-sm font-medium text-gray-900">{s.topic}</td>
                        <td className="p-3 text-xs sm:text-sm text-gray-600">{s.difficulty}</td>
                        <td className="p-3">
                          <span className={`text-xs sm:text-sm font-bold ${
                            s.overallScore >= 80 ? 'text-green-600' :
                            s.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{Math.round(s.overallScore)}</span>
                        </td>
                        <td className="p-3 text-xs sm:text-sm text-gray-600">{s.answeredQuestions}/{s.totalQuestions}</td>
                        <td className="p-3 text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <Link to={`/results/${s.id}`} className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card text-center py-10 sm:py-12">
              <p className="text-gray-500 text-sm">No sessions yet. Start your first interview!</p>
              <Link to="/setup" className="btn-primary mt-4 inline-flex">Start Interview</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
