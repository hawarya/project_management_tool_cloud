import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../services/api';
import { Plus, MoreHorizontal, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const Board = ({ projectId }) => {
  const [tasks, setTasks] = useState({
    'Pending': [],
    'In Progress': [],
    'Completed': []
  });
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'Medium', deadline: '' });

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
      fetchTasks(); // Revert on failure
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId });
      setShowTaskModal(false);
      setNewTask({ title: '', priority: 'Medium', deadline: '' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
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
          onClick={() => setShowTaskModal(true)}
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
                                ? 'border-blue-400 dark:border-blue-500 shadow-md rotate-2 scale-105 ring-2 ring-blue-400/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                            } mb-3 group transition-all`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                              {task.title}
                            </h4>
                            
                            <div className="flex justify-between items-end mt-4">
                              <div className="flex -space-x-1.5">
                                {task.assignees?.map((a, i) => (
                                  <div key={a._id} className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-white dark:border-gray-800 flex items-center justify-center text-[10px] text-indigo-700 dark:text-indigo-300 z-10" style={{ zIndex: 10 - i }} title={a.name}>
                                    {a.name.charAt(0)}
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
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
                  Create
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
