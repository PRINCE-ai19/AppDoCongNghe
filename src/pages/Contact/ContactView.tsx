import { useState, useEffect } from 'react';
import { guiLienHe } from '../../services/repositories/LienHe';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';

const ContactView = () => {
    const [formData, setFormData] = useState({
        hoTen: '',
        email: '',
        soDienThoai: '',
        noiDung: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const res = await guiLienHe(formData);
            
            if (res.success) {
                setMessage({ type: 'success', text: res.message || 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.' });
                // Reset form
                setFormData({
                    hoTen: '',
                    email: '',
                    soDienThoai: '',
                    noiDung: ''
                });
            } else {
                setMessage({ type: 'error', text: res.message || 'Gửi liên hệ thất bại! Vui lòng thử lại.' });
            }
        } catch (error) {
            console.error('Lỗi khi gửi liên hệ:', error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra! Vui lòng thử lại sau.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 mb-4 transition"
                    >
                        <ArrowBackIcon />
                        <span>Quay lại</span>
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Liên hệ với chúng tôi</h1>
                    <p className="text-gray-600">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin liên hệ</h2>
                        
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <EmailIcon className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                                    <p className="text-gray-600">luanpham45794@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <PhoneIcon className="text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Điện thoại</h3>
                                    <p className="text-gray-600">Liên hệ qua email để được hỗ trợ</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-purple-100 p-3 rounded-full">
                                    <MessageIcon className="text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Thời gian phản hồi</h3>
                                    <p className="text-gray-600">Chúng tôi sẽ phản hồi trong vòng 24 giờ</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>Lưu ý:</strong> Vui lòng điền đầy đủ thông tin để chúng tôi có thể liên hệ lại với bạn một cách nhanh chóng nhất.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi tin nhắn</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Họ tên */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    <PersonIcon className="inline mr-2" sx={{ fontSize: 18 }} />
                                    Họ tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="hoTen"
                                    value={formData.hoTen}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập họ tên của bạn"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    <EmailIcon className="inline mr-2" sx={{ fontSize: 18 }} />
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập email của bạn"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    <PhoneIcon className="inline mr-2" sx={{ fontSize: 18 }} />
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    name="soDienThoai"
                                    value={formData.soDienThoai}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại (tùy chọn)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            {/* Nội dung */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    <MessageIcon className="inline mr-2" sx={{ fontSize: 18 }} />
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="noiDung"
                                    value={formData.noiDung}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    placeholder="Nhập nội dung tin nhắn của bạn..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                                />
                            </div>

                            {/* Message */}
                            {message && (
                                <div className={`p-4 rounded-lg ${
                                    message.type === 'success' 
                                        ? 'bg-green-50 border border-green-200 text-green-700' 
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    <>
                                        <SendIcon />
                                        <span>Gửi tin nhắn</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactView;

