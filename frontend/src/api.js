const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, endpoint, data = null) {
  const options = {
    method,
    headers: getHeaders(),
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, options);
  } catch (err) {
    throw new Error('Cannot connect to backend server. Make sure it is running on http://localhost:8080');
  }

  const text = await response.text();
  let json = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { error: text };
    }
  }

  if (!response.ok) {
    throw new Error(json.error || json.message || `Request failed (${response.status}) - Is the backend running?`);
  }
  return json;
}

// Auth API
export const authApi = {
  register: (data) => request('POST', '/auth/register', data),
  login: (data) => request('POST', '/auth/login', data),
  me: () => request('GET', '/auth/me'),
};

// Interview API
export const interviewApi = {
  getTopics: () => request('GET', '/interview/topics'),
  startSession: (data) => request('POST', '/interview/start', data),
  getSession: (sessionId) => request('GET', `/interview/session/${sessionId}`),
  submitAnswer: (data) => request('POST', '/interview/submit-answer', data),
  completeSession: (sessionId) => request('POST', `/interview/complete/${sessionId}`),
};

// Dashboard API
export const dashboardApi = {
  getSessions: () => request('GET', '/dashboard/sessions'),
  getStats: () => request('GET', '/dashboard/stats'),
  getTopicStats: () => request('GET', '/dashboard/topic-stats'),
  getRecommendations: () => request('GET', '/dashboard/recommendations'),
  getScoreHistory: () => request('GET', '/dashboard/score-history'),
};
