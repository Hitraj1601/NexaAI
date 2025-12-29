import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  PenTool, 
  FileText, 
  Image, 
  Scissors, 
  History,
  Settings,
  User,
  LogOut,
  Zap,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useApi';

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const DashboardSidebar = React.memo(({ isCollapsed = false, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profileData, loading: profileLoading } = useUserProfile();

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Call backend logout to clear cookie
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      // Clear localStorage token
      localStorage.removeItem('accessToken');
      
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if backend call fails, clear local storage and redirect
      localStorage.removeItem('accessToken');
      toast.success('Logged out');
      navigate('/');
    }
  }, [navigate]);

  const menuItems = useMemo(() => [
    {
      section: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'History', path: '/dashboard/history', icon: History },
      ]
    },
    {
      section: 'AI Tools',
      items: [
        { name: 'Article Writer', path: '/article-writer', icon: PenTool },
        { name: 'Title Generator', path: '/title-generator', icon: FileText },
        { name: 'Image Generator', path: '/image-generator', icon: Image },
        { name: 'Background Remover', path: '/background-remover', icon: Scissors },
      ]
    },
    {
      section: 'Account',
      items: [
        { name: 'Profile', path: '/dashboard/profile', icon: User },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
      ]
    }
  ], []);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-card/50 border-r border-border/20 flex flex-col transition-all duration-300 ease-in-out relative`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
      
      {/* Logo */}
      <div className="p-6 border-b border-border/20">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent transition-all duration-300">
              NexaAI
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-4 space-y-8">
          {menuItems.map((section) => (
            <div key={section.section}>
              {!isCollapsed && (
                <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 transition-all duration-300">
                  {section.section}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center ${isCollapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2'} rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                        isActive(item.path)
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 transition-all duration-300">{item.name}</span>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-background border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-border/20">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary-foreground">
                  {profileLoading ? '...' : getInitials(profileData?.user?.username || 'User')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profileLoading ? 'Loading...' : profileData?.user?.username || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profileLoading ? '' : profileData?.user?.email || ''}
                </p>
              </div>
            </div>
            <Separator className="mb-4" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {profileLoading ? '...' : getInitials(profileData?.user?.username || 'User')}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar;