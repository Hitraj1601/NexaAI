import { Link } from 'react-router-dom';
import { Zap, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'AI Tools',
      links: [
        { name: 'Article Writer', path: '/article-writer' },
        { name: 'Title Generator', path: '/title-generator' },
        { name: 'Image Generator', path: '/image-generator' },
        { name: 'Background Remover', path: '/background-remover' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Community', path: '/community' },
        { name: 'Pricing', path: '/#pricing' },
        { name: 'About', path: '/#about' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', path: '/#contact' },
        { name: 'Contact Us', path: '/#contact' },
        { name: 'API Docs', path: '#' },
        { name: 'Status', path: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="bg-card/50 border-t border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
                NexaAI
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Transform your workflow with powerful AI tools designed for content creators, 
              professionals, and businesses. Experience the future of productivity.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-10 h-10 glass rounded-lg flex items-center justify-center hover-lift hover:bg-primary/20 transition-smooth"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 text-muted-foreground hover:text-primary transition-smooth" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-foreground font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-muted-foreground hover:text-primary transition-smooth"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} NexaAI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-smooth">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-smooth">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-smooth">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;