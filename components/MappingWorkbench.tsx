
import React from 'react';
// FIX: Add file extensions to fix module resolution errors.
import { TrialBalanceTable } from './TrialBalanceTable.tsx';
import { MappedLedgersTable } from './MappedLedgersTable.tsx';
import { MappingPanel } from './MappingPanel.tsx';
import { TrialBalanceItem, Masters, AllData } from '../types.ts';
import { ImportModal } from './ImportModal.tsx';
import { MastersModal } from './MastersModal.tsx';
import { UploadIcon, CogIcon } from './icons.tsx';

interface MappingWorkbenchProps {
    allData: AllData;
    setTrialBalanceData: React.Dispatch<React.SetStateAction<TrialBalanceItem[]>>;
    onImport: (data: Omit<TrialBalanceItem, 'id' | 'isMapped' | 'majorHeadCode' | 'minorHeadCode' | 'groupingCode' | 'lineItemCode'>[]) => void;
    masters: Masters;
    setMasters: (masters: Masters) => void;
    token: string;
}

export const MappingWorkbench: React.FC<MappingWorkbenchProps> = ({ allData, setTrialBalanceData, onImport, masters, setMasters, token }) => {
    const { trialBalanceData } = allData;
    const [selectedLedgerId, setSelectedLedgerId] = React.useState<string | null>(null);
    const [selectedLedgerIds, setSelectedLedgerIds] = React.useState<Set<string>>(new Set());
    const [selectedMappedIds, setSelectedMappedIds] = React.useState<Set<string>>(new Set());
    const [isImportModalOpen, setImportModalOpen] = React.useState(false);
    const [isMastersModalOpen, setMastersModalOpen] = React.useState(false);
    
    const unmappedLedgers = trialBalanceData.filter(item => !item.isMapped);
    const mappedLedgers = trialBalanceData.filter(item => item.isMapped);

    const handleSelectLedger = (id: string) => {
        setSelectedLedgerId(id);
        // Clear multi-select when selecting individual ledger
        setSelectedLedgerIds(new Set());
        setSelectedMappedIds(new Set());
    };
    
    const handleToggleSelection = (id: string) => {
        setSelectedLedgerIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
        setSelectedLedgerId(null); // Clear single selection when multi-selecting
    };
    
    const handleToggleMappedSelection = (id: string) => {
        setSelectedMappedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
        setSelectedLedgerId(null); // Clear single selection when multi-selecting
    };
    
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLedgerIds(new Set(unmappedLedgers.map(l => l.id)));
        } else {
            setSelectedLedgerIds(new Set());
        }
    };
    
    const handleSelectAllMapped = (checked: boolean) => {
        if (checked) {
            setSelectedMappedIds(new Set(mappedLedgers.map(l => l.id)));
        } else {
            setSelectedMappedIds(new Set());
        }
    };
    
    const handleMapLedger = (ledgerIds: string[], mapping: { majorHeadCode: string; minorHeadCode: string; groupingCode: string; lineItemCode: string }) => {
        setTrialBalanceData(prev => prev.map(item => ledgerIds.includes(item.id) ? {
            ...item,
            isMapped: true,
            ...mapping,
        } : item));
        setSelectedLedgerId(null);
        setSelectedLedgerIds(new Set());
        setSelectedMappedIds(new Set());
    };
    
    const handleUnmapLedger = (ledgerIds: string[]) => {
        setTrialBalanceData(prev => prev.map(item => ledgerIds.includes(item.id) ? {
            ...item,
            isMapped: false,
            majorHeadCode: null,
            minorHeadCode: null,
            groupingCode: null,
            lineItemCode: null,
        } : item));
        setSelectedLedgerId(null);
        setSelectedMappedIds(new Set());
    };
    
    React.useEffect(() => {
      const currentUnmapped = trialBalanceData.filter(item => !item.isMapped);
      if (currentUnmapped.length > 0 && !currentUnmapped.find(l => l.id === selectedLedgerId) && selectedLedgerIds.size === 0 && selectedMappedIds.size === 0) {
        setSelectedLedgerId(currentUnmapped[0].id);
      } else if (currentUnmapped.length === 0 && selectedLedgerIds.size === 0 && selectedMappedIds.size === 0) {
        setSelectedLedgerId(null);
      }
    }, [trialBalanceData, selectedLedgerId, selectedLedgerIds, selectedMappedIds]);

    // Get ledgers for mapping panel - either single selected or multiple selected
    const selectedLedgers = React.useMemo(() => {
        if (selectedLedgerId) {
            const ledger = trialBalanceData.find(l => l.id === selectedLedgerId);
            return ledger ? [ledger] : [];
        }
        if (selectedLedgerIds.size > 0) {
            return trialBalanceData.filter(l => selectedLedgerIds.has(l.id));
        }
        if (selectedMappedIds.size > 0) {
            return trialBalanceData.filter(l => selectedMappedIds.has(l.id));
        }
        return [];
    }, [selectedLedgerId, selectedLedgerIds, selectedMappedIds, trialBalanceData]);

    return (
        <div className="p-6 h-full flex flex-col space-y-4">
             <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Mapping Workbench</h1>
                    <p className="text-sm text-gray-400">Map trial balance ledgers to the financial statement structure.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setImportModalOpen(true)} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                        <UploadIcon className="w-4 h-4 mr-2"/>
                        Import Trial Balance
                    </button>
                    <button onClick={() => setMastersModalOpen(true)} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                         <CogIcon className="w-4 h-4 mr-2"/>
                        View Masters
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                <div className="lg:col-span-2 flex flex-col space-y-6 overflow-hidden">
                    <TrialBalanceTable
                        ledgers={unmappedLedgers}
                        selectedLedgerId={selectedLedgerId}
                        onSelectLedger={handleSelectLedger}
                        selectedLedgerIds={selectedLedgerIds}
                        onToggleSelection={handleToggleSelection}
                        onSelectAll={handleSelectAll}
                        masters={masters}
                        token={token}
                        setTrialBalanceData={setTrialBalanceData}
                    />
                    <MappedLedgersTable 
                        ledgers={mappedLedgers} 
                        masters={masters}
                        onSelectLedger={handleSelectLedger}
                        selectedLedgerIds={selectedMappedIds}
                        onToggleSelection={handleToggleMappedSelection}
                        onSelectAll={handleSelectAllMapped}
                    />
                </div>
                
                <div className="lg:col-span-1 bg-gray-800 rounded-lg border border-gray-700 overflow-y-auto">
                    <MappingPanel 
                        ledgers={selectedLedgers}
                        masters={masters}
                        onMapLedger={handleMapLedger}
                        onUnmapLedger={handleUnmapLedger}
                        token={token}
                    />
                </div>
            </div>

            <ImportModal 
                isOpen={isImportModalOpen} 
                onClose={() => setImportModalOpen(false)} 
                onImport={onImport}
                masters={masters}
                token={token}
                setTrialBalanceData={setTrialBalanceData}
            />
            <MastersModal isOpen={isMastersModalOpen} onClose={() => setMastersModalOpen(false)} masters={masters} setMasters={setMasters} />
        </div>
    );
};