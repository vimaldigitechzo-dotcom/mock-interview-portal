import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Plus, TrendingUp, Trophy, Target, Brain, ArrowLeft, User, Sparkles, Clock, ArrowRight, Play } from 'lucide-react';

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
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Loading your interview dashboard...</span>
        </div>
      </div>
    );
  }

  const formatScore = (score) => Math.round(score);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Brain className="w-4 h-4" />
              </div>
              <span>Interview<span className="text-blue-600">AI</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link to="/setup" className="btn-primary text-xs sm:text-sm py-2 px-3.5 sm:px-4">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Interview</span>
              <span className="sm:hidden">New</span>
            </Link>
            <Link to="/profile" className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button onClick={logout} className="btn-secondary text-xs sm:text-sm py-2 px-3">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Banner */}
        <div className="card bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 border-none shadow-xl shadow-blue-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Ready for your next round?
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Candidate'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Consistency is key. Practice 1 mock interview today to reinforce your skills and boost your scores.
            </p>
          </div>
          <Link to="/setup" className="btn-secondary bg-white text-blue-700 hover:bg-blue-50 border-none font-bold text-sm px-6 py-3 w-full md:w-auto shadow-lg shadow-black/10">
            <Play className="w-4 h-4 fill-current" /> Start Practice Now
          </Link>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          <div className="card hover:border-blue-300/60 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats?.totalSessions || 0}</div>
                <div className="text-xs text-slate-500 font-medium truncate">Total Sessions</div>
              </div>
            </div>
          </div>

          <div className="card hover:border-emerald-300/60 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{formatScore(stats?.averageScore || 0)}%</div>
                <div className="text-xs text-slate-500 font-medium truncate">Average Score</div>
              </div>
            </div>
          </div>

          <div className="card hover:border-amber-300/60 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats?.bestScore || 0}%</div>
                <div className="text-xs text-slate-500 font-medium truncate">Best Score</div>
              </div>
            </div>
          </div>

          <div className="card hover:border-purple-300/60 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats?.currentStreak || 0} Days</div>
                <div className="text-xs text-slate-500 font-medium truncate">Active Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Score Trend */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Performance Over Time</h3>
                <p className="text-xs text-slate-500">Historical score trajectory across completed mock interviews</p>
              </div>
            </div>

            {scoreHistory.length > 0 ? (
              <div className="w-full h-[240px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={scoreHistory.map((s, i) => ({ name: `S${i + 1}`, score: Math.round(s.overallScore), topic: s.topic }))}
                    margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                    <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-center text-slate-400 gap-2 border border-dashed border-slate-200 rounded-xl">
                <Clock className="w-8 h-8 text-slate-300" />
                <span className="text-xs sm:text-sm">Complete your first interview session to unlock trend tracking</span>
              </div>
            )}
          </div>

          {/* Topic Performance */}
          <div className="card">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1">Topic Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Average score by category</p>

            {topicStats.length > 0 ? (
              <div className="w-full h-[240px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicStats} layout="vertical" margin={{ top: 5, right: 15, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} fontSize={10} stroke="#94a3b8" />
                    <YAxis type="category" dataKey="topic" fontSize={10} stroke="#94a3b8" width={75} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="averageScore" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-center text-slate-400 gap-2 border border-dashed border-slate-200 rounded-xl">
                <Target className="w-8 h-8 text-slate-300" />
                <span className="text-xs sm:text-sm">Practice different topics to compare proficiency</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">AI Recommended Study Plan</h3>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">{rec.recommendedTopic}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{rec.reason}</p>
                  </div>
                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-500">{Math.round(rec.confidence)}% match</span>
                    <Link to="/setup" className="btn-primary text-xs py-1.5 px-3">Practice <ArrowRight className="w-3.5 h-3.5" /></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Recent Interview Sessions</h3>
            <Link to="/setup" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Start New <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {sessions.length > 0 ? (
            <div className="card p-0 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500">
                      <th className="text-left text-xs font-semibold uppercase tracking-wider p-3.5">Topic</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider p-3.5">Difficulty</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider p-3.5">Score</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider p-3.5">Questions</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider p-3.5">Date</th>
                      <th className="text-left text-xs font-semibold uppercase tracking-wider p-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.slice(0, 10).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 text-xs sm:text-sm font-bold text-slate-800 capitalize">{s.topic}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                            {s.difficulty}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black ${
                            s.overallScore >= 80 ? 'bg-emerald-50 text-emerald-700' :
                            s.overallScore >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {Math.round(s.overallScore)}%
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-600 font-medium">{s.answeredQuestions}/{s.totalQuestions}</td>
                        <td className="p-3.5 text-xs text-slate-400 font-medium">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td className="p-3.5">
                          <Link to={`/results/${s.id}`} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                            Review Feedback
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-base mb-1">No sessions recorded yet</h4>
              <p className="text-xs sm:text-sm text-slate-500 mb-5 max-w-sm mx-auto">Take your first interview to get scored by our AI models and track your growth.</p>
              <Link to="/setup" className="btn-primary">Start Your First Interview</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
