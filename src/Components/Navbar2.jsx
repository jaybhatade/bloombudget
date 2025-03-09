import { useEffect, useState, useRef } from "react"
import { FiHome, FiPieChart, FiPlus, FiUser } from "react-icons/fi"
import { HiOutlineSparkles } from "react-icons/hi2"
import { Link, useLocation } from "react-router-dom"

function Navbar2() {
    const location = useLocation()
    const [activeTab, setActiveTab] = useState(location.pathname === "/" ? "home" : location.pathname.substring(1))
    const navRef = useRef(null)

    useEffect(() => {
        setActiveTab(location.pathname === "/" ? "home" : location.pathname.substring(1))
    }, [location])

    const scrollToCenter = (element) => {
        if (element && navRef.current) {
            const navWidth = navRef.current.offsetWidth
            const tabOffset = element.offsetLeft
            const tabWidth = element.offsetWidth
            const scrollPosition = tabOffset - (navWidth / 2) + (tabWidth / 2)
            navRef.current.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            })
        }
    }

    const handleTabClick = (id) => {
        setActiveTab(id)
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
            const activeTabElement = document.querySelector(`[data-tab="${id}"]`)
            scrollToCenter(activeTabElement)
        })
    }

    useEffect(() => {
        // Scroll active tab to center on initial render
        const activeTabElement = document.querySelector(`[data-tab="${activeTab}"]`)
        scrollToCenter(activeTabElement)
    }, []) // Empty dependency array to run only on mount

    const navItems = [
        { id: "home", icon: FiHome, label: "Home", path: "/" },
        { id: "stats", icon: FiPieChart, label: "Stats", path: "/stats" },
        { id: "plus", icon: FiPlus, label: "Add", path: "/add" },
        { id: "ai", icon: HiOutlineSparkles, label: "AI", path: "/ai" },
        { id: "profile", icon: FiUser, label: "Profile", path: "/profile" },
    ]

    return (
        <div className="bg-slate-950 w-full relative">
            {/* Fade effect on left edge */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
            {/* Fade effect on right edge */}
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
            <nav ref={navRef} className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                <div className="flex justify-centers space-x-4 py-2 pl-[40%] pr-[40%] w-fit">
                    {navItems.map((item) => (
                        <Link
                            to={item.path}
                            key={item.id}
                            data-tab={item.id}
                            onClick={() => handleTabClick(item.id)}
                            className={`flex items-center space-x-2 p-2 rounded-lg whitespace-nowrap ${
                                activeTab === item.id
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "text-slate-400 hover:bg-slate-700/50"
                            } transition-colors duration-200`}
                        >
                            <item.icon className="text-xl" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}

export default Navbar2
