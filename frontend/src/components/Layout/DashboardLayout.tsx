import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      <DashboardSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;