import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";
import { checkAuthentication, loginUser, registerUser } from "../Common/ApiFunctions/AuthFunctions/AuthFunctions";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        name: '', 
        password: '',
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const user = await checkAuthentication();
                if (user) {
                    navigate("/");
                }
            } catch (error) {
                console.error('Error in authentication check:', error);
            }
        };

        verifyAuth();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleInputBlur = () => {
        setIsInputFocused(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await loginUser(formData.email, formData.password);
            
            if (result.success) {
                const userData = {
                    userId: result.userId
                };
                navigate(result.role === "Admin" ? "/admin" : "/", { state: { user: userData } });
            } else {
                setError(result.error);
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
            const result = await registerUser(formData.name, formData.email, formData.password);
            
            if (result.success) {
                setFormData({ email: '', name: '', password: '' });
                setIsLogin(true);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error during registration: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({ email: '', name: '', password: '' });
    };

    // Enhanced animations with smoother transitions
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.7, 
                ease: "easeOut",
                staggerChildren: 0.1
            }
        }
    };

    const childVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const inputVariants = {
        focus: { 
            scale: 1.02,
            boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
            transition: { duration: 0.3, ease: "easeOut" }
        },
        blur: { 
            scale: 1,
            boxShadow: "0 0 0 0px rgba(59, 130, 246, 0)",
            transition: { duration: 0.3, ease: "easeOut" }
        },
        hover: {
            scale: 1.01,
            transition: { duration: 0.2, ease: "easeOut" }
        }
    };

    const buttonVariants = {
        rest: { scale: 1 },
        hover: { 
            scale: 1.03,
            boxShadow: "0 8px 20px -5px rgba(59, 130, 246, 0.5)",
            transition: { duration: 0.3, ease: "easeOut" }
        },
        tap: { 
            scale: 0.97,
            transition: { duration: 0.1, ease: "easeOut" }
        }
    };

    const imageVariants = {
        normal: { 
            height: "auto",
            opacity: 1,
            justifyContent: "center",
            transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
        },
        shrink: { 
            height: "120px",
            opacity: 0.8,
            justifyContent: "flex-start",
            transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
        }
    };

    const errorVariants = {
        initial: { opacity: 0, x: -20, height: 0 },
        animate: { 
            opacity: 1, 
            x: 0, 
            height: "auto",
            transition: { 
                duration: 0.4, 
                ease: [0.4, 0.0, 0.2, 1]
            }
        },
        exit: {
            opacity: 0,
            x: -20,
            height: 0,
            transition: { 
                duration: 0.3, 
                ease: [0.4, 0.0, 0.2, 1]
            }
        }
    };

    const formControlVariants = {
        initial: { opacity: 0, y: 20, height: 0 },
        animate: { 
            opacity: 1, 
            y: 0, 
            height: "auto",
            transition: { 
                type: "spring",
                stiffness: 300,
                damping: 25
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            height: 0,
            transition: { 
                duration: 0.3, 
                ease: [0.4, 0.0, 0.2, 1]
            }
        }
    };

    const imageVariants2 = {
        normal: { 
            scale: 1,
            transition: { duration: 0.3, ease: "easeInOut" }
        },
        shrink: { 
            scale: 0.5,
            transition: { duration: 0.3, ease: "easeInOut" }
        }
    };


    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 to-slate-950 text-white flex flex-col items-center justify-center px-4">
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-md p-8"
            >
                <motion.h2 
                    className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
                    variants={childVariants}
                >
                    {isLogin ? "Bloom Budget" : "Create Account"}
                </motion.h2>
                
                <motion.div 
                    className="text-slate-300 text-center"
                    variants={childVariants}
                >
                    {isLogin ? "Login to your account" : "Sign up to track your finances!"}
                </motion.div>
                
                <motion.div 
                    className="w-full overflow-hidden flex justify-center items-center"
                    animate={isInputFocused ? "shrink" : "normal"}
                    variants={imageVariants}
                >
                    <motion.img 
                        src="/16191.png" 
                        animate={isInputFocused ? "shrink" : "normal"}
                        variants={imageVariants2}
                        
                    />
                </motion.div>
                
                {error && (
                    <motion.div 
                        variants={errorVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6 text-center backdrop-blur-sm"
                    >
                        {error}
                    </motion.div>
                )}
                
                <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
                    <motion.div 
                        className="space-y-2" 
                        variants={childVariants}
                    >
                        <div className="flex items-center space-x-2">
                            <FiMail className="text-slate-400" />
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                Email Address
                            </label>
                        </div>
                        <motion.input
                            variants={inputVariants}
                            initial="blur"
                            whileHover="hover"
                            whileFocus="focus"
                            id="email"
                            type="email"
                            name="email"
                            required
                            placeholder="abc@example.com"
                            className="w-full p-3 bg-slate-700/40 border border-slate-600 text-white rounded-lg focus:outline-none transition-all duration-300"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </motion.div>
                    
                    {!isLogin && (
                        <motion.div 
                            className="space-y-2" 
                            variants={formControlVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <div className="flex items-center space-x-2">
                                <FiUser className="text-slate-400" />
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                                    Full Name
                                </label>
                            </div>
                            <motion.input
                                variants={inputVariants}
                                initial="blur"
                                whileHover="hover"
                                whileFocus="focus"
                                id="name"
                                type="text"
                                name="name"
                                required
                                placeholder="Your name "
                                className="w-full p-3 bg-slate-700/40 border border-slate-600 text-white rounded-lg focus:outline-none transition-all duration-300"
                                value={formData.name}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                            />
                        </motion.div>
                    )}
                    
                    <motion.div 
                        className="space-y-2" 
                        variants={childVariants}
                    >
                        <div className="flex items-center space-x-2">
                            <FiLock className="text-slate-400" />
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                        </div>
                        <motion.input
                            variants={inputVariants}
                            initial="blur"
                            whileHover="hover"
                            whileFocus="focus"
                            id="password"
                            type="password"
                            name="password"
                            required
                            placeholder={isLogin ? "Your password" : "Create a password"}
                            className="w-full p-3 bg-slate-700/40 border border-slate-600 text-white rounded-lg focus:outline-none transition-all duration-300"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </motion.div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        variants={buttonVariants}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 py-4 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <motion.div 
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                ></motion.div>
                                {isLogin ? "Signing in..." : "Signing up..."}
                            </div>
                        ) : (
                            isLogin ? "Login" : "Sign Up"
                        )}
                    </motion.button>
                </form>
                
                <motion.div 
                    className="text-slate-300 text-center mt-6"
                    variants={childVariants}
                >
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <motion.button 
                        onClick={toggleAuthMode}
                        whileHover={{ scale: 1.05, color: "#93c5fd" }}
                        transition={{ duration: 0.2 }}
                        className="text-blue-400 font-medium ml-2"
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AuthPage;