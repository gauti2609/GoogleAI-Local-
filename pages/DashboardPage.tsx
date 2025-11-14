import React, { useState, useEffect } from 'react';
import { FinancialEntity, EntityType } from '../types.ts';
import * as apiService from '../services/apiService.ts';
import { PlusIcon, TrashIcon } from '../components/icons.tsx';
import { ConfirmationModal } from '../components/ConfirmationModal.tsx';

interface DashboardPageProps {
  token: string;
  onSelectEntity: (entity: FinancialEntity) => void;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ token, onSelectEntity, onLogout }) => {
  const [entities, setEntities] = useState<FinancialEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityType, setNewEntityType] = useState<EntityType>('Company');
  const [entityToDelete, setEntityToDelete] = useState<FinancialEntity | null>(null);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const data = await apiService.getEntities(token);
        setEntities(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch entities.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntities();
  }, [token]);
  
  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;
    try {
        const newEntity = await apiService.createEntity(token, newEntityName, newEntityType);
        setEntities(prev => [...prev, newEntity]);
        setCreateModalOpen(false);
        setNewEntityName('');
    } catch (err: any) {
        setError(err.message || 'Failed to create entity.');
    }
  };

  const handleDeleteEntity = async () => {
    if (!entityToDelete) return;
    try {
        await apiService.deleteEntity(token, entityToDelete.id);
        setEntities(prev => prev.filter(e => e.id !== entityToDelete.id));
        setEntityToDelete(null);
    } catch (err: any) {
        setError(err.message || 'Failed to delete entity.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">FinAutomate Dashboard</h1>
            <p className="text-gray-400">Select an entity to work on or create a new one.</p>
        </div>
        <button onClick={onLogout} className="text-sm text-gray-400 hover:text-white">Logout</button>
      </header>
      
      {isLoading && <p>Loading entities...</p>}
      {error && <p className="text-red-400">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {entities.map(entity => (
          <div key={entity.id} className="group bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-brand-blue cursor-pointer transition-colors relative" onClick={() => onSelectEntity(entity)}>
            <h2 className="font-bold text-lg text-white truncate">{entity.name}</h2>
            <p className="text-sm text-gray-400">{entity.entityType}</p>
            <p className="text-xs text-gray-500 mt-4">Last updated: {new Date(entity.updatedAt).toLocaleDateString()}</p>
             <button
              onClick={(e) => {
                e.stopPropagation();
                setEntityToDelete(entity);
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-gray-700/50 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-opacity"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
         <button onClick={() => setCreateModalOpen(true)} className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-gray-600 hover:border-brand-blue hover:text-brand-blue text-gray-500 transition-colors">
            <PlusIcon className="w-8 h-8 mb-2" />
            <span className="font-semibold">Create New Entity</span>
        </button>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Create New Financial Entity</h2>
                <form onSubmit={handleCreateEntity}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400">Entity Name</label>
                        <input type="text" value={newEntityName} onChange={e => setNewEntityName(e.target.value)} required className="w-full mt-1 p-2 bg-gray-700 rounded-md"/>
                    </div>
                     <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400">Entity Type</label>
                         <select value={newEntityType} onChange={e => setNewEntityType(e.target.value as EntityType)} className="w-full mt-1 p-2 bg-gray-700 rounded-md">
                            <option value="Company">Company</option>
                            <option value="LLP">LLP</option>
                            <option value="Non-Corporate">Non-Corporate Entity</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setCreateModalOpen(false)} className="py-2 px-4 bg-gray-600 rounded-md">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-brand-blue rounded-md">Create</button>
                    </div>
                </form>
            </div>
        </div>
      )}
      
      <ConfirmationModal
        isOpen={!!entityToDelete}
        onClose={() => setEntityToDelete(null)}
        onConfirm={handleDeleteEntity}
        title="Delete Entity?"
        message={`Are you sure you want to permanently delete "${entityToDelete?.name}"? All associated data will be lost.`}
        confirmButtonText="Yes, Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />

    </div>
  );
};