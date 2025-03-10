import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { FaMoneyBill, FaUniversity, FaCreditCard, FaWallet, FaPiggyBank } from 'react-icons/fa';
import EditAccountModal from './EditAccountModal';
import { INR } from '../Common/funcs';

const iconMap = {
  '💵': <FaMoneyBill className="w-6 h-6" />,
  '🏦': <FaUniversity className="w-6 h-6" />,
  '💳': <FaCreditCard className="w-6 h-6" />,
  '👛': <FaWallet className="w-6 h-6" />,
  '🐷': <FaPiggyBank className="w-6 h-6" />
};

const getIconColor = (icon) => {
  const colorMap = {
    '💵': 'bg-green-500',
    '🏦': 'bg-blue-500',
    '💳': 'bg-purple-500',
    '👛': 'bg-orange-500',
    '🐷': 'bg-pink-500'
  };
  
  return colorMap[icon] || 'bg-gray-500';
};

function AccountList({ accounts, onDelete, onUpdate }) {
  const [editingAccount, setEditingAccount] = useState(null);

  const handleEdit = (account) => {
    setEditingAccount(account);
  };

  const handleCloseEdit = () => {
    setEditingAccount(null);
  };

  const formatBalance = (balance) => {
    const amount = parseFloat(balance);
    const isNegative = amount < 0;
    const prefix = isNegative ? '-' : '';
    const colorClass = isNegative ? 'text-red-400' : 'text-slate-400';
    
    return (
      <span className={colorClass}>
        {prefix}{INR}{Math.abs(amount).toFixed(0)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {accounts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 p-6 rounded-lg text-center"
          >
            <p className="text-slate-400">No accounts found. Add an account to get started.</p>
          </motion.div>
        )}
        
        {accounts.map((account) => (
          <motion.div
            key={account.id}
            className="bg-slate-900 p-4 rounded-lg flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <div className="flex items-center space-x-4">
              <div className={`${getIconColor(account.icon)} p-3 rounded-full`}>
                {iconMap[account.icon] || account.icon}
              </div>
              <div>
                <h3 className="font-medium">{account.name}</h3>
                <p>{formatBalance(account.balance)}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleEdit(account)}
                className="text-slate-400 hover:text-blue-500 transition-colors"
                aria-label="Edit account"
              >
                <FiEdit className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDelete(account.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Delete account"
              >
                <FiTrash className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Edit Account Modal */}
      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          isOpen={!!editingAccount}
          onClose={handleCloseEdit}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

export default AccountList;