import { react, useState, useRef, useEffect, useCallback } from "react";
import { User, Settings, LogOut, Mail, Key, ChevronDown, Target, PiggyBank, Plus, Eye } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./../firebase";
import AddTransaction from "./AddTransaction";
import { MonthChart, FullChart } from "./Charts";
import Tiles from "./Tiles";
import Transactions from './Transactions';
import ShowBudgetGoals from './ShowBudgetGoals';
import ShowSavingsGoals from './ShowSavingsGoals';
import SetBudgetGoals from './SetBudgetGoals';
import SetSavingsGoals from './SetSavingsGoals';
import { RefetchContext } from '../context/RefetchContext';

// Colors : Primary Components bg -> #1a152d

export default function Dashboard({ onLogout, userData }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [verificationSent, setVerificationSent] = useState(false);

    const [wholeData, setWholeData] = useState({});

    const [expensePeriod, setExpensePeriod] = useState([]);
    const [expenseDataAll, setExpenseDataAll] = useState([]);
    const [expenseDataCurrentMonth, setExpenseDataCurrentMonth] = useState({});

    const [incomePeriod, setIncomePeriod] = useState([]);
    const [incomeDataAll, setIncomeDataAll] = useState([]);
    const [incomeDataCurrentMonth, setIncomeDataCurrentMonth] = useState({});

    const [expenseCategories, setExpenseCategories] = useState({});
    const [incomeCategories, setIncomeCategories] = useState({});
    const [savingsCategories, setSavingsCategories] = useState({});

    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [balanceLeft, setBalanceLeft] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);

    const [transactionData, setTransactionData] = useState([]);

    const [budgetData, setBudgetData] = useState([]);
    const [savingsData, SetSavingsData] = useState([]);
    
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await auth.currentUser.getIdToken();
                
                const response = await fetch(`${serverUrl}/wholeData`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${await auth.currentUser.getIdToken()}`
                    }});
                if (response.status === 200) {
                    const data = await response.json();
                    setExpenseCategories(data.category.expense);
                    setIncomeCategories(data.category.income);
                    setSavingsCategories(data.category.savings);

                    setExpenseDataCurrentMonth(data.expenseDataCurrentMonth);
                    setIncomeDataAll(data.incomeDataAll);
                    setIncomePeriod(data.incomePeriod);

                    setTotalExpense(data.totalExpense);
                    setTotalIncome(data.totalIncome);
                    setBalanceLeft(data.balanceLeft);
                    setTotalSavings(data.totalSavings);

                    setTransactionData(data.transactions);

                    setBudgetData(data.budgetData);
                    SetSavingsData(data.savingsData);
                    
                } else if (response.status === 403) {
                    alert("You're not authorized. Please login to your account!");
                } else {
                    alert("Server is not reachable, try again later!");
                }
            } catch (error) {
                alert(error.message);
            }
            
        };
        fetchData();
    }, [])


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAvatarClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        setIsDropdownOpen(false);
        onLogout();
    };

    const handleChangePassword = async() => {
        try {
            await sendPasswordResetEmail(auth, userData?.email);
        } catch (error) {
            alert("Failed to send password reset email. Please try again.");
            return;
        }
        
        setVerificationSent(true);
        setIsDropdownOpen(false);
    };

    const fetchData = useCallback(async () => {
        try {
          const token = await auth.currentUser.getIdToken();
          const response = await fetch(`${serverUrl}/wholeData`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            const cat = data?.category || {};
            setExpenseCategories(cat.expense || []);
            setIncomeCategories(cat.income || []);
            setSavingsCategories(cat.savings || []);
            setExpenseDataCurrentMonth(data?.expenseDataCurrentMonth || {});
            setIncomeDataAll(data?.incomeDataAll || []);
            setIncomePeriod(data?.incomePeriod || []);
            setTotalExpense(Number(data?.totalExpense) || 0);
            setTotalIncome(Number(data?.totalIncome) || 0);
            setBalanceLeft(Number(data?.balanceLeft) || 0);
            setTotalSavings(Number(data?.totalSavings) || 0);
            setTransactionData(data?.transactions || []);
            setBudgetData(
              data?.budgetData
                ? (Array.isArray(data.budgetData) ? data.budgetData : [data.budgetData])
                : []
            );
            SetSavingsData(data?.savingsData || []);
          }
        } catch (_) {}
      }, [serverUrl]);

        return (
        <RefetchContext.Provider value={{ refetch: fetchData }}>
        <div className="min-h-screen p-4 flex flex-col">
            {/* Header-LOGO */}
            <div className="flex flex-row justify-between items-center py-[1vh] px-[1vw] md:px-[2vw] md:py-[0vh]">
                <h1 className="text-white text-3xl md:text-4xl">XpenseX</h1>
                
                {/* Avatar with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <div 
                        className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors duration-200"
                        onClick={handleAvatarClick}
                    >
                        <User className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-[#1a152d] border border-slate-800 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                            
                            <div className="p-4 border-b border-slate-800">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">
                                            {userData?.name || 'User'}
                                        </p>
                                        <div className="flex items-center space-x-1">
                                            <p className="text-slate-400 text-sm truncate">
                                                {userData?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Menu items */}
                            <div className="p-2">
                                <button
                                    onClick={() => {handleChangePassword()}}
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                                >
                                    <Key className="w-4 h-4" />
                                    <span>Change Password</span>
                                </button>
                                
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dashboard */}
            <div className="bg-[#130E22] h-fit flex flex-col md:mx-auto mt-8 rounded-xl shadow-lg p-5 md:px-10 min-h-fit gap-8 md:gap-4">
                {/* First main row */}
                <div className="flex-1 flex flex-col md:flex-row gap-12">
                    <div className="flex flex-col gap-1 h-fit">
                    <h1 className="text-white text-2xl md:text-3xl font-semibold">Dashboard</h1>
                    <AddTransaction expenseCategories={expenseCategories} incomeCategories={incomeCategories} savingsCategories={savingsCategories} />
                    </div>

                    <div className="flex flex-col gap-6 flex-1 md:mt-10">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                        <h1 className="text-white text-xl font-semibold">Expense Breakdown</h1>
                        <MonthChart data={expenseDataCurrentMonth} />
                        </div>
                        <div className="flex-1">
                        <h1 className="text-white text-xl font-semibold">Income Breakdown</h1>
                        <FullChart data={incomeDataAll} period={incomePeriod}/>
                        </div>
                    </div>

                    <div className="w-full">
                        <Tiles totalIncome={totalIncome} totalExpense={totalExpense} balanceLeft={balanceLeft} totalSavings={totalSavings} />
                    </div>
                    </div>
                </div>

                {/* Second main row */}
                <div className="w-full flex flex-col md:flex-row gap-10">
                    <div className="w-full md:w-1/3">
                    <Transactions data={transactionData} expenseCategoriesList={expenseCategories} />
                    </div>

                    <div className="w-full md:w-1/3">
                    <ShowBudgetGoals data={budgetData} budgetCategories={expenseCategories} />
                    </div>

                    <div className="w-full md:w-1/3">
                    <ShowSavingsGoals data={savingsData} savingsCategories={savingsCategories} />
                    </div>
                </div>

            </div>




            {/* Verification link send successfully screen */}
            {verificationSent && (
                <div className="absolute w-full h-full backdrop-blur-sm flex items-center justify-center bg-black/40">
                <div className="bg-slate-800/95 border border-slate-700 rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
                    {/* Animated Green Tick */}
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <svg 
                        className="w-10 h-10 text-white animate-bounce" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7"
                        />
                    </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Email Sent Successfully!</h2>
                    <p className="text-slate-400 mb-6">
                    
                    We've sent a password reset link to your email address.
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                    Please check your inbox and click the link to change your password, and login using your new credentials.
                    </p>
                    <button
                    onClick={() => setVerificationSent(false)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-medium duration-300 transform hover:scale-105"
                    >
                    Got it
                    </button>
                </div>
                </div>
            )}
        </div>
        </RefetchContext.Provider>
      );
}