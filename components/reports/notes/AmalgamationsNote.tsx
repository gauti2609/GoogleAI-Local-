// components/reports/notes/AmalgamationsNote.tsx
import React from 'react';
import { AmalgamationData } from '../../../types.ts';

interface AmalgamationsNoteProps {
    data: AmalgamationData;
}

const format = (val: string) => {
    const num = parseFloat(val) || 0;
    return num === 0 ? '-' : num.toLocaleString('en-IN', {minimumFractionDigits: 2});
};

const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="mt-3">
        <h4 className="font-semibold text-gray-300 text-sm mb-1">{title}</h4>
        <div className="text-xs text-gray-400 space-y-1">{children}</div>
    </div>
)

export const AmalgamationsNote: React.FC<AmalgamationsNoteProps> = ({ data }) => {
    
    if (!data.amalgamatedCompany) {
        return <p className="text-sm text-gray-500 italic">No amalgamation to report during the period.</p>;
    }
    
    const parse = (val: string) => parseFloat(val) || 0;
    const totalConsideration = data.consideration.reduce((sum, item) => sum + parse(item.amount), 0);

    return (
        <div className="space-y-4 text-sm">
            <p>
                During the period, the company underwent an amalgamation in the nature of a <span className="font-semibold">{data.nature}</span> with {data.amalgamatedCompany}, effective from {data.effectiveDate}. 
                The amalgamation has been accounted for using the <span className="font-semibold">{data.accountingMethod}</span>.
            </p>

            <Section title="Details of Consideration">
                <table className="min-w-full text-xs">
                    <tbody className="divide-y divide-gray-700">
                        {data.consideration.map(item => (
                            <tr key={item.id}><td className="p-1">{item.particular}</td><td className="p-1 text-right font-mono">{format(item.amount)}</td></tr>
                        ))}
                        <tr className="font-bold border-t-2 border-gray-500">
                            <td className="p-1">Total Consideration</td><td className="p-1 text-right font-mono">{format(totalConsideration.toString())}</td>
                        </tr>
                    </tbody>
                </table>
            </Section>

            <Section title="Treatment of Reserves">
                <p className="italic">{data.treatmentOfReserves}</p>
            </Section>

            {data.additionalInfo && (
                 <Section title="Additional Information">
                    <p className="italic">{data.additionalInfo}</p>
                </Section>
            )}
        </div>
    );
};