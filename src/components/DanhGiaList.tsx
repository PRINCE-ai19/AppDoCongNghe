import { useState, useEffect } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { 
    layDanhGiaTheoSanPham, 
    type DanhGia
} from '../services/repositories/DanhGia';

interface DanhGiaListProps {
    sanPhamId: number;
}

// Component Avatar với fallback
const Avatar = ({ hinhAnh, hoTen }: { hinhAnh?: string; hoTen?: string }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const getAvatarInitial = (name?: string) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    const getAvatarColor = (name?: string) => {
        if (!name) return 'bg-gray-500';
        const colors = [
            'bg-gradient-to-br from-blue-500 to-blue-600',
            'bg-gradient-to-br from-purple-500 to-purple-600',
            'bg-gradient-to-br from-pink-500 to-pink-600',
            'bg-gradient-to-br from-indigo-500 to-indigo-600',
            'bg-gradient-to-br from-green-500 to-green-600',
            'bg-gradient-to-br from-yellow-500 to-yellow-600',
            'bg-gradient-to-br from-red-500 to-red-600',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (!hinhAnh || imageError) {
        return (
            <div className={`w-14 h-14 ${getAvatarColor(hoTen)} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                {getAvatarInitial(hoTen)}
            </div>
        );
    }

    return (
        <div className="relative w-14 h-14">
            {!imageLoaded && (
                <div className={`absolute inset-0 ${getAvatarColor(hoTen)} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {getAvatarInitial(hoTen)}
                </div>
            )}
            <img 
                src={hinhAnh} 
                alt={hoTen || 'Avatar'}
                className="w-14 h-14 rounded-full object-cover shadow-lg border-2 border-white"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                style={{ display: imageLoaded ? 'block' : 'none' }}
            />
        </div>
    );
};

const DanhGiaList = ({ sanPhamId }: DanhGiaListProps) => {
    const [danhGias, setDanhGias] = useState<DanhGia[]>([]);
    const [diemTrungBinh, setDiemTrungBinh] = useState(0);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDanhGias();
    }, [sanPhamId, page]);

    useEffect(() => {
        const handleReload = () => {
            loadDanhGias();
        };
        window.addEventListener('reloadDanhGia', handleReload);
        return () => {
            window.removeEventListener('reloadDanhGia', handleReload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sanPhamId]);

    const loadDanhGias = async () => {
        setLoading(true);
        try {
            const res = await layDanhGiaTheoSanPham(sanPhamId, page, pageSize);
            if (res.success && res.data) {
                setDanhGias(res.data.items || []);
                setDiemTrungBinh(res.data.diemTrungBinh || 0);
                setTotal(res.data.total || 0);
            }
        } catch (error) {
            console.error('Lỗi khi tải đánh giá:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number, size: number = 20, showEmpty: boolean = false) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        return (
            <div className="flex gap-0.5 items-center">
                {[1, 2, 3, 4, 5].map((star) => {
                    if (star <= fullStars) {
                        return (
                            <StarIcon 
                                key={star}
                                sx={{ 
                                    color: '#fbbf24',
                                    fontSize: size,
                                }} 
                            />
                        );
                    } else if (star === fullStars + 1 && hasHalfStar) {
                        return (
                            <StarIcon 
                                key={star}
                                sx={{ 
                                    color: '#fbbf24',
                                    fontSize: size,
                                    opacity: 0.5
                                }} 
                            />
                        );
                    } else {
                        return showEmpty ? (
                            <StarBorderIcon 
                                key={star}
                                sx={{ 
                                    color: '#d1d5db',
                                    fontSize: size,
                                }} 
                            />
                        ) : (
                            <StarIcon 
                                key={star}
                                sx={{ 
                                    color: '#e5e7eb',
                                    fontSize: size,
                                }} 
                            />
                        );
                    }
                })}
            </div>
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `lúc ${hours}:${minutes} ${day} tháng ${month}, ${year}`;
    };

    return (
        <div className="mt-12">
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header với gradient */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-6">
                    <h2 className="text-3xl font-bold text-white mb-0">Đánh giá sản phẩm</h2>
                </div>

                <div className="p-8">
                    {/* Điểm trung bình - Thiết kế đẹp hơn */}
                    {total > 0 && (
                        <div className="mb-8 pb-8 border-b border-gray-200">
                            <div className="flex flex-col items-center">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-30"></div>
                                    <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-full p-8 shadow-2xl">
                                        <div className="text-6xl font-bold text-white">
                                            {diemTrungBinh.toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    {renderStars(Math.round(diemTrungBinh), 28, true)}
                                </div>
                                <div className="text-lg font-semibold text-gray-700">
                                    {total} {total === 1 ? 'đánh giá' : 'đánh giá'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danh sách đánh giá */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                                <p className="mt-4 text-gray-600 font-medium">Đang tải đánh giá...</p>
                            </div>
                        ) : danhGias.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                                    <StarBorderIcon sx={{ fontSize: 40, color: '#9ca3af' }} />
                                </div>
                                <p className="text-gray-500 text-lg">Chưa có đánh giá nào cho sản phẩm này.</p>
                                <p className="text-gray-400 text-sm mt-2">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                            </div>
                        ) : (
                            <>
                                {danhGias.map((danhGia, index) => (
                                    <div 
                                        key={danhGia.id} 
                                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6"
                                    >
                                        <div className="flex gap-4">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <Avatar 
                                                    hinhAnh={danhGia.taiKhoan?.hinhAnh} 
                                                    hoTen={danhGia.taiKhoan?.hoTen} 
                                                />
                                            </div>

                                            {/* Nội dung đánh giá */}
                                            <div className="flex-1 min-w-0">
                                                {/* Tên và thời gian */}
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                                                            {danhGia.taiKhoan?.hoTen || 'Người dùng'}
                                                        </h3>
                                                        <span className="text-sm text-gray-500">
                                                            {formatDate(danhGia.ngayDanhGia)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Số sao */}
                                                <div className="mb-3">
                                                    {renderStars(danhGia.soSao || 0, 20, true)}
                                                </div>
                                                
                                                {/* Nội dung đánh giá */}
                                                {danhGia.noiDung && (
                                                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                                                        <p className="text-gray-800 leading-relaxed">{danhGia.noiDung}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Phân trang */}
                                {total > pageSize && (
                                    <div className="flex justify-center items-center gap-3 mt-8 pt-8 border-t border-gray-200">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-5 py-2.5 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                                        >
                                            ← Trước
                                        </button>
                                        <div className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-md">
                                            Trang {page} / {Math.ceil(total / pageSize)}
                                        </div>
                                        <button
                                            onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                                            disabled={page >= Math.ceil(total / pageSize)}
                                            className="px-5 py-2.5 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                                        >
                                            Sau →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DanhGiaList;

