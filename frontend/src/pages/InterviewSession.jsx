import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interviewApi } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, Clock, Mic, MicOff, Send, CheckCircle2, 
  Brain, AlertCircle, Sparkles, ChevronRight, MessageSquare 
} from 'lucide-react';

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    loadSession();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [currentIndex, loading, questions.length]);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      const totalTimer = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(totalTimer);
    }
  }, [loading, questions.length]);

  const loadSession = async () => {
    try {
      const data = await interviewApi.getSession(parseInt(sessionId));
      setQuestions(data.questions);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load session');
      navigate('/dashboard');
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim() || answer.trim().length < 10) {
      toast.error('Please provide a detailed response (at least 10 characters)');
      return;
    }
    setSubmitting(true);
    try {
      const currentQ = questions[currentIndex];
      const result = await interviewApi.submitAnswer({
        questionId: String(currentQ.id),
        sessionId,
        answer,
      });
      setEvaluation(result.evaluation);
      toast.success('Answer evaluated by AI!');
    } catch (err) {
      toast.error('Evaluation error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswer('');
      setEvaluation(null);
      setTimeLeft(300);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    try {
      await interviewApi.completeSession(parseInt(sessionId));
      navigate(`/results/${sessionId}`);
    } catch (err) {
      toast.error('Failed to complete session');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      toast.info('Microphone recording active. Speak clearly into your mic.');
    } catch (err) {
      toast.error('Microphone access denied. You can still type your answer.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Voice recorded. Add any final adjustments and submit.');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Preparing your live interview room...</span>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Live Session HUD Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/dashboard" className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">Live Interview</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            {/* Session Time */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono">{formatTime(totalTime)}</span>
            </div>

            {/* Question Counter Badge */}
            <span className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Animated Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Overall Session Progress</span>
            <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Question & Answer Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="card shadow-lg shadow-slate-200/40 border-slate-200">
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  {currentQ.questionDifficulty || 'Medium'}
                </span>

                {/* Question countdown */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  timeLeft <= 60 
                    ? 'bg-red-100 text-red-700 ring-2 ring-red-400 animate-pulse' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time Left: {formatTime(timeLeft)}</span>
                </div>
              </div>

              <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug mb-5">
                {currentQ.questionText}
              </h2>

              {/* Voice Input Section with Visualizer */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 shadow-sm transition-all"
                    >
                      <Mic className="w-4 h-4" /> Start Voice Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 text-white font-bold text-xs sm:text-sm hover:bg-red-700 shadow-sm animate-pulse"
                    >
                      <MicOff className="w-4 h-4" /> Stop Recording
                    </button>
                  )}

                  {/* Audio Wave Visualizer Simulation */}
                  {isRecording && (
                    <div className="flex items-center gap-1 h-5">
                      <span className="w-1 bg-red-500 rounded-full animate-bounce h-4"></span>
                      <span className="w-1 bg-red-500 rounded-full animate-bounce h-6 delay-75"></span>
                      <span className="w-1 bg-red-500 rounded-full animate-bounce h-3 delay-150"></span>
                      <span className="w-1 bg-red-500 rounded-full animate-bounce h-5 delay-100"></span>
                    </div>
                  )}
                </div>

                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  {isRecording ? 'Listening to voice...' : 'Speak or type your response'}
                </span>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Structure your answer clearly:
1. Explain the core concept
2. Walk through an example or algorithmic steps
3. State time & space complexity
4. Discuss real-world trade-offs"
                  className="input-field min-h-[180px] sm:min-h-[220px] resize-y font-normal leading-relaxed text-sm"
                  rows={8}
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5 px-1 font-medium">
                  <span>Aim for clear, structured technical explanations</span>
                  <span>{wordCount} words • {answer.length} chars</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>AI Evaluating Answer...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Submit Answer for AI Scoring</span>
                    </div>
                  )}
                </button>

                {evaluation && currentIndex < questions.length - 1 && (
                  <button onClick={handleNext} className="btn-secondary">
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {evaluation && currentIndex === questions.length - 1 && (
                  <button onClick={completeSession} className="btn-primary bg-gradient-to-r from-emerald-600 to-teal-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete & View Final Report</span>
                  </button>
                )}
              </div>
            </div>

            {/* AI Evaluation Feedback Card */}
            {evaluation && (
              <div className="card border-l-4 border-l-blue-600 bg-gradient-to-br from-white to-blue-50/20 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">AI Feedback & Score</h3>
                  </div>
                  <span className="text-sm font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    Overall: {evaluation.overallScore}%
                  </span>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50/80 rounded-xl border border-blue-100">
                    <div className="text-xl sm:text-2xl font-black text-blue-700">{evaluation.correctnessScore}%</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5">Correctness</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50/80 rounded-xl border border-emerald-100">
                    <div className="text-xl sm:text-2xl font-black text-emerald-700">{evaluation.completenessScore}%</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5">Completeness</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50/80 rounded-xl border border-purple-100">
                    <div className="text-xl sm:text-2xl font-black text-purple-700">{evaluation.clarityScore}%</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5">Clarity</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block mb-1">Evaluator Notes:</strong>
                    {evaluation.feedback}
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs sm:text-sm">
                    <span className="font-bold text-emerald-900">Key Strengths: </span>
                    <span className="text-emerald-800">{evaluation.strengths}</span>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100 text-xs sm:text-sm">
                    <span className="font-bold text-amber-900">Areas to Improve: </span>
                    <span className="text-amber-800">{evaluation.improvements}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Session Stats */}
            <div className="card">
              <h3 className="font-bold text-slate-900 mb-3 text-sm sm:text-base">Session Monitor</h3>
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Current Question</span>
                  <span className="font-bold text-slate-800">{currentIndex + 1} of {questions.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Answered Questions</span>
                  <span className="font-bold text-emerald-600">{questions.filter(q => q.submitted === 'submitted').length}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Elapsed Time</span>
                  <span className="font-mono font-bold text-slate-800">{formatTime(totalTime)}</span>
                </div>
              </div>
            </div>

            {/* Questions Jump Navigation */}
            <div className="card">
              <h3 className="font-bold text-slate-900 mb-3 text-sm sm:text-base">Question Navigator</h3>
              <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-1 gap-2">
                {questions.map((q, i) => {
                  const isCurrent = i === currentIndex;
                  const isDone = q.submitted === 'submitted';
                  return (
                    <button
                      key={q.id}
                      onClick={() => { setCurrentIndex(i); setAnswer(''); setEvaluation(null); setTimeLeft(300); }}
                      className={`text-center lg:text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>Q{q.questionNumber}</span>
                      <span className="hidden lg:inline text-xs opacity-75">
                        {isDone ? 'Submitted ✓' : 'Pending'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
