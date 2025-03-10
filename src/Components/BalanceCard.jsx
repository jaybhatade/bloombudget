import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../Firebase'
import { motion } from 'framer-motion'
import { INR } from '../Common/funcs'

function BalanceCard() {
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [loading, setLoading] = useState(true)

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userID = localStorage.getItem('userID')
        if (!userID) {
          setLoading(false)
          return
        }

        const q = query(
          collection(db, 'transactions'),
          where('userID', '==', userID)
        )

        const querySnapshot = await getDocs(q)
        let income = 0
        let expenses = 0

        querySnapshot.forEach((doc) => {
          const transaction = doc.data()
          if (transaction.type === 'income') {
            income += transaction.amount
          } else {
            expenses += transaction.amount
          }
        })

        setTotalIncome(income)
        setTotalExpenses(expenses)
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
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
        className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-6 rounded-xl shadow-lg"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-slate-400 mb-1">Total Balance</h2>
            {loading ? (
              <p className="text-3xl font-bold">Loading...</p>
            ) : (
              <p className="text-3xl font-bold">{INR}{(totalIncome - totalExpenses).toLocaleString()}</p>
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
      </motion.div>
    </motion.div>
  )
}

export default BalanceCard
