import api from "../api/api";

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface SanPhamThanhToan {
    sanPhamId: number;
    tenSanPham: string;
    gia: number;
    giaGiam?: number;
    soLuong: number;
    thanhTien: number;
    anhDaiDien?: string;
}

export interface KhachHangInfo {
    hoTen: string;
    email: string;
    soDienThoai?: string;
    diaChi?: string;
}

export interface VoucherInfo {
    id: number;
    maPhieu: string;
    moTa?: string;
    giaTriGiam: number;
    kieuGiam: string;
    ngayKetThuc: string;
}

export interface XemThanhToanResponse {
    success: boolean;
    message: string;
    tongTien?: number;
    khachHang?: KhachHangInfo;
    vouchers?: VoucherInfo[];
    data?: SanPhamThanhToan[];
}

export interface DatHangRequest {
    payment: number; // 0 = COD, 1 = VNPay
    taiKhoanId: number;
    diaChiGiao?: string;
    ghiChu?: string;
    phuongThucThanhToan?: string;
    maPhieuGiamGia?: string;
}

export interface DatHangResponse {
    success?: boolean;
    statusCode?: number;
    message: string;
    url?: string; // URL thanh toán VNPay (nếu có)
    state?: string;
}

/**
 * Xem thông tin thanh toán
 * API: GET /api/ThanhToan/ThanhToan/Xem/{taiKhoanId}
 */
export const xemThongTinThanhToan = async (taiKhoanId: number): Promise<XemThanhToanResponse> => {
    try {
        const res = await api.get(`/api/ThanhToan/ThanhToan/Xem/${taiKhoanId}`);
        const data = res.data;

        return {
            success: data.success ?? true,
            message: data.message || "Lấy thông tin thanh toán thành công.",
            tongTien: data.tongTien || 0,
            khachHang: data.khachHang,
            vouchers: data.vouchers || [],
            data: data.data || []
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi lấy thông tin thanh toán:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.message || errorData.Message || "Không thể lấy thông tin thanh toán.",
                tongTien: 0,
                vouchers: [],
                data: []
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!",
            tongTien: 0,
            vouchers: [],
            data: []
        };
    }
};

/**
 * Đặt hàng
 * API: POST /api/ThanhToan/ThanhToan/DatHang
 */
export const datHang = async (request: DatHangRequest): Promise<DatHangResponse> => {
    try {
        const res = await api.post(`/api/ThanhToan/ThanhToan/DatHang`, request);
        const data = res.data;

        // Xử lý response từ VNPay (có url) hoặc COD (success)
        if (data.url) {
            return {
                statusCode: data.statusCode || 201,
                message: data.message || "Tạo đơn hàng thành công!",
                url: data.url,
                state: data.state
            };
        }

        return {
            success: data.success ?? true,
            message: data.message || "Đặt hàng thành công!"
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi đặt hàng:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.message || errorData.Message || "Không thể đặt hàng."
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!"
        };
    }
};

