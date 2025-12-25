import api from "../api/api";

export const ORDER_STATUS = {
    CHO_XU_LY: "Chờ xử lý",
    DANG_CHUAN_BI: "Đang chuẩn bị hàng",
    DANG_GIAO: "Đang giao hàng",
    GIAO_THANH_CONG: "Giao thành công",
    DA_HUY: "Đã hủy",
} as const;

export const ORDER_STATUSES: string[] = [
    ORDER_STATUS.CHO_XU_LY,
    ORDER_STATUS.DANG_CHUAN_BI,
    ORDER_STATUS.DANG_GIAO,
    ORDER_STATUS.GIAO_THANH_CONG,
    ORDER_STATUS.DA_HUY,
];

const ORDER_TRANSITIONS: Record<string, string[]> = {
    [ORDER_STATUS.CHO_XU_LY]: [ORDER_STATUS.DANG_CHUAN_BI, ORDER_STATUS.DA_HUY],
    [ORDER_STATUS.DANG_CHUAN_BI]: [ORDER_STATUS.DANG_GIAO, ORDER_STATUS.DA_HUY],
    [ORDER_STATUS.DANG_GIAO]: [ORDER_STATUS.GIAO_THANH_CONG],
    [ORDER_STATUS.GIAO_THANH_CONG]: [],
    [ORDER_STATUS.DA_HUY]: [],
};

const CANCELLABLE_STATUSES: string[] = [
    ORDER_STATUS.CHO_XU_LY,
    ORDER_STATUS.DANG_CHUAN_BI,
];

export const getNextStatuses = (current?: string) => {
    if (!current) return [];
    return ORDER_TRANSITIONS[current] ?? [];
};

export const canCancelOrder = (status?: string) => {
    if (!status) return false;
    return CANCELLABLE_STATUSES.includes(status);
};

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface ChiTietDonHang {
    id: number;
    sanPhamId?: number;
    soLuong?: number;
    donGia?: number;
    sanPham?: {
        id: number;
        tenSanPham?: string;
        thuongHieu?: string;
        gia?: number;
        giaGiam?: number;
        moTa?: string;
        hinhAnhDaiDien?: string;
        hinhAnh?: Array<{
            id: number;
            hinhAnh: string;
        }>;
        thanhTien?: number;
    };
}

export interface DonHang {
    id: number;
    ngayDat?: string;
    tongTien?: number;
    trangThai?: string;
    diaChiGiao?: string;
    ghiChu?: string;
    phuongThucThanhToan?: boolean;
    phieuGiamGia?: {
        id: number;
        maPhieu?: string;
        moTa?: string;
    } | null;
    chiTietDonHangs?: ChiTietDonHang[];
}

export interface DonHangDetail extends DonHang {
    taiKhoan?: {
        id: number;
        hoTen?: string;
        email?: string;
    } | null;
}

/**
 * Lấy danh sách đơn hàng của người dùng
 * API: GET /api/DonHang/GetByTaiKhoan/{taiKhoanId}
 */
export const layDonHangTheoTaiKhoan = async (taiKhoanId: number): Promise<ApiResponse<DonHang[]>> => {
    try {
        const res = await api.get(`/api/DonHang/GetByTaiKhoan/${taiKhoanId}`);
        const data = res.data;
        
        console.log('Raw API response:', data);
        console.log('Response keys:', Object.keys(data));

        if (data.Success !== undefined) {
            console.log('Using Success/Data format');
            console.log('Success:', data.Success);
            console.log('Data type:', typeof data.Data, 'Is Array:', Array.isArray(data.Data));
            console.log('Data length:', Array.isArray(data.Data) ? data.Data.length : 'Not an array');
            
            return {
                success: data.Success,
                message: data.Message || data.message || "",
                data: data.Data || []
            };
        }

        if (data.success !== undefined) {
            console.log('Using success/data format');
            return {
                success: data.success ?? false,
                message: data.message ?? "",
                data: data.data || []
            };
        }

        // Fallback: nếu response không có format chuẩn, thử parse trực tiếp
    
        return {
            success: true,
            message: "",
            data: Array.isArray(data) ? data : []
        };
    } catch (e: any) {
        console.error("Lỗi khi lấy đơn hàng:", e.response?.data || e.message);
        return {
            success: false,
            message: "Không thể kết nối đến server!",
            data: []
        };
    }
};

/**
 * Lấy chi tiết một đơn hàng
 * API: GET /api/DonHang/{id}
 */
export const layChiTietDonHang = async (id: number): Promise<ApiResponse<DonHangDetail>> => {
    try {
        const res = await api.get(`/api/DonHang/${id}`);
        const data = res.data;

        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "",
                data: data.Data
            };
        }

        return {
            success: data.success ?? false,
            message: data.message ?? "",
            data: data.data
        };
    } catch (e: any) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", e.response?.data || e.message);
        return {
            success: false,
            message: "Không thể kết nối đến server!",
            data: {} as DonHangDetail
        };
    }
};

export interface PaginatedOrders {
    page: number;
    pageSize: number;
    total: number;
    items: DonHang[];
}

const mapApiResponse = <T>(data: any): ApiResponse<T> => {
    if (data.Success !== undefined) {
        return {
            success: data.Success,
            message: data.Message || data.message || "",
            data: data.Data,
        };
    }

    return {
        success: data.success ?? false,
        message: data.message ?? "",
        data: data.data,
    };
};

export const layDonHangAdmin = async (status?: string, page = 1, pageSize = 20): Promise<ApiResponse<PaginatedOrders>> => {
    try {
        const res = await api.get("/api/DonHang/admin", {
            params: {
                status,
                page,
                pageSize,
            },
        });
        const data = mapApiResponse<PaginatedOrders>(res.data);
        if (data.success && data.data) {
            return data;
        }
        return {
            success: false,
            message: data.message || "Không thể lấy danh sách đơn hàng.",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || "Không thể kết nối đến server!",
        };
    }
};

export const capNhatTrangThaiDonHang = async (
    id: number,
    trangThaiMoi: string,
    ghiChu?: string
): Promise<ApiResponse<null>> => {
    try {
        const res = await api.patch(`/api/DonHang/${id}/status`, {
            trangThaiMoi,
            ghiChu,
        });
        return mapApiResponse<null>(res.data);
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || "Không thể cập nhật trạng thái.",
        };
    }
};

export const huyDonHangAdmin = async (id: number, lyDo?: string): Promise<ApiResponse<null>> => {
    try {
        const res = await api.post(`/api/DonHang/${id}/cancel`, {
            lyDo,
        });
        return mapApiResponse<null>(res.data);
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || "Không thể hủy đơn hàng.",
        };
    }
};

