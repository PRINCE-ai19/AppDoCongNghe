import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { layTatCaSanPham, laySanPhamYeuThich, toggleYeuThich,  type SanPham } from '../../services/repositories/SanPham';
import { LayTatCaDanhMuc, type DanhMuc } from '../../services/repositories/DanhMuc';
import { layTatCaTinTuc, type TinTuc } from '../../services/repositories/TinTuc';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import LaptopIcon from '@mui/icons-material/Laptop';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import StarIcon from '@mui/icons-material/Star';

const quickLinks = [
    { label: "Phiếu giảm giá", icon: <LoyaltyIcon sx={{ fontSize: 30 }} />, path: "/voucher", gradient: "from-pink-500 to-rose-500" },
    { label: "Sản phẩm", icon: <LaptopIcon sx={{ fontSize: 30 }} />, path: "/products", gradient: "from-blue-500 to-indigo-500" },
    { label: "Liên hệ", icon: <ContactMailIcon sx={{ fontSize: 30 }} />, path: "/lienhe", gradient: "from-purple-500 to-violet-500" },
];

const HomeView = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<DanhMuc[]>([]);
    const [news, setNews] = useState<TinTuc[]>([]);
    const [loading, setLoading] = useState(true);
    const [featuredProducts, setFeaturedProducts] = useState<SanPham[]>([]);
    const [favoriteProducts, setFavoriteProducts] = useState<SanPham[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

    useEffect(() => {
        loadData();
        loadFavoriteProducts();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load products
            const productRes = await layTatCaSanPham();
            if (productRes.success && productRes.data) {
                const productList = productRes.data.filter(p => p.hienThi !== false);
                // Lấy 8 sản phẩm đầu tiên làm featured
                setFeaturedProducts(productList.slice(0, 8));
            }

            // Load categories
            const categoryRes = await LayTatCaDanhMuc();
            if (categoryRes.success && categoryRes.data) {
                setCategories(categoryRes.data);
            }

            // Load news
            const newsRes = await layTatCaTinTuc();
            if (newsRes.success && newsRes.data) {
                // Chỉ lấy tin tức có hienThi = true
                const visibleNews = newsRes.data.filter(n => n.hienThi !== false);
                setNews(visibleNews.slice(0, 3)); // Lấy 3 tin mới nhất
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryIcon = (categoryName: string) => {
        const name = categoryName.toLowerCase();
        if (name.includes('điện thoại') || name.includes('phone') || name.includes('smartphone')) {
            return <PhoneAndroidIcon sx={{ fontSize: 48, color: '#6366f1' }} />;
        } else if (name.includes('laptop') || name.includes('máy tính')) {
            return <LaptopIcon sx={{ fontSize: 48, color: '#6366f1' }} />;
        } else if (name.includes('phụ kiện') || name.includes('accessories') || name.includes('tai nghe')) {
            return <HeadphonesIcon sx={{ fontSize: 48, color: '#6366f1' }} />;
        }
        // Default icon
        return <PhoneAndroidIcon sx={{ fontSize: 48, color: '#6366f1' }} />;
    };

    const loadFavoriteProducts = async () => {
        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) {
            setFavoriteProducts([]);
            return;
        }

        try {
            const userInfo = JSON.parse(userInfoStr);
            const favoriteIdsList = await laySanPhamYeuThich(userInfo.id);
            setFavoriteIds(favoriteIdsList);

            // Lấy thông tin sản phẩm yêu thích
            const productRes = await layTatCaSanPham();
            if (productRes.success && productRes.data) {
                const favoriteList = productRes.data.filter(
                    p => favoriteIdsList.includes(p.id) && p.hienThi !== false
                );
                setFavoriteProducts(favoriteList);
            }
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm yêu thích:', error);
            setFavoriteProducts([]);
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        e.stopPropagation();

        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích!');
            navigate('/dangnhap');
            return;
        }

        try {
            const userInfo = JSON.parse(userInfoStr);
            const result = await toggleYeuThich(userInfo.id, productId);
            
            if (result.success) {
                // Cập nhật favoriteIds ngay lập tức
                if (result.isFavorite) {
                    setFavoriteIds(prev => [...prev, productId]);
                    alert('Đã thêm vào sản phẩm yêu thích!');
                } else {
                    setFavoriteIds(prev => prev.filter(id => id !== productId));
                    alert('Đã xóa khỏi sản phẩm yêu thích!');
                }
                // Reload danh sách yêu thích
                await loadFavoriteProducts();
            } else {
                alert(result.message || 'Không thể cập nhật yêu thích.');
            }
        } catch (error) {
            console.error('Lỗi khi toggle yêu thích:', error);
            alert('Có lỗi xảy ra khi cập nhật yêu thích!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <StarIcon sx={{ fontSize: 32, color: '#3b82f6' }} className="animate-pulse" />
                        </div>
                    </div>
                    <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-indigo-50">
            {/* Hero Section - Modern Design */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="relative container mx-auto px-4 py-24 md:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                            <StarIcon sx={{ fontSize: 20 }} />
                            <span className="text-sm font-medium">Cửa hàng công nghệ hàng đầu Việt Nam</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
                            <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                                TechStore
                            </span>
                            <br />
                            <span className="text-white">Khám phá tương lai</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
                            Trải nghiệm công nghệ đỉnh cao với những sản phẩm chất lượng, giá cả hợp lý
                        </p>
                    </div>
                </div>

                {/* Wave Separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249 250 251)" />
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-white -mt-1">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out border border-blue-100">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md hover:rotate-12 transition-transform duration-300">
                                <CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Chất lượng đảm bảo</h3>
                                <p className="text-gray-600 text-sm">100% hàng chính hãng</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out border border-green-100">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md hover:rotate-12 transition-transform duration-300">
                                <LocalShippingIcon sx={{ fontSize: 32, color: 'white' }} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Giao hàng nhanh</h3>
                                <p className="text-gray-600 text-sm">Miễn phí vận chuyển</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out border border-purple-100">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md hover:rotate-12 transition-transform duration-300">
                                <SupportAgentIcon sx={{ fontSize: 32, color: 'white' }} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Hỗ trợ 24/7</h3>
                                <p className="text-gray-600 text-sm">Luôn sẵn sàng phục vụ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Links - Modern Cards */}
            <section className="py-12 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
                        Dịch vụ nổi bật
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {quickLinks.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-100"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                <div className="relative z-10">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out shadow-lg`}>
                                        <div className="text-white">
                                            {item.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                        {item.label}
                                    </h3>
                                    <p className="text-gray-600 text-sm">Khám phá ngay</p>
                                    <ArrowForwardIcon className="mt-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300 ease-out" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section - Modern Grid */}
            {categories.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Danh mục sản phẩm</h2>
                            <p className="text-gray-600 text-lg">Khám phá đa dạng sản phẩm công nghệ</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/category/${category.id}`}
                                    className="group relative bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out border border-gray-100 hover:border-blue-300"
                                >
                                    <div className="flex justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out">
                                        {getCategoryIcon(category.tenDanhMuc)}
                                    </div>
                                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                                        {category.tenDanhMuc}
                                    </h3>
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300"></div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Products Section - Modern Cards */}
            {featuredProducts.length > 0 && (
                <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                            <div>
                                <h2 className="text-4xl font-bold mb-2 text-gray-800">Sản phẩm nổi bật</h2>
                                <p className="text-gray-600">Những sản phẩm được yêu thích nhất</p>
                            </div>
                            <Link
                                to="/products"
                                className="mt-4 md:mt-0 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group transition-all duration-300 ease-out"
                            >
                                Xem tất cả
                                <ArrowForwardIcon className="group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-100 hover:border-blue-300"
                                >
                                    <Link to={`/product/${product.id}`}>
                                        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                            {product.hinhAnhDaiDien ? (
                                                <img
                                                    src={product.hinhAnhDaiDien}
                                                    alt={product.tenSanPham}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ShoppingCartIcon sx={{ fontSize: 60 }} />
                                                </div>
                                            )}
                                            {product.giaGiam && (
                                                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                    <LocalOfferIcon sx={{ fontSize: 14 }} />
                                                    -{Math.round((1 - product.giaGiam / product.gia) * 100)}%
                                                </div>
                                            )}
                                            <button 
                                                onClick={(e) => handleToggleFavorite(e, product.id)}
                                                className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-md hover:scale-110 z-10"
                                            >
                                                {favoriteIds.includes(product.id) ? (
                                                    <FavoriteIcon className="text-red-500" sx={{ fontSize: 20 }} />
                                                ) : (
                                                    <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                                                )}
                                            </button>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 ease-out text-gray-800">
                                                {product.tenSanPham}
                                            </h3>
                                            {product.thuongHieu && (
                                                <p className="text-sm text-gray-500 mb-3">
                                                    {product.thuongHieu}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    {product.giaGiam ? (
                                                        <div>
                                                            <span className="text-red-600 font-bold text-xl">
                                                                {formatPrice(product.giaGiam)}
                                                            </span>
                                                            <span className="text-gray-400 line-through ml-2 text-sm">
                                                                {formatPrice(product.gia)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-blue-600 font-bold text-xl">
                                                            {formatPrice(product.gia)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Favorite Products Section */}
            {favoriteProducts.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-3 mb-12">
                            <FavoriteIcon className="text-red-500" sx={{ fontSize: 32 }} />
                            <h2 className="text-4xl font-bold text-gray-800">Sản phẩm yêu thích của bạn</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {favoriteProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out border-2 border-red-100 hover:border-red-300"
                                >
                                    <Link to={`/product/${product.id}`}>
                                        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                            {product.hinhAnhDaiDien ? (
                                                <img
                                                    src={product.hinhAnhDaiDien}
                                                    alt={product.tenSanPham}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ShoppingCartIcon sx={{ fontSize: 60 }} />
                                                </div>
                                            )}
                                            {product.giaGiam && (
                                                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                    <LocalOfferIcon sx={{ fontSize: 14 }} />
                                                    -{Math.round((1 - product.giaGiam / product.gia) * 100)}%
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                                                <FavoriteIcon sx={{ fontSize: 18 }} />
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 ease-out text-gray-800">
                                                {product.tenSanPham}
                                            </h3>
                                            {product.thuongHieu && (
                                                <p className="text-sm text-gray-500 mb-3">
                                                    {product.thuongHieu}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    {product.giaGiam ? (
                                                        <div>
                                                            <span className="text-red-600 font-bold text-xl">
                                                                {formatPrice(product.giaGiam)}
                                                            </span>
                                                            <span className="text-gray-400 line-through ml-2 text-sm">
                                                                {formatPrice(product.gia)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-blue-600 font-bold text-xl">
                                                            {formatPrice(product.gia)}
                                                        </span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={(e) => handleToggleFavorite(e, product.id)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:scale-110 transition-all duration-300 ease-out"
                                                >
                                                    <FavoriteIcon sx={{ fontSize: 24 }} />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* News Section - Modern Cards */}
            {news.length > 0 && (
                <section className="py-16 bg-gradient-to-b from-white to-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                            <div>
                                <h2 className="text-4xl font-bold mb-2 text-gray-800">Tin tức công nghệ</h2>
                                <p className="text-gray-600">Cập nhật những xu hướng mới nhất</p>
                            </div>
                            <Link
                                to="/news"
                                className="mt-4 md:mt-0 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group transition-all duration-300 ease-out"
                            >
                                Xem tất cả
                                <ArrowForwardIcon className="group-hover:translate-x-1 transition-transform duration-300 ease-out" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {news.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/news/${item.id}`}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-100 hover:border-blue-200"
                                >
                                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.tieuDe}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                                                📰
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 ease-out text-gray-800">
                                            {item.tieuDe}
                                        </h3>
                                        {item.moTa && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {item.moTa}
                                            </p>
                                        )}
                                        {item.ngayTao && (
                                            <p className="text-xs text-gray-400">
                                                {formatDate(item.ngayTao)}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Call to Action - Modern Design */}
            <section className="relative py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
                <div className="relative container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                        Bạn đang tìm kiếm sản phẩm cụ thể?
                    </h2>
                    <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
                        Khám phá hàng ngàn sản phẩm công nghệ với giá tốt nhất và chất lượng đảm bảo
                    </p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-out"
                    >
                        Xem tất cả sản phẩm
                        <ArrowForwardIcon />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomeView;
