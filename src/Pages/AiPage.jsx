import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import { INR } from '../Common/funcs';

// Google AI SDK for browser
import { GoogleGenerativeAI } from '@google/generative-ai';

function AiPage() {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [genAI, setGenAI] = useState(null);
  const [model, setModel] = useState(null);
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const chatRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userID = localStorage.getItem('userID');
        if (!userID) {
          setDataLoading(false);
          return;
        }

        // 1. Fetch user profile information directly using document reference
        const userDocRef = doc(db, "users", userID);
        const userDocSnap = await getDoc(userDocRef);
        let userName = "User";
        if (userDocSnap.exists()) {
          const userProfileData = userDocSnap.data();
          if (userProfileData.name) {
            userName = userProfileData.name;
          }
        }

        // 1. Fetch transactions
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userID', '==', userID)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const fetchedTransactions = [];
        transactionsSnapshot.forEach((doc) => {
          fetchedTransactions.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setTransactions(fetchedTransactions);

        // 2. Fetch accounts for total balance
        const accountsQuery = query(
          collection(db, 'accounts'),
          where('userID', '==', userID)
        );
        const accountsSnapshot = await getDocs(accountsQuery);
        let accountsBalance = 0;
        accountsSnapshot.forEach((doc) => {
          const accountData = doc.data();
          if (accountData.balance) {
            accountsBalance += accountData.balance;
          }
        });
        setTotalBalance(accountsBalance);

        // Calculate monthly income and expenses
        calculateMonthlyTransactions(fetchedTransactions);

        // Fetch savings goals if they exist
        const goalsQuery = query(
          collection(db, 'goals'),
          where('userID', '==', userID)
        );
        const goalsSnapshot = await getDocs(goalsQuery);
        let savingsGoal = 0;
        if (!goalsSnapshot.empty) {
          const goalData = goalsSnapshot.docs[0].data();
          if (goalData.targetAmount) {
            savingsGoal = goalData.targetAmount;
          }
        }

        // Build expense categories breakdown
        const expenseCategories = getExpenseCategoriesBreakdown(fetchedTransactions);

        // Set complete user data
        setUserData({
          name: userName,
          totalIncome: totalIncome,
          totalExpenses: totalExpenses,
          budget: getBudgetEstimate(fetchedTransactions),
          expenseCategories: expenseCategories,
          savingsGoal: savingsGoal,
          balance: accountsBalance
        });

        setDataLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setDataLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Calculate monthly transactions whenever month/year changes or transactions are fetched
  useEffect(() => {
    if (transactions.length > 0) {
      calculateMonthlyTransactions(transactions);
    }
  }, [currentMonthIndex, currentYear, transactions]);

  // Function to calculate monthly income and expenses
  const calculateMonthlyTransactions = (transactionsData) => {
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactionsData.forEach(transaction => {
      // Handle different date formats
      let transactionDate;
      if (transaction.date && transaction.date.toDate) {
        // If using Firestore Timestamp
        transactionDate = transaction.date.toDate();
      } else if (transaction.date instanceof Date) {
        // If already a Date object
        transactionDate = transaction.date;
      } else if (typeof transaction.date === 'string') {
        // If date string
        transactionDate = new Date(transaction.date);
      }
      
      // Check if transaction is from selected month and year
      if (transactionDate && 
          transactionDate.getMonth() === currentMonthIndex && 
          transactionDate.getFullYear() === currentYear) {
        
        if (transaction.type === 'income') {
          monthlyIncome += transaction.amount;
        } else {
          monthlyExpenses += transaction.amount;
        }
      }
    });

    setTotalIncome(monthlyIncome);
    setTotalExpenses(monthlyExpenses);
  };

  // Function to get expense categories breakdown
  const getExpenseCategoriesBreakdown = (transactionsData) => {
    const categories = {};
    
    transactionsData.forEach(transaction => {
      // Only consider expense transactions from current month/year
      let transactionDate;
      if (transaction.date && transaction.date.toDate) {
        transactionDate = transaction.date.toDate();
      } else if (transaction.date instanceof Date) {
        transactionDate = transaction.date;
      } else if (typeof transaction.date === 'string') {
        transactionDate = new Date(transaction.date);
      }
      
      if (transaction.type === 'expense' && 
          transactionDate && 
          transactionDate.getMonth() === currentMonthIndex && 
          transactionDate.getFullYear() === currentYear) {
        
        const category = transaction.category || 'other';
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += transaction.amount;
      }
    });
    
    return categories;
  };

  // Function to estimate monthly budget based on past spending
  const getBudgetEstimate = (transactionsData) => {
    // Get average monthly expenses from the last 3 months
    const now = new Date();
    let totalExpenses = 0;
    let monthsCount = 0;
    
    for (let i = 0; i < 3; i++) {
      const targetMonth = new Date(now);
      targetMonth.setMonth(now.getMonth() - i);
      
      let monthlyTotal = 0;
      transactionsData.forEach(transaction => {
        let transactionDate;
        if (transaction.date && transaction.date.toDate) {
          transactionDate = transaction.date.toDate();
        } else if (transaction.date instanceof Date) {
          transactionDate = transaction.date;
        } else if (typeof transaction.date === 'string') {
          transactionDate = new Date(transaction.date);
        }
        
        if (transaction.type === 'expense' && 
            transactionDate && 
            transactionDate.getMonth() === targetMonth.getMonth() && 
            transactionDate.getFullYear() === targetMonth.getFullYear()) {
          monthlyTotal += transaction.amount;
        }
      });
      
      if (monthlyTotal > 0) {
        totalExpenses += monthlyTotal;
        monthsCount++;
      }
    }
    
    return monthsCount > 0 ? Math.round(totalExpenses / monthsCount) : totalExpenses;
  };

  // Initialize Google AI API
  useEffect(() => {
    const initializeAi = async () => {
      try {
        // Replace with your actual API key from Google AI Studio
        const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
        const genAIInstance = new GoogleGenerativeAI(API_KEY);
        
        // Get the Gemini model
        const modelInstance = genAIInstance.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        setGenAI(genAIInstance);
        setModel(modelInstance);
        
        // Wait until user data is loaded to display greeting
        if (!dataLoading && userData) {
          // Add initial greeting message
          setConversation([{
            role: 'assistant',
            content: `Hi ${userData.name}! I'm your financial assistant. I can help with spending analysis, budgeting tips, and finance questions. How can I assist you?`
          }]);
        }
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        if (!dataLoading && userData) {
          setConversation([{
            role: 'assistant',
            content: `Hi ${userData.name}! I'm your financial assistant. I seem to be having trouble connecting to my AI systems. You can still type your questions, and I'll try to respond.`
          }]);
        }
      }
    };
    
    if (!dataLoading && userData) {
      initializeAi();
    }
  }, [dataLoading, userData]);

  useEffect(() => {
    // Scroll to bottom of chat whenever conversation updates
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const createFinancialContextPrompt = (userQuestion) => {
    if (!userData) return `User Question: ${userQuestion}\nPlease provide financial advice based on general best practices.`;

    const currentMonthName = new Date(currentYear, currentMonthIndex, 1).toLocaleString('default', { month: 'long' });
    
    // Get top spending categories
    const categories = userData.expenseCategories || {};
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    let categoryBreakdown = "";
    sortedCategories.forEach(([category, amount]) => {
      categoryBreakdown += `- ${category}: ${INR}${amount.toLocaleString()}\n`;
    });

    // Calculate savings rate
    const savingsRate = userData.totalIncome > 0 
      ? Math.round(((userData.totalIncome - userData.totalExpenses) / userData.totalIncome) * 100) 
      : 0;

    // Format transactions for recent history
    let recentTransactions = "";
    const sortedTransactions = [...transactions]
      .sort((a, b) => {
        const dateA = a.date && a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date && b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      })
      .slice(0, 5);
    
    sortedTransactions.forEach(transaction => {
      const date = transaction.date && transaction.date.toDate 
        ? transaction.date.toDate().toLocaleDateString() 
        : new Date(transaction.date).toLocaleDateString();
      recentTransactions += `- ${date}: ${transaction.description || 'Transaction'} (${transaction.type}): ${INR}${transaction.amount.toLocaleString()}\n`;
    });

    return `
      User Data Context for ${currentMonthName} ${currentYear}:
      Name: ${userData.name}
      Account Balance: ${INR}${userData.balance.toLocaleString()}
      Total Income this month: ${INR}${userData.totalIncome.toLocaleString()}
      Total Expenses this month: ${INR}${userData.totalExpenses.toLocaleString()}
      Monthly Budget: ${INR}${userData.budget.toLocaleString()}
      Current Savings Rate: ${savingsRate}%
      
      Top Expense Categories:
      ${categoryBreakdown}
      
      Recent Transactions:
      ${recentTransactions}
      
      Savings Goal: ${INR}${userData.savingsGoal.toLocaleString()}

      User Question: ${userQuestion}

      Please provide personalized financial advice based on this data. Keep your response concise and focused on addressing the user's question directly in easy to understand language.
    `;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !model) return;
    
    const userMessage = userInput.trim();
    setUserInput('');
    
    // Add user message to conversation
    setConversation(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);
    
    setIsLoading(true);
    
    try {
      // Create the contextual prompt
      const contextualPrompt = createFinancialContextPrompt(userMessage);
      
      // Generate content using the Gemini model
      const result = await model.generateContent(contextualPrompt);
      const response = result.response;
      const text = response.text();
      
      // Add AI response to conversation
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: text
      }]);
    } catch (error) {
      console.error('AI response error:', error);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process your request at the moment. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageClass = (role) => {
    if (role === 'user') {
      return "p-2 px-4 bg-blue-500 rounded-b-xl rounded-tl-xl text-white self-end max-w-[80%]";
    } else {
      return "self-start mb-4";
    }
  };

  // Auto-resize textarea as content grows
  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
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
        className="flex-1 p-4 rounded-xl shadow-lg flex flex-col"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
      >
        {dataLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
              <p className="text-slate-300">Loading financial data...</p>
            </div>
          </div>
        ) : (
          <>
            <div 
              ref={chatRef}
              className="flex flex-col space-y-4 mb-4 flex-1 overflow-y-auto pb-2"
            >
              {conversation.map((message, index) => (
                <motion.div 
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={getMessageClass(message.role)}
                >
                  {message.role === 'assistant' && (
                    <h2 className="font-semibold text-blue-400 mb-2">AI Assistant:</h2>
                  )}
                  <p className="text-slate-200 text-md whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="p-2 rounded-xl mr-8"
                >
                  <div className="flex items-center">
                    <h2 className="font-semibold text-blue-400 mr-2">AI Assistant:</h2>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col justify-center mt-auto">
              <div className="relative flex">
                <textarea 
                  value={userInput}
                  onChange={handleInputChange}
                  onInput={handleTextareaResize}
                  className="w-full p-4 rounded-xl bg-slate-700/50 text-white mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-400"
                  placeholder="Ask about your finances ..."
                  rows="1"
                  style={{ minHeight: '3rem' }}
                />
                <motion.button 
                  type="submit"
                  disabled={isLoading || !userInput.trim() || !model}
                  className={`absolute right-3 bottom-6 p-2 rounded-lg ${
                    isLoading || !userInput.trim() || !model
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
          </>
        )}
      </motion.div>
    </div>
  );
}

export default AiPage;