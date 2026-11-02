import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interviewApi } from '../api';
import { toast } from 'sonner';
import { ArrowLeft, Award, ChevronDown, ChevronUp } from 'lucide-react';

export default function InterviewResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    try {
      const data = await interviewApi.getSession(parseInt(sessionId));
      setResults(data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load results');
      navigate('/dashboard');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const questions = results?.questions || [];
  const evaluations = questions.filter(q => q.submitted === 'submitted');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/dashboard" className="p-1 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Interview Results</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button onClick={() => navigate('/setup')} className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4">New</button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3">Dashboard</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Overall Score */}
        <div className="card mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-50 mb-3 sm:mb-4">
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Interview Complete!</h2>
          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-4xl sm:text-5xl font-bold text-blue-600">
              {Math.round(evaluations.reduce((sum, q) => sum + (q.evaluation?.overallScore || 0), 0) / (evaluations.length || 1))}
            </span>
            <span className="text-xl sm:text-2xl text-gray-400">/100</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">{evaluations.length} of {questions.length} questions answered</p>
        </div>

        {/* Per-Question Results */}
        <div className="space-y-4">
          {questions.map((q, index) => {
            const evalData = q.evaluation;
            const isExpanded = expandedCard === q.id;
            const score = evalData?.overallScore || 0;

            return (
              <div key={q.id} className="card">
                <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-gray-500 font-medium">Question {index + 1}</span>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base mt-1 leading-snug">{q.questionText}</h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
                    <div className="text-[11px] text-gray-500">/100</div>
                  </div>
                </div>

                {/* Score bars */}
                {evalData && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                    <div>
                      <div className="text-[11px] sm:text-xs text-gray-500 mb-1 truncate">Correctness</div>
                      <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${getScoreBg(evalData.correctnessScore)} rounded-full`} style={{ width: `${evalData.correctnessScore}%` }} />
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-600 mt-0.5 font-medium">{evalData.correctnessScore}%</div>
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs text-gray-500 mb-1 truncate">Completeness</div>
                      <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${getScoreBg(evalData.completenessScore)} rounded-full`} style={{ width: `${evalData.completenessScore}%` }} />
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-600 mt-0.5 font-medium">{evalData.completenessScore}%</div>
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-xs text-gray-500 mb-1 truncate">Clarity</div>
                      <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${getScoreBg(evalData.clarityScore)} rounded-full`} style={{ width: `${evalData.clarityScore}%` }} />
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-600 mt-0.5 font-medium">{evalData.clarityScore}%</div>
                    </div>
                  </div>
                )}

                {/* Toggle details */}
                {evalData && (
                  <>
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : q.id)}
                      className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {isExpanded ? 'Hide Feedback' : 'Show Feedback'}
                    </button>

                    {isExpanded && (
                      <div className="mt-3.5 space-y-3.5 border-t border-gray-100 pt-3.5">
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Your Answer</h4>
                          <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2.5 sm:p-3 rounded-lg leading-relaxed">{q.userAnswer}</p>
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Feedback</h4>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{evalData.feedback}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                          <div className="p-2.5 sm:p-3 bg-green-50 rounded-lg">
                            <h4 className="text-xs sm:text-sm font-semibold text-green-800 mb-1">Strengths</h4>
                            <p className="text-xs sm:text-sm text-green-700 leading-relaxed">{evalData.strengths}</p>
                          </div>
                          <div className="p-2.5 sm:p-3 bg-yellow-50 rounded-lg">
                            <h4 className="text-xs sm:text-sm font-semibold text-yellow-800 mb-1">Areas to Improve</h4>
                            <p className="text-xs sm:text-sm text-yellow-700 leading-relaxed">{evalData.improvements}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Ideal Answer</h4>
                          <p className="text-xs sm:text-sm text-gray-600 bg-blue-50 p-2.5 sm:p-3 rounded-lg leading-relaxed">{evalData.idealAnswer}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
