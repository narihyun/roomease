import React, { PropsWithChildren } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';

// Protected Route wrapper to ensure onboarding is done
const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { isSetup } = useApp();
  if (!isSetup) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />
          
          {/* Onboarding Wizard */}
          <Route path="/onboarding" element={<Onboarding />} />

  
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;