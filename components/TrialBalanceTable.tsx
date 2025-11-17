
import React, { useState } from 'react';
// FIX: Add file extension to fix module resolution error.
import { TrialBalanceItem, Masters } from '../types.ts';
import * as apiService from '../services/apiService.ts';
import { WandIcon } from './icons.tsx';

interface TrialBalanceTableProps {
  ledgers: TrialBalanceItem[];
  selectedLedgerId: string | null;
  onSelectLedger: (id: string) => void;
  selectedLedgerIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  masters: Masters;
  token: string;
  setTrialBalanceData: React.Dispatch<React.SetStateAction<TrialBalanceItem[]>>;
}

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
};

export const TrialBalanceTable: React.FC<TrialBalanceTableProps> = ({ 
  ledgers, 
  selectedLedgerId, 
  onSelectLedger,
  selectedLedgerIds,
  onToggleSelection,
  onSelectAll,
  masters,
  token,
  setTrialBalanceData
}) => {
    const [isBulkMapping, setIsBulkMapping] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    
    // Filter ledgers based on search query
    const filteredLedgers = ledgers.filter(ledger => 
        ledger.ledger.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const allSelected = filteredLedgers.length > 0 && filteredLedgers.every(l => selectedLedgerIds.has(l.id));
    
    const handleBulkAIMapping = async () => {
        const selectedLedgers = ledgers.filter(l => selectedLedgerIds.has(l.id));
        if (selectedLedgers.length === 0) {
            alert('Please select at least one ledger for bulk AI mapping.');
            return;
        }
        
        setIsBulkMapping(true);
        setBulkProgress({ current: 0, total: selectedLedgers.length });
        
        try {
            const results = await apiService.getBulkMappingSuggestions(
                token,
                selectedLedgers.map(l => ({ ledgerName: l.ledger, closingBalance: l.closingCy })),
                masters,
                (current, total) => setBulkProgress({ current, total })
            );
            
            // Apply high-confidence mappings (>= 0.55)
            let autoMappedCount = 0;
            setTrialBalanceData(prev => {
                return prev.map(item => {
                    const result = results.find(r => r.ledgerName === item.ledger);
                    if (result && result.suggestion && result.suggestion.confidence >= 0.55) {
                        autoMappedCount++;
                        return {
                            ...item,
                            isMapped: true,
                            majorHeadCode: result.suggestion.majorHeadCode,
                            minorHeadCode: result.suggestion.minorHeadCode,
                            groupingCode: result.suggestion.groupingCode,
                            lineItemCode: result.suggestion.lineItemCode,
                        };
                    }
                    return item;
                });
            });
            
            alert(`Bulk AI mapping complete!\n${autoMappedCount} ledgers auto-mapped with high confidence.\n${selectedLedgers.length - autoMappedCount} require manual review.`);
            onSelectAll(false); // Clear selection
        } catch (error: any) {
            alert(`Error during bulk AI mapping: ${error.message}`);
        } finally {
            setIsBulkMapping(false);
            setBulkProgress({ current: 0, total: 0 });
        }
    };
    
    return (
        <div className="flex-1 flex flex-col bg-gray-800 p-4 rounded-lg border border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-white">To Be Mapped ({ledgers.length})</h2>
                {selectedLedgerIds.size > 0 && (
                    <button
                        onClick={handleBulkAIMapping}
                        disabled={isBulkMapping}
                        className="flex items-center bg-brand-blue hover:bg-brand-blue-dark disabled:bg-gray-600 text-white font-bold py-1.5 px-3 rounded-md transition-colors text-sm"
                    >
                        <WandIcon className="w-4 h-4 mr-2" />
                        {isBulkMapping 
                            ? `Processing ${bulkProgress.current}/${bulkProgress.total}...` 
                            : `Get AI Suggestions for Selected (${selectedLedgerIds.size})`
                        }
                    </button>
                )}
            </div>
            {/* Search input */}
            <div className="mb-2">
                <input
                    type="text"
                    placeholder="Search ledgers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
            </div>
            <div className="flex-1 overflow-y-auto">
                 <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-gray-800">
                        <tr>
                            <th className="p-2 text-left font-medium text-gray-400 w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-blue focus:ring-brand-blue"
                                />
                            </th>
                            <th className="p-2 text-left font-medium text-gray-400">Ledger Name</th>
                            <th className="p-2 text-right font-medium text-gray-400">Closing (CY)</th>
                            <th className="p-2 text-right font-medium text-gray-400">Closing (PY)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredLedgers.length > 0 ? filteredLedgers.map(item => (
                            <tr
                                key={item.id}
                                className={`cursor-pointer transition-colors ${
                                    selectedLedgerId === item.id 
                                    ? 'bg-brand-blue/20' 
                                    : 'hover:bg-gray-700/50'
                                }`}
                            >
                                <td className="p-2" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={selectedLedgerIds.has(item.id)}
                                        onChange={() => onToggleSelection(item.id)}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-blue focus:ring-brand-blue"
                                    />
                                </td>
                                <td className="p-2 font-medium" onClick={() => onSelectLedger(item.id)}>{item.ledger}</td>
                                <td className="p-2 text-right font-mono" onClick={() => onSelectLedger(item.id)}>{formatCurrency(item.closingCy)}</td>
                                <td className="p-2 text-right font-mono" onClick={() => onSelectLedger(item.id)}>{formatCurrency(item.closingPy)}</td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">
                                    {searchQuery ? 'No ledgers match your search.' : 'No unmapped ledgers. All items have been mapped.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};