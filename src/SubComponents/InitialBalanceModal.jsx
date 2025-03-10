import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoneyBill, FaUniversity } from 'react-icons/fa';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../Firebase';
import { INR } from '../Common/funcs';

function InitialBalanceModal({ isOpen, onClose, onComplete }) {
  const [cashBalance, setCashBalance] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const userID = localStorage.getItem('userID');

  const validateInputs = () => {
    if (cashBalance === '' && accountBalance === '') {
      setError('Please enter at least one balance');
      return false;
    }
    
    if (cashBalance && (isNaN(cashBalance) || parseFloat(cashBalance) < 0)) {
      setError('Please enter a valid cash balance');
      return false;
    }
    
    if (accountBalance && (isNaN(accountBalance) || parseFloat(accountBalance) < 0)) {
      setError('Please enter a valid account balance');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;
    
    try {
      setIsSubmitting(true);
      const batch = [];
      
      // Add cash account if balance is provided
      if (cashBalance && parseFloat(cashBalance) > 0) {
        batch.push(
          addDoc(collection(db, 'accounts'), {
            name: 'Cash',
            balance: parseFloat(cashBalance),
            icon: '💵',
            userID: userID,
            createdAt: serverTimestamp()
          })
        );
      }
      
      // Add bank account if balance is provided
      if (accountBalance && parseFloat(accountBalance) > 0) {
        batch.push(
          addDoc(collection(db, 'accounts'), {
            name: 'Bank Account',
            balance: parseFloat(accountBalance),
            icon: '🏦',
            userID: userID,
            createdAt: serverTimestamp()
          })
        );
      }
      
      // Execute all operations
      await Promise.all(batch);
      
      if (onComplete) {
        onComplete();
      }
      
    } catch (error) {
      console.error("Error setting up initial balances:", error);
      setError('Failed to set up accounts. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-slate-900 rounded-lg w-full max-w-md p-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-2">Welcome to Bloom Budget</h2>
            <p className="text-slate-400 mb-6">Let's set up your starting balances to get started</p>
            
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 mb-4 text-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              {/* Cash Balance */}
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-green-500 p-2 rounded-full">
                    <FaMoneyBill className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium">Cash</h3>
                </div>
                
                <div className="flex items-center">
                  <span className="text-slate-400 mr-2">{INR}</span>
                  <input
                    type="number"
                    value={cashBalance}
                    onChange={(e) => setCashBalance(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="0"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              {/* Account Balance */}
              <div className="bg-slate-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <FaUniversity className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium">Bank Account</h3>
                </div>
                
                <div className="flex items-center">
                  <span className="text-slate-400 mr-2">{INR}</span>
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                    step="0.01"
                    min="0"
                  />
                </div>

              </div>
                <p className='text-sm'>
                    Note: You can update it later in profile {'>'} manage account
                </p>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InitialBalanceModal;