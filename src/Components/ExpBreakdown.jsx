import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";


const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ExpBreakdown() {
  const [expenseData, setExpenseData] = useState([]);
  const [currentMonthName, setCurrentMonthName] = useState('');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [totalExpense, setTotalExpense] = useState(0);
  const userID = localStorage.getItem("userID");

  const goToPreviousMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const goToNextMonth = () => {
    const now = new Date();
    const isCurrentMonthYear = currentMonthIndex === now.getMonth() && currentYear === now.getFullYear();
    
    // Don't allow navigating to future months
    if (isCurrentMonthYear) {
      return;
    }
    
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  useEffect(() => {
    // Update month name when month or year changes
    const date = new Date(currentYear, currentMonthIndex, 1);
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    setCurrentMonthName(monthName);
    
    fetchTransactions();
  }, [currentMonthIndex, currentYear]);

  const fetchTransactions = async () => {
    try {
      // Get all expense transactions without date filter
      const q = query(
        collection(db, "transactions"),
        where("userID", "==", userID),
        where("type", "==", "expense")
      );
      const querySnapshot = await getDocs(q);
      
      const categoryMap = new Map();
      let monthlyTotal = 0;
      
      // Filter for selected month transactions in code
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const category = data.categoryName;
        const amount = data.amount;
        
        // Convert timestamp to Date or use date string
        let transactionDate;
        if (data.date && data.date.toDate) {
          // If using Firestore Timestamp
          transactionDate = data.date.toDate();
        } else if (data.date instanceof Date) {
          // If already a Date object
          transactionDate = data.date;
        } else if (typeof data.date === 'string') {
          // If date string
          transactionDate = new Date(data.date);
        }
        
        // Check if transaction is from selected month and year
        if (transactionDate && 
            transactionDate.getMonth() === currentMonthIndex && 
            transactionDate.getFullYear() === currentYear) {
          
          if (categoryMap.has(category)) {
            categoryMap.set(category, categoryMap.get(category) + amount);
          } else {
            categoryMap.set(category, amount);
          }
          
          monthlyTotal += amount;
        }
      });

      setTotalExpense(monthlyTotal);

      const colors = ["#FF6B6B", "#4ECDC4", "#FFD166", "#6A0572", "#1A535C"];
      const processedData = Array.from(categoryMap).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      setExpenseData(processedData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  return (
    <div>
      <motion.div 
        variants={cardVariants} 
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 rounded-xl shadow-lg border border-slate-700/50"
      >
        <div className="flex items-center justify-between pt-6 px-6">
          <h2 className="text-xl font-semibold">Expense Breakdown</h2>
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={goToPreviousMonth}
              className="p-1 rounded-full hover:bg-slate-700 transition-colors duration-200"
              aria-label="Previous month"
            >
              <FaChevronLeft size={18} />
            </button>
            
            <div className="text-sm text-slate-400 text-center">
              {currentMonthName}
            </div>
            
            <button 
              onClick={goToNextMonth}
              className="p-1 rounded-full hover:bg-slate-700 transition-colors duration-200"
              aria-label="Next month"
              disabled={currentMonthIndex === new Date().getMonth() && currentYear === new Date().getFullYear()}
            >
              <FaChevronRight 
                size={18} 
                className={currentMonthIndex === new Date().getMonth() && currentYear === new Date().getFullYear() 
                  ? "text-slate-600" 
                  : "text-slate-300"}
              />
            </button>
          </div>
        </div>
        
        <div className="px-6 mt-2">
          <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
            <span className="text-sm text-slate-400">Total Expenses:</span>
            <span className="text-lg font-semibold text-slate-200">₹{totalExpense.toLocaleString()}</span>
          </div>
        </div>
        
        {expenseData.length > 0 ? (
          <div className="flex flex-col md:flex-row items-center overflow-hidden">
            <div className="w-full md:w-1/2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={{
                      stroke: "#6B7280",
                      strokeWidth: 1,
                      strokeDasharray: "2 2"
                    }}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      outerRadius,
                      name,
                      percent
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius * 1.3;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#9CA3AF"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          className="text-[12px] font-medium"
                        >
                          {`${name} (${(percent * 100).toFixed(0)}%)`}
                        </text>
                      );
                    }}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="transparent"
                        className="hover:opacity-80 transition-opacity duration-300"
                      />
                    ))}
                  </Pie>
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
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 px-6 pb-6">
              <ul className="space-y-2">
                {expenseData.map((item, index) => (
                  <li 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/50 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium text-slate-200">{item.name}</span>
                    </div>
                    <span className="font-semibold">₹{item.value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-72 text-slate-400">
            No expenses recorded for {currentMonthName}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ExpBreakdown;