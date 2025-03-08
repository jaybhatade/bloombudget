import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getFirestore, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import app from "../Firebase";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const db = getFirestore(app);

    useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            const userData = JSON.parse(loggedInUser);
            navigate(userData.role === "Admin" ? "/admin" : "/", { state: { user: userData } });
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const q = query(collection(db, "users"), where("email", "==", formData.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const user = querySnapshot.docs[0].data();
                
                if (user.password === formData.password) {
                    const userData = {
                        userId: querySnapshot.docs[0].id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                    localStorage.setItem("user", JSON.stringify(userData));
                    navigate(user.role === "Admin" ? "/admin" : "/", { state: { user: userData } });
                } else {
                    setError("Invalid password!");
                }
            } else {
                setError("User not found!");
            }
        } catch (error) {
            setError("Error logging in: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await addDoc(collection(db, "users"), {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'User'
            });
            setFormData({ email: '', name: '', password: '' });
            setIsLogin(true); // Switch to login view after successful signup
        } catch (err) {
            setError('Error adding user: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({ email: '', name: '', password: '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md p-8 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
                <h2 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <div className="text-gray-400 text-center mb-8">
                    {isLogin ? "Sign in to your account" : "Sign up to start your journey!"}
                </div>
                
                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 text-center">
                        {error}
                    </div>
                )}
                
                <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            required
                            placeholder="Enter your email"
                            className="w-full p-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    
                    {!isLogin && (
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                required
                                placeholder="Enter your full name"
                                className="w-full p-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            required
                            placeholder={isLogin ? "Enter your password" : "Create a password"}
                            className="w-full p-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-4 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                {isLogin ? "Signing in..." : "Signing up..."}
                            </div>
                        ) : (
                            isLogin ? "Sign In" : "Sign Up"
                        )}
                    </button>
                </form>
                
                <div className="text-gray-400 text-center mt-4">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                        onClick={toggleAuthMode} 
                        className="text-blue-500 hover:underline ml-2"
                    >
                        {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;