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
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
            <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/setup" className="btn-primary text-sm py-2 px-4">New Interview</Link>
            <button onClick={logout} className="btn-secondary text-sm py-2 px-3">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{user?.name?.[0] || 'U'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{user?.role || 'USER'}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats?.totalSessions || 0}</div>
            <div className="text-xs text-gray-500">Total Sessions</div>
          </div>
          <div className="card text-center">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{Math.round(stats?.averageScore || 0)}</div>
            <div className="text-xs text-gray-500">Average Score</div>
          </div>
          <div className="card text-center">
            <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats?.bestScore || 0}</div>
            <div className="text-xs text-gray-500">Best Score</div>
          </div>
          <div className="card text-center">
            <Flame className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats?.currentStreak || 0}</div>
            <div className="text-xs text-gray-500">Day Streak</div>
          </div>
        </div>

        {/* Interview History */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Interview History</h3>
          {sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <span className="font-medium text-gray-900">{s.topic}</span>
                    <span className="ml-2 text-xs text-gray-500">{s.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`font-bold ${
                        s.overallScore >= 80 ? 'text-green-600' :
                        s.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{Math.round(s.overallScore)}</span>
                      <span className="text-xs text-gray-500 ml-1">/100</span>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                    <Link to={`/results/${s.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No interview sessions yet</p>
              <Link to="/setup" className="btn-primary mt-4 inline-block text-sm">Start Your First Interview</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
