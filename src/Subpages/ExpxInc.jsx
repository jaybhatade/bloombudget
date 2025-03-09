import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function ExpxInc() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  useEffect(() => {
    if (allTransactions.length > 0) {
      filterTransactionsByMonth();
    }
  }, [allTransactions, currentMonthIndex, currentYear]);

  const fetchAllTransactions = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "transactions"),
        where("userID", "==", userID)
      );
      const querySnapshot = await getDocs(q);
      
      const transactions = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let transactionDate;
        
        if (data.date && data.date.toDate) {
          transactionDate = data.date.toDate();
        } else if (data.date instanceof Date) {
          transactionDate = data.date;
        } else if (typeof data.date === 'string') {
          transactionDate = new Date(data.date);
        }
        
        if (transactionDate) {
          transactions.push({
            ...data,
            parsedDate: transactionDate
          });
        }
      });
      
      setAllTransactions(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekNumber = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const pastDaysOfYear = (date - firstDayOfMonth) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfMonth.getDay() + 1) / 7);
  };

  const filterTransactionsByMonth = () => {
    const weeklyData = {};
    
    // Initialize weeks
    for (let i = 1; i <= 5; i++) {
      weeklyData[i] = { week: i, income: 0, expenses: 0 };
    }
    
    let monthTotalIncome = 0;
    let monthTotalExpenses = 0;
    
    // Filter transactions for the current month and year
    allTransactions.forEach((transaction) => {
      const transactionDate = transaction.parsedDate;
      
      if (transactionDate.getMonth() === currentMonthIndex && 
          transactionDate.getFullYear() === currentYear) {
        
        const week = getWeekNumber(transactionDate);
        
        if (transaction.type === "income") {
          weeklyData[week].income += transaction.amount;
          monthTotalIncome += transaction.amount;
        } else if (transaction.type === "expense") {
          weeklyData[week].expenses += transaction.amount;
          monthTotalExpenses += transaction.amount;
        }
      }
    });

    setTotalIncome(monthTotalIncome);
    setTotalExpenses(monthTotalExpenses);

    const processedData = Object.values(weeklyData).sort((a, b) => a.week - b.week);
    setChartData(processedData);
  };

  const goToPreviousMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const formatXAxis = (week) => {
    return `Week ${week}`;
  };

  const getCurrentMonthName = () => {
    return `${months[currentMonthIndex]} ${currentYear}`;
  };

  const isCurrentMonth = currentMonthIndex === new Date().getMonth() && 
                         currentYear === new Date().getFullYear();

  return (
    <div>
      <motion.div 
        variants={cardVariants} 
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 rounded-xl shadow-lg border border-slate-700/50"
      >
        <div className="flex items-center justify-between pt-6 px-6">
          <h2 className="text-xl font-semibold">Income vs Expenses</h2>
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={goToPreviousMonth}
              className="p-1 rounded-full hover:bg-slate-700 transition-colors duration-200"
              aria-label="Previous month"
            >
              <FaChevronLeft size={18} />
            </button>
            
            <div className="text-sm text-slate-400 text-center">
              {getCurrentMonthName()}
            </div>
            
            <button 
              onClick={goToNextMonth}
              className="p-1 rounded-full hover:bg-slate-700 transition-colors duration-200"
              aria-label="Next month"
              disabled={isCurrentMonth}
            >
              <FaChevronRight 
                size={18} 
                className={isCurrentMonth ? "text-slate-600" : "text-slate-300"}
              />
            </button>
          </div>
        </div>
        
        <div className="px-6 mt-2">
          <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
            <span className="text-sm text-slate-400">Total Income:</span>
            <span className="text-lg font-semibold text-slate-200">₹{totalIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
            <span className="text-sm text-slate-400">Total Expenses:</span>
            <span className="text-lg font-semibold text-slate-200">₹{totalExpenses.toLocaleString()}</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-72 text-slate-400">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-72 text-slate-400">
            No transactions recorded for {getCurrentMonthName()}
          </div>
        ) : (
          <div className="px-4 py-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                
              >
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: '#9CA3AF' }} 
                  tickLine={{ stroke: '#6B7280' }}
                  tickFormatter={formatXAxis}
                  interval="preserveStartEnd"
                  fontSize={10}
                  
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF' }} 
                  tickLine={{ stroke: '#6B7280' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "rgba(31, 41, 55, 0.95)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                    backdropFilter: "blur(4px)"
                  }}
                  itemStyle={{ color: "#FFFFFF" }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                  labelFormatter={(label) => `${getCurrentMonthName()} ${label}`}
                />
                <Bar 
                  dataKey="income" 
                  name="Income" 
                  fill="#60A5FA" 
                  
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="expenses" 
                  name="Expenses" 
                  fill="#F87171" 
                  radius={[4, 4, 0, 0]} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 5 }}
                  iconType="circle"
                  payload={[
                    { value: 'Income', type: 'circle', color: '#60A5FA' },
                    { value: 'Expenses', type: 'circle', color: '#F87171' }
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ExpxInc;