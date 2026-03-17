import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Board from '../components/Board';
import FileUpload from '../components/FileUpload';
import { ArrowLeft, Users, Calendar, Settings, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

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

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchAllUsers = async () => {
    try {
      const { data } = await api.get('/users');
      // Filter out users already in the project
      const memberIds = project.members.map(m => m._id);
      setAllUsers(data.filter(u => !memberIds.includes(u._id)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMemberClick = () => {
    fetchAllUsers();
    setShowAddMemberModal(true);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.post(`/projects/${id}/members`, { userId: selectedUser });
      setShowAddMemberModal(false);
      setSelectedUser('');
      fetchProject();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12 h-screen items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!project) return <div className="p-8 text-center text-gray-500">Project not found</div>;

  const isOwner = project.owner && project.owner._id === user._id;

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
            <div className="flex-1">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Team Members</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex flex-wrap gap-2">
                  {project.members && project.members.map((member, i) => (
                    <div key={member._id} className="relative group flex items-center bg-gray-100 dark:bg-gray-700 rounded-full pl-1 pr-3 py-1 border border-gray-200 dark:border-gray-600">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium text-white mr-2" title={member.email}>
                        {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">{member.name}</span>
                      
                      {/* Remove Button for Owner */}
                      {isOwner && member._id !== project.owner._id && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            if(window.confirm(`Remove ${member.name}?`)) {
                              try {
                                await api.delete(`/projects/${project._id}/members/${member._id}`);
                                fetchProject();
                              } catch(err) {
                                alert('Error removing member');
                              }
                            }
                          }}
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove Member"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isOwner && (
                  <button 
                    onClick={handleAddMemberClick}
                    className="h-8 px-3 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-medium text-gray-500 hover:text-blue-600 hover:border-blue-600 dark:hover:text-blue-400 dark:hover:border-blue-400 transition-colors"
                    title="Add Member"
                  >
                    <Plus size={14} className="mr-1" /> Add
                  </button>
                )}
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

      <Board projectId={project._id} members={project.members} />
      
      <FileUpload projectId={project._id} />

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Team Member</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select User</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="" disabled>Select a user to add</option>
                  {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                {allUsers.length === 0 && (
                  <p className="text-xs text-orange-500 mt-2">No new users available to add.</p>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedUser}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
