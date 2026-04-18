import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Setup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [config, setConfig] = useState({
    role: 'Frontend Dev',
    topic: 'React',
    difficulty: 'Medium',
    questionCount: 3,
    mode: 'Text'
  });

  const roles = ['Frontend Dev', 'Backend Dev', 'Full Stack', 'Data Analyst', 'DevOps', 'General SWE'];
  const topics = ['DSA', 'OS', 'DBMS', 'Computer Networks', 'React', 'Node.js', 'System Design', 'Behavioural'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const counts = [3, 5, 10];
  const modes = ['Text', 'Voice'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'questionCount' ? parseInt(value, 10) : value
    }));
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/session/start', {
        role: config.role,
        topic: config.topic,
        difficulty: config.difficulty.toLowerCase(),
        mode: config.mode.toLowerCase(),
        questionCount: config.questionCount
      });
      
      navigate(`/interview/${response.data.sessionId}`, { 
        state: { questions: response.data.questions, mode: config.mode.toLowerCase() } 
      });
    } catch (err) {
      setError("AI service is temporarily unavailable. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-2">Configure Your Interview</h1>
          <p className="text-indigo-100">Customize your mock session to target exactly what you need to practice.</p>
        </div>
        
        <form onSubmit={handleStart} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Target Role</label>
              <select name="role" value={config.role} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-gray-50">
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Focus Topic</label>
              <select name="topic" value={config.topic} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-gray-50">
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Difficulty Level</label>
              <select name="difficulty" value={config.difficulty} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-gray-50">
                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Number of Questions</label>
              <select name="questionCount" value={config.questionCount} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border bg-gray-50">
                {counts.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Input Mode</label>
              <div className="mt-2 flex items-center space-x-6">
                {modes.map(m => (
                  <label key={m} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value={m}
                      checked={config.mode === m}
                      onChange={handleChange}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 block text-base font-medium text-gray-700">
                      {m}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-75 cursor-not-allowed transform scale-95' : 'hover:shadow-lg'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Questions...
                </>
              ) : 'Start Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Setup;
