import { Link, useNavigate, useLocation } from 'react-router-dom';
import AnimatedOutlet from '../components/AnimatedOutlet';
import { useState, useEffect } from 'react';
import { xemChiTietGioHang } from '../services/repositories/GioHang';
import { layThongBaoTheoUser } from '../services/repositories/ThongBao';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';


const UserLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [userInfo, setUserInfo] = useState<any>(null);
    const [cartQuantity, setCartQuantity] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        // Load user info from sessionStorage
        const loadUserInfo = () => {
            try {
                const userInfoStr = sessionStorage.getItem("userInfo");
                if (userInfoStr) {
                    setUserInfo(JSON.parse(userInfoStr));
                } else {
                    setUserInfo(null);
                }
            } catch (error) {
                console.error('Lỗi khi đọc userInfo:', error);
                setUserInfo(null);
            }
        };

        loadUserInfo();
        // Listen for storage changes (when user logs in/out in another tab)
        window.addEventListener('storage', loadUserInfo);
        // Listen for custom event when profile is updated in the same tab
        const handleUserInfoUpdate = () => {
            loadUserInfo();
        };
        window.addEventListener('userInfoUpdated', handleUserInfoUpdate);
        
        return () => {
            window.removeEventListener('storage', loadUserInfo);
            window.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
        };
    }, []);

    useEffect(() => {
        // Load cart quantity when user info changes or location changes
        const loadCartQuantity = async () => {
            const userInfoStr = sessionStorage.getItem("userInfo");
            if (!userInfoStr) {
                setCartQuantity(0);
                return;
            }

            try {
                const userInfo = JSON.parse(userInfoStr);
                const res = await xemChiTietGioHang(userInfo.id);
                if (res.success) {
                    setCartQuantity(res.tongSoLuong || 0);
                } else {
                    setCartQuantity(0);
                }
            } catch (error) {
                console.error('Lỗi khi tải số lượng giỏ hàng:', error);
                setCartQuantity(0);
            }
        };

        if (userInfo) {
            loadCartQuantity();
        } else {
            setCartQuantity(0);
        }

        // Listen for cart update events
        const handleCartUpdate = () => {
            if (userInfo) {
                loadCartQuantity();
            }
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [userInfo, location.pathname]);

    useEffect(() => {
        const loadNotifications = async () => {
            if (!userInfo?.id) {
                setNotificationCount(0);
                return;
            }
            try {
                const res = await layThongBaoTheoUser(userInfo.id);
                if (res.success && Array.isArray(res.data)) {
                    const unread = res.data.filter((item) => !item.daXem).length;
                    setNotificationCount(unread);
                } else {
                    setNotificationCount(0);
                }
            } catch (error) {
                console.error('Lỗi khi tải thông báo:', error);
                setNotificationCount(0);
            }
        };

        loadNotifications();
    }, [userInfo]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement search functionality
        console.log('Searching for:', searchTerm);
    };

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userInfo");
        setUserInfo(null);
        navigate('/dangnhap');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="text-2xl font-bold text-blue-600">
                                TechStore
                            </div>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </form>

                        {/* Right Menu */}
                        <div className="flex items-center space-x-4">
                            {userInfo && (
                                <Link
                                    to="/donhang"
                                    className="p-2 text-gray-700 hover:text-blue-600 transition"
                                    title="Đơn hàng của tôi"
                                >
                                    <ShoppingBagIcon />
                                </Link>
                            )}
                      
                            <Link
                                to="/thongbao"
                                className="relative p-2 text-gray-700 hover:text-blue-600 transition"
                                title="Thông báo"
                            >
                                <NotificationsNoneIcon />
                                {notificationCount > 0 && (
                                    <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-4 px-1 flex items-center justify-center">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                )}
                            </Link>
                            <Link
                                to="/cart"
                                className="relative p-2 text-gray-700 hover:text-blue-600 transition"
                            >
                                <ShoppingCartIcon />
                                {cartQuantity > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartQuantity > 99 ? '99+' : cartQuantity}
                                    </span>
                                )}
                            </Link>
                            
                            {userInfo && userInfo.hoTen ? (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition rounded-lg hover:bg-gray-100"
                                    >
                                        {userInfo.hinhAnh ? (
                                            <img 
                                                src={userInfo.hinhAnh} 
                                                alt={userInfo.hoTen}
                                                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                <PersonIcon sx={{ fontSize: 20 }} />
                                            </div>
                                        )}
                                        <span className="hidden sm:inline font-medium">{userInfo.hoTen}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600 transition rounded-lg hover:bg-gray-100"
                                        title="Đăng xuất"
                                    >
                                        <LogoutIcon />
                                        <span className="hidden sm:inline">Đăng xuất</span>
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/dangnhap"
                                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition rounded-lg hover:bg-gray-100"
                                >
                                    <LoginIcon />
                                    <span className="hidden sm:inline">Đăng nhập</span>
                                </Link>
                            )}
                            
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-gray-700"
                            >
                                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="md:hidden pb-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                <AnimatedOutlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white mt-16">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Về chúng tôi</h3>
                            <p className="text-gray-400 text-sm">
                                TechStore - Cửa hàng công nghệ hàng đầu Việt Nam
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link to="/about" className="hover:text-white">Giới thiệu</Link></li>
                                <li><Link to="/contact" className="hover:text-white">Liên hệ</Link></li>
                                <li><Link to="/news" className="hover:text-white">Tin tức</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link to="/faq" className="hover:text-white">Câu hỏi thường gặp</Link></li>
                                <li><Link to="/shipping" className="hover:text-white">Vận chuyển</Link></li>
                                <li><Link to="/returns" className="hover:text-white">Đổi trả</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Theo dõi</h3>
                            <p className="text-gray-400 text-sm mb-2">
                                Đăng ký nhận thông tin khuyến mãi
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                        <p>&copy; 2024 TechStore. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default UserLayout;


