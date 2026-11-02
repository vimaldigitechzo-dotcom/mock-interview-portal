import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interviewApi } from '../api';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  LayoutDashboard, 
  Share2, 
  Check, 
  BookOpen, 
  Zap, 
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function InterviewResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    try {
      const data = await interviewApi.getSession(parseInt(sessionId));
      setResults(data);
      // Automatically expand first answered question if available
      const firstAnswered = (data?.questions || []).find(q => q.submitted === 'submitted' || q.evaluation);
      if (firstAnswered) {
        setExpandedCard(firstAnswered.id);
      }
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load interview results');
      navigate('/dashboard');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getTierInfo = (score) => {
    if (score >= 85) return { label: 'Exceptional Performance', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Ready for senior-level technical interviews' };
    if (score >= 70) return { label: 'Strong Pass', badge: 'bg-blue-50 text-blue-700 border-blue-200', desc: 'Solid technical depth with room for polish' };
    if (score >= 50) return { label: 'Developing Competency', badge: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'Review key concept explanations and clarity' };
    return { label: 'Needs Practice', badge: 'bg-rose-50 text-rose-700 border-rose-200', desc: 'Focus on core fundamentals before next attempt' };
  };

  const copySummary = () => {
    const text = `🎯 AI Mock Interview Performance: ${overallScore}/100 on ${results?.topic || 'Technical'} (${results?.difficulty || 'General'}). Completed on AI Mock Interview Portal.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Performance summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
          <BrainCircuit className="w-5 h-5 text-primary-600 absolute inset-0 m-auto" />
        </div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Calculating comprehensive evaluation...</p>
      </div>
    );
  }

  const questions = results?.questions || [];
  const evaluations = questions.filter(q => q.submitted === 'submitted' || q.evaluation);
  const overallScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, q) => sum + (q.evaluation?.overallScore || 0), 0) / evaluations.length)
    : Math.round(results?.overallScore || 0);

  const avgCorrectness = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, q) => sum + (q.evaluation?.correctnessScore || 0), 0) / evaluations.length)
    : 0;

  const avgCompleteness = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, q) => sum + (q.evaluation?.completenessScore || 0), 0) / evaluations.length)
    : 0;

  const avgClarity = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, q) => sum + (q.evaluation?.clarityScore || 0), 0) / evaluations.length)
    : 0;

  const tier = getTierInfo(overallScore);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link 
              to="/dashboard" 
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">Evaluation Report</h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Session #{sessionId}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate capitalize">
                {results?.topic || 'General'} • {results?.difficulty || 'Practice'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <button
              onClick={copySummary}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Copy Summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            <Link 
              to="/setup" 
              className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake / New</span>
            </Link>
            <Link 
              to="/dashboard" 
              className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3 inline-flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-5 sm:pt-8 space-y-6">
        
        {/* Performance Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-8 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Interview Completed</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Comprehensive Assessment Report
              </h2>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                {tier.desc}. Evaluated with natural language comprehension across technical correctness, completeness of arguments, and answer clarity.
              </p>

              {/* Status Pill */}
              <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tier.badge}`}>
                  <Award className="w-3.5 h-3.5" />
                  {tier.label}
                </span>
                <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  {evaluations.length} of {questions.length} Questions Answered
                </span>
              </div>
            </div>

            {/* Score Ring / Radial Display */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl backdrop-blur-md">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-indigo-300">
                    {overallScore}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    Overall / 100
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Metric Bars */}
          <div className="relative z-10 mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-3 sm:gap-6 text-center md:text-left">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span className="truncate">Correctness</span>
                <span className="font-bold text-white">{avgCorrectness}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-700" 
                  style={{ width: `${avgCorrectness}%` }} 
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span className="truncate">Completeness</span>
                <span className="font-bold text-white">{avgCompleteness}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full transition-all duration-700" 
                  style={{ width: `${avgCompleteness}%` }} 
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span className="truncate">Clarity</span>
                <span className="font-bold text-white">{avgClarity}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-400 rounded-full transition-all duration-700" 
                  style={{ width: `${avgClarity}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question by Question Accordion Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              <span>Detailed Question Feedback</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Click any question to inspect feedback
            </span>
          </div>

          {questions.map((q, index) => {
            const evalData = q.evaluation;
            const isExpanded = expandedCard === q.id;
            const score = evalData?.overallScore || 0;
            const isSubmitted = q.submitted === 'submitted' || !!evalData;

            return (
              <div 
                key={q.id || index} 
                className={`card transition-all duration-200 border ${
                  isExpanded ? 'border-primary-200 shadow-md ring-1 ring-primary-500/20' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Header row */}
                <div 
                  className="cursor-pointer select-none"
                  onClick={() => setExpandedCard(isExpanded ? null : q.id)}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Question {index + 1}
                        </span>
                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Answered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Skipped
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">
                        {q.questionText}
                      </h4>
                    </div>

                    {/* Score badge & chevron */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isSubmitted ? (
                        <div className="text-right">
                          <div className={`text-xl sm:text-2xl font-black ${getScoreColor(score)}`}>
                            {score}
                          </div>
                          <div className="text-[10px] uppercase font-semibold text-slate-400">/ 100</div>
                        </div>
                      ) : (
                        <div className="text-xs font-medium text-slate-400 italic">No score</div>
                      )}

                      <div className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Micro progress bar visible when collapsed */}
                  {evalData && (
                    <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>Accuracy</span>
                          <span className="font-semibold">{evalData.correctnessScore}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${getScoreBg(evalData.correctnessScore)} rounded-full`} style={{ width: `${evalData.correctnessScore}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>Depth</span>
                          <span className="font-semibold">{evalData.completenessScore}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${getScoreBg(evalData.completenessScore)} rounded-full`} style={{ width: `${evalData.completenessScore}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>Clarity</span>
                          <span className="font-semibold">{evalData.clarityScore}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${getScoreBg(evalData.clarityScore)} rounded-full`} style={{ width: `${evalData.clarityScore}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-4 animate-in fade-in duration-200">
                    
                    {/* User Answer Container */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                        <span>Your Response</span>
                      </h5>
                      <div className="text-xs sm:text-sm text-slate-700 bg-slate-50/90 border border-slate-200/80 p-3 sm:p-4 rounded-xl leading-relaxed whitespace-pre-wrap font-sans">
                        {q.userAnswer || <span className="text-slate-400 italic">No response submitted for this question.</span>}
                      </div>
                    </div>

                    {/* AI Assessment Commentary */}
                    {evalData?.feedback && (
                      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 sm:p-4">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1 flex items-center gap-1.5">
                          <BrainCircuit className="w-3.5 h-3.5 text-primary-600" />
                          <span>AI Evaluator Assessment</span>
                        </h5>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {evalData.feedback}
                        </p>
                      </div>
                    )}

                    {/* Strengths & Improvements Grid */}
                    {evalData && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>Demonstrated Strengths</span>
                          </h5>
                          <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                            {evalData.strengths || 'Provided clear context and appropriate terminology.'}
                          </p>
                        </div>

                        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1.5 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>Areas for Improvement</span>
                          </h5>
                          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                            {evalData.improvements || 'Consider supplementing the answer with concrete edge cases or architectural trade-offs.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Model Ideal Answer */}
                    {evalData?.idealAnswer && (
                      <div className="rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-3.5 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-blue-600" />
                            <span>Benchmark Ideal Response</span>
                          </h5>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                            Expert Reference
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {evalData.idealAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Action Footer */}
        <div className="card text-center p-6 sm:p-8 bg-gradient-to-b from-white to-slate-50 border border-slate-200 space-y-4">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto text-primary-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Ready for your next round?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
              Practicing multiple sessions builds cognitive muscle memory and directly increases offer rates across top tech companies.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Link to="/setup" className="btn-primary w-full sm:w-auto text-xs sm:text-sm py-2 px-6">
              Start Next Session
            </Link>
            <Link to="/dashboard" className="btn-secondary w-full sm:w-auto text-xs sm:text-sm py-2 px-5">
              View Analytics Dashboard
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
