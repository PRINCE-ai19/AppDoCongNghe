import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { layTaiKhoanTheoId, capNhatProfile, type TaiKhoan } from '../../services/repositories/TaiKhoan';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const ProfileView = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [profile, setProfile] = useState<TaiKhoan | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
    
    // Form state
    const [formData, setFormData] = useState({
        hoTen: '',
        email: '',
        soDienThoai: '',
        diaChi: '',
    });

    // Image state
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            const userInfoStr = sessionStorage.getItem('userInfo');
            if (!userInfoStr) {
                navigate('/dangnhap');
                return;
            }

            const user = JSON.parse(userInfoStr);
            setUserInfo(user);

            // Load profile từ API
            const res = await layTaiKhoanTheoId(user.id);
            if (res.success && res.data) {
                setProfile(res.data);
                setFormData({
                    hoTen: res.data.hoTen || '',
                    email: res.data.email || '',
                    soDienThoai: res.data.soDienThoai || '',
                    diaChi: res.data.diaChi || '',
                });
                if (res.data.hinhAnh) {
                    setImagePreview(res.data.hinhAnh);
                }
            } else {
                alert('Không thể tải thông tin tài khoản!');
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin:', error);
            alert('Có lỗi xảy ra khi tải thông tin!');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!userInfo || !profile) return;

        // Validation
        if (!formData.hoTen.trim()) {
            alert('Vui lòng nhập họ tên!');
            return;
        }

        if (!formData.email.trim()) {
            alert('Vui lòng nhập email!');
            return;
        }

        setSaving(true);
        try {
            // Tạo FormData để gửi cả text và file
            const formDataToSend = new FormData();
            formDataToSend.append('HoTen', formData.hoTen.trim());
            formDataToSend.append('Email', formData.email.trim());
            formDataToSend.append('SoDienThoai', formData.soDienThoai || '');
            formDataToSend.append('DiaChi', formData.diaChi || '');
            if (selectedImage) {
                formDataToSend.append('HinhAnh', selectedImage);
            }

            console.log('FormData contents:');
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
            }

            const res = await capNhatProfile(profile.id, formDataToSend);
            console.log('Response from API:', res);
            
            if (res.success && res.data) {
                alert('Cập nhật thông tin thành công!');
                setProfile(res.data);
                setIsEditing(false);
                setSelectedImage(null);
                
                // Cập nhật image preview nếu có ảnh mới
                if (res.data.hinhAnh) {
                    setImagePreview(res.data.hinhAnh);
                }
                
                // Cập nhật sessionStorage
                const updatedUserInfo = {
                    ...userInfo,
                    hoTen: res.data.hoTen,
                    email: res.data.email,
                    hinhAnh: res.data.hinhAnh,
                };
                sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                setUserInfo(updatedUserInfo);
                
                // Dispatch custom event để cập nhật header trong cùng tab
                window.dispatchEvent(new Event('userInfoUpdated'));
            } else {
                console.error('Update failed:', res);
                alert(res.message || 'Không thể cập nhật thông tin!');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin!');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                hoTen: profile.hoTen || '',
                email: profile.email || '',
                soDienThoai: profile.soDienThoai || '',
                diaChi: profile.diaChi || '',
            });
            setImagePreview(profile.hinhAnh || null);
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        setIsEditing(false);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Chưa có thông tin';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy thông tin</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    Quay về trang chủ
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
                >
                    <ArrowBackIcon />
                    <span>Quay lại</span>
                </button>

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <PersonIcon sx={{ fontSize: 50, color: '#3b82f6' }} />
                                    )}
                                </div>
                                {isEditing && (
                                    <>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition shadow-lg"
                                            type="button"
                                        >
                                            <PhotoCameraIcon sx={{ fontSize: 18 }} />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </>
                                )}
                            </div>
                            <div className="flex-1 text-white">
                                <h1 className="text-3xl font-bold mb-2">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="hoTen"
                                            value={formData.hoTen}
                                            onChange={handleInputChange}
                                            className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-full max-w-md"
                                            placeholder="Họ và tên"
                                        />
                                    ) : (
                                        profile.hoTen
                                    )}
                                </h1>
                                <p className="text-blue-100 flex items-center gap-2">
                                    <EmailIcon sx={{ fontSize: 18 }} />
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-full max-w-md text-sm"
                                            placeholder="Email"
                                        />
                                    ) : (
                                        profile.email
                                    )}
                                </p>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition flex items-center gap-2 font-semibold"
                                >
                                    <EditIcon sx={{ fontSize: 20 }} />
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Thông tin cá nhân */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <PersonIcon sx={{ fontSize: 24, color: '#3b82f6' }} />
                                    Thông tin cá nhân
                                </h2>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="soDienThoai"
                                                value={formData.soDienThoai}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Số điện thoại"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <PhoneIcon sx={{ fontSize: 20, color: '#6b7280' }} />
                                                <span>{profile.soDienThoai || 'Chưa có thông tin'}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Địa chỉ
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                name="diaChi"
                                                value={formData.diaChi}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Địa chỉ"
                                            />
                                        ) : (
                                            <div className="flex items-start gap-2 text-gray-700">
                                                <LocationOnIcon sx={{ fontSize: 20, color: '#6b7280', marginTop: '2px' }} />
                                                <span>{profile.diaChi || 'Chưa có thông tin'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin tài khoản */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BadgeIcon sx={{ fontSize: 24, color: '#3b82f6' }} />
                                    Thông tin tài khoản
                                </h2>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mã tài khoản
                                        </label>
                                        <div className="text-gray-700">
                                            #{profile.id}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Loại tài khoản
                                        </label>
                                        <div className="text-gray-700">
                                            {profile.idLoaiTaiKhoanNavigation?.tenLoai || 'Người dùng'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                            <CalendarTodayIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                                            Ngày đăng ký
                                        </label>
                                        <div className="text-gray-700">
                                            {formatDate(profile.ngayTao)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SaveIcon sx={{ fontSize: 20 }} />
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    <CancelIcon sx={{ fontSize: 20 }} />
                                    Hủy
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/donhang')}
                        className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ShoppingBagIcon sx={{ fontSize: 24, color: '#3b82f6' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Đơn hàng của tôi</h3>
                                <p className="text-sm text-gray-600">Xem lịch sử đơn hàng</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/thongbao')}
                        className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <EmailIcon sx={{ fontSize: 24, color: '#10b981' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Thông báo</h3>
                                <p className="text-sm text-gray-600">Xem thông báo của bạn</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;

