import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interviewApi } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, Clock, Mic, MicOff, Send, CheckCircle2, 
  Brain, AlertCircle, Sparkles, ChevronRight, MessageSquare,
  Lock, FastForward, Award, Volume2, Wand2, ShieldAlert
} from 'lucide-react';

const FILLER_WORDS = ['hmm', 'um', 'uh', 'er', 'ah', 'like', 'basically', 'actually'];

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [interimText, setInterimText] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadSession();
    // Test browser Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
    return () => {
      clearInterval(timerRef.current);
      stopRecordingInternal();
    };
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
      setQuestions(data.questions || []);
      // If some questions are already submitted, resume at the first pending question
      const firstPending = (data.questions || []).findIndex(q => q.submitted !== 'submitted' && q.submitted !== 'skipped');
      if (firstPending !== -1) {
        setCurrentIndex(firstPending);
      }
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load session');
      navigate('/dashboard');
    }
  };

  // --- Real-time Speech to Text Transcription ---
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please type your response.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info('🎙️ Listening... Speak your technical explanation.');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let finalized = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalized += transcriptChunk;
          } else {
            interim += transcriptChunk;
          }
        }

        if (finalized) {
          setAnswer(prev => {
            const trimmedPrev = prev.trim();
            const chunk = finalized.trim();
            if (!trimmedPrev) return chunk;
            // Add clean punctuation/spacing
            return `${trimmedPrev} ${chunk}`;
          });
        }
        setInterimText(interim);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission blocked. Please allow mic permissions in your browser bar.');
          stopRecordingInternal();
        }
      };

      recognition.onend = () => {
        // Only mark stopped if user didn't request continuous
        setIsRecording(false);
        setInterimText('');
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Recognition start error:', err);
      toast.error('Could not start microphone: ' + err.message);
      setIsRecording(false);
    }
  };

  const stopRecordingInternal = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    setInterimText('');
  };

  const stopRecording = () => {
    stopRecordingInternal();
    toast.success('Voice recording paused. You can refine or submit your answer.');
  };

  // Clean filler words ("hmm", "um", "uh", "like")
  const cleanFillerWords = () => {
    if (!answer.trim()) return;
    let cleaned = answer;
    FILLER_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b[,]?`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    // Clean redundant spacing
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    setAnswer(cleaned);
    toast.success('Refined answer by removing verbal filler words!');
  };

  // Detect filler words count in real-time
  const detectedFillers = (() => {
    const combined = `${answer} ${interimText}`.toLowerCase();
    const tokens = combined.match(/\b[a-z']+\b/g) || [];
    return tokens.filter(t => FILLER_WORDS.includes(t));
  })();

  const handleSubmit = async () => {
    if (!answer.trim() || answer.trim().length < 10) {
      toast.error('Please provide a complete answer (at least 10 characters)');
      return;
    }

    if (isRecording) {
      stopRecordingInternal();
    }

    setSubmitting(true);
    try {
      const currentQ = questions[currentIndex];
      const result = await interviewApi.submitAnswer({
        questionId: String(currentQ.id),
        sessionId,
        answer: answer.trim(),
      });

      setEvaluation(result.evaluation);
      
      // Update state for this question
      setQuestions(prev => {
        const updated = [...prev];
        updated[currentIndex] = {
          ...updated[currentIndex],
          submitted: 'submitted',
          userAnswer: answer.trim(),
          evaluation: result.evaluation
        };
        return updated;
      });

      toast.success('Question evaluated! Check feedback below and proceed.');
    } catch (err) {
      toast.error('Evaluation error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipQuestion = () => {
    if (isRecording) {
      stopRecordingInternal();
    }

    setQuestions(prev => {
      const updated = [...prev];
      updated[currentIndex] = {
        ...updated[currentIndex],
        submitted: 'skipped',
        userAnswer: '(Skipped by candidate)'
      };
      return updated;
    });

    toast.info(`Question ${currentIndex + 1} skipped.`);
    advanceNextQuestion();
  };

  const advanceNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswer('');
      setInterimText('');
      setEvaluation(null);
      setTimeLeft(300);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Preparing your live interview room...</span>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const isQuestionAnswered = currentQ.submitted === 'submitted' || !!evaluation;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Live Session HUD Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link 
              to="/dashboard" 
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">Real-Time Mock Interview</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
            {/* Session Time */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono">{formatTime(totalTime)}</span>
            </div>

            {/* Question Counter Badge */}
            <span className="text-xs sm:text-sm font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200/60">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6">
        
        {/* Session Progress Stepper */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Interview Stage Progress</span>
            <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* Main Question & Answer Column */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Question Box */}
            <div className="card shadow-md border-slate-200/90 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3.5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-800">
                    Question {currentIndex + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-500 capitalize">
                    {currentQ.questionDifficulty || 'Senior Level'}
                  </span>
                </div>

                {/* Per-question countdown */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  timeLeft <= 60 
                    ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-400 animate-pulse' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time: {formatTime(timeLeft)}</span>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-4">
                {currentQ.questionText}
              </h2>

              {/* Real-Time Speech Recording Controls */}
              <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={isQuestionAnswered}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Mic className="w-4 h-4" /> Start Voice Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs sm:text-sm hover:bg-rose-700 shadow-sm animate-pulse"
                    >
                      <MicOff className="w-4 h-4" /> Stop Recording
                    </button>
                  )}

                  {/* Clean filler words button */}
                  {detectedFillers.length > 0 && !isQuestionAnswered && (
                    <button
                      onClick={cleanFillerWords}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-semibold transition-colors"
                      title="Filter out verbal fillers like hmm, um, uh"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Remove Fillers ({detectedFillers.length})</span>
                    </button>
                  )}
                </div>

                {/* Animated Speech Waveform when recording */}
                {isRecording && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                    <span>Transcribing live speech...</span>
                    <div className="flex items-end gap-0.5 h-4 ml-1">
                      <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-3"></span>
                      <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-4" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Speech Interim Preview Banner */}
              {interimText && (
                <div className="mb-3 p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 italic flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-blue-600 flex-shrink-0 animate-pulse" />
                  <span className="truncate">Hearing: "{interimText}"</span>
                </div>
              )}

              {/* Answer Text Area */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={isQuestionAnswered}
                  rows={6}
                  className={`input-field font-sans text-sm sm:text-base resize-y transition-all ${
                    isRecording ? 'border-emerald-400 ring-2 ring-emerald-400/20' : ''
                  }`}
                  placeholder="Speak your answer with the microphone or type your response here... Be structured, thorough, and mention trade-offs."
                />
              </div>

              {/* Answer Meta Bar: Words, Characters & Filler Word tracker */}
              <div className="mt-2.5 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 px-1">
                <div className="flex items-center gap-3">
                  <span><strong>{wordCount}</strong> words</span>
                  <span>•</span>
                  <span><strong>{answer.length}</strong> characters</span>
                </div>

                {/* Real-time speech clarity feedback */}
                {detectedFillers.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-medium">
                    <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span>{detectedFillers.length} filler word{detectedFillers.length > 1 ? 's' : ''} detected ({detectedFillers.slice(0, 3).join(', ')})</span>
                  </div>
                )}
              </div>

              {/* Actions Footer: Submit / Skip / Next */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                {!isQuestionAnswered ? (
                  <>
                    <button
                      onClick={handleSkipQuestion}
                      type="button"
                      className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                      <FastForward className="w-4 h-4" />
                      <span>Skip Question</span>
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !answer.trim()}
                      className="btn-primary w-full sm:w-auto text-xs sm:text-sm py-2.5 px-6 inline-flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>AI Evaluating Response...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-end">
                    <button
                      onClick={advanceNextQuestion}
                      className="btn-primary w-full sm:w-auto text-xs sm:text-sm py-2.5 px-7 inline-flex items-center justify-center gap-2"
                    >
                      <span>
                        {currentIndex < questions.length - 1 
                          ? `Proceed to Question ${currentIndex + 2}` 
                          : 'Complete & View Results'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Instant AI Evaluation Card (Revealed after submission) */}
            {evaluation && (
              <div className="card bg-gradient-to-br from-white to-indigo-50/40 border-primary-200 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-600" />
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">AI Evaluation Summary</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary-600">{evaluation.overallScore}</span>
                    <span className="text-xs text-slate-400 font-semibold"> / 100</span>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  <div className="text-center p-2.5 sm:p-3 bg-blue-50/80 rounded-xl border border-blue-100">
                    <div className="text-lg sm:text-xl font-black text-blue-700">{evaluation.correctnessScore}%</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5">Correctness</div>
                  </div>
                  <div className="text-center p-2.5 sm:p-3 bg-emerald-50/80 rounded-xl border border-emerald-100">
                    <div className="text-lg sm:text-xl font-black text-emerald-700">{evaluation.completenessScore}%</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5">Completeness</div>
                  </div>
                  <div className="text-center p-2.5 sm:p-3 bg-indigo-50/80 rounded-xl border border-indigo-100">
                    <div className="text-lg sm:text-xl font-black text-indigo-700">{evaluation.clarityScore}%</div>
                    <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5">Clarity</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed border border-slate-200/60">
                    <strong className="text-slate-900 block mb-1">Evaluator Notes:</strong>
                    {evaluation.feedback}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs sm:text-sm">
                      <span className="font-bold text-emerald-900 block mb-0.5">Demonstrated Strengths:</span>
                      <span className="text-emerald-800">{evaluation.strengths}</span>
                    </div>

                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs sm:text-sm">
                      <span className="font-bold text-amber-900 block mb-0.5">Areas to Refine:</span>
                      <span className="text-amber-800">{evaluation.improvements}</span>
                    </div>
                  </div>
                </div>

                {/* Next Question CTA Button inside card */}
                <div className="mt-4 pt-3 border-t border-indigo-100 flex justify-end">
                  <button
                    onClick={advanceNextQuestion}
                    className="btn-primary text-xs sm:text-sm py-2 px-6 inline-flex items-center gap-1.5"
                  >
                    <span>
                      {currentIndex < questions.length - 1 
                        ? `Continue to Question ${currentIndex + 2}` 
                        : 'Finalize & View Report'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sequential Interview Sidebar (No random jumping!) */}
          <div className="space-y-4">
            
            {/* Session Monitor */}
            <div className="card">
              <h3 className="font-bold text-slate-900 mb-3 text-sm sm:text-base">Session Monitor</h3>
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Current Question</span>
                  <span className="font-bold text-slate-800">{currentIndex + 1} of {questions.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Answered Questions</span>
                  <span className="font-bold text-emerald-600">
                    {questions.filter(q => q.submitted === 'submitted').length}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total Elapsed</span>
                  <span className="font-mono font-bold text-slate-800">{formatTime(totalTime)}</span>
                </div>
              </div>
            </div>

            {/* Sequential Question Progress List */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Interview Flow</h3>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                  Sequential Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Questions are administered one by one to simulate an authentic technical round.
              </p>

              <div className="space-y-2">
                {questions.map((q, i) => {
                  const isCurrent = i === currentIndex;
                  const isDone = q.submitted === 'submitted';
                  const isSkipped = q.submitted === 'skipped';
                  const isLocked = i > currentIndex;

                  return (
                    <div
                      key={q.id || i}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
                        isCurrent
                          ? 'bg-primary-50 text-primary-800 border-primary-300 ring-1 ring-primary-400/40 shadow-xs'
                          : isDone
                          ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200'
                          : isSkipped
                          ? 'bg-slate-100 text-slate-500 border-slate-200 line-through'
                          : 'bg-slate-50 text-slate-400 border-slate-200/60 opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse flex-shrink-0" />
                        ) : isSkipped ? (
                          <FastForward className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <span>Question {i + 1}</span>
                      </div>

                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        {isCurrent ? (
                          <span className="text-primary-700">In Progress</span>
                        ) : isDone ? (
                          <span className="text-emerald-700">Answered ✓</span>
                        ) : isSkipped ? (
                          <span className="text-slate-400">Skipped</span>
                        ) : (
                          <span className="text-slate-400">Locked</span>
                        )}
                      </span>
                    </div>
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
