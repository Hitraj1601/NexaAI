import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Zap, 
  Menu, 
  X, 
  LogIn,
  UserPlus
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-lift" onClick={handleLinkClick}>
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
              NexaAI
            </span>
          </Link>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <Link to="/signin" onClick={handleLinkClick}>
                <Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-105">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" onClick={handleLinkClick}>
                <Button size="sm" className="gradient-primary hover-glow transition-all duration-200 hover:scale-105">
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
                onClick={toggleMobileMenu}
                className="transition-all duration-200 hover:bg-primary/10"
              >
                <div className="transform transition-transform duration-200">
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
        isMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="glass border-t border-border/20 bg-background/95 backdrop-blur-md">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {/* Mobile Auth Buttons */}
            <div className="space-y-2">
              <div className="flex justify-center pb-2">
                <ThemeToggle />
              </div>
              <Link to="/signin" onClick={handleLinkClick}>
                <Button variant="ghost" size="sm" className="w-full justify-start transition-all duration-200 hover:scale-[1.02]">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" onClick={handleLinkClick}>
                <Button size="sm" className="w-full gradient-primary hover-glow transition-all duration-200 hover:scale-[1.02]">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;