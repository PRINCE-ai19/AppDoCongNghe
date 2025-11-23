import api from "../api/api";

//  Định nghĩa kiểu dữ liệu 
export interface UserLogin {
    taiKhoan: string;
    matKhau: string;
}
/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface ApiResponse {
    success: boolean;
    message: string;
    token?: string;
    data?: any;
}

//Hàm đăng nhập 
export const DangNhap = async (data: UserLogin): Promise<ApiResponse> => {
    try {
        const response = await api.post("/api/DangNhap/login", data);

        // Nếu API trả về thành công
        if (response.data.success) {
            const user = response.data.data;

            // Lưu token vào sessionStorage
            sessionStorage.setItem("token", user.token);

            sessionStorage.setItem("userInfo", JSON.stringify({
                id: user.id,
                hoTen: user.hoTen,
                email: user.email,
                hinhAnh: user.hinhAnh || null,
                role: user.role
            }));

            return {
                success: true,
                message: "Đăng nhập thành công!",
                token: user.token,
                data: response.data.data,
            };
        }

        // Nếu API trả về thất bại
        return {
            success: false,
            message: response.data.message || "Đăng nhập thất bại!",
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (error: any) {
        console.error("Lỗi đăng nhập:", error);

        return {
            success: false,
            message: error.response?.data?.message || "Lỗi máy chủ hoặc kết nối!",
        };
    }
};

//  Hàm lấy token từ session 
export const getToken = (): string | null => {
    return sessionStorage.getItem("token");
};

// Hàm xóa token (khi đăng xuất) 
export const clearToken = (): void => {
    sessionStorage.removeItem("token");
};
