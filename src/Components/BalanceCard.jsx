import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../Firebase'
import { motion } from 'framer-motion'
import { INR } from '../Common/funcs'
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

function BalanceCard() {
  const [transactions, setTransactions] = useState([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonthName, setCurrentMonthName] = useState('')

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  // Function to navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1)
    }
  }

  // Function to navigate to next month
  const goToNextMonth = () => {
    const now = new Date()
    const isCurrentMonthYear = currentMonthIndex === now.getMonth() && currentYear === now.getFullYear()
    
    // Don't allow navigating to future months
    if (isCurrentMonthYear) {
      return
    }
    
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1)
    }
  }

  // Update month name when month or year changes
  useEffect(() => {
    const date = new Date(currentYear, currentMonthIndex, 1)
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })
    setCurrentMonthName(monthName)
    
    if (!loading) {
      calculateMonthlyTransactions()
    }
  }, [currentMonthIndex, currentYear, loading])

  // Filter transactions for current month
  const calculateMonthlyTransactions = () => {
    let monthlyIncome = 0
    let monthlyExpenses = 0

    transactions.forEach(transaction => {
      // Handle different date formats
      let transactionDate
      if (transaction.date && transaction.date.toDate) {
        // If using Firestore Timestamp
        transactionDate = transaction.date.toDate()
      } else if (transaction.date instanceof Date) {
        // If already a Date object
        transactionDate = transaction.date
      } else if (typeof transaction.date === 'string') {
        // If date string
        transactionDate = new Date(transaction.date)
      }
      
      // Check if transaction is from selected month and year
      if (transactionDate && 
          transactionDate.getMonth() === currentMonthIndex && 
          transactionDate.getFullYear() === currentYear) {
        
        if (transaction.type === 'income') {
          monthlyIncome += transaction.amount
        } else {
          monthlyExpenses += transaction.amount
        }
      }
    })

    setTotalIncome(monthlyIncome)
    setTotalExpenses(monthlyExpenses)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userID = localStorage.getItem('userID')
        if (!userID) {
          setLoading(false)
          return
        }

        // 1. Fetch transactions for monthly income/expense
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userID', '==', userID)
        )
        const transactionsSnapshot = await getDocs(transactionsQuery)
        const fetchedTransactions = []
        transactionsSnapshot.forEach((doc) => {
          fetchedTransactions.push({
            id: doc.id,
            ...doc.data()
          })
        })
        setTransactions(fetchedTransactions)

        // 2. Fetch accounts for total balance
        const accountsQuery = query(
          collection(db, 'accounts'),
          where('userID', '==', userID)
        )
        const accountsSnapshot = await getDocs(accountsQuery)
        let accountsBalance = 0
        accountsSnapshot.forEach((doc) => {
          const accountData = doc.data()
          if (accountData.balance) {
            accountsBalance += accountData.balance
          }
        })
        setTotalBalance(accountsBalance)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="space-y-6"
    >
      {/* Balance Card */}
      <motion.div
        variants={cardVariants}
        className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-6 rounded-xl shadow-lg h-full flex flex-col justify-between" 
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-slate-400 mb-1">Total Balance</h2>
            {loading ? (
              <p className="text-3xl font-bold">Loading...</p>
            ) : (
              <p className="text-3xl font-bold">{INR}{totalBalance.toLocaleString()}</p>
            )}
          </div>
          {!loading && (
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-slate-400 text-sm">Income</p>
                <p className="text-green-400 font-medium">{INR}{totalIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Expenses</p>
                <p className="text-red-400 font-medium">{INR}{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
          <button
            onClick={goToPreviousMonth}
            className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
            aria-label="Previous month"
          >
            <FaChevronLeft size={18} />
          </button>
          
          <h3 className="text-slate-300 font-medium">
            {currentMonthName}
          </h3>
          
          <button
            onClick={goToNextMonth}
            className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors"
            aria-label="Next month"
            disabled={currentMonthIndex === new Date().getMonth() && currentYear === new Date().getFullYear()}
          >
            <FaChevronRight 
              size={18} 
              className={currentMonthIndex === new Date().getMonth() && currentYear === new Date().getFullYear() 
                ? "text-slate-600" 
                : "text-slate-300"}
            />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default BalanceCard