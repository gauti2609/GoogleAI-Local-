
import React from 'react';
// FIX: Add file extension to fix module resolution error.
import { ChangesInInventoriesData } from '../../../types.ts';

interface CostOfMaterialsConsumedNoteProps {
    data: ChangesInInventoriesData;
}

const formatCurrency = (val: string): string => {
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num) || num === 0) return '-';
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

export const CostOfMaterialsConsumedNote: React.FC<CostOfMaterialsConsumedNoteProps> = ({ data }) => {
    const parse = (val: string) => parseFloat(val.replace(/,/g, '')) || 0;
    
    const openingTotal = data.opening.reduce((sum, item) => sum + parse(item.amountCy), 0);
    const closingTotal = data.closing.reduce((sum, item) => sum + parse(item.amountCy), 0);

    return (
        <div className="overflow-x-auto max-w-lg">
             <table className="min-w-full text-sm">
                <tbody className="divide-y divide-gray-700">
                    <tr className="font-semibold"><td className="p-2">Opening Stock</td><td className="p-2 text-right font-mono">{formatCurrency(openingTotal.toString())}</td></tr>
                    {data.opening.map(item => <tr key={item.id}><td className="p-2 pl-6">{item.name}</td><td className="p-2 text-right font-mono">{formatCurrency(item.amountCy)}</td></tr>)}
                    
                    <tr className="font-semibold"><td className="p-2">Add: Purchases</td><td className="p-2 text-right font-mono">{/* Add logic if purchases are tracked separately */}</td></tr>
                    
                    <tr className="font-semibold"><td className="p-2">Less: Closing Stock</td><td className="p-2 text-right font-mono">({formatCurrency(closingTotal.toString())})</td></tr>
                     {data.closing.map(item => <tr key={item.id}><td className="p-2 pl-6">{item.name}</td><td className="p-2 text-right font-mono">{formatCurrency(item.amountCy)}</td></tr>)}

                    <tr className="font-bold bg-gray-700/30">
                        <td className="p-2">Cost of Materials Consumed</td>
                        <td className="p-2 text-right font-mono">{/* Add total logic here */}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
