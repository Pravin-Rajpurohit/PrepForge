import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import WeakAreaBadge from '../components/WeakAreaBadge';

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get(`/session/${sessionId}`);
        setSession(response.data);
      } catch (err) {
        setError('Failed to load session results.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Analyzing your interview performance...</p>
      </div>
    </div>;
  }

  if (error || !session) {
    return <div className="p-8 text-center text-red-500">{error || 'Session not found'}</div>;
  }

  // Determine color and message based on score
  const getScoreInfo = (score) => {
    if (score >= 8) return { color: 'text-green-600', bg: 'bg-green-100', msg: 'Excellent work!' };
    if (score >= 5) return { color: 'text-yellow-600', bg: 'bg-yellow-100', msg: 'Keep practicing!' };
    return { color: 'text-red-600', bg: 'bg-red-100', msg: 'Needs significant improvement.' };
  };

  const scoreInfo = getScoreInfo(session.totalScore);
  
  // Extract weak areas specifically from this session
  const lowScoringQuestions = session.questions.filter(q => q.score < 6);
  const hasWeakAreas = lowScoringQuestions.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Summary */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-8">
        <div className="p-8 md:p-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Results</h1>
          <p className="text-gray-500 mb-8">Role: {session.role} &bull; Topic: {session.topic} &bull; Difficulty: {session.difficulty}</p>
          
          <div className="inline-flex flex-col items-center justify-center p-8 rounded-full border-8 border-gray-50 shadow-inner mb-6 relative w-48 h-48">
            <span className={`text-6xl font-extrabold ${scoreInfo.color}`}>{session.totalScore}</span>
            <span className="text-gray-400 font-medium mt-1">out of 10</span>
          </div>
          
          <h2 className={`text-2xl font-bold ${scoreInfo.color} mb-2`}>{scoreInfo.msg}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review the detailed feedback below for each question to understand your strengths and areas for improvement.
          </p>
        </div>
        
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate('/setup')}
            className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-indigo-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      {/* Weak Areas Detected */}
      {hasWeakAreas && (
        <div className="bg-orange-50 rounded-xl p-6 mb-8 border border-orange-100 shadow-sm">
          <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            Weak Areas Detected
          </h3>
          <p className="text-sm text-orange-700 mb-4">Based on this session, you should focus your practice on:</p>
          <div className="flex flex-wrap gap-2">
            <WeakAreaBadge label={session.topic} />
          </div>
        </div>
      )}

      {/* Questions Breakdown */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 ml-2">Detailed Evaluation</h3>
        {session.questions.map((q, idx) => {
          const qScoreInfo = getScoreInfo(q.score);
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-start">
                <div className="pr-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Question {idx + 1}</span>
                  <h4 className="text-lg font-medium text-gray-900">{q.questionText}</h4>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${qScoreInfo.bg} ${qScoreInfo.color}`}>
                  Score: {q.score}/10
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Your Answer</span>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap">{q.userAnswer}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1 block flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Strength
                    </span>
                    <p className="text-sm text-green-800">{q.strength}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1 block flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Improvement
                    </span>
                    <p className="text-sm text-orange-800">{q.improvement}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 block">AI Feedback</span>
                  <p className="text-gray-700 leading-relaxed text-sm">{q.aiFeedback}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Results;
