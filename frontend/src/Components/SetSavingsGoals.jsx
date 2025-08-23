import { useState, useEffect } from 'react';
import { PiggyBank, DollarSign, Calendar, Plus} from 'lucide-react';
import ShowSavingsGoals from './ShowSavingsGoals';
import { auth } from './../firebase';

export default function SetSavingsGoals({ data, savingsCategories, onBack }) {
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    const [savingsData, setSavingsData] = useState({
        name: '',
        targetAmount: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSavings, setShowSavings] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const handleInputChange = (field, value) => {
        setSavingsData(prev => ({ ...prev, [field]: value }));
        setError('');
        setSuccess('');
    };

    useEffect(() => {
        setSelectedCategories(savingsCategories);
    }, [savingsCategories]);

    const handleSubmit = async(e) => {
        e.preventDefault();
        
        if (!savingsData.name || !savingsData.targetAmount) {
            setError("Please fill in all required fields!");
            return;
        }

        const formattedData = {
            name: savingsData.name,
            targetAmount: Number(savingsData.targetAmount),
            description: savingsData.description || "" 
        };

        try {
            const response = await fetch(`${serverUrl}/SetSavings`, {
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

            setSuccess("Savings goal added successfully!");
            
            // Reset form
            setSavingsData({
                name: '',
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

    if(showSavings){
        return(<ShowSavingsGoals data={data} savingsCategories={savingsCategories} />);
    }

    return (
        <div className="bg-[#191428] rounded-xl p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">Set Savings Goal</h2>
                <button 
                    onClick={() => {
                        if (onBack) {
                            onBack();
                        }
                    }} 
                    className="text-purple-400 text-md cursor-pointer hover:text-purple-300"
                >
                    Show Savings
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

                {/* Goal Name */}
                <div>
                    <label className="block text-white font-medium mb-2">
                        Goal Name
                    </label>
                    <input
                        type="text"
                        value={savingsData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 text-lg bg-[#201A30] border border-[#28233C] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., New Laptop, trip"
                        required
                    />
                </div>

                {/* Target Amount */}
                <div>
                    <label className="block text-white font-medium mb-2">
                        Target Amount
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">₹</span>
                        <input
                            type="number"
                            value={savingsData.targetAmount}
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
                        value={savingsData.description}
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
                    Create Savings Goal
                </button>
            </form>
        </div>
    );
}
