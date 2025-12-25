import api from "../api/api";
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface ProductPagingResponse {
    success: boolean;
    message: string;
    data: {
        items: Product[];
        total: number;
        page: number;
        pageSize: number;
    };
}
export interface Product {
    id: number;
    tenSanPham: string;
    thuongHieu: string;
    gia: number;
    giaGiam?: number;
    moTa: string;
    hienThi?: boolean;
    soLuongTon: number;
    ngayThem: string;
    danhMuc: string;
    hinhAnhDaiDien: string;
}

export interface ProductDetail {
    id: number;
    tenSanPham: string;
    gia: number;
    giaGiam?: number;
    moTa?: string;
    soLuongTon?: number;
    thuongHieu?: string;
    danhMuc?: string;
    ngayThem?: string;
    hinhAnhList?: string[];
    cauHinhSanPhams?: Array<{
        id: number;
        tenThongSo?: string;
        giaTri?: string;
    }>;
}

// Aliases for backward compatibility
export type SanPhamDetail = ProductDetail;
export type SanPham = Product;
export type SanPhamRequest = CreateProductDto;

export interface SanPhamImage {
    id: number;
    sanPhamId: number;
    url: string;
    isMain?: boolean;
}


export interface ProductCategory {
    id: number;
    tenSanPham: string;
    thuongHieu: string;
    gia: number;
    giaGiam?: number;
    moTa: string;
    soLuongTon: number;
    ngayThem: string;
    danhMuc: string;
    anhDaiDien: string;
}

export interface CreateProductDto {
    id?: number; // nếu có id => update
    tenSanPham: string;
    danhMucId: number;
    thuongHieu: string;
    gia: number;
    soLuongTon: number;
    moTa: string;
    hinhanh?: File[];   // ảnh upload
}


export const themSanPham = async (sanpham: CreateProductDto): Promise<{ success: boolean; message: string }> => {
    try {
        const res = await api.post(`/api/SanPham/Themsp`, sanpham);
        return res.data;
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi thêm vào giỏ hàng:", e.message);
        return { success: false, message: "Không thể thêm sản phẩm vào giỏ hàng." };
    }

}

export const xoaSanPham = async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
        const res = await api.delete(`api/SanPham/${id}`);
        return {
            success: res.data?.success ?? false,
            message: res.data?.message ?? "Không rõ kết quả từ server"
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi xóa sản phẩm:", e.message);
        return {
            success: false,
            message: "Không thể xóa sản phẩm."
        };
    }
}

/**
 * Sửa sản phẩm (update)
 */
export const suaSanPham = async (sanpham: CreateProductDto): Promise<{ success: boolean; message: string }> => {
    try {
        if (!sanpham.id) {
            return { success: false, message: "ID sản phẩm không hợp lệ." };
        }
        const res = await api.put(`/api/SanPham/${sanpham.id}`, sanpham);
        return res.data || { success: false, message: "Không thể cập nhật sản phẩm." };
    } catch (e: any) {
        console.error("Lỗi sửa sản phẩm:", e.message);
        return { success: false, message: "Không thể cập nhật sản phẩm." };
    }
}

/**
 * Xóa ảnh sản phẩm
 */
export const xoaAnhSanPham = async (imageId: number): Promise<{ success: boolean; message: string }> => {
    try {
        const res = await api.delete(`/api/SanPham/image/${imageId}`);
        return res.data || { success: false, message: "Không thể xóa ảnh." };
    } catch (e: any) {
        console.error("Lỗi xóa ảnh sản phẩm:", e.message);
        return { success: false, message: "Không thể xóa ảnh sản phẩm." };
    }
}

export const layTatCaSanPham = async (
    page: number = 1,
    pageSize: number = 10
): Promise<ProductPagingResponse> => {
    try {
        const res = await api.get(`/api/SanPham/paging?page=${page}&pageSize=${pageSize}`);

        const json = res.data;

        // Kiểm tra đúng cấu trúc từ backend
        if (json && json.success === true && json.data && Array.isArray(json.data.items)) {
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

// Alias for backward compatibility
export const laySanPhamPhanTrang = layTatCaSanPham;

export const laySanPhamTheoDanhMuc = async (categoryId: number): Promise<ApiResponse<ProductCategory[]>> => {
    try {
        const res = await api.get(`/api/SanPham/category/${categoryId}`);

        if (res.data && Array.isArray(res.data.data)) {
            return res.data;
        }

        if (Array.isArray(res.data)) {
            return {
                success: true,
                message: "Lấy sản phẩm theo danh mục thành công",
                data: res.data,
            };
        }

        return {
            success: true,
            message: "Không có sản phẩm trong danh mục này",
            data: [],
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        // Không log error nếu là 404 (danh mục không có sản phẩm là trường hợp bình thường)
        if (e.response?.status !== 404) {
            console.error("Lỗi khi lấy sản phẩm theo danh mục:", e);
        }
        return {
            success: true,
            message: "Không có sản phẩm trong danh mục này",
            data: [],
        };
    }

};

export const layChiTietSanPham = async (id: number): Promise<ApiResponse<ProductDetail>> => {
    try {
        const res = await api.get(`/api/SanPham/${id}`);
        return res.data;
    } catch (e: any) {
        // Không log error nếu là 404 (sản phẩm không tồn tại là trường hợp bình thường)
        if (e.response?.status !== 404) {
            console.error("Lỗi khi lấy chi tiết sản phẩm:", e.message);
        }
        return {
            success: false,
            message: "Không tìm thấy sản phẩm.",
        };
    }
};

export const searchProducts = async (keyword: string): Promise<ApiResponse<Product[]>> => {

    try {
        const res = await api.get<ApiResponse<Product[]>>(`/api/SanPham/search`, {
            params: { keyword },
        });
        return res.data;
    } catch (e: any) {
        if (e.res) {
            return e.res.data;

        }
        return {
            success: false,
            message: "không kết nối với máy chủ.",
            data: [] as Product[],
        };
    }
};

/**
 * Lấy danh sách ID sản phẩm yêu thích của user
 */
export const laySanPhamYeuThich = async (taiKhoanId: number): Promise<number[]> => {
    try {
        const res = await api.get(`/api/SanPham/GetByTaiKhoan/${taiKhoanId}`);
        // Backend trả về trực tiếp array, không có wrapper ApiRespone
        if (Array.isArray(res.data)) {
            return res.data;
        }
        return [];
    } catch (error: any) {
        // Không log error nếu là 404 (user chưa có yêu thích là trường hợp bình thường)
        if (error.response?.status !== 404) {
            console.error("Lỗi khi lấy danh sách yêu thích:", error);
        }
        return [];
    }
};

/**
 * Toggle yêu thích sản phẩm
 */
export const toggleYeuThich = async (
    taiKhoanId: number,
    sanPhamId: number
): Promise<{ success: boolean; message: string; isFavorite: boolean }> => {
    try {
        // Backend nhận query parameters
        const res = await api.post(`/api/SanPham/toggle?taiKhoanId=${taiKhoanId}&sanPhamId=${sanPhamId}`);
        // Backend trả về { isFavorite: true/false }, không có wrapper ApiRespone
        if (res.data && res.data.isFavorite !== undefined) {
            return {
                success: true,
                message: res.data.isFavorite ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích",
                isFavorite: res.data.isFavorite,
            };
        }
        return { success: false, message: "Không thể cập nhật yêu thích.", isFavorite: false };
    } catch (error: any) {
        console.error("Lỗi khi toggle yêu thích:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Không thể cập nhật yêu thích.",
            isFavorite: false,
        };
    }
};