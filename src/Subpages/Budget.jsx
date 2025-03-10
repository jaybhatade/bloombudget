import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../Firebase';

// Budget Card Component
const BudgetCard = ({ budget, onEdit, onDelete, spent, transactionCount }) => {
  const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
  
  return (
    <div className="bg-slate-700/50 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
        <div className="text-white font-medium">{budget.categoryName}</div>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(budget)} className="text-blue-400 hover:text-blue-300 bg-slate-600/50 p-1 rounded-lg">
            <FiEdit2 size={16} />
          </button>
          <button onClick={() => onDelete(budget.id)} className="text-red-400 hover:text-red-300 bg-slate-600/50 p-1 rounded-lg">
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-300">₹{spent.toLocaleString()} of ₹{budget.amount.toLocaleString()}</span>
        <span className={percentage > 100 ? 'text-red-400' : 'text-green-400'}>{percentage}%</span>
      </div>
      
      <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden mb-2">
        <div 
          className={percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}
          style={{ width: `${Math.min(percentage, 100)}%`, height: '100%' }}
        ></div>
      </div>
      
      <div className="text-xs text-slate-400">{transactionCount} transaction{transactionCount !== 1 ? 's' : ''}</div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, textColor = "text-white" }) => (
  <div className="bg-slate-700/50 p-3 rounded-lg">
    <div className="text-slate-300 text-sm mb-1">{title}</div>
    <div className={`text-lg font-bold ${textColor}`}>{value}</div>
  </div>
);

const BudgetForm = ({ formData, setFormData, categories, onSubmit, onCancel, isEditing }) => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
  
    // Function to fetch Category ID by Name
    const getCategoryIdByName = (name) => {
      const category = categories.find(cat => cat.name === name);
      return category ? category.id : "";
    };
  
    return (
      <form onSubmit={onSubmit} className="bg-slate-800/50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          
          {/* Category Selection */}
          <div>
            <label className="block text-slate-300 mb-1 text-sm">Category</label>
            <select 
              value={formData.categoryName || ""}
              onChange={(e) => {
                const selectedCategoryName = e.target.value;
                const selectedCategoryId = getCategoryIdByName(selectedCategoryName);
                setFormData({
                  ...formData, 
                  category: selectedCategoryId, 
                  categoryName: selectedCategoryName
                });
              }}
              className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 text-sm"
              required
            >
              <option value="">Select</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
  
          {/* Amount Input */}
          <div>
            <label className="block text-slate-300 mb-1 text-sm">Amount (₹)</label>
            <input 
              type="number" 
              value={formData.amount} 
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 text-sm"
              min="0"
              required
            />
          </div> 
  
          {/* Month Selection */}
          <div>
            <label className="block text-slate-300 mb-1 text-sm">Month</label>
            <select 
              value={formData.month || ""}
              onChange={(e) => setFormData({...formData, month: e.target.value})}
              className="w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 text-sm"
              required
            >
              <option value="">Select</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>
  
        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <button 
            type="button"
            onClick={onCancel}
            className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded-lg text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
          >
            {isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    );
  };
  

// Main Budget Component
function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state consolidated into a single object
  const [formData, setFormData] = useState({
    category: "",
    categoryName: "",
    amount: "",
    month: new Date().toLocaleString('default', { month: 'long' }),
    id: null
  });
  
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
      
      // Fetch transactions
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
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
      setLoading(false);
    }
  };
  
  const calculateSpentByCategory = (categoryName) => {
    const lowerCategory = categoryName.toLowerCase();
    const categoryTransactions = transactions.filter(t => 
      t.category && t.category.toLowerCase() === lowerCategory && 
      t.type === "expense" && 
      t.amount && typeof t.amount === 'number'
    );
    
    return categoryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };
  
  const getTransactionCountByCategory = (categoryName) => {
    const lowerCategory = categoryName.toLowerCase();
    return transactions.filter(t => 
      t.category && t.category.toLowerCase() === lowerCategory && 
      t.type === "expense"
    ).length;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formData.id) {
        // Update existing budget
        const budgetRef = doc(db, "budgets", formData.id);
        await updateDoc(budgetRef, {
          category: formData.category,
          categoryName: formData.categoryName,
          amount: Number(formData.amount),
          month: formData.month
        });
      } else {
        // Add new budget
        const newBudget = {
          userID: userID,
          category: formData.category,
          categoryName: formData.categoryName,
          amount: Number(formData.amount),
          month: formData.month,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "budgets"), newBudget);
      }
      
      resetForm();
      await fetchData();
    } catch (err) {
      console.error("Error saving budget:", err);
      setError("Failed to save budget");
    }
  };
  
  const deleteBudget = async (budgetId) => {
    try {
      await deleteDoc(doc(db, "budgets", budgetId));
      await fetchData();
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError("Failed to delete budget");
    }
  };
  
  const editBudget = (budget) => {
    setFormData({
      category: budget.category,
      categoryName: budget.categoryName,
      amount: budget.amount.toString(),
      month: budget.month,
      id: budget.id
    });
    setShowForm(true);
  };
  
  const resetForm = () => {
    setFormData({
      category: "",
      categoryName: "",
      amount: "",
      month: new Date().toLocaleString('default', { month: 'long' }),
      id: null
    });
    setShowForm(false);
  };
  
  // Get unique categories from both categories collection and existing budgets
  const getUniqueCategories = () => {
    const existingCategoryNames = categories.map(cat => cat.name);
    const budgetCategories = budgets
      .filter(budget => budget.categoryName && !existingCategoryNames.includes(budget.categoryName))
      .map(budget => ({ id: `budget-${budget.category}`, name: budget.categoryName }));
    
    return [...categories, ...budgetCategories];
  };
  
  // Calculate totals
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = transactions
    .filter(t => t.type === "expense" && t.amount && typeof t.amount === 'number')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetUsagePercentage = totalBudget > 0 
    ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) 
    : 0;
  
  // Group budgets by category for display (using categoryName instead of category)
  const budgetsByCategory = budgets.reduce((acc, budget) => {
    const categoryKey = budget.categoryName || budget.category;
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(budget);
    return acc;
  }, {});
  
  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <div className="ml-2">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="bg-slate-800/70 p-4 rounded-lg">
          <div className="text-red-500 mb-2">❌ {error}</div>
          <button onClick={() => fetchData()} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Link to="/" className="mr-3 text-slate-400 hover:text-white">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Budget Dashboard</h1>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
        >
          {showForm ? <FiX className="mr-1" /> : <FiPlus className="mr-1" />}
          {showForm ? 'Cancel' : 'Add Budget'}
        </button>
      </div>

      {/* Budget Form */}
      {showForm && (
        <BudgetForm 
          formData={formData}
          setFormData={setFormData}
          categories={getUniqueCategories()}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isEditing={!!formData.id}
        />
      )}
      
      {/* Overview Section */}
      <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-3">Overview</h2>
        
        <div className="grid grid-cols-3 gap-3 mb-3">
          <StatsCard title="Total Budget" value={`₹${totalBudget.toLocaleString()}`} />
          <StatsCard title="Total Spent" value={`₹${totalSpent.toLocaleString()}`} textColor="text-red-400" />
          <StatsCard 
            title="Remaining" 
            value={`₹${remainingBudget.toLocaleString()}`} 
            textColor={remainingBudget < 0 ? 'text-red-400' : 'text-green-400'} 
          />
        </div>
        
        {/* Usage Progress Bar */}
        <div className="mb-1 flex justify-between text-xs">
          <span>Budget Usage</span>
          <span>{budgetUsagePercentage}%</span>
        </div>
        <div className="h-2 w-full bg-slate-600 rounded-full overflow-hidden">
          <div 
            className={budgetUsagePercentage > 80 ? 'bg-red-500' : 'bg-blue-500'}
            style={{ width: `${budgetUsagePercentage}%`, height: '100%' }}
          ></div>
        </div>
      </div>
      
      {/* Budgets by Category */}
      <div className="bg-slate-800/50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Budget Categories</h2>
        
        {Object.keys(budgetsByCategory).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(budgetsByCategory).map(([categoryName, categoryBudgets]) => {
              const totalCategoryBudget = categoryBudgets.reduce((sum, b) => sum + b.amount, 0);
              const spent = calculateSpentByCategory(categoryName);
              const transactionCount = getTransactionCountByCategory(categoryName);
              
              return (
                <div key={categoryName} className="bg-slate-700/40 p-3 rounded-lg">
                  
                  {/* Category Budgets */}
                  <div className="space-y-2">
                    {categoryBudgets.map(budget => (
                      <BudgetCard 
                        key={budget.id}
                        budget={budget}
                        onEdit={editBudget}
                        onDelete={deleteBudget}
                        spent={calculateSpentByCategory(budget.category)}
                        transactionCount={getTransactionCountByCategory(  budget.category)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <p className="text-slate-300 mb-2">No budgets found</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
            >
              <FiPlus className="inline mr-1" /> Create Budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Budget;