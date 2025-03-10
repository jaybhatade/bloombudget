import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { collection, addDoc, getDocs, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../Firebase';

// Import components
import TransactionTypeSelector from '../Components/TransactionTypeSelector';
import CategorySelector from '../Components/CategorySelector';
import AmountInput from '../Components/AmountInput';
import DateSelector from '../Components/DateSelector';
import PaymentMethodSelector from '../Components/PaymentMethodSelector';
import NotesInput from '../Components/NotesInput';

function AddPage() {
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");  // Changed from "cash" to empty string
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState({
    expense: [],
    income: []
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const userID = localStorage.getItem("userID");
  
  // Define emoji options for categories and payment methods to pass to child components
  const emojiOptions = ["🛍️", "🍽️", "📱", "🎮", "📚", "💅", "⚽", "🤝", "🚗", "👕", "🚙", "🍺", "🚬", "💰", "💻", "📈", "🎁", "💵", "🏦", "💳", "🏠", "💊", "✈️", "🎭", "🎟️", "📊"];
  const paymentMethodEmojis = ["💵", "💳", "🏦", "📱", "👝", "💰", "🏧"];

  // Fetch payment methods and categories from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        
        // Get user's custom payment methods
        const userPaymentMethodsQuery = query(
          collection(db, "accounts"),
          where("userID", "==", userID)
        );

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
        
        const [
          userPaymentMethodsSnapshot,
          systemCategoriesSnapshot, 
          userCategoriesSnapshot
        ] = await Promise.all([
          getDocs(userPaymentMethodsQuery),
          getDocs(systemCategoriesQuery),
          getDocs(userCategoriesQuery)
        ]);
        
        // Process payment methods
        const allPaymentMethods = [];
        
        // Add user payment methods
        userPaymentMethodsSnapshot.forEach(doc => {
          allPaymentMethods.push({ id: doc.id, ...doc.data() });
        });

        setPaymentMethods(allPaymentMethods);
        
        // Set default payment method if available
        if (allPaymentMethods.length > 0) {
          setPaymentMethod(allPaymentMethods[0].id);
        }
        
        // Process categories
        const allCategories = {
          expense: [],
          income: []
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
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation to check for payment method and category
    if (!selectedCategory || !amount || !paymentMethod) {
      // Specific error messages based on what's missing
      if (!selectedCategory && !paymentMethod) {
        alert("Please select both a category and payment method");
      } else if (!selectedCategory) {
        alert("Please select a category");
      } else if (!paymentMethod) {
        alert("Please select a payment method");
      } else {
        alert("Please enter an amount");
      }
      return;
    }

    try {
      const selectedCategoryObj = categories[transactionType].find(cat => cat.id === selectedCategory);
      const selectedPaymentMethodObj = paymentMethods.find(method => method.id === paymentMethod);
      
      await addDoc(collection(db, "transactions"), {
        userID,
        type: transactionType,
        amount: parseFloat(amount),
        category: selectedCategory,
        categoryName: selectedCategoryObj ? selectedCategoryObj.name : "",
        categoryIcon: selectedCategoryObj ? selectedCategoryObj.icon : "",
        date: selectedDate,
        paymentMethod,
        paymentMethodName: selectedPaymentMethodObj ? selectedPaymentMethodObj.name : "",
        paymentMethodIcon: selectedPaymentMethodObj ? selectedPaymentMethodObj.icon : "",
        notes: notes.trim(),
        createdAt: serverTimestamp()
      });

      // Success, go back to main screen
      navigate('/');
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

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
      <TransactionTypeSelector 
        transactionType={transactionType} 
        setTransactionType={setTransactionType}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Transaction Form */}
      <form onSubmit={handleSubmit} className="px-4 flex flex-col gap-6">
        {/* Category Selection */}
        <CategorySelector
          transactionType={transactionType}
          categories={categories}
          setCategories={setCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          loading={loading}
          userID={userID}
          emojiOptions={emojiOptions}
        />

        {/* Amount Input */}
        <AmountInput amount={amount} setAmount={setAmount} />

        {/* Date Picker */}
        <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

        {/* Payment Method Selection */}
        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentMethods={paymentMethods}
          setPaymentMethods={setPaymentMethods}
          userID={userID}
          paymentMethodEmojis={paymentMethodEmojis}
        />

        {/* Notes Input */}
        <NotesInput notes={notes} setNotes={setNotes} />

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 py-4 px-6 rounded-lg text-white font-medium hover:bg-blue-600 transition-colors shadow-lg mt-4"
        >
          Save Transaction
        </button>
      </form>
    </motion.div>
  );
}

export default AddPage;