import { db } from "../Firebase";
import { query, collection, where, getDocs } from 'firebase/firestore';

export const fetchTransactions = async (userID) => {
    const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userID', '==', userID)
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    const transactions = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return transactions;
};

export const fetchAccounts = async (userID) => {
    const accountsQuery = query(
        collection(db, 'accounts'),
        where('userID', '==', userID)
    );
    const accountsSnapshot = await getDocs(accountsQuery);
    const accounts = accountsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    return accounts;
};

export const calculateTotalIncome = (transactions) => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    return totalIncome;
};

export const calculateTotalExpenses = (transactions) => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    return totalExpenses;
};

export const calculateNetSavings = (totalIncome, totalExpenses) => {
    const netSavings = totalIncome - totalExpenses;
    return netSavings;
};

export const calculateTotalBalance = (accounts) => {
    const totalBalance = accounts.reduce((sum, account) => {
        const balance = parseFloat(account.balance) || 0;
        return sum + balance;
    }, 0);
    return totalBalance;
};

export const calculateBalanceAfterTransactions = (totalBalance, netSavings) => {
    const newBalance = totalBalance + netSavings;

    return newBalance;
};


