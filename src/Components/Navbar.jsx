import { useEffect, useState } from "react"
import { FiHome, FiPieChart, FiPlus, FiUser } from "react-icons/fi"
import { HiOutlineSparkles } from "react-icons/hi2"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"

function Navbar() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.pathname === "/" ? "home" : location.pathname.substring(1));

    useEffect(() => {
        setActiveTab(location.pathname === "/" ? "home" : location.pathname.substring(1));
    }, [location]);

    const navItems = [
        { id: "home", icon: FiHome, label: "Home", path: "/" },
        { id: "stats", icon: FiPieChart, label: "Stats", path: "/stats" },
        { id: "plus", icon: FiPlus, label: "Add", path: "/add" },
        { id: "ai", icon: HiOutlineSparkles, label: "AI", path: "/ai" },
        { id: "profile", icon: FiUser, label: "Profile", path: "/profile" },
    ];

    return (
        <>
            {/* Desktop Side Navigation */}
            <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 flex-col">
                <div className="p-6 mb-4">
                    <h1 className="text-xl font-bold text-white">App Name</h1>
                </div>
                <div className="flex flex-col flex-1 px-3">
                    {navItems.map((item) => (
                        <Link
                            to={item.path}
                            key={item.id}
                            className={`flex items-center py-3 px-4 rounded-lg mb-2 ${
                                activeTab === item.id
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "text-slate-400 hover:bg-slate-700/50"
                            } transition-colors duration-200`}
                        >
                            <item.icon className={`text-xl mr-3 ${activeTab === item.id ? "text-blue-400" : ""}`} />
                            <span className={`${activeTab === item.id ? "font-medium" : ""}`}>{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="activeSideTab"
                                    className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>
                <div className="p-6 mt-auto">
                    <div className="flex items-center text-slate-400">
                        <div className="w-8 h-8 bg-slate-600 rounded-full mr-3"></div>
                        <span className="text-sm">User Name</span>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-800/80 border-t border-slate-700 backdrop-blur-md">
                <div className="flex justify-around">
                    {navItems.map((item) => (
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

            {/* Content padding for desktop */}
            <div className="hidden lg:block w-64"></div>
        </>
    )
}

export default Navbar