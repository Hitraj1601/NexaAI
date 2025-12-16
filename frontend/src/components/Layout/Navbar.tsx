import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Zap, 
  Menu, 
  X, 
  Home, 
  PenTool, 
  FileText, 
  Image, 
  Scissors, 
  FileCheck, 
  Users, 
  LayoutDashboard,
  LogIn,
  UserPlus
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Article Writer', path: '/article-writer', icon: PenTool },
    { name: 'Title Generator', path: '/title-generator', icon: FileText },
    { name: 'Image Generator', path: '/image-generator', icon: Image },
    { name: 'Background Remover', path: '/background-remover', icon: Scissors },
    { name: 'Resume Reviewer', path: '/resume-reviewer', icon: FileCheck },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between  h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center  space-x-2 hover-lift m">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent ">
              NexaAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-smooth ${
                    isActive(item.path)
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <Link to="/signin">
              <Button variant="ghost" size="sm" className="transition-smooth">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gradient-primary hover-glow transition-smooth">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-border/20 absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-smooth ${
                    isActive(item.path)
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            {/* Mobile Auth Buttons */}
            <div className="pt-4 space-y-2 border-t border-border/20">
              <div className="flex justify-center pb-2">
                <ThemeToggle />
              </div>
              <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start transition-smooth">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button size="sm" className="w-full gradient-primary hover-glow transition-smooth">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;