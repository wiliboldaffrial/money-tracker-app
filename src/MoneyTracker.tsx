import { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, X, Edit2, Trash2 } from 'lucide-react';

export default function MoneyTracker() {
    type Transaction = {
        id: number;
        amount: number;
        type: "income" | "expense";
        category: string;
        note?: string;
        date: string;
    };


    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [type, setType] = useState<"income" | "expense">("expense");
    const [amount, setAmount] = useState(""); // still string, parsed later
    const [category, setCategory] = useState("");
    const [note, setNote] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [filter, setFilter] = useState<"all" | "income" | "expense">("all");


    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
    const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('transactions') || '[]');
        setTransactions(saved);
    }, []);

    const saveTransactions = (txns: Transaction[]) => {
        localStorage.setItem("transactions", JSON.stringify(txns));
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(num);
    };

    const parseFormattedNumber = (str: string) => {
       return Number(str.replace(/[^0-9.-]+/g, ""));
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFormattedNumber(e.target.value);
        setAmount(value.toString()); // since state is string
    };

    const addTransaction = () => {
        if (!amount || !category) return;

        if (editingId) {
            const updated = transactions.map((t) =>
            t.id === editingId
                ? { ...t, type, amount: parseFloat(amount), category, note }
                : t
            );
            saveTransactions(updated);
            setEditingId(null);
        } else {
            const newTransaction: Transaction = {
            id: Date.now(),
            type,
            amount: parseFloat(amount),
            category,
            note,
            date: new Date().toISOString(),
            };
            saveTransactions([newTransaction, ...transactions]);
        }

        setShowModal(false);
        setAmount("");
        setCategory("");
        setNote("");
    };

    const editTransaction = (transaction: Transaction) => {
        setEditingId(transaction.id);
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setCategory(transaction.category);
        setNote(transaction.note ?? "");
        setShowModal(true);
    };

    const deleteTransaction = (id: number) => {
        saveTransactions(transactions.filter((t) => t.id !== id));
        setShowDeleteConfirm(null);
    };


    const filteredTransactions = transactions.filter(t => 
        filter === 'all' || t.type === filter
    );

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 rounded-b-3xl shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Money Tracker</h1>
            
            {/* Balance Card */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <p className="text-sm opacity-90">Total Balance</p>
            <p className="text-3xl font-bold">Rp {formatNumber(balance)}</p>
            </div>

            {/* Income/Expense Summary */}
            <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-500/30 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={18} />
                <p className="text-xs">Income</p>
                </div>
                <p className="text-xl font-bold">Rp {formatNumber(totalIncome)}</p>
            </div>
            <div className="bg-red-500/30 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={18} />
                <p className="text-xs">Expense</p>
                </div>
                <p className="text-xl font-bold">Rp {formatNumber(totalExpense)}</p>
            </div>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4">
            {(['all', 'income', 'expense'] as const).map(f => (
            <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                filter === f 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white text-gray-600'
                }`}
            >
                {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
            ))}
        </div>

        {/* Transactions List */}
        <div className="px-4 space-y-3">
            {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
                <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
                <p>No transactions yet</p>
            </div>
            ) : (
            filteredTransactions.map(t => (
                <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="font-semibold text-gray-800">{t.category}</p>
                    </div>
                    <p className={`text-lg font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}Rp {formatNumber(t.amount)}
                    </p>
                </div>
                {t.note && <p className="text-sm text-gray-500 mb-2">{t.note}</p>}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                    {new Date(t.date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                    <button
                        onClick={() => editTransaction(t)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(t.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                    >
                        <Trash2 size={18} />
                    </button>
                    </div>
                </div>
                </div>
            ))
            )}
        </div>

        {/* Add Button */}
        <button
            onClick={() => setShowModal(true)}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-all"
        >
            <PlusCircle size={32} />
        </button>

        {/* Add Transaction Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-3xl p-6 w-full max-w-lg animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
                <button onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setAmount('');
                    setCategory('');
                    setNote('');
                }} className="text-gray-400">
                    <X size={24} />
                </button>
                </div>

                {/* Type Toggle */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                    onClick={() => setType('income')}
                    className={`py-3 rounded-xl font-medium ${
                    type === 'income' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Income
                </button>
                <button
                    onClick={() => setType('expense')}
                    className={`py-3 rounded-xl font-medium ${
                    type === 'expense' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Expense
                </button>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">Rp</span>
                    <input
                    type="text"
                    value={amount ? formatNumber(Number(amount)) : ''}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
                </div>

                {/* Category Select */}
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="">Select category</option>
                    {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                </div>

                {/* Note Input */}
                <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
                <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                </div>

                {/* Add Button */}
                <button
                onClick={addTransaction}
                disabled={!amount || !category}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                {editingId ? 'Update Transaction' : 'Add Transaction'}
                </button>
            </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-bold mb-2">Delete Transaction?</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this transaction? This action cannot be undone.</p>
                <div className="flex gap-3">
                <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl font-medium hover:bg-gray-300"
                >
                    Cancel
                </button>
                <button
                    onClick={() => deleteTransaction(showDeleteConfirm)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl font-medium hover:bg-red-600"
                >
                    Delete
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}