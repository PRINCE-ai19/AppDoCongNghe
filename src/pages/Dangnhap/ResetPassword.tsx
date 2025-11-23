import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DatLaiMatKhau } from "../../services/repositories/QuenMatKhau";
import LockResetIcon from '@mui/icons-material/LockReset';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ErrorIcon from '@mui/icons-material/Error';

export default function ResetPassword() {
    const location = useLocation();
    const email = location.state?.email;
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otp || !newPassword) {
            setMessage(" Vui lòng nhập đầy đủ OTP và mật khẩu mới!");
            return;
        }
        const res = await DatLaiMatKhau({ email, otp, newPassword });
        if (res.success) {
            alert("Mật khẩu đã được đặt lại thành công!");
            navigate("/");
        } else {
            setMessage(res.message);
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
                                <LockResetIcon className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                            Đặt Lại Mật Khẩu
                        </h1>
                        <p className="text-white/90 text-sm sm:text-base">
                            Nhập mã OTP và mật khẩu mới của bạn
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="px-6 sm:px-8 py-8">
                        {/* Email Display */}
                        {email && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                                <EmailIcon className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-gray-600">Email</p>
                                    <p className="text-sm font-medium text-gray-900">{email}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-5">
                            {/* OTP Input */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                                    Mã OTP
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <VpnKeyIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Nhập mã OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* New Password Input */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <LockIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu mới"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
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

                            {/* Error Message */}
                            {message && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                    <ErrorIcon className="h-5 w-5" />
                                    <span>{message}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <LockResetIcon className="h-5 w-5" />
                                <span>Đặt Lại Mật Khẩu</span>
                            </button>
                        </form>

                        {/* Back to Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Không muốn đổi?{" "}
                                <Link
                                    to="/dangnhap"
                                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                                >
                                    Quay lại đăng nhập
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
