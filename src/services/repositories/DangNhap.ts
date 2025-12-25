import api from "../api/api";

//  Định nghĩa kiểu dữ liệu 
export interface UserLogin {
    TaiKhoan: string;
    MatKhau: string;
}

export interface LoginResponse {
    id: number;
    hoTen: string;
    email: string;
    hinhAnh?: string | null;
    role: string;
    token: string;
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface ApiResponse {
    success: boolean;
    message: string;
    token?: string;
    data?: LoginResponse;
}

//Hàm đăng nhập 
export const DangNhap = async (data: { TaiKhoan: string; MatKhau: string }): Promise<ApiResponse> => {
    try {
        const response = await api.post("/api/DangNhap/login", data);

        // Backend trả về Success (PascalCase), cần check cả hai format
        const isSuccess = response.data.Success !== undefined 
            ? response.data.Success 
            : response.data.success;

        if (isSuccess) {
            const user = response.data.Data || response.data.data;

            if (user) {
                const token = user.Token || user.token;
                if (!token) {
                    return {
                        success: false,
                        message: "Không nhận được token đăng nhập!",
                    };
                }

                // Lưu token vào sessionStorage
                sessionStorage.setItem("token", token);

                sessionStorage.setItem("userInfo", JSON.stringify({
                    id: user.Id || user.id,
                    hoTen: user.HoTen || user.hoTen,
                    email: user.Email || user.email,
                    hinhAnh: user.HinhAnh || user.hinhAnh || null,
                    role: user.Role || user.role
                }));

                return {
                    success: true,
                    message: response.data.Message || response.data.message || "Đăng nhập thành công!",
                    token,
                    data: user,
                };
            }
        }

        // Nếu API trả về thất bại
        return {
            success: false,
            message: response.data.Message || response.data.message || "Đăng nhập thất bại!",
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (error: any) {
        console.error("Lỗi đăng nhập:", error);

        const errorMessage = error.response?.data?.Message 
            || error.response?.data?.message 
            || error.message 
            || "Lỗi máy chủ hoặc kết nối!";

        return {
            success: false,
            message: errorMessage,
        };
    }
};

//  Hàm lấy token từ session 
export const getToken = (): string | null => {
    return sessionStorage.getItem("token");
};

// Hàm lấy thông tin user từ session
export const getUserInfo = (): { id: number; hoTen: string; email: string; hinhAnh?: string | null; role: string } | null => {
    const userInfoStr = sessionStorage.getItem("userInfo");
    if (userInfoStr) {
        try {
            return JSON.parse(userInfoStr);
        } catch {
            return null;
        }
    }
    return null;
};

// Hàm xóa token và userInfo (khi đăng xuất) 
export const clearToken = (): void => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userInfo");
};

// Hàm kiểm tra đã đăng nhập chưa
export const isAuthenticated = (): boolean => {
    return getToken() !== null;
};
