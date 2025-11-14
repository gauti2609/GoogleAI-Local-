
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
    onImport: (data: Omit<TrialBalanceItem, 'id' | 'isMapped' | 'majorHeadCode' | 'minorHeadCode' | 'groupingCode'>[]) => void;
    masters: Masters;
    setMasters: (masters: Masters) => void;
    token: string;
}

export const MappingWorkbench: React.FC<MappingWorkbenchProps> = ({ allData, setTrialBalanceData, onImport, masters, setMasters, token }) => {
    const { trialBalanceData } = allData;
    const [selectedLedgerId, setSelectedLedgerId] = React.useState<string | null>(null);
    const [isImportModalOpen, setImportModalOpen] = React.useState(false);
    const [isMastersModalOpen, setMastersModalOpen] = React.useState(false);
    
    const unmappedLedgers = trialBalanceData.filter(item => !item.isMapped);
    const mappedLedgers = trialBalanceData.filter(item => item.isMapped);

    const handleSelectLedger = (id: string) => {
        setSelectedLedgerId(id);
    };
    
    const handleMapLedger = (ledgerId: string, mapping: { majorHeadCode: string; minorHeadCode: string; groupingCode: string }) => {
        setTrialBalanceData(prev => prev.map(item => item.id === ledgerId ? {
            ...item,
            isMapped: true,
            ...mapping,
        } : item));
        setSelectedLedgerId(null); // Deselect to allow auto-selection of next item
    };
    
    React.useEffect(() => {
      const currentUnmapped = trialBalanceData.filter(item => !item.isMapped);
      if (currentUnmapped.length > 0 && !currentUnmapped.find(l => l.id === selectedLedgerId)) {
        setSelectedLedgerId(currentUnmapped[0].id);
      } else if (currentUnmapped.length === 0) {
        setSelectedLedgerId(null);
      }
    }, [trialBalanceData, selectedLedgerId]);

    const selectedLedger = trialBalanceData.find(l => l.id === selectedLedgerId);

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
                        masters={masters}
                    />
                    <MappedLedgersTable ledgers={mappedLedgers} masters={masters} />
                </div>
                
                <div className="lg:col-span-1 bg-gray-800 rounded-lg border border-gray-700 overflow-y-auto">
                    <MappingPanel 
                        ledger={selectedLedger}
                        masters={masters}
                        onMapLedger={handleMapLedger}
                        token={token}
                    />
                </div>
            </div>

            <ImportModal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} onImport={onImport} />
            <MastersModal isOpen={isMastersModalOpen} onClose={() => setMastersModalOpen(false)} masters={masters} setMasters={setMasters} />
        </div>
    );
};