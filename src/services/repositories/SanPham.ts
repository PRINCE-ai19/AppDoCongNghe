import api from "../api/api";

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface SanPhamImage {
    id: number;
    sanPhamId?: number;
    hinhAnh: string;
}

export interface SanPham {
    id: number;
    tenSanPham: string;
    thuongHieu?: string;
    gia: number;
    giaGiam?: number;
    moTa?: string;
    hienThi?: boolean;
    soLuongTon?: number;
    ngayThem?: string;
    danhMuc?: string;
    hinhAnhDaiDien?: string;
    hinhAnh?: SanPhamImage[];
}

export interface CauHinhSanPham {
    id: number;
    tenThongSo?: string;
    giaTri?: string;
}

export interface SanPhamDetail {
    id: number;
    tenSanPham: string;
    gia: number;
    giaGiam?: number;
    moTa?: string;
    soLuongTon?: number;
    ngayThem?: string;
    thuongHieu?: string;
    danhMuc?: string;
    hienthi?: boolean;
    hinhAnhList?: string[];
    cauHinhSanPhams?: CauHinhSanPham[];
}

export interface SanPhamCategory {
    id: number;
    tenSanPham: string;
    thuongHieu?: string;
    gia: number;
    giaGiam?: number;
    moTa?: string;
    soLuongTon?: number;
    ngayThem?: string;
    danhMuc?: string;
    anhDaiDien?: string;
}

export interface SanPhamRequest {
    id?: number; // Nếu có id => update, không có => thêm mới
    tenSanPham: string;
    danhMucId?: number;
    thuongHieu?: string;
    gia: number;
    soLuongTon?: number;
    moTa?: string;
    ngayThem?: string;
    hinhanh?: File[]; // Ảnh upload
}

export interface SanPhamPagingResponse {
    success: boolean;
    message: string;
    data: {
        items: SanPham[];
        total: number;
        page: number;
        pageSize: number;
    };
}

/**
 * Lấy tất cả sản phẩm (không phân trang)
 */
export const layTatCaSanPham = async (): Promise<ApiResponse<SanPham[]>> => {
    try {
        const res = await api.get(`/api/SanPham`);
        const data = res.data;
        
        // Xử lý cả Success/Message/Data và success/message/data
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message,
                data: data.Data || []
            };
        }
        
        return {
            success: data.success ?? false,
            message: data.message ?? "",
            data: data.data || []
        };
    } catch (e: any) {
        console.error("Lỗi khi lấy sản phẩm:", e.response?.data || e.message);
        return {
            success: false,
            message: "Không thể kết nối đến server!",
            data: []
        };
    }
};

/**
 * Lấy sản phẩm có phân trang (dành cho admin)
 * API: GET /api/SanPham/paging?page={page}&pageSize={pageSize}
 */
export const laySanPhamPhanTrang = async (
    page: number = 1,
    pageSize: number = 10
): Promise<SanPhamPagingResponse> => {
    try {
        const res = await api.get(
            `/api/SanPham/paging?page=${page}&pageSize=${pageSize}`
        );

        const json = res.data;

        // Kiểm tra đúng cấu trúc từ backend
        if (
            json &&
            json.success === true &&
            json.data &&
            Array.isArray(json.data.items)
        ) {
            return {
                success: true,
                message: json.message,
                data: {
                    items: json.data.items,
                    total: json.data.total,
                    page: json.data.page,
                    pageSize: json.data.pageSize,
                },
            };
        }

        // Sai format → trả fallback
        console.error("Dữ liệu không đúng định dạng:", json);
        return {
            success: false,
            message: "Dữ liệu trả về sai định dạng.",
            data: { items: [], total: 0, page, pageSize },
        };
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        return {
            success: false,
            message: "Không thể tải danh sách sản phẩm.",
            data: { items: [], total: 0, page, pageSize },
        };
    }
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export const layChiTietSanPham = async (id: number): Promise<ApiResponse<SanPhamDetail>> => {
    try {
        const res = await api.get(`/api/SanPham/${id}`);
        
        // Xử lý cả Success/Message/Data và success/message/data
        if (res.data.Success !== undefined) {
            return {
                success: res.data.Success,
                message: res.data.Message,
                data: res.data.Data
            };
        }
        
        return {
            success: res.data.success ?? false,
            message: res.data.message ?? "",
            data: res.data.data
        };
    } catch (e: any) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", e.response?.data || e.message);
        return {
            success: false,
            message: "Không thể tải chi tiết sản phẩm.",
        };
    }
};

/**
 * Lấy sản phẩm theo danh mục
 */
export const laySanPhamTheoDanhMuc = async (categoryId: number): Promise<ApiResponse<SanPhamCategory[]>> => {
    try {
        const res = await api.get(`/api/SanPham/category/${categoryId}`);

        if (res.data && res.data.Success !== undefined) {
            return {
                success: res.data.Success,
                message: res.data.Message,
                data: res.data.Data || [],
            };
        }

        if (res.data && res.data.success !== undefined) {
            return {
                success: res.data.success,
                message: res.data.message,
                data: res.data.data || [],
            };
        }

        if (Array.isArray(res.data)) {
            return {
                success: true,
                message: "Lấy sản phẩm theo danh mục thành công",
                data: res.data,
            };
        }

        return {
            success: false,
            message: "Không có dữ liệu sản phẩm trong danh mục này",
            data: [],
        };
    } catch (e: any) {
        console.error("Lỗi khi lấy sản phẩm theo danh mục:", e.response?.data || e.message);
        return {
            success: false,
            message: "Không thể tải sản phẩm theo danh mục.",
            data: [],
        };
    }
};

/**
 * Tìm kiếm sản phẩm
 */
export const searchProducts = async (keyword: string): Promise<ApiResponse<SanPham[]>> => {
    try {
        const res = await api.get(`/api/SanPham/search`, {
            params: { keyword },
        });

        if (res.data && res.data.Success !== undefined) {
            return {
                success: res.data.Success,
                message: res.data.Message,
                data: res.data.Data || [],
            };
        }

        if (res.data && res.data.success !== undefined) {
            return {
                success: res.data.success,
                message: res.data.message,
                data: res.data.data || [],
            };
        }

        return {
            success: false,
            message: "Không tìm thấy sản phẩm nào.",
            data: [],
        };
    } catch (e: any) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", e.response?.data || e.message);
        if (e.response?.data) {
            return e.response.data;
        }
        return {
            success: false,
            message: "Không thể kết nối với máy chủ.",
            data: [],
        };
    }
};

const buildSanPhamFormData = (sanpham: SanPhamRequest): FormData => {
    const formData = new FormData();

    formData.append("TenSanPham", sanpham.tenSanPham);

    if (sanpham.danhMucId !== undefined && sanpham.danhMucId !== null) {
        formData.append("DanhMucId", sanpham.danhMucId.toString());
    }

    if (sanpham.thuongHieu) {
        formData.append("ThuongHieu", sanpham.thuongHieu);
    }

    formData.append("Gia", sanpham.gia.toString());

    if (sanpham.soLuongTon !== undefined && sanpham.soLuongTon !== null) {
        formData.append("SoLuongTon", sanpham.soLuongTon.toString());
    }

    if (sanpham.moTa) {
        formData.append("MoTa", sanpham.moTa);
    }

    if (sanpham.ngayThem) {
        formData.append("NgayThem", sanpham.ngayThem);
    }

    if (sanpham.hinhanh && sanpham.hinhanh.length > 0) {
        sanpham.hinhanh.forEach((file) => {
            formData.append("Hinhanh", file);
        });
    }

    return formData;
};

/**
 * Thêm sản phẩm mới
 * API: POST /api/SanPham/ThemSp
 * Lưu ý: API này nhận FormData vì có upload file
 */
export const themSanPham = async (sanpham: SanPhamRequest): Promise<{
    success: boolean;
    message: string;
}> => {
    try {
        const formData = buildSanPhamFormData(sanpham);

        const res = await api.post(`/api/SanPham/ThemSp`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        // Xử lý cả Success/Message và success/message
        if (res.data.Success !== undefined) {
            return {
                success: res.data.Success,
                message: res.data.Message
            };
        }

        return {
            success: res.data.success ?? false,
            message: res.data.message ?? "Thành công"
        };
    } catch (e: any) {
        console.error("Lỗi khi thêm sản phẩm:", e.response?.data || e.message);
        return {
            success: false,
            message: e.response?.data?.Message || e.response?.data?.message || "Không thể thêm sản phẩm.",
        };
    }
};

/**
 * Cập nhật sản phẩm
 * API: PUT /api/SanPham/SuaSp/{id}
 */
export const suaSanPham = async (id: number, sanpham: Omit<SanPhamRequest, 'id'>): Promise<{
    success: boolean;
    message: string;
}> => {
    try {
        const formData = buildSanPhamFormData(sanpham);
        formData.append("Id", id.toString());

        const res = await api.put(`/api/SanPham/SuaSp/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        // Xử lý cả Success/Message và success/message
        if (res.data.Success !== undefined) {
            return {
                success: res.data.Success,
                message: res.data.Message
            };
        }

        return {
            success: res.data.success ?? false,
            message: res.data.message ?? "Cập nhật thành công"
        };
    } catch (e: any) {
        console.error("Lỗi khi sửa sản phẩm:", e.response?.data || e.message);
        return {
            success: false,
            message: e.response?.data?.Message || e.response?.data?.message || "Không thể cập nhật sản phẩm.",
        };
    }
};

/**
 * Xóa sản phẩm
 * API: DELETE /api/SanPham/{id}
 */
export const xoaSanPham = async (id: number): Promise<{
    success: boolean;
    message: string;
}> => {
    try {
        const res = await api.delete(`/api/SanPham/${id}`);
        
        // Xử lý cả Success/Message và success/message
        if (res.data.Success !== undefined) {
            return {
                success: res.data.Success,
                message: res.data.Message
            };
        }
        
        return {
            success: res.data.success ?? false,
            message: res.data.message ?? "Xóa thành công"
        };
    } catch (e: any) {
        console.error("Lỗi khi xóa sản phẩm:", e.response?.data || e.message);
        return {
            success: false,
            message: e.response?.data?.Message || e.response?.data?.message || "Không thể xóa sản phẩm.",
        };
    }
};

/**
 * Xóa 1 ảnh của sản phẩm
 * API: DELETE /api/SanPham/DeleteImage/{imageId}
 */
export const xoaAnhSanPham = async (imageId: number): Promise<ApiResponse<null>> => {
    try {
        const res = await api.delete(`/api/SanPham/DeleteImage/${imageId}`);
        const data = res.data;

        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message,
            };
        }

        return {
            success: data.success ?? false,
            message: data.message ?? "",
        };
    } catch (e: any) {
        console.error("Lỗi khi xóa ảnh sản phẩm:", e.response?.data || e.message);
        const errorData = e.response?.data;
        return {
            success: false,
            message: errorData?.Message || errorData?.message || "Không thể xóa ảnh sản phẩm.",
        };
    }
};

/**
 * Lấy danh sách sản phẩm yêu thích theo tài khoản
 * API: GET /api/SanPham/GetByTaiKhoan/{taiKhoanId}
 */
export const laySanPhamYeuThich = async (taiKhoanId: number): Promise<number[]> => {
    try {
        const res = await api.get(`/api/SanPham/GetByTaiKhoan/${taiKhoanId}`);
        return Array.isArray(res.data) ? res.data : [];
    } catch (e: any) {
        console.error("Lỗi khi lấy danh sách yêu thích:", e.response?.data || e.message);
        return [];
    }
};

/**
 * Toggle yêu thích sản phẩm (thêm/xóa)
 * API: POST /api/SanPham/toggle?taiKhoanId={taiKhoanId}&sanPhamId={sanPhamId}
 */
export const toggleYeuThich = async (taiKhoanId: number, sanPhamId: number): Promise<{
    success: boolean;
    isFavorite: boolean;
    message?: string;
}> => {
    try {
        const res = await api.post(`/api/SanPham/toggle`, null, {
            params: {
                taiKhoanId,
                sanPhamId,
            },
        });

        return {
            success: true,
            isFavorite: res.data?.isFavorite ?? false,
            message: res.data?.isFavorite ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích",
        };
    } catch (e: any) {
        console.error("Lỗi khi toggle yêu thích:", e.response?.data || e.message);
        return {
            success: false,
            isFavorite: false,
            message: "Không thể cập nhật yêu thích.",
        };
    }
};
