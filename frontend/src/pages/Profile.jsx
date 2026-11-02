import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Award, 
  Calendar, 
  Flame, 
  TrendingUp, 
  Target, 
  User, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Play, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [statsData, sessionsData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getSessions(),
      ]);
      setStats(statsData);
      setSessions(sessionsData);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load profile data');
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  // Group topics for quick skill breakdown
  const topicBreakdown = sessions.reduce((acc, s) => {
    const topic = s.topic || 'General';
    if (!acc[topic]) {
      acc[topic] = { count: 0, totalScore: 0 };
    }
    acc[topic].count += 1;
    acc[topic].totalScore += (s.overallScore || 0);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link 
              to="/dashboard" 
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">Candidate Profile</h1>
              <p className="text-[11px] text-slate-500 truncate hidden xs:block">Manage your performance record & settings</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link to="/setup" className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 inline-flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              <span>Practice Now</span>
            </Link>
            <button 
              onClick={logout} 
              className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3 inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-5 sm:pt-8 space-y-6">
        
        {/* Profile Card Header with Ambient Glow */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm p-5 sm:p-7">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 opacity-90" />
          
          <div className="relative pt-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-3.5 sm:gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold select-none">
                  {userInitial}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active" />
              </div>

              {/* User Bio Details */}
              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                    {user?.name || 'Candidate'}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                    <ShieldCheck className="w-3 h-3" />
                    {user?.role || 'Verified Candidate'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {user?.email || 'user@example.com'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Member since 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
              <Link to="/setup" className="btn-primary w-full sm:w-auto text-xs py-2 px-4 justify-center">
                New Mock Interview
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="card p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Practice</span>
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.totalSessions || 0}</div>
            <div className="text-[11px] text-slate-500 mt-1">Sessions Completed</div>
          </div>

          <div className="card p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Score</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{Math.round(stats?.averageScore || 0)}%</div>
            <div className="text-[11px] text-slate-500 mt-1">Overall Accuracy</div>
          </div>

          <div className="card p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Personal Best</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.bestScore || 0}%</div>
            <div className="text-[11px] text-slate-500 mt-1">Highest Evaluation</div>
          </div>

          <div className="card p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Consistency</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.currentStreak || 0} <span className="text-base font-semibold text-slate-400">days</span></div>
            <div className="text-[11px] text-slate-500 mt-1">Active Daily Streak</div>
          </div>
        </div>

        {/* Topic Practice Breakdown if available */}
        {Object.keys(topicBreakdown).length > 0 && (
          <div className="card p-5 sm:p-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-600" />
              <span>Skill Competency Breakdown</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(topicBreakdown).map(([topic, data]) => {
                const avg = Math.round(data.totalScore / (data.count || 1));
                return (
                  <div key={topic} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm capitalize">{topic}</span>
                      <span className="text-[11px] font-bold text-primary-700 bg-primary-100/70 px-2 py-0.5 rounded-full">
                        {avg}% avg
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-primary-600 rounded-full" style={{ width: `${Math.min(avg, 100)}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1.5">
                      {data.count} session{data.count > 1 ? 's' : ''} taken
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Interview History List */}
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                <span>Complete Interview History</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Review past questions, scores, and AI recommendations</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {sessions.length} total
            </span>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-2.5">
              {sessions.map((s) => (
                <div 
                  key={s.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/70 rounded-xl transition-all gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm capitalize">{s.topic}</span>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {s.difficulty}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Session #{s.id} • {s.status === 'COMPLETED' ? 'Completed Session' : s.status}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold ${getScoreColor(s.overallScore)}`}>
                      {Math.round(s.overallScore)} / 100
                    </div>
                    <Link 
                      to={`/results/${s.id}`} 
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-white hover:bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                    >
                      <span>View Feedback</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No mock interviews completed yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Launch your first AI mock session to receive an in-depth score analysis and personalized learning path.
              </p>
              <Link to="/setup" className="btn-primary inline-flex text-xs py-2 px-5 items-center gap-2">
                <Play className="w-3.5 h-3.5" />
                <span>Begin First Interview</span>
              </Link>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
