import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../Firebase';

export class TransactionService {
    static async fetchAllTransactions(userID) {
        try {
            if (!userID) {
                throw new Error("User ID is required");
            }

            // Fetch regular transactions
            const regularQuery = query(
                collection(db, 'transactions'),
                where('userID', '==', userID)
            );

            // Fetch transfer transactions
            const transferQuery = query(
                collection(db, 'transferTransactions'),
                where('userID', '==', userID)
            );

            // Execute both queries in parallel
            const [regularSnapshot, transferSnapshot] = await Promise.all([
                getDocs(regularQuery),
                getDocs(transferQuery)
            ]);

            // Process regular transactions
            const regularTransactions = regularSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                transactionType: 'regular'
            }));

            // Process transfer transactions
            const transferTransactions = transferSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                transactionType: 'transfer'
            }));

            // Combine both types of transactions
            const allTransactions = [...regularTransactions, ...transferTransactions];

            // Sort by date (newest first)
            allTransactions.sort((a, b) => {
                const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                return dateB - dateA;
            });

            return allTransactions;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }

    static async fetchCategories(userID) {
        try {
            if (!userID) {
                throw new Error("User ID is required");
            }
            
            // Create a query to fetch default categories (userID === 'default')
            const defaultQuery = query(
                collection(db, 'categories'),
                where('userID', '==', 'default')
            );
            
            // Create a query to fetch user's custom categories
            const userQuery = query(
                collection(db, 'categories'),
                where('userID', '==', userID)
            );
            
            // Execute both queries
            const [defaultSnapshot, userSnapshot] = await Promise.all([
                getDocs(defaultQuery),
                getDocs(userQuery)
            ]);
            
            // Combine results
            const defaultCategories = defaultSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            const userCategories = userSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Merge categories, with user categories taking precedence if there are duplicates
            const allCategories = [...defaultCategories, ...userCategories];
            
            // Sort alphabetically by name
            allCategories.sort((a, b) => a.name.localeCompare(b.name));
            
            return allCategories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    static async deleteTransaction(transactionId, transactionType) {
        try {
            const collectionName = transactionType === 'transfer' ? 'transferTransactions' : 'transactions';
            await deleteDoc(doc(db, collectionName, transactionId));
            return true;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    }

    static async updateRegularTransaction(transactionId, updatedData) {
        try {
            const transactionRef = doc(db, 'transactions', transactionId);
            await updateDoc(transactionRef, updatedData);
            return true;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    }

    static async updateTransferTransaction(transactionId, updatedData) {
        try {
            const transactionRef = doc(db, 'transferTransactions', transactionId);
            await updateDoc(transactionRef, updatedData);
            return true;
        } catch (error) {
            console.error('Error updating transfer transaction:', error);
            throw error;
        }
    }
}