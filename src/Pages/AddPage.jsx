import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiTag, FiCreditCard, FiPlus, FiMoreHorizontal, FiCalendar, FiPieChart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../Firebase'; // Ensure you have Firebase initialized elsewhere
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function AddPage() {
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("🏷️");
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [categories, setCategories] = useState({
    expense: [],
    income: []
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [newPaymentMethodName, setNewPaymentMethodName] = useState("");
  const [newPaymentMethodIcon, setNewPaymentMethodIcon] = useState("💳");
  
  const userID = localStorage.getItem("userID"); // Fetch user ID from local storage
  
  // Define available emoji icons for new categories
  const emojiOptions = ["🛍️", "🍽️", "📱", "🎮", "📚", "💅", "⚽", "🤝", "🚗", "👕", "🚙", "🍺", "🚬", "💰", "💻", "📈", "🎁", "💵", "🏦", "💳", "🏠", "💊", "✈️", "🎭", "🎟️", "📊"];

  // Define payment method options
  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'card', name: 'Card', icon: '💳' },
    { id: 'account', name: 'Account', icon: '🏦' },
    { id: 'upi', name: 'UPI', icon: '📱' },
  ];

  // Payment method emoji options
  const paymentMethodEmojis = ["💵", "💳", "🏦", "📱", "👝", "💰", "🏧"];

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Get system categories (userID = 'default')
        const systemCategoriesQuery = query(
          collection(db, "categories"), 
          where("userID", "==", "default")
        );
        
        // Get user's custom categories
        const userCategoriesQuery = query(
          collection(db, "categories"),
          where("userID", "==", userID)
        );
        
        const [systemCategoriesSnapshot, userCategoriesSnapshot] = await Promise.all([
          getDocs(systemCategoriesQuery),
          getDocs(userCategoriesQuery)
        ]);
        
        const allCategories = {
          expense: [
          ],
          income: [
          ]
        };
        
        // Process system categories first
        systemCategoriesSnapshot.forEach(doc => {
          const category = { id: doc.id, ...doc.data() };
          if (category.type in allCategories) {
            allCategories[category.type].push(category);
          }
        });

        // Sort default categories alphabetically
        for (const type in allCategories) {
          allCategories[type].sort((a, b) => a.name.localeCompare(b.name));
        }
        
        // Add user categories after default ones
        userCategoriesSnapshot.forEach(doc => {
          const category = { id: doc.id, ...doc.data() };
          if (category.type in allCategories) {
            allCategories[category.type].push(category);
          }
        });
        
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoriesForType = () => {
    return categories[transactionType] || [];
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (!value || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory || !amount) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const selectedCategoryObj = getCategoriesForType().find(cat => cat.id === selectedCategory);
      
      await addDoc(collection(db, "transactions"), {
        userID,
        type: transactionType,
        amount: parseFloat(amount),
        category: selectedCategory,
        categoryName: selectedCategoryObj ? selectedCategoryObj.name : "",
        categoryIcon: selectedCategoryObj ? selectedCategoryObj.icon : "",
        date: selectedDate,
        paymentMethod,
        notes: notes.trim(),
        createdAt: serverTimestamp()
      });

      // Success, go back to main screen
      setAmount("");
      setSelectedCategory("");
      setPaymentMethod("cash");
      setNotes("");
      navigate('/');
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        type: transactionType,
        userID,
        createdAt: serverTimestamp()
      });

      const newCategory = {
        id: docRef.id,
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        type: transactionType
      };

      setCategories(prev => ({
        ...prev,
        [transactionType]: [...prev[transactionType], newCategory].sort((a, b) => 
          a.name.localeCompare(b.name)
        )
      }));

      setNewCategoryName("");
      setNewCategoryIcon("🏷️");
      setNewCategoryModal(false);
      setSelectedCategory(docRef.id);
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethodName.trim()) {
      alert("Payment method name is required");
      return;
    }

    try {
      // Get existing payment methods
      const methodsQuery = query(
        collection(db, "paymentMethods"),
        where("userID", "in", ["default", userID])
      );
      const methodsSnapshot = await getDocs(methodsQuery);
      const existingMethods = methodsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Add new payment method
      const docRef = await addDoc(collection(db, "paymentMethods"), {
        name: newPaymentMethodName.trim(),
        icon: newPaymentMethodIcon,
        userID,
        createdAt: serverTimestamp()
      });

      const newMethod = {
        id: docRef.id,
        name: newPaymentMethodName.trim(),
        icon: newPaymentMethodIcon
      };

      // Combine default methods with user methods
      const allMethods = [...paymentMethods, ...existingMethods, newMethod];
      
      // Update state
      setPaymentMethod(newMethod.id);
      setNewPaymentMethodName("");
      setNewPaymentMethodIcon("💳");
      setShowPaymentMethodModal(false);
    } catch (error) {
      console.error("Error adding payment method:", error);
      alert("Failed to add payment method. Please try again.");
    }
  };

  // Display only first 6 categories, rest in "More" popup
  const visibleCategories = getCategoriesForType().slice(0, 6);
  const moreCategories = getCategoriesForType().slice(6);

  return (
    <motion.div 
      className="min-h-screen bg-slate-950 text-white"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 bg-slate-900">
        <Link to="/" className="text-lg flex items-center text-slate-300 hover:text-white">
          <FiX className="mr-1" /> Cancel
        </Link>
        <h1 className="text-xl font-semibold">New Transaction</h1>
        <div className="w-8"></div>
      </div>



      {/* Transaction Type Selector */}
      <div className="mx-4 my-6">
        <div className="flex rounded-lg overflow-hidden shadow-lg">
          {[
            {type: "expense", color: "bg-red-500"},
            {type: "income", color: "bg-green-500"}
          ].map(({type, color}) => (
            <button
              key={type}
              className={`flex-1 py-2 text-center transition-all duration-200 ${
                transactionType === type 
                  ? `${color} text-white font-medium scale-105` 
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => {
                setTransactionType(type);
                setSelectedCategory("");
                setShowMoreCategories(false);
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Form */}
      <form onSubmit={handleSubmit} className="px-4 flex flex-col gap-6">
        {/* Category Selection */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="flex items-center text-sm font-medium text-slate-300">
              <FiTag className="mr-2" /> Category
            </label>
            <button
              type="button"
              onClick={() => setNewCategoryModal(true)}
              className="text-blue-400 flex items-center text-sm"
            >
              <FiPlus className="mr-1" /> Add New
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-pulse bg-slate-800 w-full h-24 rounded-lg"></div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {visibleCategories.map((category) => (
                <div key={category.id} className='flex flex-col items-center justify-center'>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`aspect-square rounded-full flex flex-col h-14 items-center justify-center transition-all ${
                    selectedCategory === category.id 
                      ? 'bg-blue-500 text-white scale-110' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                </button>
                  <span className="text-xs mt-1 truncate w-full text-center pt-1">{category.name}</span>
                </div>
              ))}
              
              {moreCategories.length > 0 && (
                <div className='flex flex-col items-center justify-center'>
                <button
                  type="button"
                  onClick={() => setShowMoreCategories(true)}
                  className="aspect-square rounded-full flex flex-col h-14 items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <FiMoreHorizontal className="text-2xl" />
                </button>
                  <span className="text-xs mt-1">More</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="relative">
          <label className="flex items-center text-sm font-medium mb-2 text-slate-300">
            <p className="mr-2">₹</p>Amount
          </label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full bg-slate-800 rounded-lg p-4 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="0.00"
            required
          />
        </div>

        {/* Date Picker */}
        <div>
          <label className="flex items-center text-sm font-medium mb-2 text-slate-300">
            <FiCalendar className="mr-2" /> Date
          </label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={e => setSelectedDate(new Date(e.target.value))}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-800 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Payment Method Selection */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="flex items-center text-sm font-medium text-slate-300">
              <FiCreditCard className="mr-2" /> Payment Method
            </label>
            <button
              type="button"
              onClick={() => setShowPaymentMethodModal(true)}
              className="text-blue-400 flex items-center text-sm"
            >
              <FiPlus className="mr-1" /> Add New
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className='flex flex-col justify-center'>
              <button
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`aspect-square rounded-full flex flex-col h-14 items-center justify-center transition-all ${
                  paymentMethod === method.id 
                    ? 'bg-blue-500 text-white scale-110' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
              </button>
                <span className="text-xs mt-1 truncate w-full text-center px-2">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Input */}
        <div>
          <label className="flex items-center text-sm font-medium mb-2 text-slate-300">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-800 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            placeholder="Add notes about this transaction"
            rows={2}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 py-4 px-6 rounded-lg text-white font-medium hover:bg-blue-600 transition-colors shadow-lg mt-4"
        >
          Save Transaction
        </button>
      </form>

      {/* "More Categories" Modal */}
      <AnimatePresence>
        {showMoreCategories && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMoreCategories(false)}
          >
            <motion.div 
              className="bg-slate-900 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold">All Categories </h3>
                <button onClick={() => setShowMoreCategories(false)} className="text-slate-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-4 grid grid-cols-3 gap-4">
                {moreCategories.map((category) => (
                  <div>
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setShowMoreCategories(false);
                    }}
                    className={`aspect-square h-14 rounded-full flex flex-col items-center justify-center transition-all ${
                      selectedCategory === category.id 
                        ? 'bg-blue-500 text-white scale-110' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{category.icon}</span>
                  </button>
                    <span className="text-xs mt-1 truncate w-full text-center px-2">{category.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Add Category" Modal */}
      <AnimatePresence>
        {newCategoryModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNewCategoryModal(false)}
          >
            <motion.div 
              className="bg-slate-900 rounded-xl w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Add New Category</h3>
                <button onClick={() => setNewCategoryModal(false)} className="text-slate-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full bg-slate-800 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Groceries"
                    maxLength={20}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Select Icon
                  </label>
                  <div className="grid grid-cols-7 gap-2 bg-slate-800 p-3 rounded-lg">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewCategoryIcon(emoji)}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded-full ${
                          newCategoryIcon === emoji 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setNewCategoryModal(false)}
                    className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Add Payment Method" Modal */}
      <AnimatePresence>
        {showPaymentMethodModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentMethodModal(false)}
          >
            <motion.div 
              className="bg-slate-900 rounded-xl w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Add Payment Method</h3>
                <button onClick={() => setShowPaymentMethodModal(false)} className="text-slate-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Payment Method Name
                  </label>
                  <input
                    type="text"
                    value={newPaymentMethodName}
                    onChange={(e) => setNewPaymentMethodName(e.target.value)}
                    className="w-full bg-slate-800 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Credit Card"
                    maxLength={20}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Select Icon
                  </label>
                  <div className="grid grid-cols-7 gap-2 bg-slate-800 p-3 rounded-lg">
                    {paymentMethodEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewPaymentMethodIcon(emoji)}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded-full ${
                          newPaymentMethodIcon === emoji 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPaymentMethodModal(false)}
                    className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPaymentMethod}
                    className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
                  >
                    Add Payment Method
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AddPage;