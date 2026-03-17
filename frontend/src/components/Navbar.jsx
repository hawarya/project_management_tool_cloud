import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LogOut, User, Moon, Sun, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 transition-colors duration-200 z-10 relative">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="mr-4 lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Menu size={24} />
        </button>
      </div>
      <div className="flex items-center space-x-4 flex-shrink-0">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold uppercase transition-colors">
                {user.name.charAt(0)}
              </div>
              <span className="hidden sm:inline-block font-medium">{user.name}</span>
            </div>
            <button onClick={logout} className="flex items-center text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-md transition-colors">
              <LogOut size={18} className="mr-1.5" />
              <span className="hidden sm:inline-block">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
