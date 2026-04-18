import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import ScoreChart from '../components/ScoreChart';
import WeakAreaBadge from '../components/WeakAreaBadge';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/user/dashboard');
        setData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8"><span className="text-indigo-600 font-medium animate-pulse">Loading dashboard...</span></div>;
  }

  if (error) {
    return <div className="p-8 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Here's an overview of your interview preparation.</p>
        </div>
        <button
          onClick={() => navigate('/setup')}
          className="mt-4 md:mt-0 inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Start New Mock Interview
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
          <dd className="mt-2 text-3xl font-bold text-gray-900">{data.totalSessions}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
          <dd className="mt-2 text-3xl font-bold text-indigo-600">{data.averageScore.toFixed(1)}<span className="text-base text-gray-400 font-normal">/10</span></dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Best Score</dt>
          <dd className="mt-2 text-3xl font-bold text-green-600">{data.bestScore.toFixed(1)}<span className="text-base text-gray-400 font-normal">/10</span></dd>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Score Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Score Trend</h3>
          <ScoreChart data={data.scoreHistory} />
        </div>

        {/* Topic Breakdown Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Topic</h3>
          {data.topicBreakdown && data.topicBreakdown.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topicBreakdown} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="topic" stroke="#6b7280" fontSize={12} tickMargin={10} />
                  <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} tickMargin={10} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="avgScore" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">No topic data available yet.</div>
          )}
        </div>
      </div>

      {/* Weak Areas Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Areas to Improve</h3>
        {data.weakAreas && data.weakAreas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {[...new Set(data.weakAreas)].map((area, index) => (
              <WeakAreaBadge key={index} label={area} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg inline-block">No weak areas detected yet. Keep practicing!</p>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
