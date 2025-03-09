import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getFirestore, collection, getDocs, query, where, addDoc, doc, getDoc } from "firebase/firestore";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";
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
        const checkAuth = async () => {
            const userID = localStorage.getItem("userID");
            
            if (!userID) {
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', userID));
                if (userDoc.exists()) {
                    navigate("/");
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
            }
        };

        checkAuth();
    }, [navigate, db]);

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
                const userId = querySnapshot.docs[0].id;
                
                if (user.password === formData.password) {
                    const userData = {
                        userId
                    };
                    localStorage.setItem("userID", userId);
                    
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
            setIsLogin(true);
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

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    const inputVariants = {
        focus: { scale: 1.02 },
        blur: { scale: 1 }
    };

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 to-slate-950 text-white flex items-center justify-center px-4">
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700"
            >
                <motion.h2 
                    className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {isLogin ? "Bloom Budget" : "Create Account"}
                </motion.h2>
                <motion.div 
                    className="text-slate-300 text-center mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {isLogin ? "Sign in to your account" : "Sign up to start your journey!"}
                </motion.div>
                
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6 text-center backdrop-blur-sm"
                    >
                        {error}
                    </motion.div>
                )}
                
                <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
                    <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                        <div className="flex items-center space-x-2">
                            <FiMail className="text-slate-400" />
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                Email Address
                            </label>
                        </div>
                        <motion.input
                            variants={inputVariants}
                            whileFocus="focus"
                            whileBlur="blur"
                            id="email"
                            type="email"
                            name="email"
                            required
                            placeholder="Enter your email"
                            className="w-full p-3 bg-slate-700/40 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </motion.div>
                    
                    {!isLogin && (
                        <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                            <div className="flex items-center space-x-2">
                                <FiUser className="text-slate-400" />
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                                    Full Name
                                </label>
                            </div>
                            <motion.input
                                variants={inputVariants}
                                whileFocus="focus"
                                whileBlur="blur"
                                id="name"
                                type="text"
                                name="name"
                                required
                                placeholder="Enter your full name"
                                className="w-full p-3 bg-slate-700/40 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </motion.div>
                    )}
                    
                    <motion.div className="space-y-2" whileHover={{ scale: 1.01 }}>
                        <div className="flex items-center space-x-2">
                            <FiLock className="text-slate-400" />
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                        </div>
                        <motion.input
                            variants={inputVariants}
                            whileFocus="focus"
                            whileBlur="blur"
                            id="password"
                            type="password"
                            name="password"
                            required
                            placeholder={isLogin ? "Enter your password" : "Create a password"}
                            className="w-full p-3 bg-slate-700/40 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </motion.div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 py-4 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                {isLogin ? "Signing in..." : "Signing up..."}
                            </div>
                        ) : (
                            isLogin ? "Sign In" : "Sign Up"
                        )}
                    </motion.button>
                </form>
                
                <motion.div 
                    className="text-slate-300 text-center mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <motion.button 
                        onClick={toggleAuthMode}
                        whileHover={{ scale: 1.05 }}
                        className="text-blue-400 hover:text-blue-300 font-medium ml-2"
                    >
                        {isLogin ? "Sign Up" : "Sign In"}
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AuthPage;