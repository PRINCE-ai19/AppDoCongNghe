import React, { useState } from "react";
import { DangNhap } from "../../services/repositories/DangNhap";
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import { Link, useNavigate } from "react-router-dom";

export default function LoginView() {
    const [showPassword, setShowPassword] = useState(false);
    const [taiKhoan, setTaiKhoan] = useState("");
    const [matKhau, setMatKhau] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const res = await DangNhap({ taiKhoan, matKhau });

            if (res.success) {
                // Lưu remember me nếu được chọn
                if (rememberMe) {
                    localStorage.setItem("rememberMe", "true");
                }
                
                // Kiểm tra role để chuyển hướng
                const userInfoStr = sessionStorage.getItem("userInfo");
                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr);
                    // Nếu role == 2 hoặc role === "Admin" thì chuyển đến trang admin
                    if (userInfo.role === 2 || userInfo.role === "Admin" || userInfo.role === "2") {
                        navigate("/admin");
                    } else {
                        navigate("/");
                    }
                } else {
                    // Nếu không có userInfo, mặc định chuyển về trang chủ
                    navigate("/");
                }
            } else {
                setMessage(res.message);
            }
        } catch (error) {
            console.error("ERROR:", error);
            setMessage("Đăng nhập thất bại! Vui lòng kiểm tra lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
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
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-10 text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                            Đăng Nhập
                        </h1>
                        <p className="text-white/90 text-sm sm:text-base">
                            Chào mừng bạn trở lại
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="px-6 sm:px-8 py-8">
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email/Username Input */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                                    Email hoặc Tên đăng nhập
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <PersonIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={taiKhoan}
                                        onChange={(e) => setTaiKhoan(e.target.value)}
                                        placeholder="Nhập email hoặc tên đăng nhập"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
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
                                        value={matKhau}
                                        onChange={(e) => setMatKhau(e.target.value)}
                                        placeholder="Nhập mật khẩu"
                                        required
                                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
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
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                                </label>
                                <Link
                                    to="/guiemail"
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            {/* Error Message */}
                            {message && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {message}
                                </div>
                            )}

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Đang đăng nhập...</span>
                                    </>
                                ) : (
                                    <>
                                        <LoginIcon className="h-5 w-5" />
                                        <span>Đăng Nhập</span>
                                    </>
                                )}
                            </button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Hoặc</span>
                                </div>
                            </div>

                            {/* Social Login Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md"
                                >
                                    <GoogleIcon className="text-red-500" />
                                    <span className="text-sm font-medium text-gray-700">Google</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md"
                                >
                                    <FacebookIcon className="text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">Facebook</span>
                                </button>
                            </div>
                        </form>

                        {/* Register Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Chưa có tài khoản?{" "}
                                <Link
                                    to="/dangky"
                                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                                >
                                    Đăng ký ngay
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


