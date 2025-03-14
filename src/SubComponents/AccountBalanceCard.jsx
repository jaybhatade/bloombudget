import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';
import { INR } from '../Common/funcs';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function AccountBalanceCard() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "accounts"), where("userID", "==", userID));
      const querySnapshot = await getDocs(q);
      const accountsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAccounts(accountsData);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => total + parseFloat(account.balance || 0), 0);
  };

  const formatBalance = (balance) => {
    const amount = parseFloat(balance);
    const isNegative = amount < 0;
    const prefix = isNegative ? '-' : '';
    const colorClass = isNegative ? 'text-red-400' : 'text-white';
    
    return (
      <span className={colorClass}>
        {prefix}{INR}{Math.abs(amount).toFixed(0)}
      </span>
    );
  };

  const totalBalance = calculateTotalBalance();

  return (
    <motion.div 
      className=" overflow-visible shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {loading ? (
        <div className="flex justify-center items-center p-8 ">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Total Balance Section */
        <Link to={"/accounts"} className="p-4 pr-2 bg-blue-500 flex h-32 justify-between items-center overflow-visible rounded-2xl">
        <div>
          <p className="text-slate-200 text-sm font-medium mb-1">Total Balance</p>
          <h2 className="text-3xl font-bold text-white mb-2">{formatBalance(totalBalance)}</h2>
          <p className="text-slate-200 text-sm">
            {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
          </p>
        </div>
            <img src='/16572.png' className='w-34 relative bottom-4 overflow-visible'/>
        </Link>
      )}
    </motion.div>
  );
}

export default AccountBalanceCard;