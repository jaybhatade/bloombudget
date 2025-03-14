import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Statstab from '../Subpages/Statstab';
import ReportTab from '../Subpages/ReportTab';

function StatPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');

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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Main content with padding for desktop side nav */}
      <div className="p-4 pb-24 lg:pl-72">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center mb-6"
        >
          <h1 className="text-2xl font-bold">Financial Statistics</h1>
        </motion.div>

        <div className="flex space-x-4 mb-6 border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-4 ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            } transition-colors duration-200`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-2 px-4 ${
              activeTab === 'report'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            } transition-colors duration-200`}
          >
            Report
          </button>
        </div>

        {/* Tab content container with responsive layout */}
        <div className="w-full">
          {activeTab === 'stats' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Statstab />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ReportTab />
            </motion.div>
          )}
        </div>
      </div>

      <Navbar />
    </div>
  );
}

export default StatPage;