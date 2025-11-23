import api from "../api/api";
export interface NewUser {
    hoTen: string;
    soDienThoai: string;
    email: string;
    matKhau: string;
    xacNhanMatKhau: string;
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    messages?: string[];
    errors?: {
        [key: string]: string[];
    };
    data?: {
        id: number;
        hoTen: string;
        email: string;
        soDienThoai: string;
    };
}

export const DangKy = async (user: NewUser): Promise<ApiResponse> => {
    try {
        const res = await api.post(`/api/DangKy/register`, user);

        const apiData = res.data;
        console.log("✅ Phản hồi từ backend:", apiData);

        if (apiData.success || apiData.Success) {
            if (apiData.data?.hoTen || apiData.Data?.hoTen) {
                sessionStorage.setItem("userHoTen", apiData.data?.hoTen || apiData.Data?.hoTen);
            }

            return {
                success: true,
                message: apiData.message || apiData.Message || "Đăng ký thành công!",
                data: apiData.data || apiData.Data
            };
        }

        // Xử lý lỗi từ backend
        const errorData = apiData.errors || apiData.Errors || apiData.messages || apiData.Messages || [];
        const errorMessage = apiData.message || apiData.Message || "Đăng ký thất bại!";

        console.error("❌ Lỗi đăng ký từ backend:", {
            message: errorMessage,
            errors: errorData,
            fullResponse: apiData
        });

        return {
            success: false,
            message: errorMessage,
            errors: typeof errorData === 'object' && !Array.isArray(errorData) ? errorData : undefined,
            messages: Array.isArray(errorData) ? errorData : undefined
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        const errorResponse = e.response?.data;
        console.error("❌ Lỗi đăng ký (catch):", {
            status: e.response?.status,
            statusText: e.response?.statusText,
            data: errorResponse,
            message: e.message
        });

        // Xử lý lỗi validation từ backend (thường là 400 Bad Request)
        if (errorResponse) {
            const errorData = errorResponse.errors || errorResponse.Errors || errorResponse.messages || errorResponse.Messages || [];
            const errorMessage = errorResponse.message || errorResponse.Message || "Có lỗi xảy ra khi đăng ký!";

            return {
                success: false,
                message: errorMessage,
                errors: typeof errorData === 'object' && !Array.isArray(errorData) ? errorData : undefined,
                messages: Array.isArray(errorData) ? errorData : undefined
            };
        }

        return {
            success: false,
            message: "Không thể kết nối tới server! Vui lòng kiểm tra kết nối mạng.",
        };
    }
}