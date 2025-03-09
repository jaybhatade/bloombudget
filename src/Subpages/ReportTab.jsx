import React from 'react'
import { motion } from 'framer-motion';

function ReportTab() {
    const statsData = {
        monthlyIncome: 10000,
        monthlyExpenses: 6000,
        savingsRate: 40,
        expenseBreakdown: [
          { category: 'Food', amount: 2000, percentage: 33.3 },
          { category: 'Transport', amount: 1000, percentage: 16.7 },
          { category: 'Entertainment', amount: 1500, percentage: 25 },
          { category: 'Utilities', amount: 1500, percentage: 25 }
        ],
        monthlyTrend: [
          { month: 'Jan', expenses: 5800 },
          { month: 'Feb', expenses: 6200 },
          { month: 'Mar', expenses: 6000 },
        ]
      };
  return (
    <div>
      <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 p-6 rounded-xl mb-20"
          >
            <h2 className="text-xl font-semibold mb-4">Financial Report</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Income Summary</h3>
                <p className="text-slate-300">Total Income: ₹{statsData.monthlyIncome}</p>
              </div>
              <div className="p-4 bg-slate-700/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Expense Summary</h3>
                <p className="text-slate-300">Total Expenses: ₹{statsData.monthlyExpenses}</p>
                <div className="mt-2 space-y-2">
                  {statsData.expenseBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-slate-300">
                      <span>{item.category}</span>
                      <span>₹{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-slate-700/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Savings</h3>
                <p className="text-slate-300">Savings Rate: {statsData.savingsRate}%</p>
                <p className="text-slate-300">Net Savings: ₹{statsData.monthlyIncome - statsData.monthlyExpenses}</p>
              </div>
            </div>
          </motion.div>

    </div>
  )
}

export default ReportTab
