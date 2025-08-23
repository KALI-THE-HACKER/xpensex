import { useState, useEffect } from 'react';
import { Target, Trash2 } from 'lucide-react';
import SetBudgetGoals from './SetBudgetGoals';
import { auth } from '../firebase';
import { useRefetchWholeData } from '../context/RefetchContext';

export default function ShowBudgetGoals({ data, budgetCategories }) {
    const [budgetGoals, setBudgetGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [addBudget, setAddBudget] = useState(false);
    const refetchWholeData = useRefetchWholeData();

    useEffect(() => {
        if (data) {
            const goalsArray = Array.isArray(data) ? data : [data];
            setBudgetGoals(goalsArray);
            setIsLoading(false);
        } else {
            setBudgetGoals([]);
            setIsLoading(false);
        }
    }, [data]);

    const handleDeleteGoal = async (goalId) => {
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        try {
            setBudgetGoals(prev => prev.filter(goal => goal.id !== goalId));
            
            const response = await fetch(`${serverUrl}/DeleteBudget/${goalId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${await auth.currentUser.getIdToken()}`
                }
            });

            const data = await response.json();
            if(!response.ok){
                console.error("Failed to delete budget goal:", data.detail || response.statusText);
                return;
            }  

            await refetchWholeData();
        } catch (error) {
            console.error('Error deleting budget goal:', error);
        }
    };

    const calculateProgress = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };

    const getProgressColor = (progress) => {
        if (progress >= 90) return 'bg-red-500';
        if (progress >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    if (isLoading) {
        return (
            <div className="bg-[#191428] rounded-xl p-6">
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-3"></div>
                        <p className="text-slate-400 text-sm">Loading budget goals...</p>
                    </div>
                </div>
            </div>
        );
    }

    if(addBudget){
        return(
            <SetBudgetGoals 
                data={data} 
                budgetCategories={budgetCategories} 
                onBack={() => {
                    setAddBudget(false);
                }}
            />
        );
    }

    return (
        <div className="bg-[#191428] rounded-xl p-6 h-[470px] flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">Budget Goals</h2>
                <span 
                    onClick={() => setAddBudget(true)} 
                    className="text-purple-400 text-md cursor-pointer hover:text-purple-300"
                >
                    + Add new
                </span>
            </div>

            {budgetGoals.length === 0 ? (
                <div className="text-center py-8 flex-1 flex items-center justify-center">
                    <div>
                        <p className="text-slate-400 mb-2">No budget goals set</p>
                        <p className="text-slate-500 text-sm">Create your first budget goal to start tracking</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    {budgetGoals.map((goal) => {
                        const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                        return (
                            <div key={goal.id} className="bg-[#201A30] rounded-lg p-4 border border-[#28233C]">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium mb-1">{goal.category}</h3>
                                        <p className="text-slate-400 text-sm">{goal.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {handleDeleteGoal(goal.id)}}
                                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">₹{goal.currentAmount.toLocaleString()}</span>
                                        <span className="text-slate-400">/ ₹{goal.targetAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="w-full bg-[#28233C] rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-slate-400 text-sm">{progress.toFixed(1)}% complete</span>
                                    <span className="text-slate-400 text-sm">
                                        {(goal.targetAmount - goal.currentAmount)<0 ? 
                                        `Exceed by ₹${(goal.currentAmount - goal.targetAmount).toLocaleString()}`
                                        : `₹${(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining`} 
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
