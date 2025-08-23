import { react, useState, useEffect } from 'react';

export default function Tiles({ totalIncome, totalExpense, balanceLeft, totalSavings }) {
    const [isLoading, setIsLoading] = useState(true);
    const [tilesData, setTilesData] = useState({});

    useEffect(() => {
        setIsLoading(false);

        
        setTilesData({
            'Total Income': totalIncome,
            'Total Expense': totalExpense,
            'Balance': balanceLeft,
            'Savings': totalSavings
        })

        return () => {};
    }, [totalIncome, totalExpense, balanceLeft, totalSavings])

    if (isLoading) {
        return (
            <div className={'flex items-center justify-center'}>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-slate-400 text-sm">Loading tiles...</p>
                </div>
            </div>
        );
    }

    return(
        <>
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(tilesData).map(([key, value]) => (
                <div className="bg-[#191428] rounded-xl py-3">
                <div className="flex flex-col gap-1 md:gap-2 items-center">
                    <h3 className="text-xl text-white">{key}</h3>
                    <h2 className={`text-2xl ${
                        key.includes("Expense") ? "text-red-500"
                        : key.includes("Balance") ? "text-yellow-500"
                        : "text-green-500"
                        }`}>₹{value}</h2>
                </div>
            </div>
            ))}
            
        </div>
        </>
    );
}