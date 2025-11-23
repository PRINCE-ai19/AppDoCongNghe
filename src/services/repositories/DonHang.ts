import api from "../api/api";

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
        console.log('Unknown response format, trying direct parse');
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

