import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Activity,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/analytics');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const taskData = {
    labels: ['Completed', 'Pending', 'In Progress'],
    datasets: [
      {
        data: stats ? [stats.tasks.completed, stats.tasks.pending, stats.tasks.inProgress] : [0,0,0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [1, 3, 2, 5, 4, 6, stats?.tasks.completed || 0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name.split(' ')[0]}!</p>
        </div>
        <Link 
          to="/projects" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle size={18} className="mr-2" />
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={stats?.totalProjects || 0} 
          icon={<Briefcase className="text-purple-600 dark:text-purple-400" size={24} />} 
          bgColor="bg-purple-100 dark:bg-purple-900/30" 
        />
        <StatCard 
          title="Total Tasks" 
          value={stats?.tasks.total || 0} 
          icon={<Activity className="text-blue-600 dark:text-blue-400" size={24} />} 
          bgColor="bg-blue-100 dark:bg-blue-900/30" 
        />
        <StatCard 
          title="Completed Tasks" 
          value={stats?.tasks.completed || 0} 
          icon={<CheckCircle className="text-green-600 dark:text-green-400" size={24} />} 
          bgColor="bg-green-100 dark:bg-green-900/30" 
        />
        <StatCard 
          title="Pending Tasks" 
          value={stats?.tasks.pending || 0} 
          icon={<Clock className="text-orange-600 dark:text-orange-400" size={24} />} 
          bgColor="bg-orange-100 dark:bg-orange-900/30" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productivity Overview</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <Line data={lineData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Status</h2>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            {stats && stats.tasks.total > 0 ? (
              <div className="h-[250px] w-full">
                <Doughnut 
                  data={taskData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: 'gray' } } }
                  }} 
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <CheckCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p>No tasks found. Create a project to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center transition-transform hover:-translate-y-1 duration-300">
    <div className={`p-4 rounded-lg ${bgColor} mr-4`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
    </div>
  </div>
);

export default Dashboard;
