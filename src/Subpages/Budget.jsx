import React from 'react';
import { motion } from 'framer-motion';

function Budget() {
  // Sample budget data - replace with real data from your state/database
  const budgetData = {
    totalBudget: 10000,
    remainingBudget: 4000,
    categories: [
      { name: 'Food', spent: 2000, budget: 3000 },
      { name: 'Transport', spent: 1000, budget: 1500 },
      { name: 'Entertainment', spent: 1500, budget: 2000 },
      { name: 'Utilities', spent: 1500, budget: 2000 }
    ]
  };

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 p-6 rounded-xl mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-300">Total Budget</span>
            <span className="font-medium">₹{budgetData.totalBudget}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Remaining Budget</span>
            <span className="font-medium text-green-400">₹{budgetData.remainingBudget}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold mb-4">Budget Categories</h2>
        <div className="space-y-3">
          {budgetData.categories.map((category, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-slate-300">{category.name}</span>
                <span className="text-sm text-slate-400 ml-2">
                  (₹{category.spent} of ₹{category.budget})
                </span>
              </div>
              <span className={`font-medium ${
                category.spent > category.budget ? 'text-red-400' : 'text-green-400'
              }`}>
                {Math.round((category.spent / category.budget) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Budget;
