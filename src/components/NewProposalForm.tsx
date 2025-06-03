import React, { useState } from 'react';
import { useDAOStore } from '../store/daoStore';
import { FileText, DollarSign } from 'lucide-react';

const NewProposalForm: React.FC = () => {
  const { createProposal, loading } = useDAOStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'text' | 'fund'>('text');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || (type === 'fund' && !amount)) {
      return;
    }
    
    await createProposal({
      title,
      description,
      type,
      amount,
      deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setType('text');
    setAmount(undefined);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Proposal Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter proposal title"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe your proposal"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proposal Type
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setType('text')}
            className={`flex-1 flex items-center justify-center p-3 rounded-md border ${
              type === 'text'
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-5 w-5 mr-2" />
            <span>Text Based</span>
          </button>
          
          <button
            type="button"
            onClick={() => setType('fund')}
            className={`flex-1 flex items-center justify-center p-3 rounded-md border ${
              type === 'fund'
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="h-5 w-5 mr-2" />
            <span>Fund Transfer</span>
          </button>
        </div>
      </div>
      
      {type === 'fund' && (
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (ALGO)
          </label>
          <input
            type="number"
            id="amount"
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || undefined)}
            min="0.1"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter amount in ALGO"
            required
          />
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !title.trim() || !description.trim() || (type === 'fund' && !amount)}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Proposal'}
      </button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Voting period will be 7 days from creation
      </p>
    </form>
  );
};

export default NewProposalForm;