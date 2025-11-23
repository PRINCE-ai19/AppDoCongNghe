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

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                        {star <= rating ? (
                            <StarIcon sx={{ color: '#fbbf24', fontSize: 20 }} />
                        ) : (
                            <StarBorderIcon sx={{ color: '#d1d5db', fontSize: 20 }} />
                        )}
                    </span>
                ))}
            </div>
        );
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

    return (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>

            {/* Điểm trung bình */}
            {total > 0 && (
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">{diemTrungBinh.toFixed(1)}</div>
                        <div className="flex justify-center mt-2">
                            {renderStars(Math.round(diemTrungBinh))}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{total} đánh giá</div>
                    </div>
                </div>
            )}

            {/* Danh sách đánh giá */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Đang tải đánh giá...</p>
                    </div>
                ) : danhGias.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                    </div>
                ) : (
                    <>
                        {danhGias.map((danhGia) => (
                            <div key={danhGia.id} className="border-b border-gray-200 pb-4 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold">
                                                {danhGia.taiKhoan?.hoTen || 'Người dùng'}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {formatDate(danhGia.ngayDanhGia)}
                                            </span>
                                        </div>
                                        <div className="mb-2">
                                            {renderStars(danhGia.soSao || 0)}
                                        </div>
                                        {danhGia.noiDung && (
                                            <p className="text-gray-700">{danhGia.noiDung}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Phân trang */}
                        {total > pageSize && (
                            <div className="flex justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trước
                                </button>
                                <span className="px-4 py-2">
                                    Trang {page} / {Math.ceil(total / pageSize)}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                                    disabled={page >= Math.ceil(total / pageSize)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DanhGiaList;

