import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { layDonHangTheoTaiKhoan, type DonHang } from '../../services/repositories/DonHang';
import DanhGiaForm from '../../components/DanhGiaForm';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const OrderHistoryView = () => {
    const [orders, setOrders] = useState<DonHang[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<DonHang | null>(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) {
            setLoading(false);
            return;
        }

        try {
            const userInfo = JSON.parse(userInfoStr);
            console.log('Loading orders for user ID:', userInfo.id);
            const res = await layDonHangTheoTaiKhoan(userInfo.id);
            console.log('Order response:', res);
            
            if (res.success) {
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    console.log('Orders found:', res.data.length);
                    setOrders(res.data);
                } else {
                    console.log('No orders found or empty array');
                    setOrders([]);
                }
            } else {
                console.error('Failed to load orders:', res.message);
                setOrders([]);
            }
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price?: number) => {
        if (!price) return '0 ₫';
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'đã giao hàng':
            case 'đã hoàn thành':
                return <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />;
            case 'đã hủy':
            case 'hủy':
                return <CancelIcon sx={{ color: '#ef4444', fontSize: 20 }} />;
            case 'đang giao hàng':
            case 'đang vận chuyển':
                return <LocalShippingIcon sx={{ color: '#3b82f6', fontSize: 20 }} />;
            default:
                return <AccessTimeIcon sx={{ color: '#f59e0b', fontSize: 20 }} />;
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'đã giao hàng':
            case 'đã hoàn thành':
                return 'bg-green-100 text-green-800';
            case 'đã hủy':
            case 'hủy':
                return 'bg-red-100 text-red-800';
            case 'đang giao hàng':
            case 'đang vận chuyển':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getPaymentMethod = (method?: boolean) => {
        return method ? 'VNPay' : 'Thanh toán khi nhận hàng';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    const userInfoStr = sessionStorage.getItem('userInfo');
    if (!userInfoStr) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <p className="text-gray-600 text-lg mb-4">Vui lòng đăng nhập để xem đơn hàng</p>
                    <Link
                        to="/dangnhap"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="p-2 hover:bg-gray-200 rounded-full transition"
                        >
                            <ArrowBackIcon />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                <ShoppingBagIcon sx={{ fontSize: 32 }} />
                                Đơn hàng của tôi
                            </h1>
                            <p className="text-gray-600 mt-1">Xem lịch sử đơn hàng đã đặt</p>
                        </div>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <ShoppingBagIcon sx={{ fontSize: 64, color: '#9ca3af', margin: '0 auto 16px' }} />
                        <p className="text-gray-600 text-lg mb-4">Bạn chưa có đơn hàng nào</p>
                        <Link
                            to="/products"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Mua sắm ngay
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                            >
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                                                <p className="font-semibold text-lg">#{order.id}</p>
                                            </div>
                                            <div className="h-12 w-px bg-gray-300"></div>
                                            <div>
                                                <p className="text-sm text-gray-500">Ngày đặt</p>
                                                <p className="font-medium">{formatDate(order.ngayDat)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(order.trangThai)}`}>
                                                {getStatusIcon(order.trangThai)}
                                                <span className="font-medium">{order.trangThai || 'Đang xử lý'}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Tổng tiền</p>
                                                <p className="font-bold text-xl text-blue-600">{formatPrice(order.tongTien)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    {!order.chiTietDonHangs || order.chiTietDonHangs.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">
                                            <p>Đơn hàng này chưa có sản phẩm</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {order.chiTietDonHangs.map((item, index) => (
                                                <div
                                                    key={item.id || index}
                                                    className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                                                >
                                                    <Link
                                                        to={`/product/${item.sanPhamId}`}
                                                        className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden"
                                                    >
                                                        {item.sanPham?.hinhAnhDaiDien ? (
                                                            <img
                                                                src={item.sanPham.hinhAnhDaiDien}
                                                                alt={item.sanPham.tenSanPham}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                📦
                                                            </div>
                                                        )}
                                                    </Link>
                                                    <div className="flex-1">
                                                        <Link
                                                            to={`/product/${item.sanPhamId}`}
                                                            className="font-semibold text-lg hover:text-blue-600 transition"
                                                        >
                                                            {item.sanPham?.tenSanPham || 'Sản phẩm'}
                                                        </Link>
                                                        {item.sanPham?.thuongHieu && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {item.sanPham.thuongHieu}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="text-sm text-gray-600">
                                                                Số lượng: <strong>{item.soLuong}</strong>
                                                            </span>
                                                            <span className="text-sm text-gray-600">
                                                                Đơn giá: <strong>{formatPrice(item.donGia)}</strong>
                                                            </span>
                                                        </div>
                                                        {/* Form đánh giá sản phẩm */}
                                                        {item.sanPhamId && (() => {
                                                            const userInfoStr = sessionStorage.getItem('userInfo');
                                                            if (!userInfoStr) return null;
                                                            
                                                            try {
                                                                const userInfo = JSON.parse(userInfoStr);
                                                                if (!userInfo || !userInfo.id) return null;
                                                                
                                                                return (
                                                                    <div className="mt-3">
                                                                        <DanhGiaForm 
                                                                            sanPhamId={item.sanPhamId} 
                                                                            taiKhoanId={userInfo.id}
                                                                        />
                                                                    </div>
                                                                );
                                                            } catch (e) {
                                                                console.error('Lỗi khi parse userInfo:', e);
                                                                return null;
                                                            }
                                                        })()}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg text-blue-600">
                                                            {formatPrice(item.sanPham?.thanhTien || (item.donGia && item.soLuong ? item.donGia * item.soLuong : 0))}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Order Footer */}
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="space-y-1">
                                                {order.diaChiGiao && (
                                                    <p className="text-sm text-gray-600">
                                                        <strong>Địa chỉ giao hàng:</strong> {order.diaChiGiao}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600">
                                                    <strong>Phương thức thanh toán:</strong> {getPaymentMethod(order.phuongThucThanhToan)}
                                                </p>
                                                {order.phieuGiamGia && (
                                                    <p className="text-sm text-green-600">
                                                        <strong>Mã giảm giá:</strong> {order.phieuGiamGia.maPhieu} {order.phieuGiamGia.moTa && `- ${order.phieuGiamGia.moTa}`}
                                                    </p>
                                                )}
                                                {order.ghiChu && (
                                                    <p className="text-sm text-gray-600">
                                                        <strong>Ghi chú:</strong> {order.ghiChu}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                                                >
                                                    <VisibilityIcon sx={{ fontSize: 18 }} />
                                                    {selectedOrder?.id === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Detail Modal */}
                                    {selectedOrder?.id === order.id && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold mb-3">Chi tiết đơn hàng</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Mã đơn hàng:</p>
                                                    <p className="font-medium">#{order.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Ngày đặt:</p>
                                                    <p className="font-medium">{formatDate(order.ngayDat)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Trạng thái:</p>
                                                    <p className="font-medium">{order.trangThai || 'Đang xử lý'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Tổng tiền:</p>
                                                    <p className="font-medium text-blue-600">{formatPrice(order.tongTien)}</p>
                                                </div>
                                                {order.diaChiGiao && (
                                                    <div className="md:col-span-2">
                                                        <p className="text-gray-600">Địa chỉ giao hàng:</p>
                                                        <p className="font-medium">{order.diaChiGiao}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryView;

