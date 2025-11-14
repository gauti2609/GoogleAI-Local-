import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './Sidebar.tsx';
import { MappingWorkbench } from './MappingWorkbench.tsx';
import { SchedulesPage } from '../pages/SchedulesPage.tsx';
import { NotesSelectionPage } from '../pages/NotesSelectionPage.tsx';
import { ReportsPage } from '../pages/ReportsPage.tsx';
import { Page, TrialBalanceItem, Masters, ScheduleData, AllData, FinancialEntity } from '../types.ts';
import * as apiService from '../services/apiService.ts';
import { mockMasters, initialScheduleData } from '../data/mockData.ts';
import { useHistoryState } from '../hooks/useHistoryState.ts';
import { useDebouncedSave } from '../hooks/useDebouncedSave.ts';
import { SaveStatusIndicator } from './SaveStatusIndicator.tsx';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from './icons.tsx';

interface MainAppProps {
    entity: FinancialEntity;
    onBack: () => void;
    onLogout: () => void;
    token: string;
}

export const MainApp: React.FC<MainAppProps> = ({ entity, onBack, onLogout, token }) => {
  const [activePage, setActivePage] = useState<Page>('mapping');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { state: allData, setState: setAllData, undo, redo, canUndo, canRedo } = useHistoryState<AllData | null>(null);

  const handleSave = useCallback(async (dataToSave: AllData) => {
    await apiService.updateEntity(token, entity.id, dataToSave);
  }, [token, entity.id]);

  const { saveStatus } = useDebouncedSave(allData, handleSave);


  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.getEntityData(token, entity.id);
            // Initialize with default structure if data is missing from backend
            const initialState = {
                trialBalanceData: data.trialBalanceData || [],
                masters: data.masters || mockMasters,
                scheduleData: { ...initialScheduleData, ...data.scheduleData, entityInfo: { ...initialScheduleData.entityInfo, entityType: entity.entityType, companyName: entity.name }},
            };
            setAllData(initialState, true); // Set initial state without adding to history
        } catch(err: any) {
            setError(err.message || "Failed to load entity data.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [entity.id, token, setAllData]);


  const handleImport = (data: Omit<TrialBalanceItem, 'id' | 'isMapped' | 'majorHeadCode' | 'minorHeadCode' | 'groupingCode'>[]) => {
    if (!allData) return;
    const newData: TrialBalanceItem[] = data.map(item => ({
      ...item,
      id: uuidv4(),
      isMapped: false,
      majorHeadCode: null,
      minorHeadCode: null,
      groupingCode: null,
    }));
    setAllData({ ...allData, trialBalanceData: newData });
    setActivePage('mapping');
  };

  const setTrialBalanceData = (setter: React.SetStateAction<TrialBalanceItem[]>) => {
    setAllData(prev => {
        if (!prev) return prev;
        const newTB = typeof setter === 'function' ? setter(prev.trialBalanceData) : setter;
        return { ...prev, trialBalanceData: newTB };
    });
  };

  const setScheduleData = (setter: React.SetStateAction<ScheduleData>) => {
    setAllData(prev => {
        if (!prev) return prev;
        const newScheduleData = typeof setter === 'function' ? setter(prev.scheduleData) : setter;
        return { ...prev, scheduleData: newScheduleData };
    });
  };

  const setMasters = (newMasters: Masters) => {
    setAllData(prev => prev ? ({ ...prev, masters: newMasters }) : null);
  }

  const renderPage = () => {
    if (isLoading) return <div className="p-6 text-center">Loading data for {entity.name}...</div>;
    if (error) return <div className="p-6 text-center text-red-400">{error}</div>;
    if (!allData) return <div className="p-6 text-center">No data available.</div>;

    switch (activePage) {
      case 'mapping':
        return <MappingWorkbench allData={allData} setTrialBalanceData={setTrialBalanceData} onImport={handleImport} masters={allData.masters} setMasters={setMasters} token={token} />;
      case 'schedules':
        return <SchedulesPage allData={allData} setScheduleData={setScheduleData} />;
      case 'notes':
        return <NotesSelectionPage allData={allData} setScheduleData={setScheduleData}/>;
      case 'reports':
        return <ReportsPage allData={allData} />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onBack={onBack} onLogout={onLogout} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-xl font-bold text-white truncate">{entity.name}</h2>
          <div className="flex items-center space-x-4">
            <SaveStatusIndicator status={saveStatus} />
            <div className="flex items-center space-x-1">
              <button onClick={undo} disabled={!canUndo} className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <ArrowUturnLeftIcon className="w-5 h-5" />
              </button>
              <button onClick={redo} disabled={!canRedo} className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <ArrowUturnRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
            {renderPage()}
        </div>
      </main>
    </div>
  );
};