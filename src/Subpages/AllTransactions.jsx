import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiArrowLeft } from 'react-icons/fi';

function AllTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    
    const navigate = useNavigate();

    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0 }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const userID = localStorage.getItem('userID');
                if (!userID) {
                    setLoading(false);
                    return;
                }

                const q = query(
                    collection(db, 'transactions'),
                    where('userID', '==', userID)
                );

                const querySnapshot = await getDocs(q);
                const transactionsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort by date (newest first)
                transactionsData.sort((a, b) => {
                    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                    return dateB - dateA;
                });

                setTransactions(transactionsData);
                setFilteredTransactions(transactionsData);
                setError(null);
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setError(error.message);
                
                if (error.message.includes('requires an index')) {
                    console.log('This query requires a Firestore index. Please create it in the Firebase console.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // Filter and search logic
    useEffect(() => {
        let results = [...transactions];
        
        // Apply type filter
        if (filterType !== 'all') {
            results = results.filter(transaction => transaction.type === filterType);
        }
        
        // Apply search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(transaction => 
                (transaction.categoryName && transaction.categoryName.toLowerCase().includes(term)) ||
                (transaction.notes && transaction.notes.toLowerCase().includes(term))
            );
        }
        
        setFilteredTransactions(results);
    }, [transactions, filterType, searchTerm]);

    const handleBackClick = () => {
        navigate(-1);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    return (
        <motion.div 
            className="min-h-[100dvh] bg-slate-950 text-white p-4 md:p-6"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={handleBackClick}
                    className="flex items-center text-slate-300 hover:text-white transition-colors"
                >
                    <FiArrowLeft size={20} className="mr-1" />
                    <span>Back</span>
                </button>
                <h1 className="text-2xl font-bold">All Transactions</h1>
                <div></div> {/* Empty div for alignment */}
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-grow">
                        <FiSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by category or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button 
                        onClick={toggleFilters}
                        className={`p-2 rounded-lg flex items-center ${showFilters ? 'bg-blue-600' : 'bg-slate-800'} hover:bg-blue-500 transition-colors`}
                    >
                        <FiFilter size={18} />
                    </button>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <motion.div 
                    initial={{  opacity: 0 }}
                    animate={{  opacity: 1 }}
                    exit={{  opacity: 0 }}
                        className="bg-slate-800 p-4 rounded-lg mb-4"
                    >
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-2 rounded-lg ${filterType === 'all' ? 'bg-blue-600' : 'bg-slate-700'} hover:bg-blue-500 transition-colors`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterType('income')}
                                className={`px-4 py-2 rounded-lg ${filterType === 'income' ? 'bg-green-600' : 'bg-slate-700'} hover:bg-green-500 transition-colors`}
                            >
                                Income
                            </button>
                            <button
                                onClick={() => setFilterType('expense')}
                                className={`px-4 py-2 rounded-lg ${filterType === 'expense' ? 'bg-red-600' : 'bg-slate-700'} hover:bg-red-500 transition-colors`}
                            >
                                Expense
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Transactions List */}
            <motion.div 
                variants={cardVariants} 
                className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 p-6 rounded-xl shadow-lg"
            >
                {loading ? (
                    <div className="text-center text-slate-400 py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>Loading transactions...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 p-8">
                        <p>Error loading transactions</p>
                        {error.includes('requires an index') && (
                            <p className="mt-2 text-sm">
                                This query requires an index. Please click the link in your console to create it.
                            </p>
                        )}
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                        {searchTerm || filterType !== 'all' ? 
                            <p>No transactions match your search or filter criteria</p> : 
                            <p>No transactions found</p>
                        }
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between text-slate-400 text-sm mb-4 px-2">
                            <span>Transaction</span>
                            <span>Amount</span>
                        </div>
                        <ul className="space-y-4">
                            {filteredTransactions.map((transaction) => (
                                <li key={transaction.id} className="flex items-center justify-between hover:bg-slate-800 transition-colors border-b-[1px] border-b-gray-600 pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                                            <span>{transaction.categoryIcon || '💰'}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{transaction.categoryName}</p>
                                            <p className="text-slate-400 text-sm">
                                                {transaction.date?.toDate ? 
                                                    new Date(transaction.date.toDate()).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 
                                                    new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </p>
                                            <p className="font-medium text-slate-400 truncate text-xs max-w-xs">{transaction.notes}</p>
                                        </div>
                                    </div>
                                    <p className={transaction.type === "income" ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                                        {transaction.type === "income" ? "+" : "-"}
                                        ₹{transaction.amount.toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </motion.div>
{/* 
            {!loading && !error && filteredTransactions.length > 0 && (
                <motion.div 
                    variants={cardVariants}
                    className="mt-6 bg-slate-800 p-4 rounded-xl"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700 p-3 rounded-lg">
                            <p className="text-sm text-slate-400">Total Income</p>
                            <p className="text-xl font-bold text-green-400">
                                ₹{filteredTransactions
                                    .filter(t => t.type === 'income')
                                    .reduce((sum, t) => sum + t.amount, 0)
                                    .toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-slate-700 p-3 rounded-lg">
                            <p className="text-sm text-slate-400">Total Expenses</p>
                            <p className="text-xl font-bold text-red-400">
                                ₹{filteredTransactions
                                    .filter(t => t.type === 'expense')
                                    .reduce((sum, t) => sum + t.amount, 0)
                                    .toLocaleString()}
                            </p>
                        </div>
                    </div>
                </motion.div> 
            )}*/}
        </motion.div>
    );
}

export default AllTransactions;