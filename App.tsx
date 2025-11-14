import React, { useState, useEffect } from 'react';
import { Page, AllData, TrialBalanceItem, Masters, ScheduleData, EntityType, FinancialEntity } from './types.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { MainApp } from './components/MainApp.tsx';
import * as apiService from './services/apiService.ts';

function App() {
  const [token, setToken] = useState<string | null>(window.localStorage.getItem('token'));
  const [selectedEntity, setSelectedEntity] = useState<FinancialEntity | null>(null);

  const handleLogin = (newToken: string) => {
    window.localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('token');
    setToken(null);
    setSelectedEntity(null);
  };

  const handleSelectEntity = (entity: FinancialEntity) => {
    setSelectedEntity(entity);
  };
  
  const handleBackToDashboard = () => {
    setSelectedEntity(null);
  };

  if (!token) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (!selectedEntity) {
    return <DashboardPage token={token} onSelectEntity={handleSelectEntity} onLogout={handleLogout} />;
  }
  
  return <MainApp entity={selectedEntity} onBack={handleBackToDashboard} onLogout={handleLogout} token={token} />;
}

export default App;
