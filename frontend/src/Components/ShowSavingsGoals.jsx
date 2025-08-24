import { useState, useEffect } from 'react';
import { Trash2, Edit } from 'lucide-react';
import SetSavingsGoal from './SetSavingsGoals';
import { auth } from '../firebase';
import { useRefetchWholeData } from '../context/RefetchContext';

export default function ShowSavingsGoals({ data, savingsCategories }) {
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addGoal, setAddGoal] = useState(false);
  const refetchWholeData = useRefetchWholeData();

  useEffect(() => {
    try {
      if (Array.isArray(data)) setSavingsGoals(data);
      else if (data) setSavingsGoals([data]);
      else setSavingsGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  const handleDelete = async (id) => {
    if (!id) return;
    const prev = savingsGoals;
    setSavingsGoals(p => p.filter(g => g.id !== id));
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${serverUrl}/DeleteSavingsGoal/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setSavingsGoals(prev);
        return;
      }
      await refetchWholeData();
    } catch {
      setSavingsGoals(prev);
    }
  };

  const handleDeleteGoal = async (id) => {
    await handleDelete(id);
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (isLoading) {
    return (
      <div className="bg-[#191428] rounded-xl p-6">
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-3"></div>
                        <p className="text-slate-400 text-sm">Loading savings goals...</p>
                    </div>
        </div>
      </div>
    );
  }

  if (addGoal) {
    return (
      <SetSavingsGoal
        savingsCategories={savingsCategories || []}
        onBack={() => setAddGoal(false)}
      />
    );
  }

  return (
    <div className="bg-[#191428] rounded-xl p-6 h-[470px] flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-white">Savings Goals</h2>
        <button
          type="button"
          onClick={() => setAddGoal(true)}
          className="text-purple-400 text-md hover:text-purple-300"
        >
          + Add new
        </button>
      </div>
      {savingsGoals.length === 0 ? (
          <div className="text-center py-8 flex-1 flex items-center justify-center">
                    <div>
                        <p className="text-slate-400 mb-2">No budget goals set</p>
                        <p className="text-slate-500 text-sm">Create your first budget goal to start tracking</p>
                    </div>
                </div>
        ) :
      <div className="space-y-4 overflow-y-auto pr-2">
        
        {savingsGoals.map(goal => {
          const progress = goal.targetAmount
            ? Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100)
            : 0;
            let barColor = 'bg-green-500';
            if (progress >= 90) barColor = 'bg-red-500';
            else if (progress >= 75) barColor = 'bg-yellow-500';
          return (
            <div key={goal.id} className="p-4 rounded-xl bg-[#201A30] border border-[#28233C]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-medium">{goal.name}</p>
                  {goal.description && (
                    <p className="text-slate-400 text-xs mt-1">{goal.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">₹{(goal.currentAmount || 0).toLocaleString()}</span>
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

                    {goal.targetAmount - goal.currentAmount <= 0 ? ' Goal Achieved!' : `₹${Math.max(0, (goal.targetAmount - (goal.currentAmount || 0))).toLocaleString()} to go`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
