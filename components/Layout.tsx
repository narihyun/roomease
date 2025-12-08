import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, CheckSquare, List, DollarSign } from 'lucide-react';

const Layout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <>{children}</>;
  }

  // App Layout simulating a phone
  return (
    <div className="min-h-screen flex justify-center bg-gray-200 font-sans">
      <div className="w-full max-w-md bg-white shadow-2xl overflow-hidden relative flex flex-col h-[100dvh]">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-20 bg-bg">
          {children}
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p: string) => path === p;

  const NavItem = ({ to, icon: Icon, label, p }: { to: string, icon: any, label: string, p: string }) => (
    <Link to={to} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(p) ? 'text-secondary' : 'text-gray-400'}`}>
      <Icon size={24} strokeWidth={isActive(p) ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="absolute bottom-0 w-full h-20 bg-white border-t border-gray-100 flex items-center justify-around pb-4 pt-2 z-50">
      <NavItem to="/app/home" p="/app/home" icon={Home} label="Home" />
      <NavItem to="/app/tasks" p="/app/tasks" icon={CheckSquare} label="Tasks" />
      <NavItem to="/app/stock" p="/app/stock" icon={List} label="Stock" />
      <NavItem to="/app/costs" p="/app/costs" icon={DollarSign} label="Costs" />
    </div>
  );
};

export default Layout;