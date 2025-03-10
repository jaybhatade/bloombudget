import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import "react-circular-progressbar/dist/styles.css";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';

function BudgetCard() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userID = localStorage.getItem('userID');

  useEffect(() => {
    if (!userID) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    fetchData();
  }, [userID]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoryQuery = query(
        collection(db, "categories"),
        where("type", "==", "expense"),
        where("userID", "in", [userID, "default"])
      );
      const categorySnapshot = await getDocs(categoryQuery);
      const categoryList = categorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoryList);
      
      // Fetch budgets
      const budgetQuery = query(collection(db, "budgets"), where("userID", "==", userID));
      const budgetSnapshot = await getDocs(budgetQuery);
      const budgetList = budgetSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If any budget does not have categoryName, try to set it by looking up the category name
      const updatedBudgetList = budgetList.map(budget => {
        if (!budget.categoryName && budget.category) {
          const matchingCategory = categoryList.find(cat => cat.id === budget.category);
          if (matchingCategory) {
            budget.categoryName = matchingCategory.name;
          } else {
            // If no match, use the category ID as fallback
            budget.categoryName = budget.category;
          }
        }
        return budget;
      });
      
      setBudgets(updatedBudgetList);
      
      // Fetch all expense transactions at once
      const transactionQuery = query(
        collection(db, "transactions"), 
        where("userID", "==", userID),
        where("type", "==", "expense")
      );
      const transactionSnapshot = await getDocs(transactionQuery);
      const transactionList = transactionSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transactionList);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 p-4 rounded-lg mb-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-600/50 rounded mb-3"></div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="h-20 bg-slate-700/50 rounded-lg"></div>
          <div className="h-20 bg-slate-700/50 rounded-lg"></div>
          <div className="h-20 bg-slate-700/50 rounded-lg"></div>
        </div>
        <div className="h-2 w-full bg-slate-600 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-700/50 p-4 rounded-lg shadow-md">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  // Calculate totals for all budgets
  const totalBudget = budgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
  
  // Calculate total spent from all expense transactions
  const totalSpent = transactions
    .filter(t => t.type === "expense" && t.amount && typeof t.amount === 'number')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const remainingBudget = totalBudget - totalSpent;
  const budgetUsagePercentage = totalBudget > 0 
    ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) 
    : 0;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Overview Section */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-4 rounded-lg mb-4">
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Budget Overview</h2>
        </div>
        
        <div className="flex  mb-4 justify-between items-center">
          <div className=" rounded-lg">
            <div className="text-slate-300 text-sm mb-1">Total Budget</div>
            <div className="text-lg font-bold text-white">₹{totalBudget.toLocaleString()}</div>
          </div>
          <div className=" rounded-lg">
            <div className="text-slate-300 text-sm mb-1">Total Spent</div>
            <div className="text-lg font-bold text-red-400">₹{totalSpent.toLocaleString()}</div>
          </div>
          <div className="rounded-lg">
            <div className="text-slate-300 text-sm mb-1">Remaining</div>
            <div className={`text-lg font-bold ${remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
              ₹{remainingBudget.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 mr-4">
            <CircularProgressbar
              value={budgetUsagePercentage}
              text={`${budgetUsagePercentage}%`}
              styles={buildStyles({
                pathColor: budgetUsagePercentage > 90 ? "#F87171" : "#60A5FA",
                textColor: "#FFFFFF",
                trailColor: "#374151",
              })}
            />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs">
              <span>Budget Utilization</span>
              <span>{budgetUsagePercentage}% Used</span>
            </div>
            <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
              <div 
                className={budgetUsagePercentage > 90 ? 'bg-red-500' : budgetUsagePercentage > 75 ? 'bg-yellow-500' : 'bg-blue-500'}
                style={{ width: `${budgetUsagePercentage}%`, height: '100%' }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-slate-400 mt-3">
          Based on {transactions.length} transactions across {budgets.length} budget categories
        </div>
      </div>
    </motion.div>
  );
}

export default BudgetCard;