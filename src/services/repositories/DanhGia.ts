import api from "../api/api";

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface DanhGia {
    id: number;
    taiKhoanId?: number;
    sanPhamId?: number;
    soSao?: number;
    noiDung?: string;
    ngayDanhGia?: string;
    taiKhoan?: {
        id: number;
        hoTen?: string;
        email?: string;
        hinhAnh?: string;
    };
    sanPham?: {
        id: number;
        tenSanPham?: string;
        thuongHieu?: string;
        hinhAnhDaiDien?: string;
    };
}

export interface DanhGiaRequest {
    sanPhamId: number;
    soSao: number;
    noiDung?: string;
}

export interface DanhGiaListResponse {
    items: DanhGia[];
    total: number;
    page: number;
    pageSize: number;
    diemTrungBinh: number;
}

const handleResponse = <T>(payload: any, defaultSuccess = false): ApiResponse<T> => {
    if (payload?.Success !== undefined) {
        return {
            success: payload.Success,
            message: payload.Message ?? "",
            data: payload.Data,
        };
    }

    return {
        success: payload?.success ?? defaultSuccess,
        message: payload?.message ?? "",
        data: payload?.data,
    };
};

/**
 * Tạo đánh giá sản phẩm
 */
export const taoDanhGia = async (
    request: DanhGiaRequest,
    taiKhoanId: number
): Promise<ApiResponse<DanhGia>> => {
    try {
        const res = await api.post(`/api/DanhGia?taiKhoanId=${taiKhoanId}`, request);
        return handleResponse<DanhGia>(res.data, true);
    } catch (error: any) {
        console.error("Lỗi khi tạo đánh giá:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể tạo đánh giá",
        };
    }
};

/**
 * Sửa đánh giá
 */
export const suaDanhGia = async (
    id: number,
    request: DanhGiaRequest,
    taiKhoanId: number
): Promise<ApiResponse<DanhGia>> => {
    try {
        const res = await api.put(`/api/DanhGia/${id}?taiKhoanId=${taiKhoanId}`, request);
        return handleResponse<DanhGia>(res.data, true);
    } catch (error: any) {
        console.error("Lỗi khi sửa đánh giá:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể sửa đánh giá",
        };
    }
};

/**
 * Xóa đánh giá
 */
export const xoaDanhGia = async (
    id: number,
    taiKhoanId: number
): Promise<ApiResponse<void>> => {
    try {
        const res = await api.delete(`/api/DanhGia/${id}?taiKhoanId=${taiKhoanId}`);
        return handleResponse<void>(res.data, true);
    } catch (error: any) {
        console.error("Lỗi khi xóa đánh giá:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể xóa đánh giá",
        };
    }
};

/**
 * Lấy danh sách đánh giá theo sản phẩm
 */
export const layDanhGiaTheoSanPham = async (
    sanPhamId: number,
    page: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<DanhGiaListResponse>> => {
    try {
        const res = await api.get(
            `/api/DanhGia/GetBySanPham/${sanPhamId}?page=${page}&pageSize=${pageSize}`
        );
        const json = res.data;

        if (json && json.success === true && json.data) {
            return {
                success: true,
                message: json.message ?? "",
                data: json.data as DanhGiaListResponse,
            };
        }

        return handleResponse<DanhGiaListResponse>(json, false);
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách đánh giá:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể lấy danh sách đánh giá",
        };
    }
};

/**
 * Lấy đánh giá của user cho sản phẩm cụ thể
 */
export const layDanhGiaCuaUser = async (
    taiKhoanId: number,
    sanPhamId: number
): Promise<ApiResponse<DanhGia | null>> => {
    try {
        const res = await api.get(
            `/api/DanhGia/GetByUserAndSanPham?taiKhoanId=${taiKhoanId}&sanPhamId=${sanPhamId}`
        );
        return handleResponse<DanhGia | null>(res.data, true);
    } catch (error: any) {
        console.error("Lỗi khi lấy đánh giá của user:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể lấy đánh giá",
        };
    }
};

/**
 * Lấy tất cả đánh giá của user
 */
export const layTatCaDanhGiaCuaUser = async (
    taiKhoanId: number
): Promise<ApiResponse<DanhGia[]>> => {
    try {
        const res = await api.get(`/api/DanhGia/GetByUser/${taiKhoanId}`);
        return handleResponse<DanhGia[]>(res.data, true);
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách đánh giá của user:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể lấy danh sách đánh giá",
        };
    }
};

