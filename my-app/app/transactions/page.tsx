'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  accountid: number;
  account: { name: string };
}

interface Account {
  id: number;
  name: string;
}

export default function Transactions() {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      //if (!session?.access_token) {
      //  console.log('No session found');
      //  return;
      //}

      // Fetch accounts for the dropdown
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select('id, name');

      if (accountsError) {
        console.error('Error fetching accounts:', accountsError);
        return;
      }

      console.log('Fetched accounts:', accountsData);
      if (accountsData) setAccounts(accountsData);

      // Fetch transactions with account names
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select(`
          *,
          account:accounts(name)
        `);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        return;
      }

      console.log('Fetched transactions:', transactionsData);
      if (transactionsData) setTransactions(transactionsData);
    }
    fetchData();
  }, []);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount.toString());
    setDescription(transaction.description);
    setAccountId(transaction.accountid.toString());
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClientComponentClient();
    
    if (editingTransaction) {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          amount: parseFloat(amount),
          description,
          accountid: parseInt(accountId)
        })
        .eq('id', editingTransaction.id);

      if (!error) {
        // Refresh transactions list
        const { data } = await supabase
          .from("transactions")
          .select(`*, account:accounts(name)`);
        if (data) setTransactions(data);
      }
    } else {
      const { error } = await supabase
        .from('transactions')
        .insert([{ 
          amount: parseFloat(amount),
          description,
          accountid: parseInt(accountId)
        }]);
        
      if (!error) {
        const { data } = await supabase
          .from("transactions")
          .select(`*, account:accounts(name)`);
        if (data) setTransactions(data);
      }
    }
    
    setAmount('');
    setDescription('');
    setAccountId('');
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleDelete = async (id: number) => {
    const supabase = createClientComponentClient();
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
      
    if (!error) {
      setTransactions(transactions.filter(transaction => transaction.id !== id));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add Transaction
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-medium border-b">
          <div>Amount</div>
          <div>Description</div>
          <div>Account</div>
          <div>Actions</div>
        </div>
        
        {transactions?.map((transaction) => (
          <div key={transaction.id} className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-gray-50">
            <div className="font-medium">${transaction.amount.toFixed(2)}</div>
            <div className="text-gray-600">{transaction.description}</div>
            <div>{transaction.account?.name}</div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(transaction)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleDelete(transaction.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">
            {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select an account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}