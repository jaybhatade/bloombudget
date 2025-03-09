import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash, FiChevronDown, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { Link } from 'react-router-dom';

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', amount: 0 });
  const [editingBudget, setEditingBudget] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBudget, setExpandedBudget] = useState(null);
  const userID = localStorage.getItem('userID');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch budgets
        const budgetsQuery = query(
          collection(db, 'budgets'), 
          where('userID', '==', userID),
          where('month', '==', filterMonth)
        );
        const budgetsSnapshot = await getDocs(budgetsQuery);
        const budgetsData = budgetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBudgets(budgetsData);

        // Fetch categories
        const categoriesQuery = query(
          collection(db, 'categories'), 
          where('userID', 'in', [userID, 'default']), 
          where('type', '==', 'expense')
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesData);

        // Fetch all transactions for the user (not filtered by month)
        const transactionsQuery = query(
          collection(db, 'transactions'), 
          where('userID', '==', userID)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsData = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userID, filterMonth]);

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.amount || parseFloat(newBudget.amount) <= 0) {
      alert('Please select a category and enter a valid amount');
      return;
    }
    
    // Check if budget already exists for this category and month
    const existingBudget = budgets.find(b => b.category === newBudget.category);
    if (existingBudget) {
      alert('A budget for this category already exists');
      return;
    }
    
    try {
      const docRef = await addDoc(collection(db, 'budgets'), {
        ...newBudget,
        amount: parseFloat(newBudget.amount),
        userID,
        month: filterMonth,
        createdAt: new Date()
      });
      
      setBudgets([...budgets, { 
        id: docRef.id, 
        ...newBudget, 
        amount: parseFloat(newBudget.amount),
        month: filterMonth,
        createdAt: new Date()
      }]);
      
      setShowAddBudget(false);
      setNewBudget({ category: '', amount: 0 });
    } catch (error) {
      console.error('Error adding budget:', error);
      alert('Failed to add budget');
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await deleteDoc(doc(db, 'budgets', id));
      setBudgets(budgets.filter(budget => budget.id !== id));
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setNewBudget({ category: budget.category, amount: budget.amount });
    setShowAddBudget(true);
  };

  const handleUpdateBudget = async () => {
    if (!newBudget.category || !newBudget.amount || parseFloat(newBudget.amount) <= 0) {
      alert('Please select a category and enter a valid amount');
      return;
    }
    
    try {
      await updateDoc(doc(db, 'budgets', editingBudget.id), {
        amount: parseFloat(newBudget.amount),
        updatedAt: new Date()
      });
      
      setBudgets(budgets.map(budget => 
        budget.id === editingBudget.id 
          ? { ...budget, amount: parseFloat(newBudget.amount) } 
          : budget
      ));
      
      setShowAddBudget(false);
      setEditingBudget(null);
      setNewBudget({ category: '', amount: 0 });
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget');
    }
  };

  const calculateSpent = (category) => {
    return transactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const getBudgetStatus = (spent, amount) => {
    const ratio = spent / amount;
    if (ratio >= 1) return 'exceeded';
    if (ratio >= 0.9) return 'warning';
    if (ratio >= 0.75) return 'caution';
    return 'good';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'exceeded': return '#EF4444'; // red
      case 'warning': return '#F97316';  // orange
      case 'caution': return '#F59E0B';  // amber
      case 'good': return '#10B981';     // green
      default: return '#60A5FA';         // blue
    }
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
  };

  const getTotalSpent = () => {
    return transactions
      .filter(t => t.type === 'expense' && budgets.some(b => b.category === t.category))
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const toggleBudgetDetails = (budgetId) => {
    setExpandedBudget(expandedBudget === budgetId ? null : budgetId);
  };

  const getCategoryTransactions = (category) => {
    return transactions
      .filter(t => t.category === category && t.type === 'expense')
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">Budget Management</h1>
            <p className="text-slate-400 mt-1">Track and manage your monthly spending limits</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-slate-800 text-white rounded-lg p-2 border border-slate-700 focus:border-blue-500 outline-none"
            >
              {months.map(month => (
                <option key={month} value={month}>
                  {month} {month === currentMonth ? '(Current)' : ''}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setShowAddBudget(!showAddBudget);
                setEditingBudget(null);
                setNewBudget({ category: '', amount: 0 });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
            >
              <FiPlus className="mr-2" /> {editingBudget ? 'Edit Budget' : 'Add Budget'}
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={cardVariants}
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-5 rounded-xl shadow-lg"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="text-slate-400 mb-1">Total Budget</p>
            <h3 className="text-2xl font-bold">{formatCurrency(getTotalBudget())}</h3>
            <p className="text-slate-400 text-sm mt-1">{filterMonth}</p>
          </motion.div>
          
          <motion.div 
            variants={cardVariants}
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-5 rounded-xl shadow-lg"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="text-slate-400 mb-1">Total Spent</p>
            <h3 className="text-2xl font-bold">{formatCurrency(getTotalSpent())}</h3>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-2">
              <div 
                className="h-full rounded-full bg-blue-500"
                style={{ 
                  width: `${Math.min(100, (getTotalSpent() / getTotalBudget()) * 100)}%`,
                  backgroundColor: getStatusColor(getBudgetStatus(getTotalSpent(), getTotalBudget()))
                }}
              ></div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={cardVariants}
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-5 rounded-xl shadow-lg"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="text-slate-400 mb-1">Remaining</p>
            <h3 className="text-2xl font-bold">{formatCurrency(getTotalBudget() - getTotalSpent())}</h3>
            <p className="text-slate-400 text-sm mt-1">
              {Math.round((getTotalSpent() / getTotalBudget()) * 100)}% of budget used
            </p>
          </motion.div>
        </motion.div>

        {/* Add/Edit Budget Form */}
        {showAddBudget && (
          <motion.div
            className="mb-6 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingBudget ? 'Edit Budget' : 'Create New Budget'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="bg-slate-700 text-white rounded-lg p-2 w-full border border-slate-600 focus:border-blue-500 outline-none"
                  disabled={editingBudget !== null}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Budget Amount (₹)</label>
                <input
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  className="bg-slate-700 text-white rounded-lg p-2 w-full border border-slate-600 focus:border-blue-500 outline-none"
                  placeholder="Budget Amount"
                  min="1"
                  step="100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={editingBudget ? handleUpdateBudget : handleAddBudget}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex-1 transition-colors"
              >
                {editingBudget ? 'Update Budget' : 'Save Budget'}
              </button>
              <button
                onClick={() => {
                  setShowAddBudget(false);
                  setEditingBudget(null);
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Budget List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : budgets.length === 0 ? (
          <motion.div 
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-8 rounded-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiAlertCircle className="mx-auto text-4xl text-slate-400 mb-3" />
            <h3 className="text-xl font-semibold">No Budgets Found</h3>
            <p className="text-slate-400 mt-2">
              {filterMonth === currentMonth 
                ? "You haven't set any budgets for this month. Create one to start tracking your expenses."
                : `No budgets were set for ${filterMonth}.`}
            </p>
            <button
              onClick={() => {
                setShowAddBudget(true);
                setEditingBudget(null);
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
            >
              <FiPlus className="mr-2" /> Create Budget
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {budgets.map((budget) => {
              const spent = calculateSpent(budget.category);
              const progress = (spent / budget.amount) * 100;
              const category = categories.find(cat => cat.name === budget.category);
              const status = getBudgetStatus(spent, budget.amount);
              const statusColor = getStatusColor(status);
              const isExpanded = expandedBudget === budget.id;
              const categoryTransactions = getCategoryTransactions(budget.category);

              return (
                <motion.div
                  key={budget.id}
                  className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 text-white rounded-xl border border-slate-700 overflow-hidden"
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  layout
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                          <span>{category?.icon || '💰'}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{budget.category}</h3>
                          <p className="text-slate-400 text-sm">
                            Budget: {formatCurrency(budget.amount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditBudget(budget)}
                          className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <FiTrash size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center">
                      <div className="w-20 h-20 mr-4 mb-3 sm:mb-0">
                        <CircularProgressbar
                          value={Math.min(100, progress)}
                          text={`${Math.round(progress)}%`}
                          styles={buildStyles({
                            pathColor: statusColor,
                            textColor: '#FFFFFF',
                            trailColor: '#374151',
                            textSize: '16px'
                          })}
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Spent</span>
                          <span className={progress > 100 ? 'text-red-400 font-semibold' : ''}>
                            {formatCurrency(spent)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-400">Remaining</span>
                          <span className={budget.amount - spent < 0 ? 'text-red-400 font-semibold' : ''}>
                            {formatCurrency(budget.amount - spent)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${Math.min(100, progress)}%`,
                              backgroundColor: statusColor
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {categoryTransactions.length > 0 && (
                      <button
                        onClick={() => toggleBudgetDetails(budget.id)}
                        className="mt-4 flex items-center text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        <FiChevronDown 
                          className={`mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                        {isExpanded ? 'Hide' : 'Show'} {categoryTransactions.length} transactions
                      </button>
                    )}
                  </div>

                  {isExpanded && categoryTransactions.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-slate-900 border-t border-slate-700 overflow-hidden"
                    >
                      <div className="p-4">
                        <div className='flex justify-between items-center mb-4'>
                          <h4 className="text-sm font-semibold text-slate-300">Recent Transactions</h4>
                          <Link 
                            to="/transactions" 
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                          >
                            View All
                          </Link>
                        </div>
                        <ul className="space-y-4 max-h-60 overflow-y-auto">
                          {categoryTransactions.slice(0, 5).map(transaction => (
                            <li key={transaction.id} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                                  <span>{transaction.categoryIcon || '💰'}</span>
                                </div>
                                <div>
                                  <p className="font-medium">{transaction.description || budget.category}</p>
                                  <p className="text-slate-400 text-sm">
                                    {transaction.date?.toDate ? 
                                      new Date(transaction.date.toDate()).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 
                                      new Date(transaction.date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                                  </p>
                                  <p className="font-medium text-slate-400 truncate text-xs">{transaction.notes}</p>
                                </div>
                              </div>
                              <p className="text-red-400">
                                -₹{transaction.amount.toLocaleString()}
                              </p>
                            </li>
                          ))}
                        </ul>
                        {categoryTransactions.length > 5 && (
                          <p className="text-center text-xs text-slate-500 mt-2">
                            Showing 5 of {categoryTransactions.length} transactions
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Budget Insights */}
        {budgets.length > 0 && (
          <motion.div
            className="mt-8 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-5 rounded-xl border border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-3">Budget Insights</h3>
            <div className="space-y-2">
              {getTotalSpent() > getTotalBudget() && (
                <div className="flex items-start text-sm">
                  <FiAlertCircle className="text-red-400 mt-1 mr-2 flex-shrink-0" />
                  <p>You've exceeded your total budget for {filterMonth} by {formatCurrency(getTotalSpent() - getTotalBudget())}.</p>
                </div>
              )}
              
              {budgets.filter(b => calculateSpent(b.category) > b.amount).map(budget => (
                <div key={`insight-${budget.id}`} className="flex items-start text-sm">
                  <FiAlertCircle className="text-orange-400 mt-1 mr-2 flex-shrink-0" />
                  <p>Your "{budget.category}" spending exceeds the budget by {formatCurrency(calculateSpent(budget.category) - budget.amount)}.</p>
                </div>
              ))}
              
              {budgets.filter(b => calculateSpent(b.category) / b.amount > 0.9 && calculateSpent(b.category) / b.amount < 1).map(budget => (
                <div key={`insight-${budget.id}`} className="flex items-start text-sm">
                  <FiAlertCircle className="text-yellow-400 mt-1 mr-2 flex-shrink-0" />
                  <p>Your "{budget.category}" budget is nearly depleted ({Math.round(calculateSpent(budget.category) / budget.amount * 100)}% used).</p>
                </div>
              ))}
              
              {getTotalSpent() / getTotalBudget() <= 0.9 && getTotalSpent() / getTotalBudget() >= 0.5 && (
                <div className="flex items-start text-sm">
                  <FiCheck className="text-blue-400 mt-1 mr-2 flex-shrink-0" />
                  <p>You're on track with your overall budget for {filterMonth}, having used {Math.round(getTotalSpent() / getTotalBudget() * 100)}%.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Budget;