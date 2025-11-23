import { useState, useEffect } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
    taoDanhGia, 
    suaDanhGia, 
    xoaDanhGia,
    layDanhGiaCuaUser,
    type DanhGiaRequest,
    type DanhGia
} from '../services/repositories/DanhGia';

interface DanhGiaFormProps {
    sanPhamId: number;
    taiKhoanId: number;
    onSuccess?: () => void;
}

const DanhGiaForm = ({ sanPhamId, taiKhoanId, onSuccess }: DanhGiaFormProps) => {
    const [userDanhGia, setUserDanhGia] = useState<DanhGia | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [soSao, setSoSao] = useState(5);
    const [noiDung, setNoiDung] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadUserDanhGia();
    }, [sanPhamId, taiKhoanId]);

    const loadUserDanhGia = async () => {
        setLoading(true);
        try {
            const res = await layDanhGiaCuaUser(taiKhoanId, sanPhamId);
            if (res.success && res.data) {
                setUserDanhGia(res.data);
                setSoSao(res.data.soSao || 5);
                setNoiDung(res.data.noiDung || '');
            } else {
                setUserDanhGia(null);
            }
        } catch (error) {
            console.error('Lỗi khi tải đánh giá của user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStarClick = (rating: number) => {
        setSoSao(rating);
    };

    const handleSubmit = async () => {
        if (soSao < 1 || soSao > 5) {
            alert('Vui lòng chọn số sao từ 1 đến 5!');
            return;
        }

        setSubmitting(true);
        try {
            const request: DanhGiaRequest = {
                sanPhamId,
                soSao,
                noiDung: noiDung.trim() || undefined,
            };

            let res;
            if (userDanhGia && isEditing) {
                // Sửa đánh giá
                res = await suaDanhGia(userDanhGia.id, request, taiKhoanId);
            } else {
                // Tạo đánh giá mới
                res = await taoDanhGia(request, taiKhoanId);
            }

            if (res.success) {
                alert(res.message || 'Đánh giá thành công!');
                setShowForm(false);
                setIsEditing(false);
                await loadUserDanhGia();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                alert(res.message || 'Không thể lưu đánh giá!');
            }
        } catch (error) {
            console.error('Lỗi khi lưu đánh giá:', error);
            alert('Có lỗi xảy ra khi lưu đánh giá!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!userDanhGia) return;

        if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            return;
        }

        try {
            const res = await xoaDanhGia(userDanhGia.id, taiKhoanId);
            if (res.success) {
                alert('Xóa đánh giá thành công!');
                setUserDanhGia(null);
                setNoiDung('');
                setSoSao(5);
                setShowForm(false);
                setIsEditing(false);
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                alert(res.message || 'Không thể xóa đánh giá!');
            }
        } catch (error) {
            console.error('Lỗi khi xóa đánh giá:', error);
            alert('Có lỗi xảy ra khi xóa đánh giá!');
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setShowForm(true);
    };

    const renderStars = (rating: number, interactive: boolean = false) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && handleStarClick(star)}
                        disabled={!interactive}
                        className={interactive ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'}
                    >
                        {star <= rating ? (
                            <StarIcon sx={{ color: '#fbbf24', fontSize: 24 }} />
                        ) : (
                            <StarBorderIcon sx={{ color: '#d1d5db', fontSize: 24 }} />
                        )}
                    </button>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="text-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="mt-3">
            {!userDanhGia && !showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Đánh giá sản phẩm
                </button>
            ) : (
                <div className="space-y-3">
                    {userDanhGia && !isEditing && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {renderStars(userDanhGia.soSao || 0)}
                                    </div>
                                    {userDanhGia.noiDung && (
                                        <p className="text-sm text-gray-700">{userDanhGia.noiDung}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleEdit}
                                        className="p-1 text-blue-600 hover:bg-gray-200 rounded transition"
                                        title="Sửa đánh giá"
                                    >
                                        <EditIcon sx={{ fontSize: 18 }} />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-1 text-red-600 hover:bg-gray-200 rounded transition"
                                        title="Xóa đánh giá"
                                    >
                                        <DeleteIcon sx={{ fontSize: 18 }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {(showForm || isEditing) && (
                        <div className="border border-gray-300 rounded-lg p-3 bg-white">
                            <h4 className="font-semibold mb-3 text-sm">
                                {isEditing ? 'Sửa đánh giá' : 'Viết đánh giá'}
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium mb-2">Số sao *</label>
                                    {renderStars(soSao, true)}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-2">Nội dung đánh giá</label>
                                    <textarea
                                        value={noiDung}
                                        onChange={(e) => setNoiDung(e.target.value)}
                                        placeholder="Chia sẻ trải nghiệm của bạn..."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        maxLength={255}
                                    />
                                    <div className="text-xs text-gray-500 mt-1 text-right">
                                        {noiDung.length}/255 ký tự
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        <SendIcon sx={{ fontSize: 16 }} />
                                        {submitting ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Gửi đánh giá'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setIsEditing(false);
                                            if (!userDanhGia) {
                                                setNoiDung('');
                                                setSoSao(5);
                                            } else {
                                                setNoiDung(userDanhGia.noiDung || '');
                                                setSoSao(userDanhGia.soSao || 5);
                                            }
                                        }}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DanhGiaForm;

