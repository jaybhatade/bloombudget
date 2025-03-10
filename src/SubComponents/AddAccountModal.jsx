import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoneyBill, FaUniversity, FaCreditCard, FaWallet, FaPiggyBank } from 'react-icons/fa';

const accountTypes = [
  { id: '💵', name: 'Cash', icon: <FaMoneyBill className="w-6 h-6" /> },
  { id: '🏦', name: 'Bank', icon: <FaUniversity className="w-6 h-6" /> },
  { id: '💳', name: 'Card', icon: <FaCreditCard className="w-6 h-6" /> },
  { id: '👛', name: 'Wallet', icon: <FaWallet className="w-6 h-6" /> },
  { id: '🐷', name: 'Savings', icon: <FaPiggyBank className="w-6 h-6" /> },
];

function AddAccountModal({ isOpen, onClose, onAdd }) {
  const [newAccount, setNewAccount] = useState({ icon: '', name: '', balance: '' });
  const [error, setError] = useState('');

  const resetForm = () => {
    setNewAccount({ icon: '', name: '', balance: '' });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!newAccount.icon) {
      setError('Please select an account type');
      return;
    }
    
    if (!newAccount.name.trim()) {
      setError('Please enter an account name');
      return;
    }
    
    if (!newAccount.balance || isNaN(newAccount.balance) || parseFloat(newAccount.balance) < 0) {
      setError('Please enter a valid balance');
      return;
    }
    
    onAdd(newAccount);
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-slate-900 rounded-lg w-full max-w-md p-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-6">Add New Account</h2>
            
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
                      onClick={() => setNewAccount({ ...newAccount, icon: type.id })}
                      className={`p-4 rounded-lg flex flex-col items-center ${
                        newAccount.icon === type.id 
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
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full bg-slate-800 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Chase Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Initial Balance</label>
                <input
                  type="number"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                  className="w-full bg-slate-800 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Account
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AddAccountModal;