import Session from '../models/Session.js';
import User from '../models/User.js';

export const getDashboardData = async (req, res) => {
  const userId = req.user._id;

  const sessions = await Session.find({ userId, totalScore: { $exists: true } })
    .sort({ completedAt: 1 }); // Ascending for chart

  const totalSessions = sessions.length;
  let averageScore = 0;
  
  if (totalSessions > 0) {
    const totalScoreSum = sessions.reduce((acc, session) => acc + session.totalScore, 0);
    averageScore = Math.round((totalScoreSum / totalSessions) * 10) / 10;
  }

  const scoreHistory = sessions.map(session => ({
    date: session.completedAt.toISOString().split('T')[0],
    score: session.totalScore
  }));

  // Topic breakdown
  const topicStats = {};
  sessions.forEach(session => {
    if (!topicStats[session.topic]) {
      topicStats[session.topic] = { total: 0, count: 0 };
    }
    topicStats[session.topic].total += session.totalScore;
    topicStats[session.topic].count += 1;
  });

  const topicBreakdown = Object.keys(topicStats).map(topic => ({
    topic,
    avgScore: Math.round((topicStats[topic].total / topicStats[topic].count) * 10) / 10
  }));

  const user = await User.findById(userId);

  res.json({
    totalSessions,
    averageScore,
    bestScore: sessions.length > 0 ? Math.max(...sessions.map(s => s.totalScore)) : 0,
    scoreHistory,
    topicBreakdown,
    weakAreas: user.weakAreas
  });
};
