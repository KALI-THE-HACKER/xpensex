import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
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
      const res = await fetch(`${serverUrl}/DeleteSavings/${id}`, {
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

  if (isLoading) {
    return (
      <div className="bg-[#191428] rounded-xl p-6">
        <div className="flex items-center justify-center h-40">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
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
      <div className="space-y-4 overflow-y-auto pr-2">
        {savingsGoals.length === 0 && (
          <div className="text-slate-400 text-sm">No savings goals yet.</div>
        )}
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
                  <p className="text-white font-medium">{goal.category}</p>
                  {goal.description && (
                    <p className="text-slate-400 text-xs mt-1">{goal.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(goal.id)}
                  className="text-slate-500 hover:text-red-400 transition"
                  aria-label="Delete savings goal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>₹{goal.currentAmount || 0}</span>
                  <span>₹{goal.targetAmount}</span>
                </div>
                <div className="h-2 bg-[#2b2440] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-right text-xs text-slate-500 mt-1">
                  {progress.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
