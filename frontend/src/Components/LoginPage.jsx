import React, { useState } from 'react';
import { DollarSign, Eye, EyeOff, Lock, Mail, User, ArrowRight} from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./../firebase";

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotScreenError, setForgotScreenError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [showForgotScreen, setShowForgotScreen] = useState(false);

  const [verificationSentMessage1, setVerificationSentMessage1] = useState("We've sent a verification link to your email address.");
  const [verificationSentMessage2, setVerificationSentMessage2] = useState("Please check your inbox and click the verification link to complete your registration, and login using your credentials.");

//   const navigate = Navigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      if(isLogin){
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        if (userCredential.user.emailVerified) {;
          onLogin(formData);
        } else {
          setError("Please verify your email before logging in!");
        }
      } else{
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.name });
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
        setIsLogin(true);
      }
      
      //If we reach here, authentication was successful
      setIsLoading(false);
      
    } catch(err){
      console.error("Auth error:", err);
      setIsLoading(false);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters long.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email address or password!");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    }
  };

  const forgotPasswordSendEmail = async() => {
    try {
      await sendPasswordResetEmail(auth, formData?.email);
      setVerificationSentMessage1("We've sent a password reset link to your email address.");
      setVerificationSentMessage2("Please check your inbox and click the link to change your password, and login using your new credentials.");
      setVerificationSent(true);
    } catch (err) {
      setForgotScreenError(err.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">


      <div className="w-full max-w-md relative">
        {/* Logo*/}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-2xl">
            <DollarSign size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">XpenseX</h1>
          <p className="text-slate-400">Manage your finances with ease</p>
        </div>

        {/* Login/Register Form*/}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <div className="flex rounded-lg bg-slate-700 p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                  isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                  !isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="-mt-5 mb-2 w-full flex justify-center">
              {error.length !== 0 && (
                <span className="text-sm italic text-center text-red-600">{error}</span>
              )}
            </div>


            {isLogin && (         
              <div className="flex items-center justify-end">
                <button 
                  type="button"
                  onClick={() => {setShowForgotScreen(true);}}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-medium duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-3">
            <div className="text-center text-slate-400 text-sm mb-4">
              Features you'll get:
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Track expenses and income across multiple categories</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>Visual reports and spending insights</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Set budgets and get alerts</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Mobile-friendly progressive web app</span>
              </div>
            </div>
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
              
              {verificationSentMessage1}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {verificationSentMessage2}
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

      {/* Forgot password screen */}
      {showForgotScreen && (
        <div className="absolute w-full h-full backdrop-blur-sm flex items-center justify-center bg-black/40">
          <div className="bg-slate-800/95 border border-slate-700 rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Forgot Password</h2>
            <p className="text-slate-400 mb-6">
              Enter your email address and we'll send you a password reset link.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await forgotPasswordSendEmail();
                setShowForgotScreen(false);
              }}
              className="space-y-6"
            >
              <div className="relative mb-6">
                <input
                  type="email"
                  name="email"
                  required
                  autoFocus
                  placeholder="Email address"
                  className="w-full py-3 pl-10 pr-4 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={20} />
                </span>
              </div>

              <div className="text-mt-5 mb-2 w-full flex justify-center">
              {forgotScreenError.length !== 0 && (
                <span className="text-sm italic text-center text-red-600">{forgotScreenError}</span>
              )}
            </div>
              
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-medium duration-300 transform hover:scale-105 w-full"
              >
                Send Reset Link
              </button>
              <button
                type="button"
                onClick={() => setShowForgotScreen(false)}
                className="mt-4 text-slate-400 hover:text-white underline"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;