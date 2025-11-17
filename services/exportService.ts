
import ExcelJS from 'exceljs';
import { AllData, Masters } from '../types.ts';

/**
 * Helper function to get grouping display name
 */
const getGroupingName = (groupingCode: string | null, masters: Masters): string => {
  if (!groupingCode) return '';
  const grouping = masters.groupings.find(g => g.code === groupingCode);
  return grouping?.name || '';
};

/**
 * Helper function to get line item display name
 */
const getLineItemName = (lineItemCode: string | null, masters: Masters): string => {
  if (!lineItemCode) return '';
  const lineItem = masters.lineItems.find(li => li.code === lineItemCode);
  return lineItem?.name || '';
};

/**
 * Export comprehensive financial statements to Excel
 */
export const exportToExcel = async (allData: AllData, masters: Masters, entityName: string = 'Financial Statements') => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Financial Automation - Mapping Workbench';
  workbook.created = new Date();
  
  // 1. Create Trial Balance Sheet
  const tbSheet = workbook.addWorksheet('Trial Balance');
  
  // TB Headers
  tbSheet.columns = [
    { header: 'Ledger Name', key: 'ledger', width: 40 },
    { header: 'Closing CY', key: 'closingCy', width: 15 },
    { header: 'Closing PY', key: 'closingPy', width: 15 },
    { header: 'Mapped', key: 'mapped', width: 10 },
    { header: 'Major Head', key: 'majorHead', width: 30 },
    { header: 'Minor Head', key: 'minorHead', width: 30 },
    { header: 'Grouping', key: 'grouping', width: 35 },
    { header: 'Line Item', key: 'lineItem', width: 25 },
  ];
  
  // Style header row
  const tbHeaderRow = tbSheet.getRow(1);
  tbHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  tbHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4788' } };
  tbHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Add TB data
  allData.trialBalanceData.forEach((item, index) => {
    const majorHead = item.majorHeadCode ? masters.majorHeads.find(m => m.code === item.majorHeadCode)?.name : '';
    const minorHead = item.minorHeadCode ? masters.minorHeads.find(m => m.code === item.minorHeadCode)?.name : '';
    const grouping = getGroupingName(item.groupingCode, masters);
    const lineItem = getLineItemName(item.lineItemCode, masters);
    
    const row = tbSheet.addRow({
      ledger: item.ledger,
      closingCy: item.closingCy,
      closingPy: item.closingPy,
      mapped: item.isMapped ? 'Yes' : 'No',
      majorHead,
      minorHead,
      grouping,
      lineItem
    });
    
    // Format numbers
    row.getCell('closingCy').numFmt = '#,##0.00';
    row.getCell('closingPy').numFmt = '#,##0.00';
    
    // Alternate row colors
    if (index % 2 === 0) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    }
  });
  
  // Add total row
  const lastRow = tbSheet.lastRow?.number || 1;
  const totalRow = tbSheet.addRow({
    ledger: 'TOTAL',
    closingCy: { formula: `SUM(B2:B${lastRow})` },
    closingPy: { formula: `SUM(C2:C${lastRow})` },
  });
  totalRow.font = { bold: true };
  totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
  totalRow.getCell('closingCy').numFmt = '#,##0.00';
  totalRow.getCell('closingPy').numFmt = '#,##0.00';
  
  // 2. Create Grouping Summary Sheet
  const summarySheet = workbook.addWorksheet('Grouping Summary');
  
  summarySheet.columns = [
    { header: 'Major Head', key: 'majorHead', width: 30 },
    { header: 'Minor Head', key: 'minorHead', width: 30 },
    { header: 'Grouping', key: 'grouping', width: 35 },
    { header: 'Line Item', key: 'lineItem', width: 25 },
    { header: 'Total CY', key: 'totalCy', width: 15 },
    { header: 'Total PY', key: 'totalPy', width: 15 },
  ];
  
  // Style header
  const summaryHeaderRow = summarySheet.getRow(1);
  summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summaryHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4788' } };
  summaryHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Group and sum by grouping/line item
  const groupingMap = new Map<string, { majorHead: string, minorHead: string, grouping: string, lineItem: string, totalCy: number, totalPy: number }>();
  
  allData.trialBalanceData.filter(item => item.isMapped).forEach(item => {
    const majorHead = item.majorHeadCode ? masters.majorHeads.find(m => m.code === item.majorHeadCode)?.name || '' : '';
    const minorHead = item.minorHeadCode ? masters.minorHeads.find(m => m.code === item.minorHeadCode)?.name || '' : '';
    const grouping = getGroupingName(item.groupingCode, masters);
    const lineItem = getLineItemName(item.lineItemCode, masters);
    
    const key = `${item.majorHeadCode}|${item.minorHeadCode}|${item.groupingCode}|${item.lineItemCode}`;
    
    if (!groupingMap.has(key)) {
      groupingMap.set(key, {
        majorHead,
        minorHead,
        grouping,
        lineItem,
        totalCy: 0,
        totalPy: 0
      });
    }
    
    const existing = groupingMap.get(key)!;
    existing.totalCy += item.closingCy;
    existing.totalPy += item.closingPy;
  });
  
  // Add summary data
  let summaryIndex = 0;
  Array.from(groupingMap.values()).sort((a, b) => {
    if (a.majorHead !== b.majorHead) return a.majorHead.localeCompare(b.majorHead);
    if (a.minorHead !== b.minorHead) return a.minorHead.localeCompare(b.minorHead);
    if (a.grouping !== b.grouping) return a.grouping.localeCompare(b.grouping);
    return a.lineItem.localeCompare(b.lineItem);
  }).forEach(item => {
    const row = summarySheet.addRow(item);
    row.getCell('totalCy').numFmt = '#,##0.00';
    row.getCell('totalPy').numFmt = '#,##0.00';
    
    if (summaryIndex % 2 === 0) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    }
    summaryIndex++;
  });
  
  // 3. Create Notes Sheet with references
  const notesSheet = workbook.addWorksheet('Notes');
  notesSheet.addRow(['Financial Statement Notes']);
  notesSheet.getRow(1).font = { bold: true, size: 14 };
  notesSheet.addRow([]);
  notesSheet.addRow(['Note', 'Description', 'Amount CY', 'Amount PY']);
  
  const notesHeaderRow = notesSheet.getRow(3);
  notesHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  notesHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4788' } };
  
  // Add grouped notes with formulas referencing summary sheet
  let noteNumber = 1;
  Array.from(groupingMap.keys()).forEach((key, index) => {
    const item = groupingMap.get(key)!;
    notesSheet.addRow([
      `Note ${noteNumber}`,
      `${item.grouping}${item.lineItem ? ' - ' + item.lineItem : ''}`,
      { formula: `'Grouping Summary'!E${index + 2}` },
      { formula: `'Grouping Summary'!F${index + 2}` }
    ]);
    noteNumber++;
  });
  
  // Save and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${entityName.replace(/[^a-z0-9]/gi, '_')}_Financials_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  URL.revokeObjectURL(link.href);
  
  console.log('Excel export completed successfully');
};