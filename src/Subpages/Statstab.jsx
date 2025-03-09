import React from 'react'
import { motion } from 'framer-motion';


function Statstab() {
    // Sample stats data - replace with real data from your state/database
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
      <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Income</span>
                    <span className="font-medium">₹{statsData.monthlyIncome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Expenses</span>
                    <span className="font-medium">₹{statsData.monthlyExpenses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Savings Rate</span>
                    <span className="font-medium text-green-400">{statsData.savingsRate}%</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
                <div className="space-y-3">
                  {statsData.expenseBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-slate-300">{item.category}</span>
                        <span className="text-sm text-slate-400 ml-2">({item.percentage}%)</span>
                      </div>
                      <span className="font-medium">₹{item.amount}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 p-6 rounded-xl mb-20"
            >
              <h2 className="text-xl font-semibold mb-4">Monthly Trend</h2>
              <div className="flex justify-between items-end h-40">
                {statsData.monthlyTrend.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-12 bg-blue-500/50 rounded-t-md"
                      style={{ height: `${(item.expenses / statsData.monthlyIncome) * 100}%` }}
                    ></div>
                    <span className="text-sm text-slate-400 mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
    </div>
  )
}

export default Statstab
