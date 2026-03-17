import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import { Plus, MoreHorizontal, Clock, X, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

const Board = ({ projectId, members = [] }) => {
  const [tasks, setTasks] = useState({
    'Pending': [],
    'In Progress': [],
    'Completed': []
  });
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [newTask, setNewTask] = useState({ _id: '', title: '', priority: 'Medium', deadline: '', assignees: [], status: 'Pending' });

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/tasks/project/${projectId}`);
      const organized = {
        'Pending': data.filter(t => t.status === 'Pending'),
        'In Progress': data.filter(t => t.status === 'In Progress'),
        'Completed': data.filter(t => t.status === 'Completed')
      };
      setTasks(organized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [projectId]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = [...tasks[source.droppableId]];
    const destCol = [...tasks[destination.droppableId]];
    
    const [movedTask] = sourceCol.splice(source.index, 1);
    movedTask.status = destination.droppableId;
    destCol.splice(destination.index, 0, movedTask);

    setTasks({
      ...tasks,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    });

    try {
      await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (isEditingTask) {
        await api.put(`/tasks/${newTask._id}`, newTask);
      } else {
        await api.post('/tasks', { ...newTask, projectId });
      }
      setShowTaskModal(false);
      setNewTask({ _id: '', title: '', priority: 'Medium', deadline: '', assignees: [], status: 'Pending' });
      setIsEditingTask(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        console.error(err);
        alert('Error deleting task');
      }
    }
    setOpenMenuId(null);
  };

  const openEditModal = (e, task) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditingTask(true);
    setNewTask({
      _id: task._id,
      title: task.title,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      assignees: task.assignees ? task.assignees.map(a => a._id || a) : []
    });
    setOpenMenuId(null);
    setShowTaskModal(true);
  };

  const openCreateModal = () => {
    setIsEditingTask(false);
    setNewTask({ _id: '', title: '', priority: 'Medium', deadline: '', assignees: [], status: 'Pending' });
    setShowTaskModal(true);
  };

  const handleAssigneeChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setNewTask({ ...newTask, assignees: value });
  };

  const handleMenuClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) return <div className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div></div>;

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Board</h2>
        <button 
          onClick={openCreateModal}
          className="flex items-center px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 font-medium rounded-lg transition-colors text-sm"
        >
          <Plus size={16} className="mr-1" />
          Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 items-start overflow-x-auto pb-4">
          {Object.entries(tasks).map(([status, statusTasks]) => (
            <div key={status} className="flex-1 min-w-[300px] w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    status === 'Completed' ? 'bg-green-500' : 
                    status === 'In Progress' ? 'bg-blue-500' : 'bg-orange-500'
                  }`}></span>
                  {status}
                  <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {statusTasks.length}
                  </span>
                </h3>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                  >
                    {statusTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border ${
                              snapshot.isDragging 
                                ? 'border-blue-400 dark:border-blue-500 shadow-md rotate-2 scale-105 ring-2 ring-blue-400/20 z-50' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                            } mb-3 group transition-all relative`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              
                              <div className="relative" ref={openMenuId === task._id ? menuRef : null}>
                                <button 
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                                  onClick={(e) => handleMenuClick(e, task._id)}
                                >
                                  <MoreVertical size={14} />
                                </button>
                                
                                {openMenuId === task._id && (
                                  <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1" onClick={e => e.preventDefault()}>
                                    <button
                                      onClick={(e) => openEditModal(e, task)}
                                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                    >
                                      <Edit2 size={12} className="mr-2" /> Edit
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteTask(e, task._id)}
                                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                    >
                                      <Trash2 size={12} className="mr-2" /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 break-words relative z-0">
                              {task.title}
                            </h4>
                            
                            <div className="flex justify-between items-end mt-4">
                              <div className="flex -space-x-1.5">
                                {task.assignees?.map((a, i) => (
                                  <div key={a._id || i} className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-white dark:border-gray-800 flex items-center justify-center text-[10px] text-indigo-700 dark:text-indigo-300 z-10" style={{ zIndex: 10 - i }} title={a?.name}>
                                    {a?.name ? a.name.charAt(0).toUpperCase() : '?'}
                                  </div>
                                ))}
                                {(!task.assignees || task.assignees.length === 0) && (
                                  <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800">
                                    <Plus size={10} />
                                  </div>
                                )}
                              </div>
                              
                              {task.deadline && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <Clock size={12} className="mr-1" />
                                  {format(new Date(task.deadline), 'MMM d')}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditingTask ? 'Edit Task' : 'Add Task'}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              
              {isEditingTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors"
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To (Multiple allowed)</label>
                <select
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors h-24"
                  value={newTask.assignees}
                  onChange={handleAssigneeChange}
                >
                  {members.map(member => (
                    <option key={member._id} value={member._id}>{member.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple assignees</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  {isEditingTask ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
