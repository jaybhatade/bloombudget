import React from 'react';

function TransactionTypeSelector({ transactionType, setTransactionType, setSelectedCategory, setTransferToAccount }) {
  return (
    <div className="mx-4 my-6">
      <div className="flex rounded-lg overflow-hidden shadow-lg">
        {[
          {type: "expense", color: "bg-red-500"},
          {type: "income", color: "bg-green-500"},
          {type: "transfer", color: "bg-blue-500"}
        ].map(({type, color}) => (
          <button
            key={type}
            className={`flex-1 py-2 text-center transition-all duration-200 ${
              transactionType === type 
                ? `${color} text-white font-medium scale-105` 
                : 'bg-slate-800 text-slate-300'
            }`}
            onClick={() => {
              setTransactionType(type);
              setSelectedCategory("");
              // Reset transfer account when changing transaction types
              if (setTransferToAccount) {
                setTransferToAccount("");
              }
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TransactionTypeSelector;