import api from "../api/api";

export interface KhuyenMai {
    id: number;
    tenKhuyenMai: string;
    moTa?: string;
    phanTramGiam: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    soSanPham?: number;
    trangThai?: string;
}

export interface KhuyenMaiRequest {
    tenKhuyenMai: string;
    moTa?: string;
    phanTramGiam: number;
    ngayBatDau: string;
    ngayKetThuc: string;
}

export interface GanSanPhamKhuyenMaiRequest {
    sanPhamId: number;
    khuyenMaiId: number;
}

export interface SanPhamTrongKhuyenMai {
    id: number;
    tenSanPham: string;
    gia: number;
    giaGiam?: number;
    hinhAnhDaiDien?: string;
}

export interface PagingResponse<T> {
    success: boolean;
    message: string;
    data: {
        items: T[];
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

// Lấy danh sách khuyến mãi có phân trang
export const layKhuyenMaiPhanTrang = async (
    page = 1,
    pageSize = 10
): Promise<PagingResponse<KhuyenMai>> => {
    try {
        const res = await api.get(`/api/KhuyenMai/paging?page=${page}&pageSize=${pageSize}`);
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
        console.error("Lỗi khi tải khuyến mãi:", error);
        return {
            success: false,
            message: "Không thể tải danh sách khuyến mãi.",
            data: { items: [], total: 0, page, pageSize },
        };
    }
};

// Lấy tất cả khuyến mãi
export const layTatCaKhuyenMai = async (): Promise<ApiResponse<KhuyenMai[]>> => {
    try {
        const res = await api.get(`/api/KhuyenMai`);
        return handleResponse<KhuyenMai[]>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi lấy tất cả khuyến mãi:", error);
        return {
            success: false,
            message: "Không thể lấy danh sách khuyến mãi.",
            data: [],
        };
    }
};

// Lấy khuyến mãi đang active
export const layKhuyenMaiActive = async (): Promise<ApiResponse<KhuyenMai[]>> => {
    try {
        const res = await api.get(`/api/KhuyenMai/active`);
        return handleResponse<KhuyenMai[]>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi lấy khuyến mãi active:", error);
        return {
            success: false,
            message: "Không thể lấy danh sách khuyến mãi đang active.",
            data: [],
        };
    }
};

// Lấy khuyến mãi theo ID
export const layKhuyenMaiById = async (id: number): Promise<ApiResponse<KhuyenMai & { sanPhams?: any[] }>> => {
    try {
        const res = await api.get(`/api/KhuyenMai/${id}`);
        return handleResponse<KhuyenMai & { sanPhams?: any[] }>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi lấy khuyến mãi:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể lấy thông tin khuyến mãi.",
        };
    }
};

// Tạo khuyến mãi mới
export const taoKhuyenMai = async (payload: KhuyenMaiRequest): Promise<ApiResponse<KhuyenMai>> => {
    try {
        const res = await api.post(`/api/KhuyenMai`, payload);
        return handleResponse<KhuyenMai>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi tạo khuyến mãi:", error);
        return {
            success: false,
            message: error.response?.data?.Message || error.response?.data?.message || "Không thể tạo khuyến mãi.",
        };
    }
};

// Cập nhật khuyến mãi
export const capNhatKhuyenMai = async (id: number, payload: KhuyenMaiRequest): Promise<ApiResponse<KhuyenMai>> => {
    try {
        const res = await api.put(`/api/KhuyenMai/${id}`, payload);
        return handleResponse<KhuyenMai>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi cập nhật khuyến mãi:", error);
        return {
            success: false,
            message: error.response?.data?.Message || error.response?.data?.message || "Không thể cập nhật khuyến mãi.",
        };
    }
};

// Xóa khuyến mãi
export const xoaKhuyenMai = async (id: number): Promise<ApiResponse<null>> => {
    try {
        const res = await api.delete(`/api/KhuyenMai/${id}`);
        return handleResponse<null>(res.data, true);
    } catch (error: any) {
        console.error("Lỗi khi xóa khuyến mãi:", error);
        return {
            success: false,
            message: error.response?.data?.Message || error.response?.data?.message || "Không thể xóa khuyến mãi.",
        };
    }
};

// Gán sản phẩm vào khuyến mãi
export const ganSanPhamKhuyenMai = async (payload: GanSanPhamKhuyenMaiRequest): Promise<ApiResponse<null>> => {
    try {
        const res = await api.post(`/api/KhuyenMai/gan-san-pham`, payload);
        return handleResponse<null>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi gán sản phẩm vào khuyến mãi:", error);
        return {
            success: false,
            message: error.response?.data?.Message || error.response?.data?.message || "Không thể gán sản phẩm vào khuyến mãi.",
        };
    }
};

// Xóa sản phẩm khỏi khuyến mãi
export const xoaSanPhamKhoiKhuyenMai = async (sanPhamId: number, khuyenMaiId: number): Promise<ApiResponse<null>> => {
    try {
        const res = await api.delete(`/api/KhuyenMai/xoa-san-pham/${sanPhamId}/${khuyenMaiId}`);
        return handleResponse<null>(res.data, true);
    } catch (error: any) {
        console.error("Lỗi khi xóa sản phẩm khỏi khuyến mãi:", error);
        return {
            success: false,
            message: error.response?.data?.Message || error.response?.data?.message || "Không thể xóa sản phẩm khỏi khuyến mãi.",
        };
    }
};

// Lấy danh sách sản phẩm trong khuyến mãi
export const laySanPhamTrongKhuyenMai = async (id: number): Promise<ApiResponse<SanPhamTrongKhuyenMai[]>> => {
    try {
        const res = await api.get(`/api/KhuyenMai/${id}/san-pham`);
        return handleResponse<SanPhamTrongKhuyenMai[]>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi lấy danh sách sản phẩm trong khuyến mãi:", error);
        return {
            success: false,
            message: error.response?.data?.Message || error.response?.data?.message || "Không thể lấy danh sách sản phẩm.",
            data: [],
        };
    }
};

