import React, { useState } from "react";
import { GuiEmail } from "../../services/repositories/GuiEmail";
import { Link, useNavigate } from "react-router-dom";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SendIcon from '@mui/icons-material/Send';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SendOtpView = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            setMessage("Vui lòng nhập email!");
            return;
        }
        const res = await GuiEmail(email);

        if (res.success) {
            alert("✅ OTP đã được gửi đến email của bạn!");
            navigate(`/datlaimatkhau`, { state: { email } });
        }
        else {
            setMessage(`❌ ${res.message}`);
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
                                <LockIcon className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                            Quên Mật Khẩu
                        </h1>
                        <p className="text-white/90 text-sm sm:text-base">
                            Nhập email của bạn để nhận mã đặt lại mật khẩu
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="px-6 sm:px-8 py-8">
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            {/* Email Input */}
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="Nhập email của bạn"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                    />
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
                                <SendIcon className="h-5 w-5" />
                                <span>Gửi Mã Đặt Lại Mật Khẩu</span>
                            </button>
                        </form>

                        {/* Back to Login Link */}
                        <div className="mt-6 text-center">
                            <Link
                                to="/dangnhap"
                                className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center justify-center gap-2"
                            >
                                <ArrowBackIcon className="h-4 w-4" />
                                <span>Quay lại đăng nhập</span>
                            </Link>
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
};

export default SendOtpView;
