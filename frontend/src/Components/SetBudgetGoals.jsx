import { useState, useEffect } from 'react';
import { Plus  } from 'lucide-react';
import ShowBudgetGoals from './ShowBudgetGoals';
import { auth } from './../firebase';
import { useRefetchWholeData } from '../context/RefetchContext';

export default function SetBudgetGoals({ data, budgetCategories, onBack }) {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    const [budgetData, setBudgetData] = useState({
        category: '',
        targetAmount: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showBudget, setShowBudget] = useState(false);
    const [addCategory, setAddCategory] = useState(false);

    const [selectedCategories, setSelectedCategories] = useState([]);
    const refetchWholeData = useRefetchWholeData();

    const handleInputChange = (field, value) => {
        setBudgetData(prev => ({ ...prev, [field]: value }));
        setError('');
        setSuccess('');
    };

    useEffect(() => {
        setSelectedCategories(budgetCategories);
    }, [budgetCategories]);

    const handleSubmit = async(e) => {
        e.preventDefault();
        
        if (!budgetData.category || !budgetData.targetAmount) {
            setError("Please fill in all required fields!");
            return;
        }

        const formattedData = {
            category: budgetData.category,
            targetAmount: Number(budgetData.targetAmount),
            description: budgetData.description || "" 
        };

        try {
            const response = await fetch(`${serverUrl}/SetBudget`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${await auth.currentUser.getIdToken()}`
                },
                body: JSON.stringify(formattedData)
            });

            const responseData = await response.json();

            if (!response.ok) {
                setError(responseData.detail || "Failed to add budget goal.");
                return;
            }

            setSuccess("Budget goal added successfully!");
            await refetchWholeData();
            
            // Reset form
            setBudgetData({
                category: '',
                targetAmount: '',
                description: ''
            });

            if (onBack) {
                setTimeout(() => onBack(), 2000);
            }

        } catch (err) {
            setError("Failed to connect to server. Please try again.");
            console.error("Error:", err);
        }
    };

    if(showBudget){
        return(<ShowBudgetGoals data={data} budgetCategories={budgetCategories} />);
    }

    return(
        <div className="bg-[#191428] rounded-xl p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">Set Budget Goal</h2>
                <button 
                    onClick={() => {
                        if (onBack) {
                            onBack();
                        }
                    }} 
                    className="text-purple-400 text-md cursor-pointer hover:text-purple-300"
                >
                    Show budget
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                {/* Category Selection */}
                <div>
                    <label className="block text-white font-medium mb-2">
                    </label>
                    <div className="relative">
                        <select
                            value={budgetData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full appearance-none pl-3 pr-10 py-2 text-lg bg-[#201A30] border border-[#28233C] focus:border-purple-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                            required
                            disabled={addCategory}
                        >
                            <option value="">Select Category</option>
                            {selectedCategories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-purple-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>
                    <div className="relative mb-6">
                        <div className="absolute right-0 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {setAddCategory(!addCategory)}}
                                className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                            > + Add category
                            </button>
                        </div>
                    </div>
                </div>
                {addCategory && <div className="mb-6 mt-8 flex items-center gap-2 w-full">
                                <input
                                    type="text"
                                    name="category"
                                    className="flex-1 pl-3 pr-2 py-2 text-base bg-[#201A30] border border-[#28233C] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Add new category"
                                    value={budgetData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                />
                            </div>}

                {/* Target Amount */}
                <div>
                    <label className="block text-white font-medium mb-2">
                        Target Amount
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">₹</span>
                        <input
                            type="number"
                            value={budgetData.targetAmount}
                            onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 text-lg bg-[#201A30] border border-[#28233C] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter target amount"
                            required
                            min="1"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-white font-medium mb-2">
                        Description
                    </label>
                    <textarea
                        value={budgetData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full px-3 py-2 text-lg bg-[#201A30] border border-[#28233C] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="description"
                        rows='1'
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-medium duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                    Create Budget Goal
                </button>
            </form>
        </div>
    );
}
