import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function AiPage() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Sample user data object - this would typically come from your app's state/database
  const userData = {
    name: "Jay Bhatade",
    totalIncome: 10000,
    totalExpenses: 6000,
    budget: 6000,
    expenseCategories: {
      food: 2000,
      transport: 1000,
      entertainment: 1500,
      utilities: 1500
    },
    savingsGoal: 4000
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    // Construct prompt with user data context
    const contextualPrompt = `
      User Data Context:
      Name: ${userData.name}
      Total Income: ₹${userData.totalIncome}
      Total Expenses: ₹${userData.totalExpenses}
      Monthly Budget: ₹${userData.budget}
      Expense Breakdown:
      - Food: ₹${userData.expenseCategories.food}
      - Transport: ₹${userData.expenseCategories.transport}
      - Entertainment: ₹${userData.expenseCategories.entertainment}
      - Utilities: ₹${userData.expenseCategories.utilities}
      Savings Goal: ₹${userData.savingsGoal}

      User Question: ${userInput}

      Please provide financial advice based on this data.
    `;

    try {
      const apiResponse = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: contextualPrompt }),
      });

      if (!apiResponse.ok) {
        throw new Error('API request failed');
      }

      const data = await apiResponse.json();
      setResponse(data.answer);
      setUserInput('');
    } catch (error) {
      setResponse("Sorry, I couldn't process your request at the moment. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white p-4 flex flex-col">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center mb-4"
      >
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 text-slate-400 hover:text-white transition-colors"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Financial AI Assistant</h1>
      </motion.div>
      <motion.div 
        className="flex-1 bg-slate-800/50 backdrop-blur-lg p-4 rounded-xl shadow-lg flex flex-col"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col space-y-4 mb-4 flex-1 overflow-y-auto">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl"
          >
            <p className="text-slate-200">
              Hi {userData.name}! I'm your financial assistant. I can help you analyze your spending, 
              suggest budgeting strategies, or answer any questions about your finances. What would you like to know?
            </p>
          </motion.div>
          {response && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl"
            >
              <h2 className="font-semibold text-blue-400 mb-2">AI Response:</h2>
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{response}</p>
            </motion.div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col justify-center mt-auto">
          <div className="relative">
            <textarea 
              value={userInput}
              onChange={handleInputChange}
              className="w-full p-4 rounded-xl bg-slate-700/50 text-white mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-400"
              placeholder="Ask about your finances ..."
              rows="1"
            />
            <motion.button 
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className={`absolute right-3 bottom-6 p-2 rounded-lg ${
                isLoading || !userInput.trim() 
                  ? 'bg-slate-600 text-slate-400' 
                  : 'bg-blue-500 hover:bg-blue-400'
              } transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSend size={20} />
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AiPage;
