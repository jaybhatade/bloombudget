import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { collection, addDoc, getDocs, serverTimestamp, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../Firebase';

// Import components
import TransactionTypeSelector from '../Components/TransactionTypeSelector';
import CategorySelector from '../Components/CategorySelector';
import AmountInput from '../Components/AmountInput';
import DateSelector from '../Components/DateSelector';
import PaymentMethodSelector from '../Components/PaymentMethodSelector';
import NotesInput from '../Components/NotesInput';
import TransferAccountSelector from '../Components/TransferAcoountSelector';

function AddPage() {
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transferToAccount, setTransferToAccount] = useState("");
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
    
    // Input validation
    if (transactionType === "transfer") {
      if (!paymentMethod || !transferToAccount || !amount) {
        if (!paymentMethod) {
          alert("Please select a source account");
          return;
        }
        if (!transferToAccount) {
          alert("Please select a destination account");
          return;
        }
        if (!amount) {
          alert("Please enter an amount to transfer");
          return;
        }
        return;
      }
      
      if (paymentMethod === transferToAccount) {
        alert("Source and destination accounts cannot be the same");
        return;
      }
    } else {
      // Original validation for expense/income
      if (!selectedCategory || !amount || !paymentMethod) {
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
    }

    try {
      const parsedAmount = parseFloat(amount);
      
      if (transactionType === "transfer") {
        // ===== TRANSFER HANDLING =====
        // Get the source account
        const sourceAccountRef = doc(db, "accounts", paymentMethod);
        const sourceAccountSnap = await getDoc(sourceAccountRef);
        
        if (!sourceAccountSnap.exists()) {
          alert("Source account no longer exists");
          return;
        }
        
        const sourceAccountData = sourceAccountSnap.data();
        const sourceBalance = sourceAccountData.balance || 0;
        
        // Check if there's enough balance to transfer
        if (sourceBalance < parsedAmount) {
          alert("Insufficient balance in the source account");
          return;
        }
        
        // Get the destination account
        const destAccountRef = doc(db, "accounts", transferToAccount);
        const destAccountSnap = await getDoc(destAccountRef);
        
        if (!destAccountSnap.exists()) {
          alert("Destination account no longer exists");
          return;
        }
        
        const destAccountData = destAccountSnap.data();
        const destBalance = destAccountData.balance || 0;
        
        // Calculate new balances
        const newSourceBalance = sourceBalance - parsedAmount;
        const newDestBalance = destBalance + parsedAmount;
        
        // Update the source account balance
        await updateDoc(sourceAccountRef, {
          balance: newSourceBalance,
          updatedAt: serverTimestamp()
        });
        
        // Update the destination account balance
        await updateDoc(destAccountRef, {
          balance: newDestBalance,
          updatedAt: serverTimestamp()
        });
        
        // Store the transfer transaction
        const sourceAccount = paymentMethods.find(m => m.id === paymentMethod);
        const destAccount = paymentMethods.find(m => m.id === transferToAccount);
        
        await addDoc(collection(db, "transactions"), {
          userID,
          type: "transfer",
          amount: parsedAmount,
          date: selectedDate,
          // Source account details
          paymentMethod,
          paymentMethodName: sourceAccount?.name || "",
          paymentMethodIcon: sourceAccount?.icon || "",
          // Destination account details
          transferToAccount,
          transferToAccountName: destAccount?.name || "",
          transferToAccountIcon: destAccount?.icon || "",
          // Other details
          notes: notes.trim(),
          createdAt: serverTimestamp(),
          sourceBalanceAfter: newSourceBalance,
          destBalanceAfter: newDestBalance
        });
        
      } else {
        // ===== REGULAR EXPENSE/INCOME HANDLING =====
        const selectedCategoryObj = categories[transactionType].find(cat => cat.id === selectedCategory);
        const selectedPaymentMethodObj = paymentMethods.find(method => method.id === paymentMethod);
        
        // Get the current account document
        const accountDocRef = doc(db, "accounts", paymentMethod);
        const accountDoc = await getDoc(accountDocRef);
        
        if (!accountDoc.exists()) {
          alert("Selected account no longer exists");
          return;
        }
        
        const accountData = accountDoc.data();
        const currentBalance = accountData.balance || 0;
        
        // Calculate new balance based on transaction type
        let newBalance = currentBalance;
        if (transactionType === "expense") {
          newBalance = currentBalance - parsedAmount;
          // Prevent negative balance
          if (newBalance < 0) {
            alert("Insufficient balance. Please enter a smaller amount.");
            return;
          }
        } else if (transactionType === "income") {
          newBalance = currentBalance + parsedAmount;
        }
        
        // Update the account balance in Firestore
        await updateDoc(accountDocRef, {
          balance: newBalance,
          updatedAt: serverTimestamp()
        });
        
        // Add the transaction
        await addDoc(collection(db, "transactions"), {
          userID,
          type: transactionType,
          amount: parsedAmount,
          category: selectedCategory,
          categoryName: selectedCategoryObj ? selectedCategoryObj.name : "",
          categoryIcon: selectedCategoryObj ? selectedCategoryObj.icon : "",
          date: selectedDate,
          paymentMethod,
          paymentMethodName: selectedPaymentMethodObj ? selectedPaymentMethodObj.name : "",
          paymentMethodIcon: selectedPaymentMethodObj ? selectedPaymentMethodObj.icon : "",
          notes: notes.trim(),
          createdAt: serverTimestamp(),
          balanceAfterTransaction: newBalance
        });
      }

      // Success, go back to main screen
      navigate('/');
    } catch (error) {
      console.error("Error processing transaction:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

  // Function to calculate and display projected balance after transaction
  const getProjectedBalance = () => {
    if (!amount || !paymentMethod) return null;
    
    const parsedAmount = parseFloat(amount) || 0;
    const currentAccount = paymentMethods.find(m => m.id === paymentMethod);
    const currentBalance = currentAccount?.balance || 0;
    
    if (transactionType === "expense") {
      return currentBalance - parsedAmount;
    } else if (transactionType === "income") {
      return currentBalance + parsedAmount;
    } else if (transactionType === "transfer") {
      return currentBalance - parsedAmount;
    }
    
    return currentBalance;
  };
  
  // Function to calculate and display projected destination balance after transfer
  const getDestinationProjectedBalance = () => {
    if (!amount || !transferToAccount) return null;
    
    const parsedAmount = parseFloat(amount) || 0;
    const destinationAccount = paymentMethods.find(m => m.id === transferToAccount);
    const destinationBalance = destinationAccount?.balance || 0;
    
    return destinationBalance + parsedAmount;
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
        setTransferToAccount={setTransferToAccount}
      />

      {/* Transaction Form */}
      <form onSubmit={handleSubmit} className="px-4 flex flex-col gap-6 pb-8">
        {/* Conditionally render components based on transaction type */}
        {transactionType !== "transfer" && (
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
        )}

        {/* Amount Input */}
        <AmountInput amount={amount} setAmount={setAmount} />

        {/* Date Picker */}
        <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

        {/* Payment Method Selection (source account) */}
        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          paymentMethods={paymentMethods}
          setPaymentMethods={setPaymentMethods}
          userID={userID}
          paymentMethodEmojis={paymentMethodEmojis}
        />

        {/* Transfer To Account Selection - only shown for transfers */}
        {transactionType === "transfer" && (
          <TransferAccountSelector
            transferToAccount={transferToAccount}
            setTransferToAccount={setTransferToAccount}
            paymentMethods={paymentMethods}
            paymentMethod={paymentMethod}
          />
        )}

        {/* Notes Input */}
        <NotesInput notes={notes} setNotes={setNotes} />

        {/* Balance Information */}
        {paymentMethod && (
          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-slate-300 mb-2">
              {transactionType === "transfer" ? "Source Account" : "Selected Account"}: 
              {" "}{paymentMethods.find(m => m.id === paymentMethod)?.name || 'Loading...'}
            </p>
            <p className="text-slate-300">
              Current Balance: ₹{paymentMethods.find(m => m.id === paymentMethod)?.balance?.toFixed(0) || '0'}
            </p>
            
            {amount && (
              <div className="mt-2">
                <p className={getProjectedBalance() >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {transactionType === "transfer" 
                    ? "Balance After Transfer: " 
                    : "Balance After Transaction: "}
                  ₹{getProjectedBalance()?.toFixed(0)}
                </p>
                
                {/* Display destination account balance for transfers */}
                {transactionType === "transfer" && transferToAccount && (
                  <div className="mt-2 pt-2 border-t border-slate-700">
                    <p className="text-slate-300">
                      Destination Account: {paymentMethods.find(m => m.id === transferToAccount)?.name || 'Loading...'}
                    </p>
                    <p className="text-slate-300">
                      Current Balance: ₹{paymentMethods.find(m => m.id === transferToAccount)?.balance?.toFixed(0) || '0'}
                    </p>
                    <p className="text-green-400">
                      Balance After Transfer: ₹{getDestinationProjectedBalance()?.toFixed(0)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 py-4 px-6 rounded-lg text-white font-medium hover:bg-blue-600 transition-colors shadow-lg mt-4"
        >
          {transactionType === "transfer" ? "Save Transfer" : "Save Transaction"}
        </button>
      </form>
    </motion.div>
  );
}

export default AddPage;