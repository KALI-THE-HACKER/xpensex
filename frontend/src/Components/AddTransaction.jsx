import { React, useState, useRef, useEffect } from "react";
import { auth } from "./../firebase";
import { useRefetchWholeData } from '../context/RefetchContext';

export default function AddTransaction({ expenseCategories, incomeCategories, savingsCategories }) {
    const [transactionData, setTransactionData] = useState({
        amount:'',
        type:'',
        category:'',
        date:'',
        description:''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    const refetchWholeData = useRefetchWholeData();

    const handleAddTransaction = async() => {
        if (!transactionData.amount || !transactionData.type || !transactionData.category || !transactionData.date) {
            setError("Please fill in all required fields!");
            setSuccess('');
            return;
        }
        
        try {
            const response = await fetch(`${serverUrl}/AddTransaction`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${await auth.currentUser.getIdToken()}`
                },
                body: JSON.stringify(transactionData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || "Failed to add transaction.");
                setSuccess('');
                return;
            }

            // Success case
            setSuccess("Transaction added successfully!");
            setError('');
            
            // Reset form
            setTransactionData({
                amount: '',
                type: '',
                category: '',
                date: '',
                description: ''
            });

            await refetchWholeData();

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);

        } catch (err) {
            setError(err.message);
            setSuccess('');
            return;
        }
    };

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [addCategory, setAddCategory] = useState(false);


    //Dynamically changes the category as per 'type' opted by user
    useEffect(() => {
        setTransactionData(prev => ({...prev, category: ''}));
        
        if(transactionData.type === 'Expense'){
            setSelectedCategories(expenseCategories);
        } else if(transactionData.type === 'Income'){
            setSelectedCategories(incomeCategories);
        } else if(transactionData.type === 'Savings'){
            setSelectedCategories(savingsCategories);
        } else {
            setSelectedCategories([]);
        }
    }, [transactionData.type, expenseCategories, incomeCategories, savingsCategories])

    return(
        <>
        <div className="bg-[#191428] w-full max-w-[380px] mx-auto my-3 py-3 px-5 rounded-2xl overflow-hidden">
                        <form className="space-y-6 w-full">
                            
                            <label className="block text-lg font-medium text-white mb-2">
                                Add Transaction
                            </label>
                            {error && (
                                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg text-sm">
                                    {success}
                                </div>
                            )}

                            <div className="relative flex items-center mb-6" style={{minHeight: '48px'}}>
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">₹</span>
                                <input
                                    type="number"
                                    name="amount"
                                    value={transactionData.amount}
                                    onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                                    className="w-full pl-10 pr-3 py-2 text-lg bg-[#201A30] border border-[#28233C] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Amount"
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="mb-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Type Selector */}
                                    <div className="flex-1 flex flex-col">
                                        <label className="block text-lg font-medium text-white mb-2">
                                            Type
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="type"
                                                className="w-full appearance-none pl-3 pr-8 py-2 text-lg bg-[#201A30] border border-[#28233C] focus:border-purple-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 shadow-sm min-w-[150px]"
                                                required
                                                value={transactionData.type}
                                                onChange={(e) => setTransactionData({...transactionData, type: e.target.value})}
                                            >
                                                <option value="" disabled>
                                                    Select
                                                </option>
                                                <option value="Expense">Expense</option>
                                                <option value="Income">Income</option>
                                                <option value="Savings">Savings</option>
                                            </select>
                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-purple-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                    {/* Category selector */}
                                    <div className="flex-1 flex flex-col">
                                        <label className="block text-lg font-medium text-white mb-2">
                                            Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                className={`w-full appearance-none pl-3 pr-8 py-2 text-lg bg-[#201A30] border border-[#28233C] focus:border-purple-500 rounded-xl ${addCategory ? "text-neutral-500" : "text-white"} focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 shadow-sm min-w-[170px]`}
                                                required
                                                value={transactionData.category}
                                                onChange={(e) => setTransactionData({...transactionData, category: e.target.value})}
                                                disabled={addCategory}
                                            >
                                                <option value="" disabled>
                                                    Select
                                                </option>
                                                {selectedCategories.map((cat, index) => (
                                                    <option key={index} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-purple-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {transactionData.type !== 'Savings' && (
                                <div className="relative mb-6">
                                    <div className="absolute right-0 flex justify-end">
                                        <button
                                            type="button"
                                            className="mt-1 text-sm text-purple-400 hover:text-purple-300 transition-colors px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            onClick={() => { setAddCategory(!addCategory); }}
                                        >
                                            + Add category
                                        </button>
                                    </div>
                                </div>
                                )}
                            </div>

                            {addCategory && <div className="mb-6 mt-8 flex items-center gap-2 w-full">
                                <input
                                    type="text"
                                    name="category"
                                    className="flex-1 pl-3 pr-2 py-2 text-base bg-[#201A30] border border-[#28233C] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Add new category"
                                    value={transactionData.category}
                                    onChange={(e) => setTransactionData({...transactionData, category: e.target.value})}
                                />
                            </div>}

                            <label className="block text-lg font-medium text-white mb-2">
                                Date
                            </label>
                            <div className="relative flex items-center mb-6">
                                <input
                                    type="date"
                                    name="date"
                                    className="w-full pl-4 pr-5 py-1 text-lg bg-[#201A30] border border-[#28233C] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={transactionData.date}
                                    onChange={(e) => setTransactionData({...transactionData, date: e.target.value})}
                                    required
                                    // style={{height: '48px'}}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <label className="block text-lg font-medium text-white mb-2 mt-2">
                                Description
                            </label>
                            <div className="relative flex items-center mb-6">
                                <input
                                    type="text"
                                    name="description"
                                    className="w-full pl-4 pr-5 py-1 text-lg bg-[#201A30] border border-[#28233C] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Description"
                                    value={transactionData.description}
                                    onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
                                />
                            </div>
                            
                            <button
                                type="button"
                                onClick={handleAddTransaction}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-medium duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Transaction
                            </button>
                        </form>
                    </div>
        </>
    );
}