import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interviewApi } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Mic, MicOff, Send, CheckCircle } from 'lucide-react';

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
    if (!answer.trim() || answer.length < 10) {
      toast.error('Please provide a detailed answer (at least 10 characters)');
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
      toast.success('Answer submitted!');
    } catch (err) {
      toast.error('Failed to submit answer');
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
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/dashboard" className="p-1 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
            <span className="font-bold text-gray-900 text-sm sm:text-base truncate">Interview Session</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-gray-600 text-xs sm:text-sm">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-mono">{formatTime(totalTime)}</span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Q{currentIndex + 1}/{questions.length}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Progress bar */}
        <div className="mb-6 sm:mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Question card */}
            <div className="card">
              <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-[11px] sm:text-xs font-medium">
                  {currentQ.questionDifficulty || 'Medium'}
                </span>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className={`font-mono font-medium ${timeLeft <= 60 ? 'text-red-600 font-bold' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 leading-snug">{currentQ.questionText}</h2>

              {/* Voice input */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                {!isRecording ? (
                  <button onClick={startRecording} className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium">
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </button>
                ) : (
                  <button onClick={stopRecording} className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium animate-pulse">
                    <MicOff className="w-4 h-4" />
                    Stop Recording
                  </button>
                )}
                <span className="text-[11px] sm:text-xs text-gray-500">Speak or type your answer below</span>
              </div>

              {/* Answer textarea */}
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here... Be detailed and thorough."
                className="input-field min-h-[160px] sm:min-h-[200px] resize-y font-normal"
                rows={7}
              />

              {/* Submit button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Evaluating...' : 'Submit Answer'}
                </button>
                {evaluation && currentIndex < questions.length - 1 && (
                  <button onClick={handleNext} className="btn-secondary w-full sm:w-auto">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Next Question
                  </button>
                )}
                {evaluation && currentIndex === questions.length - 1 && (
                  <button onClick={completeSession} className="btn-primary w-full sm:w-auto">
                    Finish Interview
                  </button>
                )}
              </div>
            </div>

            {/* Evaluation feedback */}
            {evaluation && (
              <div className="card border-l-4 border-l-blue-500">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base">AI Evaluation</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                  <div className="text-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{evaluation.correctnessScore}</div>
                    <div className="text-[11px] sm:text-xs text-gray-500">Correctness</div>
                  </div>
                  <div className="text-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{evaluation.completenessScore}</div>
                    <div className="text-[11px] sm:text-xs text-gray-500">Completeness</div>
                  </div>
                  <div className="text-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600">{evaluation.clarityScore}</div>
                    <div className="text-[11px] sm:text-xs text-gray-500">Clarity</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{evaluation.feedback}</p>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <span className="text-xs sm:text-sm font-semibold text-green-800">Strengths: </span>
                    <span className="text-xs sm:text-sm text-green-700">{evaluation.strengths}</span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <span className="text-xs sm:text-sm font-semibold text-yellow-800">Improvements: </span>
                    <span className="text-xs sm:text-sm text-yellow-700">{evaluation.improvements}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Session Info</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Questions</span><span className="font-medium">{currentIndex + 1}/{questions.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Answered</span><span className="font-medium">{questions.filter(q => q.submitted === 'submitted').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Time Elapsed</span><span className="font-mono">{formatTime(totalTime)}</span></div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Questions List</h3>
              <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-1 gap-1.5 sm:gap-2">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIndex(i); setAnswer(''); setEvaluation(null); setTimeLeft(300); }}
                    className={`text-center lg:text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                      i === currentIndex ? 'bg-blue-100 text-blue-700 font-semibold ring-1 ring-blue-400' :
                      q.submitted === 'submitted' ? 'bg-green-50 text-green-700' :
                      'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Q{q.questionNumber} {q.submitted === 'submitted' ? '✓' : '○'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
