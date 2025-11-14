import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { AllData, ScheduleData, RatioExplanation } from '../../types.ts';

interface RatioAnalysisExplanationsProps {
    allData: AllData;
    onUpdate: React.Dispatch<React.SetStateAction<ScheduleData>>;
    isFinalized: boolean;
}

export const RatioAnalysisExplanations: React.FC<RatioAnalysisExplanationsProps> = ({ allData, onUpdate, isFinalized }) => {
    const { ratioExplanations } = allData.scheduleData;
    
    const allRatios = [
        { id: 'debtEquity', name: 'Debt-Equity Ratio' },
        { id: 'current', name: 'Current Ratio' },
        { id: 'debtService', name: 'Debt Service Coverage Ratio' },
        { id: 'roe', name: 'Return on Equity Ratio' },
        { id: 'inventoryTurnover', name: 'Inventory Turnover Ratio' },
        { id: 'receivablesTurnover', name: 'Trade Receivables Turnover Ratio' },
        { id: 'payablesTurnover', name: 'Trade Payables Turnover Ratio' },
        { id: 'netCapitalTurnover', name: 'Net Capital Turnover Ratio' },
        { id: 'netProfit', name: 'Net Profit Ratio' },
        { id: 'roce', name: 'Return on Capital Employed' },
        { id: 'roi', name: 'Return on Investment' },
    ];

    const handleUpdate = (id: string, value: string) => {
        onUpdate(prev => ({
            ...prev,
            ratioExplanations: {
                ...prev.ratioExplanations,
                [id]: {
                    ...(prev.ratioExplanations[id] || { id, explanationPy: '' }),
                    explanationCy: value,
                }
            }
        }));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Ratio Analysis - Explanations</h3>
            <p className="text-sm text-gray-400">Provide explanations for any ratio that has changed by more than 25% compared to the previous year. These explanations will be displayed in the Ratio Analysis report.</p>
            
            <div className="space-y-4">
                {allRatios.map(ratio => (
                    <div key={ratio.id}>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{ratio.name}</label>
                        <textarea
                            value={ratioExplanations[ratio.id]?.explanationCy || ''}
                            onChange={e => handleUpdate(ratio.id, e.target.value)}
                            disabled={isFinalized}
                            rows={2}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white disabled:bg-gray-800 disabled:cursor-not-allowed"
                            placeholder={`Enter explanation for changes in ${ratio.name}...`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};