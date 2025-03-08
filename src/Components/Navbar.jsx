import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FiHome, FiPieChart, FiPlus, FiUser } from "react-icons/fi" // Updated icons
import { HiOutlineSparkles } from "react-icons/hi2";
import { Link, useLocation } from "react-router-dom"

function Navbar() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.pathname === "/" ? "home" : location.pathname.substring(1));

    useEffect(() => {
        setActiveTab(location.pathname === "/" ? "home" : location.pathname.substring(1));
    }, [location]);

    return (
        <div>
            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/80 border-t border-slate-700 backdrop-blur-md">
                <div className="flex justify-around">
                    {[
                        { id: "home", icon: FiHome, label: "Home", path: "/" },
                        { id: "stats", icon: FiPieChart, label: "Stats", path: "/stats" },
                        { id: "plus", icon: FiPlus, label: "Add", path: "/add" },
                        { id: "ai", icon: HiOutlineSparkles, label: "AI", path: "/ai" }, // Fixed route for AI
                        { id: "profile", icon: FiUser, label: "Profile", path: "/profile" },
                    ].map((item) => (
                        <Link
                            to={item.path}
                            key={item.id}
                            className={`flex flex-col items-center justify-center p-3 w-full ${
                                activeTab === item.id 
                                    ? item.id === "plus" 
                                        ? "text-blue-500" 
                                        : "text-blue-400"
                                    : "text-slate-400"
                            } hover:text-blue-300 transition-colors duration-200 ${
                                item.id === "plus" ? "-mt-6" : ""
                            }`}
                        >
                            {item.id === "plus" ? (
                                <div className="bg-blue-500 p-4 rounded-full shadow-lg hover:bg-blue-400 transition-colors duration-200">
                                    <item.icon className="text-2xl text-white" />
                                </div>
                            ) : (
                                <item.icon 
                                    className={`text-xl mb-1 ${
                                        activeTab === item.id 
                                            ? "scale-110 transform" 
                                            : ""
                                    }`} 
                                />
                            )}
                            <span className="text-xs">{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 w-1/5 h-0.5 bg-blue-400"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}

export default Navbar
