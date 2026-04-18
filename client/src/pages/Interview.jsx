import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import QuestionCard from '../components/QuestionCard';
import VoiceInput from '../components/VoiceInput';

const Interview = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [mode, setMode] = useState(location.state?.mode || 'text');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Timers
  const [sessionTimer, setSessionTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);

  useEffect(() => {
    // If no questions in state, fetch session to get them (page refresh scenario)
    if (questions.length === 0) {
      api.get(`/session/${sessionId}`)
        .then(res => {
          setQuestions(res.data.questions.map(q => q.questionText));
          setMode(res.data.mode);
        })
        .catch(err => {
          setError('Failed to load session details.');
        });
    }

    // Prevent accidental navigation
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId, questions.length]);

  useEffect(() => {
    const sessionInterval = setInterval(() => setSessionTimer(prev => prev + 1), 1000);
    const questionInterval = setInterval(() => setQuestionTimer(prev => prev + 1), 1000);
    return () => {
      clearInterval(sessionInterval);
      clearInterval(questionInterval);
    };
  }, [currentIndex]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer before proceeding.');
      return;
    }
    
    setError('');
    
    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      questionText: questions[currentIndex],
      userAnswer: currentAnswer.trim()
    };
    setAnswers(newAnswers);
    
    setCurrentAnswer('');
    setQuestionTimer(0);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer for the final question.');
      return;
    }

    const finalAnswers = [...answers];
    finalAnswers[currentIndex] = {
      questionText: questions[currentIndex],
      userAnswer: currentAnswer.trim()
    };

    setLoading(true);
    setError('');

    try {
      await api.post(`/session/${sessionId}/submit`, {
        answers: finalAnswers,
        duration: sessionTimer
      });
      navigate(`/results/${sessionId}`);
    } catch (err) {
      setError("AI service is temporarily unavailable. Please try again later.");
      setLoading(false);
    }
  };

  if (questions.length === 0 && !error) {
    return <div className="p-8 flex justify-center"><span className="animate-pulse">Loading interview...</span></div>;
  }

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mock Interview</h2>
        <div className="flex space-x-4">
          <div className="bg-gray-100 px-4 py-2 rounded-lg font-mono text-gray-600 flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Session: {formatTime(sessionTimer)}
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-lg font-mono text-indigo-700 flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Question: {formatTime(questionTimer)}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700 shadow-sm transition-all">
          {error}
        </div>
      )}

      <QuestionCard 
        question={questions[currentIndex]} 
        index={currentIndex} 
        total={questions.length} 
      />

      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Your Answer</h4>
        
        {mode === 'voice' && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center space-y-3">
            <p className="text-sm text-gray-600">Speak your answer clearly. Your speech will be transcribed below.</p>
            <VoiceInput 
              onTranscriptChange={setCurrentAnswer} 
              disabled={loading}
            />
          </div>
        )}
        
        <textarea
          rows={6}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"
          placeholder="Type your answer here..."
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          disabled={loading}
        />

        <div className="mt-6 flex justify-end">
          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              Next Question
              <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`inline-flex items-center px-8 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Evaluating Answers...
                </>
              ) : error === "AI service is temporarily unavailable. Please try again later." ? 'Try Again' : 'Submit Interview'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;
