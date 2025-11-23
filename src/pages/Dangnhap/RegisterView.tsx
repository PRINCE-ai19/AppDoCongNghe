import React, { useState } from "react";
import { DangKy } from "../../services/repositories/DangKy";
import { Link, useNavigate } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ErrorIcon from '@mui/icons-material/Error';


export default function RegisterView() {
    const [hoTen, setHoTen] = useState("");
    const [soDienThoai, setSoDienThoai] = useState("");
    const [email, setEmail] = useState("");
    const [matKhau, setMatKhau] = useState("");
    const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setErrors([]);
        setFieldErrors({});
        setLoading(true);

        // Validate mật khẩu trùng khớp ở frontend
        if (matKhau !== xacNhanMatKhau) {
            setMessage("❌ Mật khẩu và xác nhận mật khẩu không trùng khớp!");
            setLoading(false);
            return;
        }

        try {
            const res = await DangKy({ hoTen, soDienThoai, email, matKhau, xacNhanMatKhau });
            
            if (res.success) {
                alert(`🎉 Đăng ký thành công! Mời bạn đăng nhập`);
                navigate("/dangnhap");
            } else {
                // Xử lý các loại lỗi từ backend
                let errorMessages: string[] = [];
                
                // Lỗi theo field (validation errors)
                if (res.errors) {
                    setFieldErrors(res.errors);
                    // Chuyển đổi errors object thành mảng messages
                    Object.keys(res.errors).forEach(field => {
                        if (res.errors && res.errors[field]) {
                            errorMessages.push(...res.errors[field]);
                        }
                    });
                }
                
                // Lỗi dạng mảng messages
                if (res.messages && res.messages.length > 0) {
                    errorMessages.push(...res.messages);
                }
                
                // Message tổng quát
                if (res.message) {
                    errorMessages.push(res.message);
                }
                
                // Hiển thị lỗi
                if (errorMessages.length > 0) {
                    setErrors(errorMessages);
                    setMessage(errorMessages.join(" | "));
                } else {
                    setMessage("⚠️ Đăng ký thất bại! Vui lòng thử lại.");
                }
                
                console.log("📋 Chi tiết lỗi:", {
                    message: res.message,
                    errors: res.errors,
                    messages: res.messages,
                    fieldErrors: res.errors
                });
            }
        } catch (error) {
            console.error("❌ Lỗi không mong đợi:", error);
            setMessage("❌ Có lỗi xảy ra! Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Card Container */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header với Gradient */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 sm:px-8 py-10 text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <PersonAddIcon className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                            Đăng Ký
                        </h1>
                        <p className="text-white/90 text-sm sm:text-base">
                            Hãy tham gia cùng chúng tôi và bắt đầu hành trình của bạn
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="px-6 sm:px-8 py-8">
                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Họ Tên */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                                    Họ và tên
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <PersonIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Nhập họ và tên"
                                        value={hoTen}
                                        onChange={(e) => {
                                            setHoTen(e.target.value);
                                            // Xóa lỗi của field khi user bắt đầu nhập
                                            if (fieldErrors.hoTen) {
                                                const newFieldErrors = { ...fieldErrors };
                                                delete newFieldErrors.hoTen;
                                                setFieldErrors(newFieldErrors);
                                            }
                                        }}
                                        required
                                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                                            fieldErrors.hoTen ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                    />
                                </div>
                                {fieldErrors.hoTen && (
                                    <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <ErrorIcon sx={{ fontSize: 16 }} />
                                        {fieldErrors.hoTen.map((err, idx) => (
                                            <span key={idx}>{err}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                                    Số điện thoại
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Nhập số điện thoại"
                                        value={soDienThoai}
                                        onChange={(e) => {
                                            setSoDienThoai(e.target.value);
                                            if (fieldErrors.soDienThoai) {
                                                const newFieldErrors = { ...fieldErrors };
                                                delete newFieldErrors.soDienThoai;
                                                setFieldErrors(newFieldErrors);
                                            }
                                        }}
                                        required
                                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                                            fieldErrors.soDienThoai ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                    />
                                </div>
                                {fieldErrors.soDienThoai && (
                                    <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <ErrorIcon sx={{ fontSize: 16 }} />
                                        {fieldErrors.soDienThoai.map((err, idx) => (
                                            <span key={idx}>{err}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <EmailIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Nhập email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (fieldErrors.email) {
                                                const newFieldErrors = { ...fieldErrors };
                                                delete newFieldErrors.email;
                                                setFieldErrors(newFieldErrors);
                                            }
                                        }}
                                        required
                                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                                            fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <ErrorIcon sx={{ fontSize: 16 }} />
                                        {fieldErrors.email.map((err, idx) => (
                                            <span key={idx}>{err}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Mật khẩu */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <LockIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu"
                                        value={matKhau}
                                        onChange={(e) => {
                                            setMatKhau(e.target.value);
                                            if (fieldErrors.matKhau) {
                                                const newFieldErrors = { ...fieldErrors };
                                                delete newFieldErrors.matKhau;
                                                setFieldErrors(newFieldErrors);
                                            }
                                        }}
                                        required
                                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                                            fieldErrors.matKhau ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <VisibilityOffIcon className="h-5 w-5" />
                                        ) : (
                                            <VisibilityIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.matKhau && (
                                    <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <ErrorIcon sx={{ fontSize: 16 }} />
                                        {fieldErrors.matKhau.map((err, idx) => (
                                            <span key={idx}>{err}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Xác nhận mật khẩu */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <LockIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu"
                                        value={xacNhanMatKhau}
                                        onChange={(e) => {
                                            setXacNhanMatKhau(e.target.value);
                                            if (fieldErrors.xacNhanMatKhau) {
                                                const newFieldErrors = { ...fieldErrors };
                                                delete newFieldErrors.xacNhanMatKhau;
                                                setFieldErrors(newFieldErrors);
                                            }
                                        }}
                                        required
                                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                                            fieldErrors.xacNhanMatKhau ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <VisibilityOffIcon className="h-5 w-5" />
                                        ) : (
                                            <VisibilityIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.xacNhanMatKhau && (
                                    <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <ErrorIcon sx={{ fontSize: 16 }} />
                                        {fieldErrors.xacNhanMatKhau.map((err, idx) => (
                                            <span key={idx}>{err}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Error Messages */}
                            {errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    <div className="flex items-start gap-2 mb-2">
                                        <ErrorIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <strong className="block mb-1">  lỗi:</strong>
                                            <ul className="list-disc list-inside space-y-1">
                                                {errors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* General Error Message */}
                            {message && !errors.length && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                    <ErrorIcon className="h-5 w-5" />
                                    <span>{message}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <>
                                        <PersonAddIcon className="h-5 w-5" />
                                        <span>Đăng Ký</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Đã có tài khoản?{" "}
                                <Link
                                    to="/dangnhap"
                                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                                >
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-gray-500">
                    © 2024 LuanPhamCompany. All rights reserved.
                </div>
            </div>

            {/* Custom Animation Styles */}
            <style>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}

