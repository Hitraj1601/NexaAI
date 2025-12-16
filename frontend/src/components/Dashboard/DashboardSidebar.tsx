import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PenTool, 
  FileText, 
  Image, 
  Scissors, 
  FileCheck,
  History,
  Settings,
  User,
  LogOut,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
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
  };
  const menuItems = [
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
        { name: 'Resume Reviewer', path: '/resume-reviewer', icon: FileCheck },
      ]
    },
    {
      section: 'Account',
      items: [
        { name: 'Profile', path: '/dashboard/profile', icon: User },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-card/50 border-r border-border/20 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/20">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
            NexaAI
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-4 space-y-8">
          {menuItems.map((section) => (
            <div key={section.section}>
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.section}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                        isActive(item.path)
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@example.com</p>
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
      </div>
    </div>
  );
};

export default DashboardSidebar;