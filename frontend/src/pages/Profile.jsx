import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Award, Calendar, Flame, TrendingUp, Target } from 'lucide-react';

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
      toast.error('Failed to load profile');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/dashboard" className="p-1 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Profile</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link to="/setup" className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">New Interview</Link>
            <button onClick={logout} className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Header */}
        <div className="card mb-6 sm:mb-8">
          <div className="flex items-center gap-3.5 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl sm:text-2xl font-bold text-blue-600">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{user?.name || 'User'}</h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[11px] sm:text-xs font-medium">{user?.role || 'USER'}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid: 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="card text-center p-3 sm:p-6">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalSessions || 0}</div>
            <div className="text-[11px] sm:text-xs text-gray-500">Total Sessions</div>
          </div>
          <div className="card text-center p-3 sm:p-6">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{Math.round(stats?.averageScore || 0)}</div>
            <div className="text-[11px] sm:text-xs text-gray-500">Average Score</div>
          </div>
          <div className="card text-center p-3 sm:p-6">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.bestScore || 0}</div>
            <div className="text-[11px] sm:text-xs text-gray-500">Best Score</div>
          </div>
          <div className="card text-center p-3 sm:p-6">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mx-auto mb-1.5 sm:mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.currentStreak || 0}</div>
            <div className="text-[11px] sm:text-xs text-gray-500">Day Streak</div>
          </div>
        </div>

        {/* Interview History */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Interview History</h3>
          {sessions.length > 0 ? (
            <div className="space-y-2.5 sm:space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2">
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{s.topic}</span>
                    <span className="ml-2 text-xs text-gray-500 capitalize">{s.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                      <span className={`font-bold text-sm sm:text-base ${
                        s.overallScore >= 80 ? 'text-green-600' :
                        s.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{Math.round(s.overallScore)}</span>
                      <span className="text-xs text-gray-500 ml-0.5">/100</span>
                    </div>
                    <span className="text-[11px] sm:text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                    <Link to={`/results/${s.id}`} className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold">View</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs sm:text-sm">No interview sessions yet</p>
              <Link to="/setup" className="btn-primary mt-4 inline-flex text-xs sm:text-sm">Start Your First Interview</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
