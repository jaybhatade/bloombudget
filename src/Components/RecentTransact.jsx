import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '../Firebase'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function RecentTransact() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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
                    where('userID', '==', userID),
                    orderBy('date', 'desc'),
                    limit(4)
                )

                const querySnapshot = await getDocs(q)
                const transactionsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))

                setTransactions(transactionsData)
                setError(null)
            } catch (error) {
                console.error('Error fetching transactions:', error)
                setError(error.message)
                
                // Check if it's an index error
                if (error.message.includes('requires an index')) {
                    console.log('This query requires a Firestore index. Please create it in the Firebase console.')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [])

    return (
        <div>
            {/* Recent Transactions */}
            <motion.div variants={cardVariants} className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 h-full p-6 rounded-xl shadow-lg">
                <div className='flex justify-between items-center '>
                    <h2 className="text-lg font-semibold">Recent Transactions</h2>
                    <Link 
                        to="/transactions" 
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                        View All
                    </Link>
                </div>
                {loading ? (
                    <div className="text-center text-slate-400">Loading transactions...</div>
                ) : error ? (
                    <div className="text-center text-red-400 p-4">
                        <p>Error loading transactions</p>
                        {error.includes('requires an index') && (
                            <p className="mt-2 text-sm">
                                This query requires an index. Please click the link in your console to create it.
                            </p>
                        )}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center text-slate-400">No transactions found</div>
                ) : (
                    <ul className="space-y-4">
                        {transactions.map((transaction) => (
                            <li key={transaction.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                                        <span>{transaction.categoryIcon || '💰'}</span>
                                    </div>
                                    <div>
                                        <p className=" font-medium">{transaction.categoryName}</p>
                                        <p className="text-slate-400 text-sm">
                                            {transaction.date?.toDate ? 
                                                new Date(transaction.date.toDate()).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 
                                                new Date(transaction.date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})} </p>
                                                <p className="font-medium text-slate-400 truncate text-xs">{transaction.notes}</p>
                                    </div>
                                </div>
                                <p className={transaction.type === "income" ? "text-green-400" : "text-red-400"}>
                                    {transaction.type === "income" ? "+" : "-"}
                                    ₹{transaction.amount.toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </motion.div>
        </div>
    )
}

export default RecentTransact