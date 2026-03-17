import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Board from '../components/Board';
import FileUpload from '../components/FileUpload';
import { ArrowLeft, Users, Calendar, Settings } from 'lucide-react';
import { format } from 'date-fns';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-12 h-screen items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!project) return <div className="p-8 text-center text-gray-500">Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm mb-4">
        <Link to="/projects" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex items-center transition-colors">
          <ArrowLeft size={16} className="mr-1" />
          Back to Projects
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl">{project.description || 'No description provided.'}</p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Settings size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-sm">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-3 text-blue-600 dark:text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Team Members</p>
              <div className="flex -space-x-2 mt-1">
                {project.members && project.members.map((member, i) => (
                  <div key={member._id} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 z-10" style={{ zIndex: 10 - i }} title={member.name}>
                    {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mr-3 text-purple-600 dark:text-purple-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Deadline</p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'No deadline set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Board projectId={project._id} />
      
      <FileUpload projectId={project._id} />
    </div>
  );
};

export default ProjectDetail;
