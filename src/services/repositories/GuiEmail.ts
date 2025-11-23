import api from "../api/api";


/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
}
export const GuiEmail = async (email: string): Promise<ApiResponse> => {
    try {
        const res = await api.post(`/api/DangNhap/SendOtp?email=${encodeURIComponent(email)}`);

        return {
            success: res.data.success,
            message: res.data.message,
            data: res.data.data,
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi gửi email OTP:", e);

        if (e.response) {
            return {
                success: false,
                message: e.response.data?.message || "Lỗi từ máy chủ Gửi Otp!",
            };
        }

        // lỗi mạng hoặc không kết nối được
        return {
            success: false,
            message: "Không thể kết nối đến máy chủ!",
        };
    }
}