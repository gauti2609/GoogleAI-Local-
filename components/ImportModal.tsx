
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
// FIX: Add file extensions to fix module resolution errors.
import { TrialBalanceItem } from '../types.ts';
import { CloseIcon, UploadIcon } from './icons.tsx';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Omit<TrialBalanceItem, 'id' | 'isMapped' | 'majorHeadCode' | 'minorHeadCode' | 'groupingCode'>[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleImport = () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
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

        onImport(data);
        onClose();
      } catch (e: any) {
        setError(e.message || 'Failed to parse CSV file.');
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
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-brand-blue bg-brand-blue/10' : 'border-gray-600 hover:border-gray-500'
            }`}
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
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </main>
        <footer className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end items-center space-x-3">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
            Cancel
          </button>
          <button onClick={handleImport} disabled={!file} className="bg-brand-blue hover:bg-brand-blue-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
            Import Data
          </button>
        </footer>
      </div>
    </div>
  );
};