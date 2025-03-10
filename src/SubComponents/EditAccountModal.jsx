import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMoneyBill, FaUniversity, FaCreditCard, FaWallet, FaPiggyBank } from 'react-icons/fa';

const accountTypes = [
  { id: '💵', name: 'Cash', icon: <FaMoneyBill className="w-6 h-6" /> },
  { id: '🏦', name: 'Bank', icon: <FaUniversity className="w-6 h-6" /> },
  { id: '💳', name: 'Card', icon: <FaCreditCard className="w-6 h-6" /> },
  { id: '👛bag', name: 'Wallet', icon: <FaWallet className="w-6 h-6" /> },
  { id: '🐷', name: 'Savings', icon: <FaPiggyBank className="w-6 h-6" /> },
];

function EditAccountModal({ account, isOpen, onClose, onUpdate }) {
  const [editedAccount, setEditedAccount] = useState({ icon: '', name: '', balance: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      setEditedAccount({
        icon: account.icon || '',
        name: account.name || '',
        balance: account.balance ? account.balance.toString() : ''
      });
    }
  }, [account]);

  const handleSubmit = () => {
    if (!editedAccount.icon) {
      setError('Please select an account type');
      return;
    }
    
    if (!editedAccount.name.trim()) {
      setError('Please enter an account name');
      return;
    }
    
    if (!editedAccount.balance || isNaN(editedAccount.balance) || parseFloat(editedAccount.balance) < 0) {
      setError('Please enter a valid balance');
      return;
    }
    
    onUpdate(account.id, {
      name: editedAccount.name,
      icon: editedAccount.icon,
      balance: parseFloat(editedAccount.balance)
    });
    
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-slate-900 rounded-lg w-full max-w-md p-6"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-6">Edit Account</h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 mb-4 text-red-200">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              {accountTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setEditedAccount({ ...editedAccount, icon: type.id })}
                  className={`p-4 rounded-lg flex flex-col items-center ${
                    editedAccount.icon === type.id 
                      ? 'bg-blue-500' 
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {type.icon}
                  <span className="mt-2 text-sm">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Account Name</label>
            <input
              type="text"
              value={editedAccount.name}
              onChange={(e) => setEditedAccount({ ...editedAccount, name: e.target.value })}
              className="w-full bg-slate-800 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Balance</label>
            <input
              type="number"
              value={editedAccount.balance}
              onChange={(e) => setEditedAccount({ ...editedAccount, balance: e.target.value })}
              className="w-full bg-slate-800 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              step="0.01"
              min="0"
            />
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EditAccountModal;