
import React from 'react';
// FIX: Add file extensions to fix module resolution errors.
import { Masters, MajorHead, MinorHead, Grouping } from '../types.ts';
import { CloseIcon } from './icons.tsx';

interface MastersModalProps {
    isOpen: boolean;
    onClose: () => void;
    masters: Masters;
    setMasters: (masters: Masters) => void; // For potential future editing
}

const MasterRow: React.FC<{ item: MajorHead | MinorHead | Grouping, level: number }> = ({ item, level }) => {
    return (
        <div>
            <div className={`flex items-center p-2 rounded-md ${level === 0 ? 'bg-gray-700/50' : ''}`}>
                <div style={{ paddingLeft: `${level * 1.5}rem` }} className="flex-1">
                    <span className="font-semibold text-gray-300">{item.code}</span>
                    <span className="ml-4 text-gray-400">{item.name}</span>
                </div>
            </div>
        </div>
    );
};


export const MastersModal: React.FC<MastersModalProps> = ({ isOpen, onClose, masters }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-full max-w-2xl flex flex-col" style={{height: '90vh'}}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-100">Chart of Accounts Masters</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-2">
                        {masters.majorHeads.map(major => (
                            <div key={major.code} className="bg-gray-900/50 rounded-lg p-2">
                                <MasterRow item={major} level={0} />
                                <div className="pl-6 pt-2 space-y-1">
                                    {masters.minorHeads.filter(minor => minor.majorHeadCode === major.code).map(minor => (
                                        <div key={minor.code}>
                                            <MasterRow item={minor} level={1} />
                                             <div className="pl-6 pt-2 space-y-1">
                                                 {masters.groupings.filter(group => group.minorHeadCode === minor.code).map(group => (
                                                    <MasterRow key={group.code} item={group} level={2} />
                                                 ))}
                                             </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                 <footer className="p-4 bg-gray-800/50 border-t border-gray-700 flex justify-end items-center">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};