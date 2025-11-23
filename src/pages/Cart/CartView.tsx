import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    xemChiTietGioHang, 
    capNhatSoLuong, 
    xoaSanPhamKhoiGioHang, 
    xoaTatCaGioHang,
    type ChiTietGioHangItem 
} from '../../services/repositories/GioHang';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';

const CartView = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<ChiTietGioHangItem[]>([]);
    const [tongTien, setTongTien] = useState(0);
    const [tongSoLuong, setTongSoLuong] = useState(0);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) {
            alert('Vui lòng đăng nhập để xem giỏ hàng!');
            navigate('/dangnhap');
            return;
        }

        try {
            const userInfo = JSON.parse(userInfoStr);
            const res = await xemChiTietGioHang(userInfo.id);
            
            if (res.success && res.data) {
                setCartItems(res.data);
                setTongTien(res.tongTien || 0);
                setTongSoLuong(res.tongSoLuong || 0);
            } else {
                setCartItems([]);
                setTongTien(0);
                setTongSoLuong(0);
            }
        } catch (error) {
            console.error('Lỗi khi tải giỏ hàng:', error);
            setCartItems([]);
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

    const handleUpdateQuantity = async (chiTietId: number, newQuantity: number) => {
        if (newQuantity <= 0) return;

        setUpdating(chiTietId);
        try {
            const res = await capNhatSoLuong(chiTietId, newQuantity);
            if (res.success) {
                await loadCart(); // Reload giỏ hàng
                // Dispatch event để cập nhật số lượng trên header
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error);
            alert('Có lỗi xảy ra khi cập nhật số lượng!');
        } finally {
            setUpdating(null);
        }
    };

    const handleRemoveItem = async (chiTietId: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            return;
        }

        try {
            const res = await xoaSanPhamKhoiGioHang(chiTietId);
            if (res.success) {
                alert(res.message);
                await loadCart(); // Reload giỏ hàng
                // Dispatch event để cập nhật số lượng trên header
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            alert('Có lỗi xảy ra khi xóa sản phẩm!');
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
            return;
        }

        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) return;

        try {
            const userInfo = JSON.parse(userInfoStr);
            const res = await xoaTatCaGioHang(userInfo.id);
            if (res.success) {
                alert(res.message);
                await loadCart(); // Reload giỏ hàng
                // Dispatch event để cập nhật số lượng trên header
                window.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error('Lỗi khi xóa giỏ hàng:', error);
            alert('Có lỗi xảy ra khi xóa giỏ hàng!');
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                        >
                            <ArrowBackIcon />
                            <span>Quay lại</span>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingCartIcon sx={{ fontSize: 32 }} />
                            Giỏ hàng của tôi
                        </h1>
                    </div>
                    {cartItems.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <DeleteIcon />
                            <span>Xóa tất cả</span>
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <ShoppingCartIcon sx={{ fontSize: 100, color: '#9CA3AF', margin: '0 auto 16px' }} />
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">
                            Giỏ hàng trống
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Bạn chưa có sản phẩm nào trong giỏ hàng.
                        </p>
                        <Link
                            to="/"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.chiTietId}
                                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                                >
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <Link
                                            to={`/product/${item.sanPhamId}`}
                                            className="flex-shrink-0"
                                        >
                                            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                                                {item.anhDaiDien ? (
                                                    <img
                                                        src={item.anhDaiDien}
                                                        alt={item.tenSanPham}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <ShoppingCartIcon sx={{ fontSize: 40 }} />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <Link
                                                to={`/product/${item.sanPhamId}`}
                                                className="block"
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition">
                                                    {item.tenSanPham}
                                                </h3>
                                            </Link>
                                            <div className="mb-4">
                                                {item.giaGiam && item.giaGiam < item.gia ? (
                                                    <>
                                                        <p className="text-sm text-gray-500 line-through">
                                                            {formatPrice(item.gia)}
                                                        </p>
                                                        <p className="text-xl font-bold text-red-600">
                                                            {formatPrice(item.giaGiam)}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-xl font-bold text-blue-600">
                                                        {formatPrice(item.gia)}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-600">Số lượng:</span>
                                                <div className="flex items-center border border-gray-300 rounded-lg">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.chiTietId, item.soLuong - 1)}
                                                        disabled={updating === item.chiTietId || item.soLuong <= 1}
                                                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                    >
                                                        <RemoveIcon sx={{ fontSize: 18 }} />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={item.soLuong}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 1;
                                                            if (val > 0) {
                                                                handleUpdateQuantity(item.chiTietId, val);
                                                            }
                                                        }}
                                                        min="1"
                                                        disabled={updating === item.chiTietId}
                                                        className="w-16 text-center border-x border-gray-300 py-1 focus:outline-none disabled:opacity-50"
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.chiTietId, item.soLuong + 1)}
                                                        disabled={updating === item.chiTietId}
                                                        className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                    >
                                                        <AddIcon sx={{ fontSize: 18 }} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price and Actions */}
                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => handleRemoveItem(item.chiTietId)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Xóa sản phẩm"
                                            >
                                                <DeleteIcon />
                                            </button>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 mb-1">Thành tiền:</p>
                                                <p className="text-xl font-bold text-blue-600">
                                                    {formatPrice(item.thanhTien)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tổng sản phẩm:</span>
                                        <span className="font-semibold">{tongSoLuong} sản phẩm</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tạm tính:</span>
                                        <span className="font-semibold">{formatPrice(tongTien)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-lg font-bold text-gray-900">
                                            <span>Tổng cộng:</span>
                                            <span className="text-blue-600">{formatPrice(tongTien)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <PaymentIcon />
                                    <span>Thanh toán</span>
                                </button>

                                <Link
                                    to="/"
                                    className="block w-full mt-4 text-center text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Tiếp tục mua sắm
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartView;

