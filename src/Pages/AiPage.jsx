import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Google AI SDK for browser
import { GoogleGenerativeAI } from '@google/generative-ai';

function AiPage() {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [genAI, setGenAI] = useState(null);
  const [model, setModel] = useState(null);
  const chatRef = useRef(null);
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

  // Initialize Google AI API
  useEffect(() => {
    const initializeAi = async () => {
      try {
        // Replace with your actual API key from Google AI Studio
        const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
        console.log(API_KEY)
        const genAIInstance = new GoogleGenerativeAI(API_KEY);
        
        // Get the Gemini model (choose the model that's most appropriate)
        const modelInstance = genAIInstance.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        setGenAI(genAIInstance);
        setModel(modelInstance);
        
        // Add initial greeting message
        setConversation([{
          role: 'assistant',
          content: `Hi ${userData.name}! I'm your financial assistant. I can help you analyze your spending, suggest budgeting strategies, or answer any questions about your finances. What would you like to know?`
        }]);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        setConversation([{
          role: 'assistant',
          content: `Hi ${userData.name}! I'm your financial assistant. I seem to be having trouble connecting to my AI systems. You can still type your questions, and I'll try to respond.`
        }]);
      }
    };
    
    initializeAi();
  }, []);

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
    return `
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

      User Question: ${userQuestion}

      Please provide financial advice based on this data. Keep your response concise and focused on addressing the user's question directly in easy to understand language .
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
    return role === 'user' 
      ? "p-4 bg-gradient-to-r from-blue-600/30 to-blue-500/30 rounded-xl ml-8" 
      : "p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl mr-8";
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
        className="flex-1 bg-slate-800/50 backdrop-blur-lg p-4 rounded-xl shadow-lg flex flex-col"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
      >
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
              {message.role === 'user' && (
                <h2 className="font-semibold text-green-400 mb-2">You:</h2>
              )}
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl mr-8"
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
      </motion.div>
    </div>
  );
}

export default AiPage;