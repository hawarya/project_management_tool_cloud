import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, X } from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity" onClick={closeSidebar}></div>
      )}
      
      {/* Sidebar background */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:static`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl flex items-center gap-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            SyncSpace
          </span>
          <button onClick={closeSidebar} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 space-y-2 relative h-[calc(100vh-4rem)] overflow-y-auto">
          <NavLink to="/" className={navLinkClasses} end>
            <LayoutDashboard size={20} className="mr-3" />
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={navLinkClasses}>
            <Briefcase size={20} className="mr-3" />
            Projects
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
