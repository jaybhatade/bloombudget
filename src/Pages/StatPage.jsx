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
      <div className="p-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center mb-6"
        >
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 text-slate-400 hover:text-white transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Financial Statistics</h1>
        </motion.div>

        <div className="flex space-x-4 mb-6 border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-4 ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-2 px-4 ${
              activeTab === 'report'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Report
          </button>
        </div>

        {activeTab === 'stats' ? (
          <>
            <Statstab />
          </>
        ) : (
          <>
            <ReportTab />
          </>
        )}
      </div>

      <Navbar />
    </div>
  );
}

export default StatPage;