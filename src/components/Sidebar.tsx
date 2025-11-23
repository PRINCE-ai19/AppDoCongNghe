import { useState } from "react";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MenuIcon from '@mui/icons-material/Menu';
import DevicesIcon from '@mui/icons-material/Devices';
import PhoneIcon from '@mui/icons-material/Phone';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import DiscountIcon from '@mui/icons-material/Discount';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    const menu = [
        { name: "Dashboard", icon: <DashboardIcon className="w-5 h-5" />, link: "" },
        { name: "Tài Khoản", icon: <PeopleAltIcon className="w-5 h-5" />, link: "taikhoan" },
        { name: "Danh Mục", icon: <MenuIcon className="w-5 h-5" />, link: "danhmuc" },
        { name: "Sản phẩm", icon: <DevicesIcon className="w-5 h-5" />, link: "sanpham" },
        { name: "Liên hệ", icon: <PhoneIcon className="w-5 h-5" />, link: "lienhe" },
        { name: "Tin tức", icon: <NewspaperIcon className="w-5 h-5" />, link: "tintuc" },
        { name: "Phiếu giảm giá", icon: <DiscountIcon className="w-5 h-5" />, link: "giamgia" },
        { name: "Khuyến mãi", icon: <LocalOfferIcon className="w-5 h-5" />, link: "khuyenmai" },
        { name: "Giỏ hàng", icon: <ShoppingCartIcon className="w-5 h-5" />, link: "giohang" },
        { name: "Đăng nhập", icon: <LoginIcon className="w-5 h-5" />, link: "/dangnhap" },
    ];

    const isActive = (link: string) => {
        if (link === "") {
            return location.pathname === "/admin" || location.pathname === "/admin/";
        }
        return location.pathname === `/admin/${link}`;
    };

    return (
        <>
            {/* MOBILE MENU BUTTON */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-lg"
                onClick={() => setIsMobileOpen(true)}
            >
                <LeaderboardIcon className="w-6 h-6 text-gray-700" />
            </button>

            {/* SIDEBAR - DESKTOP */}
            <div className="hidden md:flex h-full relative">
                <aside
                    className={`
                        h-full bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 text-white
                        shadow-2xl transition-all duration-300 ease-out
                        ${isCollapsed ? 'w-20' : 'w-64'}
                    `}
                >
                    {/* Toggle Button */}
                    <div className="flex items-center justify-between p-4 border-b border-white/20">
                        {!isCollapsed && (
                            <h1 className="text-xl font-bold text-white whitespace-nowrap">
                                Admin Panel
                            </h1>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="ml-auto p-2 rounded-lg hover:bg-white/20 transition-all duration-300 ease-out hover:scale-110"
                            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
                        >
                            {isCollapsed ? (
                                <ChevronRightIcon className="text-white" />
                            ) : (
                                <ChevronLeftIcon className="text-white" />
                            )}
                        </button>
                    </div>

                    {/* Menu */}
                    <nav className="p-4 space-y-2 mt-4">
                        {menu.map((item) => {
                            const active = isActive(item.link);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.link}
                                    className={`
                                        group relative flex items-center gap-3 p-3 rounded-xl
                                        transition-all duration-300 ease-out
                                        ${active 
                                            ? 'bg-white/20 text-white shadow-lg scale-105' 
                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                        }
                                        ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <div className={`flex-shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                                        {item.icon}
                                    </div>
                                    <span 
                                        className={`
                                            font-medium whitespace-nowrap
                                            transition-all duration-300 ease-out
                                            ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}
                                        `}
                                    >
                                        {item.name}
                                    </span>
                                    {active && !isCollapsed && (
                                        <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    {!isCollapsed && (
                        <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                            <p className="text-xs text-white/80 text-center">
                                TechStore Admin
                            </p>
                        </div>
                    )}
                </aside>
            </div>

            {/* SIDEBAR - MOBILE */}
            <div
                className={`
                    md:hidden fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 text-white
                    shadow-2xl z-50 transform transition-transform duration-300 ease-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/20">
                    <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-2 rounded-lg hover:bg-white/20 transition-all duration-300"
                    >
                        <CloseIcon className="text-white" />
                    </button>
                </div>

                {/* Mobile Menu */}
                <nav className="p-4 space-y-2 mt-4">
                    {menu.map((item) => {
                        const active = isActive(item.link);
                        return (
                            <Link
                                key={item.name}
                                to={item.link}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl
                                    transition-all duration-300 ease-out
                                    ${active 
                                        ? 'bg-white/20 text-white shadow-lg' 
                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }
                                `}
                            >
                                <div className={`flex-shrink-0 ${active ? 'scale-110' : ''} transition-transform duration-300`}>
                                    {item.icon}
                                </div>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* MOBILE OVERLAY */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
                ></div>
            )}
        </>
    );
}
