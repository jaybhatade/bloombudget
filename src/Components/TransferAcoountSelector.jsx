import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

function TransferAccountSelector({ 
  transferToAccount, 
  setTransferToAccount, 
  paymentMethods,
  paymentMethod,
}) {
  // Filter out the source account from available destinations
  const availableDestinations = paymentMethods.filter(method => method.id !== paymentMethod);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="flex items-center text-sm font-medium text-slate-300">
          <FiRefreshCw className="mr-2" /> Transfer To
        </label>
      </div>
      
      {availableDestinations.length === 0 ? (
        <div className="bg-slate-800 p-4 rounded-lg text-center text-slate-300">
          You need at least two accounts to make transfers.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {availableDestinations.map((method) => (
            <div key={method.id} className='flex flex-col justify-center'>
              <button
                type="button"
                onClick={() => setTransferToAccount(method.id)}
                className={`aspect-square rounded-full flex flex-col h-14 items-center justify-center transition-all ${
                  transferToAccount === method.id 
                    ? 'bg-blue-500 text-white scale-110' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
              </button>
              <span className="text-xs mt-1 truncate w-full text-center px-2">{method.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransferAccountSelector;