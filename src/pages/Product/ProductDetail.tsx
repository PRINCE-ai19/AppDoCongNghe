import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { layChiTietSanPham, toggleYeuThich, laySanPhamYeuThich, type SanPhamDetail } from '../../services/repositories/SanPham';
import { themVaoGioHang } from '../../services/repositories/GioHang';
import DanhGiaList from '../../components/DanhGiaList';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShareIcon from '@mui/icons-material/Share';

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<SanPhamDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    // Scroll to top when component mounts or id changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

    useEffect(() => {
        const loadProduct = async () => {
            if (!id) return;
            
            setLoading(true);
            try {
                const res = await layChiTietSanPham(parseInt(id));
                if (res.success && res.data) {
                    setProduct(res.data);
                    // Kiểm tra trạng thái yêu thích
                    checkFavoriteStatus(parseInt(id));
                } else {
                    // Nếu không tìm thấy, chuyển về trang chủ
                    navigate('/');
                }
            } catch (error) {
                console.error('Lỗi khi tải chi tiết sản phẩm:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProduct();
        }
    }, [id, navigate]);

    const checkFavoriteStatus = async (productId: number) => {
        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) {
            setIsFavorite(false);
            return;
        }

        try {
            const userInfo = JSON.parse(userInfoStr);
            const favoriteIds = await laySanPhamYeuThich(userInfo.id);
            setIsFavorite(favoriteIds.includes(productId));
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
            setIsFavorite(false);
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

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && product && product.soLuongTon && newQuantity <= product.soLuongTon) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
            navigate('/dangnhap');
            return;
        }

        if (!product || !id) return;

        try {
            const userInfo = JSON.parse(userInfoStr);
            const res = await themVaoGioHang({
                taiKhoanId: userInfo.id,
                sanPhamId: parseInt(id),
                soLuong: quantity
            });

            if (res.success) {
                // Dispatch custom event để cập nhật số lượng giỏ hàng
                window.dispatchEvent(new CustomEvent('cartUpdated'));
                alert(res.message || `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
            } else {
                alert(res.message || 'Không thể thêm sản phẩm vào giỏ hàng!');
            }
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!');
        }
    };

    const handleToggleFavorite = async () => {
        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích!');
            navigate('/dangnhap');
            return;
        }

        if (!product || !id) return;

        try {
            const userInfo = JSON.parse(userInfoStr);
            const result = await toggleYeuThich(userInfo.id, parseInt(id));
            
            if (result.success) {
                setIsFavorite(result.isFavorite);
                if (result.isFavorite) {
                    alert('Đã thêm vào sản phẩm yêu thích!');
                } else {
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

    const handleShare = () => {
        if (navigator.share && product) {
            navigator.share({
                title: product.tenSanPham,
                text: product.moTa || '',
                url: window.location.href,
            }).catch((error) => console.log('Error sharing', error));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Đã sao chép link sản phẩm!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
                <Link to="/" className="text-blue-600 hover:text-blue-800">
                    Quay về trang chủ
                </Link>
            </div>
        );
    }

    const images = product.hinhAnhList && product.hinhAnhList.length > 0 
        ? product.hinhAnhList 
        : [];

    const mainImage = images[selectedImageIndex] || images[0] || '';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
                >
                    <ArrowBackIcon />
                    <span>Quay lại</span>
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                {mainImage ? (
                                    <img
                                        src={mainImage}
                                        alt={product.tenSanPham}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ShoppingCartIcon sx={{ fontSize: 100 }} />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Images */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                                                selectedImageIndex === index
                                                    ? 'border-blue-600'
                                                    : 'border-transparent hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${product.tenSanPham} - Ảnh ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Title & Brand */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {product.tenSanPham}
                                </h1>
                                {product.thuongHieu && (
                                    <p className="text-lg text-gray-600">
                                        Thương hiệu: <span className="font-semibold">{product.thuongHieu}</span>
                                    </p>
                                )}
                                {product.danhMuc && (
                                    <Link
                                        to={`/category/${product.danhMuc}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                                    >
                                        Danh mục: {product.danhMuc}
                                    </Link>
                                )}
                            </div>

                            {/* Price */}
                            <div className="border-t border-b border-gray-200 py-4">
                                <div className="flex items-center gap-4">
                                    {product.giaGiam && product.giaGiam < product.gia ? (
                                        <>
                                            <span className="text-2xl text-gray-500 line-through">
                                                {formatPrice(product.gia)}
                                            </span>
                                            <span className="text-3xl font-bold text-red-600">
                                                {formatPrice(product.giaGiam)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-bold text-blue-600">
                                            {formatPrice(product.gia)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center gap-2">
                                {product.soLuongTon && product.soLuongTon > 0 ? (
                                    <>
                                        <CheckCircleIcon className="text-green-500" />
                                        <span className="text-green-600 font-semibold">
                                            Còn hàng ({product.soLuongTon} sản phẩm)
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-red-600 font-semibold">
                                        Hết hàng
                                    </span>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            {product.soLuongTon && product.soLuongTon > 0 && (
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold">Số lượng:</span>
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                if (val >= 1 && val <= (product.soLuongTon || 1)) {
                                                    setQuantity(val);
                                                }
                                            }}
                                            min="1"
                                            max={product.soLuongTon}
                                            className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= (product.soLuongTon || 0)}
                                            className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.soLuongTon || product.soLuongTon === 0}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCartIcon />
                                    Thêm vào giỏ hàng
                                </button>
                                <button
                                    onClick={handleToggleFavorite}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-red-500 transition flex items-center justify-center gap-2"
                                >
                                    {isFavorite ? (
                                        <>
                                            <FavoriteIcon className="text-red-500" />
                                            <span className="text-red-500">Đã yêu thích</span>
                                        </>
                                    ) : (
                                        <>
                                            <FavoriteBorderIcon />
                                            <span>Yêu thích</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-blue-500 transition flex items-center justify-center gap-2"
                                >
                                    <ShareIcon />
                                    <span>Chia sẻ</span>
                                </button>
                            </div>

                            {/* Product Details */}
                            {product.moTa && (
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-xl font-bold mb-4">Mô tả sản phẩm</h3>
                                    <div className="text-gray-700 whitespace-pre-line">
                                        {product.moTa}
                                    </div>
                                </div>
                            )}

                            {/* Cấu hình sản phẩm */}
                            {product.cauHinhSanPhams && product.cauHinhSanPhams.length > 0 && (
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-xl font-bold mb-4">Cấu hình sản phẩm</h3>
                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                                        <div className="space-y-3">
                                            {product.cauHinhSanPhams.map((cauHinh, index) => (
                                                <div
                                                    key={cauHinh.id}
                                                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 flex items-center gap-4"
                                                >
                                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 flex items-center gap-4">
                                                        <span className="text-sm font-semibold text-gray-600 min-w-[120px]">
                                                            {cauHinh.tenThongSo || 'Thông số'}:
                                                        </span>
                                                        <span className="text-base font-medium text-gray-900 flex-1">
                                                            {cauHinh.giaTri || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Additional Info */}
                            <div className="border-t border-gray-200 pt-6 space-y-2 text-sm text-gray-600">
                                {product.ngayThem && (
                                    <p>
                                        <span className="font-semibold">Ngày thêm:</span> {formatDate(product.ngayThem)}
                                    </p>
                                )}
                                <p>
                                    <span className="font-semibold">Mã sản phẩm:</span> #{product.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Đánh giá sản phẩm - Chỉ hiển thị danh sách */}
                {product && id && (
                    <DanhGiaList sanPhamId={parseInt(id)} />
                )}

                {/* Related Products Section - Có thể thêm sau */}
                <div className="mt-12">
                    {/* TODO: Add related products */}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;

