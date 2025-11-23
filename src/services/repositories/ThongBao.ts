import api from "../api/api";

export interface ThongBao {
    id: number;
    taiKhoanId: number;
    tieuDe: string;
    noiDung: string;
    ngayTao: string;
    daXem: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

const normalizeResponse = <T>(payload: any): ApiResponse<T> => {
    if (!payload) {
        return { success: false, message: "Không nhận được phản hồi từ máy chủ." };
    }

    if (payload.success !== undefined) {
        return {
            success: payload.success,
            message: payload.message ?? "",
            data: payload.data,
        };
    }

    if (payload.Success !== undefined) {
        return {
            success: payload.Success,
            message: payload.Message ?? "",
            data: payload.Data,
        };
    }

    return {
        success: true,
        message: "",
        data: payload as T,
    };
};

export const layThongBaoTheoUser = async (taiKhoanId: number): Promise<ApiResponse<ThongBao[]>> => {
    try {
        const res = await api.get(`/api/Thongbao?idTaiKhoan=${taiKhoanId}`);
        return normalizeResponse<ThongBao[]>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi tải thông báo:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể tải thông báo.",
            data: [],
        };
    }
};

export const xemChiTietThongBao = async (id: number): Promise<ApiResponse<ThongBao>> => {
    try {
        const res = await api.get(`/api/Thongbao/detail?id=${id}`);
        return normalizeResponse<ThongBao>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi xem thông báo:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể xem thông báo.",
        };
    }
};

export const xoaThongBao = async (id: number): Promise<ApiResponse<null>> => {
    try {
        const res = await api.delete(`/api/Thongbao/delete?id=${id}`);
        return normalizeResponse<null>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi xóa thông báo:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể xóa thông báo.",
        };
    }
};

