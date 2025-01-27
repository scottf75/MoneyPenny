'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Account {
  id: number;
  name: string;
  description: string;
}

export default function Accounts() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    async function fetchAccounts() {
      const supabase = createClientComponentClient();

      const { data } = await supabase
        .from("accounts")
        .select();

      if (data) setAccounts(data);
    }
    fetchAccounts();
  }, []);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setName(account.name);
    setDescription(account.description);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClientComponentClient();
    
    if (editingAccount) {
      const { error } = await supabase
        .from('accounts')
        .update({ name, description })
        .eq('id', editingAccount.id);

      if (!error) {
        setAccounts(accounts.map(account => 
          account.id === editingAccount.id 
            ? { ...account, name, description }
            : account
        ));
      } else {
        console.error('Error updating account:', error);
      }
    } else {
      const { error } = await supabase
        .from('accounts')
        .insert([{ name, description }]);
        
      if (!error) {
        const { data } = await supabase.from("accounts").select();
        if (data) setAccounts(data);
      } else {
        console.error('Error inserting account:', error);
      }
    }
    
    setName('');
    setDescription('');
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleDelete = async (id: number) => {
    const supabase = createClientComponentClient();
    
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
      
    if (!error) {
      // Update the accounts list by filtering out the deleted account
      setAccounts(accounts.filter(account => account.id !== id));
    } else {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Add Account
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 font-medium border-b">
          <div>Name</div>
          <div>Description</div>
          <div>Actions</div>
        </div>
        
        {/* Data rows */}
        {accounts?.map((account) => (
          <div key={account.id} className="grid grid-cols-4 gap-4 p-4 border-b hover:bg-gray-50">
            <div className="font-medium">{account.name}</div>
            <div className="text-gray-600">{account.description}</div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(account)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button 
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Add Transaction"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleDelete(account.id)}
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
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}