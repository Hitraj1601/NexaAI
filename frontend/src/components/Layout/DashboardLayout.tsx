import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import { ReactNode, useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen flex">
      <DashboardSidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-0' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;