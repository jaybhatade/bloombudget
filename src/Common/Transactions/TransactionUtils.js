export class TransactionUtils {
    static formatDate(date) {
        if (!date) return '';
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toISOString().split('T')[0]; // YYYY-MM-DD format for input
    }

    static formatDisplayDate(date) {
        if (!date) return '';
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    static filterTransactions(transactions, filterType, searchTerm) {
        let results = [...transactions];
        
        // Apply type filter (for regular transactions)
        if (filterType !== 'all') {
            if (filterType === 'transfer') {
                results = results.filter(transaction => transaction.transactionType === 'transfer');
            } else {
                results = results.filter(transaction => 
                    transaction.transactionType === 'regular' && transaction.type === filterType
                );
            }
        }
        
        // Apply search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(transaction => {
                if (transaction.transactionType === 'transfer') {
                    return (
                        (transaction.sourceAccountName && transaction.sourceAccountName.toLowerCase().includes(term)) ||
                        (transaction.destinationAccountName && transaction.destinationAccountName.toLowerCase().includes(term)) ||
                        (transaction.notes && transaction.notes.toLowerCase().includes(term))
                    );
                } else {
                    return (
                        (transaction.categoryName && transaction.categoryName.toLowerCase().includes(term)) ||
                        (transaction.notes && transaction.notes.toLowerCase().includes(term))
                    );
                }
            });
        }
        
        return results;
    }

    static getTransactionIcon(transaction) {
        if (transaction.transactionType === 'transfer') {
            return '↔️'; // Transfer icon
        } else {
            return transaction.categoryIcon || (transaction.type === 'income' ? '💰' : '💸');
        }
    }

    static getTransactionName(transaction) {
        if (transaction.transactionType === 'transfer') {
            return `${transaction.sourceAccountName} → ${transaction.destinationAccountName}`;
        } else {
            return transaction.categoryName || (transaction.type === 'income' ? 'Income' : 'Expense');
        }
    }

    static getTransactionAmount(transaction) {
        if (transaction.transactionType === 'transfer') {
            return transaction.amount;
        } else {
            return transaction.amount;
        }
    }

    static getAmountColorClass(transaction) {
        if (transaction.transactionType === 'transfer') {
            return 'text-blue-400';
        } else {
            return transaction.type === 'income' ? 'text-green-400' : 'text-red-400';
        }
    }

    static getAmountPrefix(transaction) {
        if (transaction.transactionType === 'transfer') {
            return '↔️';
        } else {
            return transaction.type === 'income' ? '+' : '-';
        }
    }
}