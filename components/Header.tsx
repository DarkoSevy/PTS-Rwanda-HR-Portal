import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, ChevronDownIcon, SunIcon, MoonIcon, BellIcon, CalendarIcon, MegaphoneIcon, FileSignatureIcon } from './icons';
import { User, Role, Notification } from '../types';
import { database } from '../server/db';
import { apiService } from '../services/apiService';

interface HeaderProps {
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const getNotificationsForRole = (role: Role): Notification[] => {
    const commonNotifications = [
         { id: 'n1', icon: MegaphoneIcon, title: 'New company announcement posted.', timestamp: '1 hour ago', read: false, linkTo: '/dashboard' },
         { id: 'n2', icon: FileSignatureIcon, title: 'Code of Conduct v1.5 requires your signature.', timestamp: '3 hours ago', read: false, linkTo: '/compliance' },
    ];

    if (role === Role.HRAdmin) {
        return [
            { id: 'n3', icon: CalendarIcon, title: 'Aline Uwase submitted a new leave request.', timestamp: '15 minutes ago', read: false, linkTo: '/leave-attendance' },
            ...commonNotifications,
            { id: 'n4', icon: FileSignatureIcon, title: 'Bosco Ndayisenga acknowledged the Employee Handbook.', timestamp: 'yesterday', read: true, linkTo: '/compliance' },
        ];
    }
    if (role === Role.Manager) {
         return [
            { id: 'n3', icon: CalendarIcon, title: 'Aline Uwase submitted a new leave request.', timestamp: '15 minutes ago', read: false, linkTo: '/leave-attendance' },
             ...commonNotifications.slice(0,1),
            { id: 'n5', icon: FileSignatureIcon, title: 'Your team needs to sign the new Safety Manual.', timestamp: '2 days ago', read: true, linkTo: '/compliance' },
        ];
    }
    // Employee
    return [
        { id: 'n6', icon: CalendarIcon, title: 'Your leave request has been approved.', timestamp: '30 minutes ago', read: false, linkTo: '/leave-attendance' },
        ...commonNotifications,
    ];
};


const Header: React.FC<HeaderProps> = ({ setIsMobileMenuOpen, currentUser, setCurrentUser, theme, toggleTheme }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(getNotificationsForRole(currentUser.role));
  }, [currentUser.role]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRoleChange = async (role: Role) => {
    const user = await apiService.login(role);
    setCurrentUser(user);
    setDropdownOpen(false);
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  const hasUnread = notifications.some(n => !n.read);
  const mockUsers = database.getUsers();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-primary-900 border-b border-gray-200 dark:border-primary-800 shadow-sm flex-shrink-0">
      <div className="flex items-center">
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden" aria-label="Open menu">
          <MenuIcon className="h-6 w-6" />
        </button>
        <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">PTS Rwanda HR Portal</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-800/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </button>

        <div className="relative" ref={notificationsRef}>
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-800/60 focus:outline-none" aria-label="Notifications">
              <BellIcon className="h-5 w-5" />
              {hasUnread && <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-primary-900"></span>}
            </button>
            {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-100 dark:border-gray-700" role="menu" aria-orientation="vertical">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200">Notifications</h3>
                        {hasUnread && <button onClick={markAllAsRead} className="text-xs text-primary-500 hover:underline">Mark all as read</button>}
                    </div>
                    <div className="py-1 max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(notification => (
                            <Link key={notification.id} to={notification.linkTo} onClick={() => setNotificationsOpen(false)} className="flex items-start gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                {!notification.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0 animate-pulse"></div>}
                                <notification.icon className={`w-5 h-5 flex-shrink-0 ${notification.read ? 'text-gray-400' : 'text-primary-500'}`} />
                                <div className="flex-1">
                                    <p className={!notification.read ? 'font-semibold' : ''}>{notification.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notification.timestamp}</p>
                                </div>
                            </Link>
                        )) : (
                            <p className="text-center py-6 text-sm text-gray-500">No notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>


        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3 relative z-10 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900" aria-label="User menu" aria-haspopup="true" aria-expanded={dropdownOpen}>
            <img
              className="object-cover w-9 h-9 rounded-full"
              src={currentUser.avatar}
              alt={`${currentUser.name}'s avatar`}
            />
            <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{currentUser.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
            </div>
            <ChevronDownIcon className="w-5 h-5 text-gray-500 hidden md:block" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-xl z-20 py-2" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
              </div>
              <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">Switch Role</div>
              {(Object.keys(mockUsers) as Role[]).map(role => (
                 <button 
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                 >
                 {currentUser.role === role ? 
                    <span className="mr-2 text-primary-500">✓</span> : 
                    <span className="mr-2 w-2.5 h-2.5"></span>
                 }
                 {role}
                 </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
