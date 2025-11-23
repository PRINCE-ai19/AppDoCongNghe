import api from "../api/api";

export interface LienHeRequest {
    hoTen: string;
    email: string;
    soDienThoai?: string;
    noiDung: string;
}

export interface LienHe {
    id: number;
    hoTen: string;
    email: string;
    soDienThoai?: string;
    noiDung: string;
    ngayGui: string;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
}

export const guiLienHe = async (data: LienHeRequest): Promise<ApiResponse> => {
    try {
        const response = await api.post("/api/LienHe", data);
        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data
        };
    } catch (error: any) {
        console.error("Lỗi khi gửi liên hệ:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Lỗi khi gửi liên hệ!",
        };
    }
};

export const layTatCaLienHe = async (): Promise<ApiResponse> => {
    try {
        const response = await api.get("/api/LienHe");
        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data
        };
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách liên hệ:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Lỗi khi lấy danh sách liên hệ!",
        };
    }
};

export const layLienHeById = async (id: number): Promise<ApiResponse> => {
    try {
        const response = await api.get(`/api/LienHe/${id}`);
        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data
        };
    } catch (error: any) {
        console.error("Lỗi khi lấy thông tin liên hệ:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Lỗi khi lấy thông tin liên hệ!",
        };
    }
};

export const xoaLienHe = async (id: number): Promise<ApiResponse> => {
    try {
        const response = await api.delete(`/api/LienHe/${id}`);
        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data
        };
    } catch (error: any) {
        console.error("Lỗi khi xóa liên hệ:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Lỗi khi xóa liên hệ!",
        };
    }
};

