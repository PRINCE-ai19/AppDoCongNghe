import api from "../api/api";
/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
}
export interface DatLaiMatKhauRequest {
    email: string;
    otp: string;
    newPassword: string;
}

export const DatLaiMatKhau = async (data: DatLaiMatKhauRequest): Promise<ApiResponse> => {
    try {
        const res = await api.post(`/api/DangNhap/ResetPassword`, data);
        return {
            success: res.data.success,
            message: res.data.message,
            data: res.data.data,
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi đặt lại mật khẩu:", e);
        if (e.response) {
            return {
                success: false,
                message: e.response.data?.message || "Lỗi từ máy chủ!",
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến máy chủ!",
        };
    }
}