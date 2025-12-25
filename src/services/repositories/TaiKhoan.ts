import api from "../api/api";

export interface TaiKhoan {
    id: number;
    hoTen: string;
    email: string;
    soDienThoai?: string;
    diaChi?: string;
    hinhAnh?: string;
    idLoaiTaiKhoan?: number;
    idLoaiTaiKhoanNavigation?: {
        id: number;
        tenLoai?: string;
    };
    ngayTao?: string;
}

export interface TaiKhoanRequest {
    hoTen: string;
    email: string;
    soDienThoai?: string;
    diaChi?: string;
    idLoaiTaiKhoan?: number;
}

export interface TaiKhoanPagingResponse {
    success: boolean;
    message: string;
    data: {
        items: TaiKhoan[];
        total: number;
        page: number;
        pageSize: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}
/* eslint-disable  @typescript-eslint/no-explicit-any */

const mapResponse = <T>(payload: any): ApiResponse<T> => {
    if (payload?.Success !== undefined) {
        return {
            success: payload.Success,
            message: payload.Message ?? "",
            data: payload.Data,
        };
    }

    return {
        success: payload?.success ?? false,
        message: payload?.message ?? "",
        data: payload?.data,
    };
};

export const layTaiKhoanPhanTrang = async (
    page = 1,
    pageSize = 10
): Promise<TaiKhoanPagingResponse> => {
    try {
        const res = await api.get(`/api/TaiKhoan/paging?page=${page}&pageSize=${pageSize}`);
        const json = res.data;

        if (
            json &&
            json.success === true &&
            json.data &&
            Array.isArray(json.data.items)
        ) {
            return {
                success: true,
                message: json.message ?? "",
                data: {
                    items: json.data.items,
                    total: json.data.total,
                    page: json.data.page,
                    pageSize: json.data.pageSize,
                },
            };
        }

        return {
            success: false,
            message: json?.message ?? "Dữ liệu trả về sai định dạng.",
            data: { items: [], total: 0, page, pageSize },
        };
    } catch (error) {
        console.error("Lỗi khi tải tài khoản:", error);
        return {
            success: false,
            message: "Không thể tải danh sách tài khoản.",
            data: { items: [], total: 0, page, pageSize },
        };
    }
};

export const layTatCaTaiKhoan = async (): Promise<ApiResponse<TaiKhoan[]>> => {
    try {
        const res = await api.get(`/api/TaiKhoan`);
        return mapResponse<TaiKhoan[]>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi lấy tất cả tài khoản:", error);
        return {
            success: false,
            message: "Không thể lấy danh sách tài khoản.",
            data: [],
        };
    }
};

export const layTaiKhoanTheoId = async (id: number): Promise<ApiResponse<TaiKhoan>> => {
    try {
        const res = await api.get(`/api/TaiKhoan/${id}`);
        return mapResponse<TaiKhoan>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi lấy tài khoản theo ID:", error);
        return {
            success: false,
            message: "Không thể lấy thông tin tài khoản.",
        };
    }
};

export const suaTaiKhoan = async (id: number, data: TaiKhoanRequest): Promise<ApiResponse<TaiKhoan>> => {
    try {
        const res = await api.put(`/api/TaiKhoan/Sua/${id}`, data);
        return mapResponse<TaiKhoan>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi cập nhật tài khoản:", error);
        return {
            success: false,
            message: error.response?.data?.Message || error.response?.data?.message || "Không thể cập nhật tài khoản.",
        };
    }
};

export const xoaTaiKhoan = async (id: number): Promise<ApiResponse<null>> => {
    try {
        const res = await api.delete(`/api/TaiKhoan/Xoa/${id}`);
        return mapResponse<null>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi xóa tài khoản:", error);
        return {
            success: false,
            message: error.response?.data?.Message || error.response?.data?.message || "Không thể xóa tài khoản.",
        };
    }
};

export interface LoaiTaiKhoan {
    id: number;
    tenLoai: string;
}

export const layTatCaLoaiTaiKhoan = async (): Promise<ApiResponse<LoaiTaiKhoan[]>> => {
    try {
        const res = await api.get(`/api/TaiKhoan/LoaiTaiKhoan`);
        console.log("Raw API response LoaiTaiKhoan:", res.data);
        const mapped = mapResponse<LoaiTaiKhoan[]>(res.data);
        console.log("Mapped response LoaiTaiKhoan:", mapped);
        return mapped;
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách loại tài khoản:", error);
        return {
            success: false,
            message: "Không thể lấy danh sách loại tài khoản.",
            data: [],
        };
    }
};

export const capNhatProfile = async (id: number, formData: FormData): Promise<ApiResponse<TaiKhoan>> => {
    try {
        const res = await api.put(`/api/TaiKhoan/UpdateProfile/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("UpdateProfile response:", res.data);
        return mapResponse<TaiKhoan>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi cập nhật profile:", error);
        console.error("Error response:", error.response?.data);
        const errorMessage = error.response?.data?.Message ||
            error.response?.data?.message ||
            error.message ||
            "Không thể cập nhật thông tin.";
        return {
            success: false,
            message: errorMessage,
        };
    }
};

