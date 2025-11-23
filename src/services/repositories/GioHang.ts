import api from "../api/api";

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface GioHangBind {
    taiKhoanId?: number;
    sanPhamId?: number;
    soLuong?: number;
}

export interface ChiTietGioHangItem {
    chiTietId: number;
    sanPhamId: number;
    tenSanPham?: string;
    gia: number;
    giaGiam?: number;
    soLuong: number;
    thanhTien: number;
    anhDaiDien?: string;
}

export interface GioHangResponse {
    success: boolean;
    message: string;
    tongTien?: number;
    tongSoLuong?: number;
    data?: ChiTietGioHangItem[];
}

export interface GioHang {
    id: number;
    taiKhoanId?: number;
    ngayTao?: string;
    taiKhoan?: {
        id: number;
        hoTen?: string;
        email?: string;
    };
}

export interface GioHangPagingResponse {
    success: boolean;
    message: string;
    data?: {
        items: GioHang[];
        total: number;
        page: number;
        pageSize: number;
    };
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * API: POST /api/GioHang/Them
 */
export const themVaoGioHang = async (gioHang: GioHangBind): Promise<ApiResponse<any>> => {
    try {
        const res = await api.post(`/api/GioHang/Them`, gioHang);
        const data = res.data;

        // Xử lý cả Success/Message và success/message
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "Đã thêm sản phẩm vào giỏ hàng thành công."
            };
        }

        return {
            success: data.success ?? false,
            message: data.message || "Đã thêm sản phẩm vào giỏ hàng thành công."
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi thêm vào giỏ hàng:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.message || errorData.Message || "Không thể thêm sản phẩm vào giỏ hàng."
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!"
        };
    }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * API: PUT /api/GioHang/CapNhat?chiTietId={chiTietId}&soLuongMoi={soLuongMoi}
 */
export const capNhatSoLuong = async (chiTietId: number, soLuongMoi: number): Promise<ApiResponse<any>> => {
    try {
        const res = await api.put(`/api/GioHang/CapNhat?chiTietId=${chiTietId}&soLuongMoi=${soLuongMoi}`);
        const data = res.data;

        // Xử lý cả Success/Message và success/message
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "Cập nhật số lượng thành công."
            };
        }

        return {
            success: data.success ?? false,
            message: data.message || "Cập nhật số lượng thành công."
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi cập nhật số lượng:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.message || errorData.Message || "Không thể cập nhật số lượng."
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!"
        };
    }
};

/**
 * Xóa một sản phẩm khỏi giỏ hàng
 * API: DELETE /api/GioHang/Xoa/{chiTietId}
 */
export const xoaSanPhamKhoiGioHang = async (chiTietId: number): Promise<ApiResponse<any>> => {
    try {
        const res = await api.delete(`/api/GioHang/Xoa/${chiTietId}`);
        const data = res.data;

        // Xử lý cả Success/Message và success/message
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "Đã xóa sản phẩm khỏi giỏ hàng."
            };
        }

        return {
            success: data.success ?? false,
            message: data.message || "Đã xóa sản phẩm khỏi giỏ hàng."
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.message || errorData.Message || "Không thể xóa sản phẩm khỏi giỏ hàng."
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!"
        };
    }
};

/**
 * Xóa toàn bộ giỏ hàng
 * API: DELETE /api/GioHang/Clear/{taiKhoanId}
 */
export const xoaTatCaGioHang = async (taiKhoanId: number): Promise<ApiResponse<any>> => {
    try {
        const res = await api.delete(`/api/GioHang/Clear/${taiKhoanId}`);
        const data = res.data;

        // Xử lý cả Success/Message và success/message
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "Đã xóa toàn bộ sản phẩm trong giỏ hàng."
            };
        }

        return {
            success: data.success ?? false,
            message: data.message || "Đã xóa toàn bộ sản phẩm trong giỏ hàng."
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi xóa toàn bộ giỏ hàng:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.message || errorData.Message || "Không thể xóa giỏ hàng."
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!"
        };
    }
};

/**
 * Xem chi tiết giỏ hàng
 * API: GET /api/GioHang/XemChiTiet/{taiKhoanId}
 */
export const xemChiTietGioHang = async (taiKhoanId: number): Promise<GioHangResponse> => {
    try {
        const res = await api.get(`/api/GioHang/XemChiTiet/${taiKhoanId}`);
        const data = res.data;

        // Xử lý cả Success/Message và success/message
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "Lấy chi tiết giỏ hàng thành công.",
                tongTien: data.tongTien || data.TongTien || 0,
                tongSoLuong: data.tongSoLuong || data.TongSoLuong || 0,
                data: data.data || data.Data || []
            };
        }

        return {
            success: data.success ?? true,
            message: data.message || "Lấy chi tiết giỏ hàng thành công.",
            tongTien: data.tongTien || 0,
            tongSoLuong: data.tongSoLuong || 0,
            data: data.data || []
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi lấy chi tiết giỏ hàng:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.message || errorData.Message || "Không thể lấy chi tiết giỏ hàng.",
                tongTien: 0,
                tongSoLuong: 0,
                data: []
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!",
            tongTien: 0,
            tongSoLuong: 0,
            data: []
        };
    }
};

/**
 * Lấy danh sách giỏ hàng phân trang (Admin)
 * API: GET /api/GioHang/paging?page={page}&pageSize={pageSize}
 */
export const layGioHangPhanTrang = async (page: number, pageSize: number): Promise<GioHangPagingResponse> => {
    try {
        const res = await api.get(`/api/GioHang/paging?page=${page}&pageSize=${pageSize}`);
        const data = res.data;

        // Xử lý cả Success/Message và success/message
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "Lấy danh sách giỏ hàng thành công.",
                data: data.data || data.Data
            };
        }

        return {
            success: data.success ?? true,
            message: data.message || "Lấy danh sách giỏ hàng thành công.",
            data: data.data
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi lấy danh sách giỏ hàng:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.message || errorData.Message || "Không thể lấy danh sách giỏ hàng.",
                data: undefined
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!",
            data: undefined
        };
    }
};

/**
 * Xóa giỏ hàng (Admin)
 * API: DELETE /api/GioHang/DeleteGH/{id}
 */
export const xoaGioHang = async (id: number): Promise<ApiResponse<any>> => {
    try {
        const res = await api.delete(`/api/GioHang/DeleteGH/${id}`);
        const data = res.data;

        // Xử lý cả Success/Message và success/message
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "Xóa giỏ hàng thành công."
            };
        }

        // Nếu response chỉ có message (200 OK), coi như success
        if (res.status === 200 && data.message) {
            return {
                success: true,
                message: data.message || "Xóa giỏ hàng thành công."
            };
        }

        return {
            success: data.success ?? false,
            message: data.message || "Xóa giỏ hàng thành công."
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi xóa giỏ hàng:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.message || errorData.Message || "Không thể xóa giỏ hàng."
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!"
        };
    }
};

