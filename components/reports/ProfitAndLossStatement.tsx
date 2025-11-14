import React from 'react';
import { AllData } from '../../types.ts';
import { formatNumber } from '../../utils/formatNumber.ts';
import { getNoteNumberMap } from '../../utils/noteUtils.ts';

interface ReportProps {
  allData: AllData;
}

const ReportRow: React.FC<{ label: string; note?: string; valueCy?: number; valuePy?: number; isBold?: boolean; isSub?: boolean; isHeader?: boolean; formatFn: (num: number) => string; }> = 
({ label, note, valueCy, valuePy, isBold, isSub, isHeader, formatFn }) => {
    if (isHeader) {
        return (
            <tr className="font-bold bg-gray-700/30">
                <td className="p-3 text-white">{label}</td>
                <td className="p-3 text-center"></td>
                <td className="p-3 text-right"></td>
                <td className="p-3 text-right"></td>
            </tr>
        );
    }
    return (
        <tr className={`${isBold ? 'font-bold text-white' : ''}`}>
            <td className={`p-2 ${isSub ? 'pl-8' : ''}`}>{label}</td>
            <td className="p-2 text-center text-gray-400">{note}</td>
            <td className="p-2 text-right font-mono">{valueCy !== undefined ? formatFn(valueCy) : ''}</td>
            <td className="p-2 text-right font-mono">{valuePy !== undefined ? formatFn(valuePy) : ''}</td>
        </tr>
    );
};

export const ProfitAndLossStatement: React.FC<ReportProps> = ({ allData }) => {
    const { trialBalanceData, scheduleData } = allData;
    const { roundingUnit, entityType } = scheduleData.entityInfo;
    const format = (num: number) => formatNumber(num, roundingUnit);
    const parse = (val: string) => parseFloat(String(val).replace(/,/g, '')) || 0;
    
    const noteNumberMap = getNoteNumberMap(scheduleData.noteSelections);

    const getTBTotal = (groupingCode: string, year: 'cy' | 'py') => {
        const key = year === 'cy' ? 'closingCy' : 'closingPy';
        return trialBalanceData
            .filter(i => i.isMapped && i.groupingCode === groupingCode)
            .reduce((sum, item) => sum + item[key], 0);
    };

    // --- INCOME ---
    const revenueCy = Math.abs(getTBTotal('C.10.01', 'cy'));
    const revenuePy = Math.abs(getTBTotal('C.10.01', 'py'));
    const otherIncomeCy = Math.abs(getTBTotal('C.10.02', 'cy'));
    const otherIncomePy = Math.abs(getTBTotal('C.10.02', 'py'));
    const totalIncomeCy = revenueCy + otherIncomeCy;
    const totalIncomePy = revenuePy + otherIncomePy;

    // --- EXPENSES ---
    const openingStockMaterialsCy = scheduleData.costOfMaterialsConsumed.opening.reduce((s, i) => s + parse(i.amountCy), 0);
    const closingStockMaterialsCy = scheduleData.costOfMaterialsConsumed.closing.reduce((s, i) => s + parse(i.amountCy), 0);
    const purchasesMaterialsCy = getTBTotal('C.20.01', 'cy'); // Assuming C.20.01 is now for material purchases
    const costOfMaterialsConsumedCy = openingStockMaterialsCy + purchasesMaterialsCy - closingStockMaterialsCy;
    
    const purchasesStockInTradeCy = getTBTotal('C.20.02', 'cy');
    
    const openingInventoriesCy = scheduleData.changesInInventories.opening.reduce((s, i) => s + parse(i.amountCy), 0);
    const closingInventoriesCy = scheduleData.changesInInventories.closing.reduce((s, i) => s + parse(i.amountCy), 0);
    const changesInInventoriesCy = openingInventoriesCy - closingInventoriesCy;

    const employeeBenefitsCy = getTBTotal('C.20.04', 'cy');
    const financeCostsCy = getTBTotal('C.20.05', 'cy');
    const otherExpensesCy = getTBTotal('C.20.07', 'cy');
    const depreciationCy = scheduleData.ppe.assets.reduce((sum, row) => sum + parse(row.depreciationForYear), 0) +
                         scheduleData.intangibleAssets.assets.reduce((sum, row) => sum + parse(row.depreciationForYear), 0);
    
    // PY values are placeholders
    const costOfMaterialsConsumedPy = 0;
    const purchasesStockInTradePy = 0;
    const changesInInventoriesPy = 0;
    const employeeBenefitsPy = getTBTotal('C.20.04', 'py');
    const financeCostsPy = getTBTotal('C.20.05', 'py');
    const otherExpensesPy = getTBTotal('C.20.07', 'py');
    const depreciationPy = 0; 

    // Partners' Remuneration is handled after PAT for LLPs/Non-Corporates
    const partnersRemunerationCy = getTBTotal('C.20.11', 'cy');
    const partnersRemunerationPy = getTBTotal('C.20.11', 'py');
    
    const totalExpensesCy = costOfMaterialsConsumedCy + purchasesStockInTradeCy + changesInInventoriesCy + employeeBenefitsCy + financeCostsCy + otherExpensesCy + depreciationCy;
    const totalExpensesPy = costOfMaterialsConsumedPy + purchasesStockInTradePy + changesInInventoriesPy + employeeBenefitsPy + financeCostsPy + otherExpensesPy + depreciationPy;
    
    // --- PROFIT ---
    const profitBeforeExceptionalCy = totalIncomeCy - totalExpensesCy;
    const profitBeforeExceptionalPy = totalIncomePy - totalExpensesPy;
    
    const exceptionalItemsCy = scheduleData.exceptionalItems.filter(i => i.type === 'exceptional').reduce((s, i) => s + parse(i.amountCy), 0);
    const exceptionalItemsPy = 0;
    
    const profitBeforeTaxCy = profitBeforeExceptionalCy - exceptionalItemsCy;
    const profitBeforeTaxPy = profitBeforeExceptionalPy - exceptionalItemsPy;

    const taxCy = parse(scheduleData.taxExpense.currentTax) + parse(scheduleData.taxExpense.deferredTax);
    const taxPy = 0; // Not implemented
    const profitAfterTaxCy = profitBeforeTaxCy - taxCy;
    const profitAfterTaxPy = profitBeforeTaxPy - taxPy;
    
    // For LLPs/Non-Corporates, deduct remuneration after PAT to find profit transferred.
    const remunerationExpenseCy = entityType !== 'Company' ? partnersRemunerationCy : 0;
    const remunerationExpensePy = entityType !== 'Company' ? partnersRemunerationPy : 0;
    const netProfitTransferredCy = profitAfterTaxCy - remunerationExpenseCy;
    const netProfitTransferredPy = profitAfterTaxPy - remunerationExpensePy;
    
    // --- EPS ---
    const shares = parse(scheduleData.eps.weightedAvgEquityShares);
    const basicEpsCy = shares > 0 ? profitAfterTaxCy / shares : 0;
    const basicEpsPy = 0; // Not implemented

    return (
        <div className="bg-gray-800 text-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-white">Statement of Profit and Loss</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="p-3 text-left font-medium w-1/2">Particulars</th>
                            <th className="p-3 text-center font-medium">Note No.</th>
                            <th className="p-3 text-right font-medium">Current Year ({scheduleData.entityInfo.currencySymbol})</th>
                            <th className="p-3 text-right font-medium">Previous Year ({scheduleData.entityInfo.currencySymbol})</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        <ReportRow label="I. Revenue from operations" note={noteNumberMap['revenue']?.toString()} valueCy={revenueCy} valuePy={revenuePy} formatFn={format} />
                        <ReportRow label="II. Other income" note={noteNumberMap['otherIncome']?.toString()} valueCy={otherIncomeCy} valuePy={otherIncomePy} formatFn={format} />
                        <ReportRow label="III. Total Income (I + II)" valueCy={totalIncomeCy} valuePy={totalIncomePy} isBold formatFn={format} />

                        <ReportRow label="IV. EXPENSES" isHeader formatFn={format} />
                        <ReportRow label="Cost of materials consumed" note={noteNumberMap['cogs']?.toString()} valueCy={costOfMaterialsConsumedCy} valuePy={costOfMaterialsConsumedPy} formatFn={format} />
                        <ReportRow label="Purchases of Stock-in-Trade" valueCy={purchasesStockInTradeCy} valuePy={purchasesStockInTradePy} formatFn={format} />
                        <ReportRow label="Changes in inventories" note={noteNumberMap['changesInInv']?.toString()} valueCy={changesInInventoriesCy} valuePy={changesInInventoriesPy} formatFn={format} />
                        <ReportRow label="Employee benefits expense" note={noteNumberMap['employee']?.toString()} valueCy={employeeBenefitsCy} valuePy={employeeBenefitsPy} formatFn={format} />
                        <ReportRow label="Finance costs" note={noteNumberMap['finance']?.toString()} valueCy={financeCostsCy} valuePy={financeCostsPy} formatFn={format} />
                        <ReportRow label="Depreciation and amortisation expense" note={`${noteNumberMap['ppe'] || ''}, ${noteNumberMap['intangible'] || ''}`} valueCy={depreciationCy} valuePy={depreciationPy} formatFn={format} />
                        <ReportRow label="Other expenses" note={noteNumberMap['otherExpenses']?.toString()} valueCy={otherExpensesCy} valuePy={otherExpensesPy} formatFn={format} />
                        <ReportRow label="Total Expenses" valueCy={totalExpensesCy} valuePy={totalExpensesPy} isBold formatFn={format} />
                        
                        <ReportRow label="V. Profit before exceptional items and tax (III - IV)" valueCy={profitBeforeExceptionalCy} valuePy={profitBeforeExceptionalPy} isBold formatFn={format} />
                        <ReportRow label="VI. Exceptional Items" valueCy={exceptionalItemsCy} valuePy={exceptionalItemsPy} formatFn={format} />
                        
                        <ReportRow label="VII. Profit before tax (V - VI)" valueCy={profitBeforeTaxCy} valuePy={profitBeforeTaxPy} isBold formatFn={format} />
                        <ReportRow label="VIII. Tax expense" note={noteNumberMap['tax']?.toString()} valueCy={taxCy} valuePy={taxPy} formatFn={format} />
                        <ReportRow label="IX. Profit (Loss) after tax (VII - VIII)" valueCy={profitAfterTaxCy} valuePy={profitAfterTaxPy} isBold formatFn={format} />

                        {entityType === 'Company' ? (
                            <>
                                <ReportRow label="X. Earnings per equity share (for continuing operations)" isHeader formatFn={format} />
                                <ReportRow label="Basic (₹)" note={noteNumberMap['eps']?.toString()} valueCy={basicEpsCy} valuePy={basicEpsPy} formatFn={format} isSub />
                                <ReportRow label="Diluted (₹)" note={noteNumberMap['eps']?.toString()} valueCy={basicEpsCy} valuePy={basicEpsPy} formatFn={format} isSub />
                            </>
                        ) : (
                            <>
                                <ReportRow label="Less: Remuneration to Partners/Owners" valueCy={remunerationExpenseCy} valuePy={remunerationExpensePy} formatFn={format} />
                                <ReportRow label="X. Net Profit transferred to Partners'/Owners' Account" valueCy={netProfitTransferredCy} valuePy={netProfitTransferredPy} isBold formatFn={format} />
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};