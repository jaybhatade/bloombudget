import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiX, FiTag, FiCreditCard } from 'react-icons/fi'
import { motion } from 'framer-motion'

function AddPage() {
  const [transactionType, setTransactionType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")

  // Separate category lists with icons
  const expenseCategories = [
    { id: "shopping", name: "Shopping", icon: "🛍️" },
    { id: "food", name: "Food", icon: "🍽️" },
    { id: "phone", name: "Phone", icon: "📱" },
    { id: "entertainment", name: "Entertainment", icon: "🎮" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "beauty", name: "Beauty", icon: "💅" },
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "social", name: "Social", icon: "🤝" },
    { id: "transportation", name: "Transportation", icon: "🚗" },
    { id: "clothing", name: "Clothing", icon: "👕" },
    { id: "car", name: "Car", icon: "🚙" },
    { id: "alcohol", name: "Alcohol", icon: "🍺" },
    { id: "cigarettes", name: "Cigarettes", icon: "🚬" }
  ]

  const incomeCategories = [
    { id: "salary", name: "Salary", icon: "💰" },
    { id: "freelance", name: "Freelance", icon: "💻" },
    { id: "investments", name: "Investments", icon: "📈" },
    { id: "gifts", name: "Gifts", icon: "🎁" },
    { id: "refunds", name: "Refunds", icon: "↩️" },
    { id: "other", name: "Other Income", icon: "💵" }
  ]

  const transferCategories = [
    { id: "account_to_cash", name: "Account to Cash", icon: "🏦" },
    { id: "cash_to_account", name: "Cash to Account", icon: "💳" },
    { id: "account_to_account", name: "Account to Account", icon: "↔️" }
  ]

  const getCategoriesForType = () => {
    switch(transactionType) {
      case "expense":
        return expenseCategories;
      case "income":
        return incomeCategories;
      case "transfer":
        return transferCategories;
      default:
        return expenseCategories;
    }
  }

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (!value || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      transactionType,
      amount,
      selectedCategory,
      paymentMethod
    });
    // Reset form after submission
    setAmount("");
    setSelectedCategory("");
    setPaymentMethod("cash");
  }

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
      </div>

      {/* Transaction Type Selector */}
      <div className="mx-4 my-6">
        <div className="flex rounded-lg overflow-hidden shadow-lg">
          {[
            {type: "expense", color: "bg-red-500"},
            {type: "income", color: "bg-green-500"},
            {type: "transfer", color: "bg-blue-500"}
          ].map(({type, color}) => (
            <button
              key={type}
              className={`flex-1 py-4 text-center transition-all duration-200 ${
                transactionType === type 
                  ? `${color} text-white font-medium scale-105` 
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setTransactionType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Form */}
      <form onSubmit={handleSubmit} className="px-4 flex flex-col gap-6">
        {/* Amount Input */}
        <div className="relative">
          <label className="flex items-center text-sm font-medium mb-2 text-slate-300">
            <p className="mr-2" >₹</p>Amount
          </label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full bg-slate-800 rounded-lg p-4 text-2xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            placeholder="0.00"
            required
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="flex items-center text-sm font-medium mb-2 text-slate-300">
            <FiTag className="mr-2" /> Category
          </label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full bg-slate-800 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            required
          >
            <option value="">Select a category</option>
            {getCategoriesForType().map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="flex items-center text-sm font-medium mb-2 text-slate-300">
            <FiCreditCard className="mr-2" /> Payment Method
          </label>
          <div className="flex bg-slate-800 rounded-lg overflow-hidden shadow-lg">
            {["cash", "account"].map((method) => (
              <button
                key={method}
                type="button"
                className={`flex-1 py-4 text-center transition-all duration-200 ${
                  paymentMethod === method 
                    ? 'bg-blue-500 text-white font-medium scale-105' 
                    : 'bg-slate-800 text-slate-300'
                }`}
                onClick={() => setPaymentMethod(method)}
              >
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 py-4 px-6 rounded-lg text-white font-medium hover:bg-blue-600 transition-colors duration-200 shadow-lg mt-4"
        >
          Save Transaction
        </button>
      </form>
    </motion.div>
  )
}

export default AddPage