
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
// FIX: Add file extensions to fix module resolution errors.
import { TrialBalanceItem, Masters } from '../types.ts';
import { CloseIcon, UploadIcon } from './icons.tsx';
import * as apiService from '../services/apiService.ts';
import { batchAutoMapLedgers } from '../utils/autoMapping.ts';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Omit<TrialBalanceItem, 'id' | 'isMapped' | 'majorHeadCode' | 'minorHeadCode' | 'groupingCode' | 'lineItemCode'>[]) => void;
  masters: Masters;
  token: string;
  setTrialBalanceData: React.Dispatch<React.SetStateAction<TrialBalanceItem[]>>;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, masters, token, setTrialBalanceData }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoMapEnabled, setAutoMapEnabled] = useState(false);
  const [useFuzzyLogic, setUseFuzzyLogic] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target?.result as string;
        const rows = csvText.split('\n').filter(row => row.trim() !== '');
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/\s/g, ''));
        const ledgerIndex = headers.indexOf('ledger');
        const closingCyIndex = headers.indexOf('closingcy');
        const closingPyIndex = headers.indexOf('closingpy'); // Optional

        if (ledgerIndex === -1 || closingCyIndex === -1) {
          throw new Error('CSV must contain "ledger" and "closingCy" columns.');
        }

        const data = rows.slice(1).map((row, i) => {
          const values = row.split(',');
          const ledger = values[ledgerIndex]?.trim();
          const closingCy = parseFloat(values[closingCyIndex]?.trim());
          const closingPy = closingPyIndex > -1 ? parseFloat(values[closingPyIndex]?.trim()) : 0;
          
          if (!ledger || isNaN(closingCy)) {
            throw new Error(`Invalid data found in row ${i + 2}. Check ledger and closingCy columns.`);
          }
          return { ledger, closingCy, closingPy: isNaN(closingPy) ? 0 : closingPy };
        });

        if (autoMapEnabled) {
          setIsProcessing(true);
          setProgress({ current: 0, total: data.length });
          
          try {
            let mappedData: TrialBalanceItem[];
            
            // Try AI suggestions first if available
            try {
              const results = await apiService.getBulkMappingSuggestions(
                token,
                data.map(d => ({ ledgerName: d.ledger, closingBalance: d.closingCy })),
                masters,
                (current, total) => setProgress({ current, total })
              );
              
              // Map the data with AI suggestions (auto-map if confidence >= 0.85)
              mappedData = data.map(item => {
                const result = results.find(r => r.ledgerName === item.ledger);
                const suggestion = result?.suggestion;
                
                if (suggestion && suggestion.confidence >= 0.85) {
                  return {
                    ...item,
                    id: uuidv4(),
                    isMapped: true,
                    majorHeadCode: suggestion.majorHeadCode,
                    minorHeadCode: suggestion.minorHeadCode,
                    groupingCode: suggestion.groupingCode,
                    lineItemCode: suggestion.lineItemCode || null,
                  };
                } else {
                  return {
                    ...item,
                    id: uuidv4(),
                    isMapped: false,
                    majorHeadCode: null,
                    minorHeadCode: null,
                    groupingCode: null,
                    lineItemCode: null,
                  };
                }
              });
              
              const aiMappedCount = mappedData.filter(d => d.isMapped).length;
              
              // Apply fuzzy logic to unmapped items if enabled
              if (useFuzzyLogic && aiMappedCount < data.length) {
                const unmappedItems = mappedData.filter(d => !d.isMapped);
                const fuzzyResults = batchAutoMapLedgers(
                  unmappedItems.map(d => ({ ledger: d.ledger, closingCy: d.closingCy })),
                  masters,
                  0.55 // Lower threshold for fuzzy matching
                );
                
                let fuzzyMappedCount = 0;
                mappedData = mappedData.map(item => {
                  if (item.isMapped) return item;
                  
                  const fuzzyResult = fuzzyResults.find(r => r.ledgerName === item.ledger);
                  if (fuzzyResult?.mapping) {
                    fuzzyMappedCount++;
                    return {
                      ...item,
                      isMapped: true,
                      majorHeadCode: fuzzyResult.mapping.majorHeadCode,
                      minorHeadCode: fuzzyResult.mapping.minorHeadCode,
                      groupingCode: fuzzyResult.mapping.groupingCode,
                      lineItemCode: fuzzyResult.mapping.lineItemCode || null,
                    };
                  }
                  return item;
                });
                
                setTrialBalanceData(mappedData);
                const totalMapped = aiMappedCount + fuzzyMappedCount;
                alert(
                  `Import with auto-mapping complete!\n` +
                  `${aiMappedCount} ledgers mapped by AI (≥85% confidence)\n` +
                  `${fuzzyMappedCount} ledgers mapped by fuzzy logic (≥55% similarity)\n` +
                  `${data.length - totalMapped} ledgers require manual mapping`
                );
              } else {
                setTrialBalanceData(mappedData);
                alert(`Import with AI auto-mapping complete!\n${aiMappedCount} of ${data.length} ledgers auto-mapped with high confidence.`);
              }
              
              onClose();
            } catch (aiError: any) {
              // If AI fails, fallback to fuzzy logic only
              console.warn('AI mapping failed, using fuzzy logic fallback:', aiError);
              
              if (useFuzzyLogic) {
                const fuzzyResults = batchAutoMapLedgers(
                  data.map(d => ({ ledger: d.ledger, closingCy: d.closingCy })),
                  masters,
                  0.55
                );
                
                mappedData = data.map(item => {
                  const fuzzyResult = fuzzyResults.find(r => r.ledgerName === item.ledger);
                  if (fuzzyResult?.mapping) {
                    return {
                      ...item,
                      id: uuidv4(),
                      isMapped: true,
                      majorHeadCode: fuzzyResult.mapping.majorHeadCode,
                      minorHeadCode: fuzzyResult.mapping.minorHeadCode,
                      groupingCode: fuzzyResult.mapping.groupingCode,
                      lineItemCode: fuzzyResult.mapping.lineItemCode || null,
                    };
                  }
                  return {
                    ...item,
                    id: uuidv4(),
                    isMapped: false,
                    majorHeadCode: null,
                    minorHeadCode: null,
                    groupingCode: null,
                    lineItemCode: null,
                  };
                });
                
                const fuzzyMappedCount = mappedData.filter(d => d.isMapped).length;
                setTrialBalanceData(mappedData);
                alert(
                  `Import with fuzzy logic complete!\n` +
                  `${fuzzyMappedCount} of ${data.length} ledgers auto-mapped using similarity matching (≥55%).\n` +
                  `AI suggestions were not available.`
                );
                onClose();
              } else {
                throw new Error(`Auto-mapping failed: ${aiError.message}. Please try again or import without auto-mapping.`);
              }
            }
          } catch (err: any) {
            setError(`Auto-mapping failed: ${err.message}. Importing without mapping.`);
            onImport(data);
          } finally {
            setIsProcessing(false);
            setProgress({ current: 0, total: 0 });
          }
        } else {
          onImport(data);
          onClose();
        }
      } catch (e: any) {
        setError(e.message || 'Failed to parse CSV file.');
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-full max-w-lg">
        <header className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-100">Import Trial Balance</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" disabled={isProcessing}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-brand-blue bg-brand-blue/10' : 'border-gray-600 hover:border-gray-500'
            } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <UploadIcon className="w-12 h-12 mx-auto text-gray-500 mb-2" />
            {file ? (
              <p className="text-gray-300">File selected: <span className="font-semibold">{file.name}</span></p>
            ) : (
              <p className="text-gray-400">Drag & drop a CSV file here, or click to select a file.</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Required columns: 'ledger', 'closingCy'. Optional: 'closingPy'.</p>
          </div>
          
          <div className="mt-4 space-y-3">
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={autoMapEnabled}
                onChange={(e) => setAutoMapEnabled(e.target.checked)}
                disabled={isProcessing}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-blue focus:ring-brand-blue mr-2"
              />
              Enable auto-mapping during import
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Automatically map ledgers using AI and fuzzy logic. Saves time!
            </p>
            
            {autoMapEnabled && (
              <label className="flex items-center text-sm text-gray-300 ml-6">
                <input
                  type="checkbox"
                  checked={useFuzzyLogic}
                  onChange={(e) => setUseFuzzyLogic(e.target.checked)}
                  disabled={isProcessing}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-brand-blue focus:ring-brand-blue mr-2"
                />
                Use fuzzy logic as fallback (≥70% similarity)
              </label>
            )}
          </div>
          
          {isProcessing && (
            <div className="mt-4 p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-lg">
              <p className="text-sm text-brand-blue-light">
                Processing auto-mapping: {progress.current} of {progress.total}...
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-brand-blue h-2 rounded-full transition-all"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </main>
        <footer className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end items-center space-x-3">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleImport} 
            disabled={!file || isProcessing} 
            className="bg-brand-blue hover:bg-brand-blue-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
          >
            {isProcessing ? 'Processing...' : 'Import Data'}
          </button>
        </footer>
      </div>
    </div>
  );
};