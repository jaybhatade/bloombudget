// import React, { useEffect, useState } from 'react';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from '../Firebase';
// import { FiBarChart2, FiArrowUp, FiArrowDown } from 'react-icons/fi';

// function ReportTab() {
//     const [transactions, setTransactions] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [reportData, setReportData] = useState({
//         totalIncome: 0,
//         totalExpenses: 0,
//         savingsRate: 0,
//         netSavings: 0,
//         incomeBreakdown: [],
//         expenseBreakdown: []
//     });

//     useEffect(() => {
//         fetchTransactions();
//     }, []);

//     useEffect(() => {
//         if (transactions.length > 0) {
//             generateReportData();
//         }
//     }, [transactions]);

//     const fetchTransactions = async () => {
//         try {
//             setLoading(true);
//             const userID = localStorage.getItem('userID');
//             if (!userID) {
//                 setLoading(false);
//                 return;
//             }

//             const q = query(
//                 collection(db, 'transactions'),
//                 where('userID', '==', userID)
//             );

//             const querySnapshot = await getDocs(q);
//             const transactionsData = querySnapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             }));

//             setTransactions(transactionsData);
//             setError(null);
//         } catch (error) {
//             console.error('Error fetching transactions:', error);
//             setError(error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const generateReportData = () => {
//         // Calculate total income and expenses
//         const incomeTransactions = transactions.filter(t => t.type === 'income');
//         const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
//         const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
//         const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        
//         // Calculate savings rate
//         const netSavings = totalIncome - totalExpenses;
//         const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
        
//         // Generate income breakdown by category
//         const incomeByCategory = {};
//         incomeTransactions.forEach(t => {
//             const categoryName = t.categoryName || 'Uncategorized';
//             if (!incomeByCategory[categoryName]) {
//                 incomeByCategory[categoryName] = 0;
//             }
//             incomeByCategory[categoryName] += (t.amount || 0);
//         });
        
//         const incomeBreakdown = Object.keys(incomeByCategory).map(category => {
//             const amount = incomeByCategory[category];
//             return {
//                 category,
//                 amount,
//                 percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0
//             };
//         }).sort((a, b) => b.amount - a.amount);
        
//         // Generate expense breakdown by category
//         const expensesByCategory = {};
//         expenseTransactions.forEach(t => {
//             const categoryName = t.categoryName || 'Uncategorized';
//             if (!expensesByCategory[categoryName]) {
//                 expensesByCategory[categoryName] = 0;
//             }
//             expensesByCategory[categoryName] += (t.amount || 0);
//         });
        
//         const expenseBreakdown = Object.keys(expensesByCategory).map(category => {
//             const amount = expensesByCategory[category];
//             return {
//                 category,
//                 amount,
//                 percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
//             };
//         }).sort((a, b) => b.amount - a.amount);
        
//         setReportData({
//             totalIncome,
//             totalExpenses,
//             savingsRate,
//             netSavings,
//             incomeBreakdown,
//             expenseBreakdown
//         });
//     };

//     return (
//         <div className="p-4">
//             {loading ? (
//                 <div className="text-center p-4">
//                     <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
//                     <p>Loading financial summary...</p>
//                 </div>
//             ) : error ? (
//                 <div className="text-center text-red-400 p-4">
//                     <p>Error: {error}</p>
//                 </div>
//             ) : (
//                 <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
//                     <h2 className="text-lg font-semibold mb-4 flex items-center">
//                         <FiBarChart2 className="mr-2" /> Financial Summary
//                     </h2>
                    
//                     {/* Main Summary Stats */}
//                     <div className="grid grid-cols-3 gap-2 mb-6">
//                         <div className="bg-green-900/30 p-3 rounded-lg text-center">
//                             <p className="text-xs text-green-400 mb-1">Income</p>
//                             <p className="text-lg font-bold text-green-400">₹{reportData.totalIncome.toLocaleString()}</p>
//                         </div>
//                         <div className="bg-red-900/30 p-3 rounded-lg text-center">
//                             <p className="text-xs text-red-400 mb-1">Expenses</p>
//                             <p className="text-lg font-bold text-red-400">₹{reportData.totalExpenses.toLocaleString()}</p>
//                         </div>
//                         <div className="bg-blue-900/30 p-3 rounded-lg text-center">
//                             <p className="text-xs text-blue-400 mb-1">Balance</p>
//                             <p className="text-lg font-bold text-blue-400">₹{reportData.netSavings.toLocaleString()}</p>
//                             <p className="text-xs">{reportData.savingsRate}% saved</p>
//                         </div>
//                     </div>
                    
//                     {/* Breakdowns Section */}
//                     <div className="space-y-6">
//                         {/* Income Breakdown */}
//                         <div>
//                             <h3 className="text-sm font-medium mb-3 flex items-center">
//                                 <FiArrowUp className="mr-1 text-green-400" /> Income Breakdown
//                             </h3>
//                             {reportData.incomeBreakdown.length === 0 ? (
//                                 <p className="text-xs text-slate-400">No income data available</p>
//                             ) : (
//                                 <div className="space-y-2">
//                                     {reportData.incomeBreakdown.slice(0, 3).map((item, index) => (
//                                         <div key={index} className="flex items-center text-sm">
//                                             <div className="w-1/3 truncate text-xs">{item.category}</div>
//                                             <div className="w-2/3">
//                                                 <div className="flex items-center">
//                                                     <div className="flex-grow bg-slate-700 h-2 rounded-full overflow-hidden">
//                                                         <div 
//                                                             className="bg-green-500 h-full" 
//                                                             style={{ width: `${item.percentage}%` }}
//                                                         ></div>
//                                                     </div>
//                                                     <div className="ml-2 text-xs text-green-400 w-16 text-right">
//                                                         ₹{item.amount.toLocaleString()}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
                        
//                         {/* Expense Breakdown */}
//                         <div>
//                             <h3 className="text-sm font-medium mb-3 flex items-center">
//                                 <FiArrowDown className="mr-1 text-red-400" /> Expense Breakdown
//                             </h3>
//                             {reportData.expenseBreakdown.length === 0 ? (
//                                 <p className="text-xs text-slate-400">No expense data available</p>
//                             ) : (
//                                 <div className="space-y-2">
//                                     {reportData.expenseBreakdown.slice(0, 3).map((item, index) => (
//                                         <div key={index} className="flex items-center text-sm">
//                                             <div className="w-1/3 truncate text-xs">{item.category}</div>
//                                             <div className="w-2/3">
//                                                 <div className="flex items-center">
//                                                     <div className="flex-grow bg-slate-700 h-2 rounded-full overflow-hidden">
//                                                         <div 
//                                                             className="bg-red-500 h-full" 
//                                                             style={{ width: `${item.percentage}%` }}
//                                                         ></div>
//                                                     </div>
//                                                     <div className="ml-2 text-xs text-red-400 w-16 text-right">
//                                                         ₹{item.amount.toLocaleString()}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default ReportTab;


import React from 'react'

function ReportTab() {
  return (
    <div className="min-h-screen flex justify-center bg-slate-950 text-gray-400 p-4">
Coming soon
    </div>)
}

export default ReportTab
