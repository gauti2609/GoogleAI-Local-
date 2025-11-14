

// FIX: Add file extension to fix module resolution error.
import { AllData } from '../types.ts';

// This is a placeholder for a more robust Excel export functionality.
// In a real application, you would use a library like 'xlsx' or 'exceljs'.
export const exportToExcel = (allData: AllData) => {
    console.log("Exporting data to Excel...", allData);
    alert("Excel export functionality is not fully implemented in this demo.");

    // Example of creating a simple CSV for trial balance
    const headers = ["Ledger", "Closing CY", "Closing PY", "Grouping"];
    const csvContent = [
        headers.join(','),
        ...allData.trialBalanceData.map(item => [
            `"${item.ledger.replace(/"/g, '""')}"`,
            item.closingCy,
            item.closingPy,
            item.groupingCode || 'N/A'
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "trial_balance_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};