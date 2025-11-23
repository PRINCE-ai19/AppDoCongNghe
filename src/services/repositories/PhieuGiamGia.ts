import api from "../api/api";

export interface PhieuGiamGia {
    id: number;
    maPhieu: string;
    moTa?: string;
    giaTriGiam: number;
    kieuGiam: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    soLuong: number;
    trangThai: boolean;
}

export interface PhieuGiamGiaRequest {
    maPhieu: string;
    moTa?: string;
    giaTriGiam: number;
    kieuGiam: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    soLuong: number;
    trangThai: boolean;
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

export interface ClaimVoucherRequest {
    taiKhoanID: number;
    phieuGiamGiaID: number;
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

export const layPhieuGiamGiaPhanTrang = async (
    page = 1,
    pageSize = 10
): Promise<PagingResponse<PhieuGiamGia>> => {
    try {
        const res = await api.get(`/api/PhieuGiamGia/Trang?page=${page}&pageSize=${pageSize}`);
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
        console.error("Lỗi khi tải phiếu giảm giá:", error);
        return {
            success: false,
            message: "Không thể tải danh sách phiếu giảm giá.",
            data: { items: [], total: 0, page, pageSize },
        };
    }
};

export const layTatCaPhieuGiamGia = async (): Promise<ApiResponse<PhieuGiamGia[]>> => {
    try {
        const res = await api.get(`/api/PhieuGiamGia`);
        return handleResponse<PhieuGiamGia[]>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi lấy tất cả PGG:", error);
        return {
            success: false,
            message: "Không thể lấy danh sách phiếu giảm giá.",
            data: [],
        };
    }
};

export const taoPhieuGiamGia = async (payload: PhieuGiamGiaRequest): Promise<ApiResponse<PhieuGiamGia>> => {
    try {
        const res = await api.post(`/api/PhieuGiamGia`, payload);
        return handleResponse<PhieuGiamGia>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi tạo phiếu giảm giá:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể tạo phiếu giảm giá.",
        };
    }
};

export const capNhatPhieuGiamGia = async (id: number, payload: PhieuGiamGiaRequest): Promise<ApiResponse<null>> => {
    try {
        const res = await api.put(`/api/PhieuGiamGia/Update/${id}`, payload);
        return handleResponse<null>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi cập nhật phiếu giảm giá:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể cập nhật phiếu giảm giá.",
        };
    }
};

export const xoaPhieuGiamGia = async (id: number): Promise<ApiResponse<null>> => {
    try {
        const res = await api.delete(`/api/PhieuGiamGia/Delete/${id}`);
        return handleResponse<null>(res.data, true);
    } catch (error: any) {
        console.error("Lỗi khi xóa phiếu giảm giá:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể xóa phiếu giảm giá.",
        };
    }
};

export const claimPhieuGiamGia = async (payload: ClaimVoucherRequest): Promise<ApiResponse<null>> => {
    try {
        const res = await api.post(`/api/PhieuGiamGia/Claim`, payload);
        return handleResponse<null>(res.data);
    } catch (error: any) {
        console.error("Lỗi khi nhận phiếu giảm giá:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể nhận phiếu giảm giá.",
        };
    }
};

