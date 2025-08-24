import { react, useState, useEffect } from 'react';

export default function Transactions({ data, expenseCategoriesList }){
    const [isLoading, setIsLoading] = useState(true);
    const [recentTransactions, setRecentTransactions] = useState([]);

    const [expenseCategories, setExpenseCategories] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        
        if(data){
            setRecentTransactions(data);
            setExpenseCategories(expenseCategoriesList);
            setIsLoading(false);
        }
        // setRecentTransactions([
        //     {
        //       id: 1,
        //       title: "Shopping",
        //       date: "14 August",
        //       amount: "1200",
        //       description: "Bought clothes"
        //     },
        //     {
        //       id: 2,
        //       title: "Groceries",
        //       date: "15 August",
        //       amount: "800",
        //       description: "Weekly food items"
        //     },
        //     {
        //       id: 3,
        //       title: "Salary",
        //       date: "10 August",
        //       amount: "50000",
        //       description: ""
        //     },
        //     {
        //       id: 4,
        //       title: "Transport",
        //       date: "13 July",
        //       amount: "150",
        //       description: "Metro pass"
        //     },
        //     {
        //       id: 5,
        //       title: "Dining Out",
        //       date: "29 July",
        //       amount: "650",
        //       description: "Dinner with friends"
        //     }
        //   ]
        // );

        // setExpenseCategories(["Food", "Transport", "Shopping", "Bills", "Miscellaneous"]);
        

        return () => {};
    }, [data, expenseCategoriesList])

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
        <div className="w-full bg-[#191428] rounded-xl px-5 py-4 shadow-lg">
            <h2 className="text-white text-xl font-semibold mb-1 ">Recent Transactions</h2>
            <div className="divide-y divide-[#28233C] h-[400px] overflow-y-auto">
                {recentTransactions.length === 0 ? (
                     <div className="text-center py-8 flex-1 flex items-center justify-center h-full">
                    <div>
                        <p className="text-slate-400 mb-2">No transactions</p>
                        <p className="text-slate-500 text-sm">Create your first transaction to start tracking</p>
                    </div>
                </div>
                ) : (
                    recentTransactions.slice().map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between py-3 group hover:bg-[#221b36] rounded-lg transition-colors duration-150 px-2"
                        >
                            <div className="flex flex-col">
                                <span className="text-white font-medium text-base">{item.category}</span>
                                <span className="text-slate-400 text-xs">{item.date}</span>
                                {item.description && (
                                    <span className="text-slate-500 text-xs mt-1">{item.description}</span>
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-lg font-semibold ${
                                    expenseCategories.includes(item.category)
                                        ? "text-red-400"
                                        : "text-green-400"
                                }`}>
                                    {expenseCategories.includes(item.category)
                                        ? "-"
                                        : "+"} ₹{item.amount}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        </>
    );
}