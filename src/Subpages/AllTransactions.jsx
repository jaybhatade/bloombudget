import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiArrowLeft, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import { TransactionService } from '../Common/Transactions/TransactionService';
import { TransactionUtils } from '../Common/Transactions/TransactionUtils';

function AllTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedTransaction, setEditedTransaction] = useState(null);
    const [loadingCategories, setLoadingCategories] = useState(false);
    
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

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        const filtered = TransactionUtils.filterTransactions(transactions, filterType, searchTerm);
        setFilteredTransactions(filtered);
    }, [transactions, filterType, searchTerm]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const userID = localStorage.getItem('userID');
            if (!userID) {
                setLoading(false);
                return;
            }

            const transactionsData = await TransactionService.fetchAllTransactions(userID);
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

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const userID = localStorage.getItem('userID');
            const categoriesData = await TransactionService.fetchCategories(userID);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleTransactionClick = (transaction) => {
        setSelectedTransaction(transaction);
        setEditMode(false);
    };

    const closePopup = () => {
        setSelectedTransaction(null);
        setEditMode(false);
        setEditedTransaction(null);
        setShowDeleteConfirm(false);
    };

    const handleEditClick = () => {
        // Fetch categories when entering edit mode
        fetchCategories();
        setEditMode(true);
        setEditedTransaction({...selectedTransaction});
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await TransactionService.deleteTransaction(
                selectedTransaction.id, 
                selectedTransaction.transactionType
            );
            // Update local state
            const updatedTransactions = transactions.filter(t => t.id !== selectedTransaction.id);
            setTransactions(updatedTransactions);
            closePopup();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            setError('Failed to delete transaction: ' + error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedTransaction({
            ...editedTransaction,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        });
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        const selectedCategory = categories.find(cat => cat.id === categoryId);
        
        if (selectedCategory) {
            setEditedTransaction({
                ...editedTransaction,
                categoryId: selectedCategory.id,
                categoryName: selectedCategory.name,
                categoryIcon: selectedCategory.icon
            });
        }
    };

    const handleSaveEdit = async () => {
        try {
            if (editedTransaction.transactionType === 'transfer') {
                // For transfer transactions, only allow updating notes for simplicity
                const updateData = { notes: editedTransaction.notes };
                await TransactionService.updateTransferTransaction(editedTransaction.id, updateData);
            } else {
                // For regular transactions, allow updating all fields
                await TransactionService.updateRegularTransaction(editedTransaction.id, editedTransaction);
            }
            
            // Update local state
            const updatedTransactions = transactions.map(t => 
                t.id === selectedTransaction.id ? {...t, ...editedTransaction} : t
            );
            
            setTransactions(updatedTransactions);
            setSelectedTransaction({...selectedTransaction, ...editedTransaction});
            setEditMode(false);
        } catch (error) {
            console.error('Error updating transaction:', error);
            setError('Failed to update transaction: ' + error.message);
        }
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
                            placeholder="Search by name, account, or notes..."
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                            <button
                                onClick={() => setFilterType('transfer')}
                                className={`px-4 py-2 rounded-lg ${filterType === 'transfer' ? 'bg-blue-600' : 'bg-slate-700'} hover:bg-blue-500 transition-colors`}
                            >
                                Transfer
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
                                <li 
                                    key={transaction.id} 
                                    className="flex items-center justify-between hover:bg-slate-800 transition-colors border-b-[1px] border-b-gray-600 pb-4 last:border-b-0 last:pb-0 cursor-pointer"
                                    onClick={() => handleTransactionClick(transaction)}
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                                            <span>{TransactionUtils.getTransactionIcon(transaction)}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{TransactionUtils.getTransactionName(transaction)}</p>
                                            <p className="text-slate-400 text-sm">
                                                {TransactionUtils.formatDisplayDate(transaction.date)}
                                            </p>
                                            <p className="font-medium text-slate-400 truncate text-xs max-w-xs">{transaction.notes}</p>
                                        </div>
                                    </div>
                                    <p className={TransactionUtils.getAmountColorClass(transaction)}>
                                        {TransactionUtils.getAmountPrefix(transaction)}
                                        ₹{TransactionUtils.getTransactionAmount(transaction).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </motion.div>

            {/* Transaction Detail Popup */}
            <AnimatePresence>
                {selectedTransaction && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                        <motion.div 
                            className="bg-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Popup Header */}
                            <div className="flex justify-between items-center p-4 border-b border-slate-700">
                                <h3 className="text-xl font-semibold">
                                    {editMode ? "Edit Transaction" : "Transaction Details"}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {!editMode && !showDeleteConfirm && (
                                        <>
                                            <button 
                                                onClick={handleEditClick} 
                                                className="p-2 rounded-full hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                <FiEdit size={18} />
                                            </button>
                                            <button 
                                                onClick={handleDeleteClick}
                                                className="p-2 rounded-full hover:bg-slate-700 text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                    <button 
                                        onClick={closePopup}
                                        className="p-2 rounded-full hover:bg-slate-700 transition-colors"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Delete Confirmation */}
                            {showDeleteConfirm ? (
                                <div className="p-6">
                                    <p className="text-center mb-6">Are you sure you want to delete this transaction?</p>
                                    <div className="flex justify-center gap-4">
                                        <button 
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleDeleteConfirm}
                                            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ) : editMode ? (
                                /* Edit Mode - different for regular vs. transfer transactions */
                                <div className="p-6 space-y-4">
                                    {selectedTransaction.transactionType === 'regular' ? (
                                        /* Regular Transaction Edit Form */
                                        <>
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Transaction Type</label>
                                                <select
                                                    name="type"
                                                    value={editedTransaction.type || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-slate-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="income">Income</option>
                                                    <option value="expense">Expense</option>
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    value={editedTransaction.amount || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-slate-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Category</label>
                                                {loadingCategories ? (
                                                    <div className="flex items-center space-x-2 text-slate-400">
                                                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                                        <span>Loading categories...</span>
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={editedTransaction.categoryId || ''}
                                                        onChange={handleCategoryChange}
                                                        className="w-full bg-slate-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Select a category</option>
                                                        {categories
                                                            .filter(cat => cat.type === editedTransaction.type) // Only show categories matching the transaction type
                                                            .map(category => (
                                                                <option key={category.id} value={category.id}>
                                                                    {category.icon} {category.name}
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm text-slate-400 mb-1">Date</label>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={TransactionUtils.formatDate(editedTransaction.date)}
                                                    onChange={(e) => {
                                                        const date = new Date(e.target.value);
                                                        setEditedTransaction({
                                                            ...editedTransaction,
                                                            date: date
                                                        });
                                                    }}
                                                    className="w-full bg-slate-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        /* Transfer Transaction Edit Form - Limited to just notes */
                                        <div className="space-y-4">
                                            <div className="bg-slate-700 rounded-lg p-4">
                                                <p className="text-yellow-400 mb-2">Note: Transfer transaction details like accounts and amount cannot be edited</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-slate-400">From Account</p>
                                                        <p className="font-medium">{editedTransaction.sourceAccountName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-400">To Account</p>
                                                        <p className="font-medium">{editedTransaction.destinationAccountName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-400">Amount</p>
                                                        <p className="font-medium">₹{editedTransaction.amount.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-400">Date</p>
                                                        <p className="font-medium">{TransactionUtils.formatDisplayDate(editedTransaction.date)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Common fields for both transaction types */}
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Notes</label>
                                        <textarea
                                            name="notes"
                                            value={editedTransaction.notes || ''}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end gap-4 pt-4">
                                        <button 
                                            onClick={() => setEditMode(false)}
                                            className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSaveEdit}
                                            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode - different for regular vs. transfer transactions */
                                <div className="p-6">
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                                            <span className="text-2xl">
                                                {TransactionUtils.getTransactionIcon(selectedTransaction)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {selectedTransaction.transactionType === 'regular' ? (
                                        /* Regular Transaction Details */
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <h4 className="text-2xl font-bold mb-1">
                                                    <span className={selectedTransaction.type === "income" ? "text-green-400" : "text-red-400"}>
                                                        {selectedTransaction.type === "income" ? "+" : "-"}
                                                        ₹{selectedTransaction.amount.toLocaleString()}
                                                    </span>
                                                </h4>
                                                <p className="text-slate-400">{selectedTransaction.categoryName}</p>
                                            </div>
                                            
                                            <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Date</span>
                                                    <span>{TransactionUtils.formatDisplayDate(selectedTransaction.date)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Type</span>
                                                    <span className={selectedTransaction.type === "income" ? "text-green-400 capitalize" : "text-red-400 capitalize"}>
                                                        {selectedTransaction.type}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Category</span>
                                                    <span>{selectedTransaction.categoryName}</span>
                                                </div>
                                                {selectedTransaction.notes && (
                                                    <div>
                                                        <span className="text-slate-400 block mb-1">Notes</span>
                                                        <p className="bg-slate-800 p-3 rounded">{selectedTransaction.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Transfer Transaction Details */
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <h4 className="text-2xl font-bold mb-1">
                                                    <span className="text-blue-400">
                                                        ₹{selectedTransaction.amount.toLocaleString()}
                                                    </span>
                                                </h4>
                                                <p className="text-slate-400">Transfer</p>
                                            </div>
                                            
                                            <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Date</span>
                                                    <span>{TransactionUtils.formatDisplayDate(selectedTransaction.date)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block mb-1">From Account</span>
                                                    <div className="flex items-center space-x-2 bg-slate-800 p-3 rounded">
                                                        <span>{selectedTransaction.sourceAccountIcon}</span>
                                                        <span>{selectedTransaction.sourceAccountName}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block mb-1">To Account</span>
                                                    <div className="flex items-center space-x-2 bg-slate-800 p-3 rounded">
                                                        <span>{selectedTransaction.destinationAccountIcon}</span>
                                                        <span>{selectedTransaction.destinationAccountName}</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-slate-400 block mb-1">Source Balance Before</span>
                                                        <p className="bg-slate-800 p-2 rounded">₹{selectedTransaction.sourceBalanceBefore.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block mb-1">Source Balance After</span>
                                                        <p className="bg-slate-800 p-2 rounded">₹{selectedTransaction.sourceBalanceAfter.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block mb-1">Dest. Balance Before</span>
                                                        <p className="bg-slate-800 p-2 rounded">₹{selectedTransaction.destinationBalanceBefore.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block mb-1">Dest. Balance After</span>
                                                        <p className="bg-slate-800 p-2 rounded">₹{selectedTransaction.destinationBalanceAfter.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                {selectedTransaction.notes && (
                                                    <div>
                                                        <span className="text-slate-400 block mb-1">Notes</span>
                                                        <p className="bg-slate-800 p-3 rounded">{selectedTransaction.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default AllTransactions;