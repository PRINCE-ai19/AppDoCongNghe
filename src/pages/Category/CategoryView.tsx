import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { layDanhMucTheoId, type DanhMuc } from '../../services/repositories/DanhMuc';
import { laySanPhamTheoDanhMuc, type SanPhamCategory, toggleYeuThich, laySanPhamYeuThich } from '../../services/repositories/SanPham';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';

const CategoryView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [category, setCategory] = useState<DanhMuc | null>(null);
    const [products, setProducts] = useState<SanPhamCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

    // Scroll to top when component mounts or id changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

    useEffect(() => {
        if (id) {
            loadData();
            loadFavoriteIds();
        }
    }, [id]);

    const loadData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            // Load category info
            const categoryRes = await layDanhMucTheoId(parseInt(id));
            if (categoryRes.success && categoryRes.data) {
                setCategory(categoryRes.data);
            }

            // Load products by category
            const productRes = await laySanPhamTheoDanhMuc(parseInt(id));
            if (productRes.success && productRes.data) {
                // Lọc sản phẩm có hienThi !== false
                const visibleProducts = productRes.data.filter(() => {
                    // SanPhamCategory có thể không có hienThi, nên chỉ lọc nếu có
                    return true; // Tạm thời lấy tất cả, có thể cần điều chỉnh theo backend
                });
                setProducts(visibleProducts);
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFavoriteIds = async () => {
        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) {
            setFavoriteIds([]);
            return;
        }

        try {
            const userInfo = JSON.parse(userInfoStr);
            const favoriteIdsList = await laySanPhamYeuThich(userInfo.id);
            setFavoriteIds(favoriteIdsList);
        } catch (error) {
            console.error('Lỗi khi tải danh sách yêu thích:', error);
            setFavoriteIds([]);
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
            } else {
                alert(result.message || 'Không thể cập nhật yêu thích.');
            }
        } catch (error) {
            console.error('Lỗi khi toggle yêu thích:', error);
            alert('Có lỗi xảy ra khi cập nhật yêu thích!');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <CategoryIcon sx={{ fontSize: 32, color: '#3b82f6' }} className="animate-pulse" />
                        </div>
                    </div>
                    <p className="mt-6 text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button - Modern Design */}
                <div className="mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all duration-300 ease-out group"
                    >
                        <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md group-hover:bg-blue-50 transition-all duration-300 ease-out">
                            <HomeIcon className="group-hover:scale-110 transition-transform duration-300 ease-out" />
                        </div>
                        <span className="font-medium">Quay lại trang chủ</span>
                    </Link>
                </div>

                {/* Category Header - Modern Hero Section */}
                {category && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl mb-12 p-8 md:p-12 text-white">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                    <CategoryIcon sx={{ fontSize: 32, color: 'white' }} />
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
                                        {category.tenDanhMuc}
                                    </h1>
                                    <div className="flex items-center gap-4 text-blue-100">
                                        <span className="flex items-center gap-2">
                                            <ShoppingCartIcon sx={{ fontSize: 20 }} />
                                            <span className="font-semibold">{products.length} sản phẩm</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {category.moTa && (
                                <p className="text-lg md:text-xl text-blue-100 max-w-3xl leading-relaxed">
                                    {category.moTa}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Products Grid - Modern Cards */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out border border-gray-100 hover:border-blue-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Link to={`/product/${product.id}`}>
                                    <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                        {product.anhDaiDien ? (
                                            <img
                                                src={product.anhDaiDien}
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
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl p-12 md:p-16 text-center border border-gray-100">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
                            <ShoppingCartIcon sx={{ fontSize: 48, color: '#9CA3AF' }} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-3">
                            Không có sản phẩm nào
                        </h3>
                        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                            Danh mục này hiện chưa có sản phẩm nào. Hãy quay lại sau để xem các sản phẩm mới!
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out"
                        >
                            <HomeIcon />
                            <span>Quay về trang chủ</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryView;
