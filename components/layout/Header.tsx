'use client';

import { Bell, Search, LogOut, User, Moon, Sun, Settings, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  title: string;
  description?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isNew?: boolean;
}

const defaultNotifications: Notification[] = [
  { id: '1', title: 'System Update', message: 'New features available in your dashboard', time: '2 hours ago', isNew: true },
  { id: '2', title: 'API Usage Alert', message: "You've used 80% of your monthly quota", time: '1 day ago' },
];

export default function Header({ title, description }: HeaderProps) {
  const router = useRouter();
  const { userEmail, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleLogout() {
    await signOut();
    router.push('/auth/login');
    router.refresh();
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const initials = userEmail 
    ? userEmail.substring(0, 2).toUpperCase() 
    : 'U';

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Title & Description */}
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description && (
            <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1">
          {/* Search Bar */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors min-w-[200px]"
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
            </button>

            {/* Search Dropdown */}
            {showSearch && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    className="flex-1 px-2 py-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowSearch(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="py-2 max-h-64 overflow-y-auto">
                  <p className="px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">Quick Links</p>
                  {[
                    { name: 'Analytics Dashboard', href: '/dashboard' },
                    { name: 'View Logs', href: '/logs' },
                    { name: 'Admin Settings', href: '/settings' },
                    { name: 'Billing & Plans', href: '/billing' },
                    { name: 'Support', href: '/support' },
                  ].map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        setShowSearch(false);
                        router.push(item.href);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications([])}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-start gap-3 group ${
                          notif.isNew ? 'border-l-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifications(notifications.filter(n => n.id !== notif.id));
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Delete notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative ml-1" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                  {initials}
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userEmail?.split('@')[0]}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push('/profile');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                  >
                    <User size={16} className="text-gray-400" />
                    Your Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push('/settings');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                  >
                    <Settings size={16} className="text-gray-400" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
