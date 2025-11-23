import api from "../api/api";

export interface TinTuc {
    id: number;
    tieuDe: string;
    moTa?: string;
    noiDung?: string;
    image?: string;
    ngayTao?: string;
    ngaySua?: string;
    hienThi?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface TinTucPagingResponse {
    success: boolean;
    message: string;
    data: {
        items: TinTuc[];
        total: number;
        page: number;
        pageSize: number;
    };
}

/**
 * Lấy tất cả tin tức (không phân trang)
 */
export const layTatCaTinTuc = async (): Promise<ApiResponse<TinTuc[]>> => {
    try {
        const res = await api.get(`/api/TinTuc`);
        const data = res.data;
        
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
        console.error("Lỗi khi lấy tin tức:", e.response?.data || e.message);
        return {
            success: false,
            message: "Không thể kết nối đến server!",
            data: []
        };
    }
};

/**
 * Lấy tin tức có phân trang (dành cho admin)
 */
export const layTinTucPhanTrang = async (
    page: number = 1,
    pageSize: number = 10
): Promise<TinTucPagingResponse> => {
    try {
        const res = await api.get(
            `/api/TinTuc/paging?page=${page}&pageSize=${pageSize}`
        );

        const json = res.data;

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

        return {
            success: false,
            message: "Dữ liệu trả về sai định dạng.",
            data: { items: [], total: 0, page, pageSize },
        };
    } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
        return {
            success: false,
            message: "Không thể tải danh sách tin tức.",
            data: { items: [], total: 0, page, pageSize },
        };
    }
};

/**
 * Lấy tin tức theo ID
 * API: GET /api/TinTuc/{id}
 */
export const layTinTucTheoId = async (id: number): Promise<ApiResponse<TinTuc>> => {
    try {
        const res = await api.get(`/api/TinTuc/${id}`);
        const data = res.data;
        
        // Xử lý cả Success/Message/Data và success/message/data
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
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi lấy tin tức theo ID:", e.response?.data || e.message);
        return {
            success: false,
            message: "Không thể kết nối đến server!",
            data: {} as TinTuc
        };
    }
};

export interface TinTucRequest {
    tieuDe: string;
    moTa?: string;
    noiDung?: string;
    image?: File;
    hienThi?: boolean;
}

/**
 * Thêm tin tức mới
 * API: POST /api/TinTuc
 * Lưu ý: API này nhận FormData vì có upload file
 */
export const themTinTuc = async (tinTuc: TinTucRequest): Promise<ApiResponse<TinTuc>> => {
    try {
        // Tạo FormData để gửi file
        const formData = new FormData();

        // Thêm các trường text
        formData.append("TieuDe", tinTuc.tieuDe);
        if (tinTuc.moTa) {
            formData.append("MoTa", tinTuc.moTa);
        }
        if (tinTuc.noiDung) {
            formData.append("NoiDung", tinTuc.noiDung);
        }
        if (tinTuc.hienThi !== undefined) {
            formData.append("HienThi", tinTuc.hienThi.toString());
        }

        // Thêm file ảnh nếu có
        if (tinTuc.image) {
            formData.append("Image", tinTuc.image);
        }

        const res = await api.post(`/api/TinTuc`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const data = res.data;

        // Xử lý cả Success/Message/Data và success/message/data
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "Thêm tin tức thành công.",
                data: data.Data
            };
        }

        return {
            success: data.success ?? false,
            message: data.message || "Thêm tin tức thành công.",
            data: data.data
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi thêm tin tức:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.Message || errorData.message || "Không thể thêm tin tức."
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!"
        };
    }
};

/**
 * Cập nhật tin tức
 * API: PUT /api/TinTuc/{id}
 * Lưu ý: API này nhận FormData vì có upload file
 */
export const suaTinTuc = async (id: number, tinTuc: TinTucRequest): Promise<ApiResponse<TinTuc>> => {
    try {
        // Tạo FormData để gửi file
        const formData = new FormData();

        // Thêm các trường text
        formData.append("TieuDe", tinTuc.tieuDe);
        if (tinTuc.moTa) {
            formData.append("MoTa", tinTuc.moTa);
        }
        if (tinTuc.noiDung) {
            formData.append("NoiDung", tinTuc.noiDung);
        }
        if (tinTuc.hienThi !== undefined) {
            formData.append("HienThi", tinTuc.hienThi.toString());
        }

        // Thêm file ảnh nếu có (nếu không có thì giữ ảnh cũ)
        if (tinTuc.image) {
            formData.append("Image", tinTuc.image);
        }

        const res = await api.put(`/api/TinTuc/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const data = res.data;

        // Xử lý cả Success/Message/Data và success/message/data
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "Cập nhật tin tức thành công.",
                data: data.Data
            };
        }

        return {
            success: data.success ?? false,
            message: data.message || "Cập nhật tin tức thành công.",
            data: data.data
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi cập nhật tin tức:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.Message || errorData.message || "Không thể cập nhật tin tức."
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!"
        };
    }
};

/**
 * Xóa tin tức
 * API: DELETE /api/TinTuc/{id}
 */
export const xoaTinTuc = async (id: number): Promise<ApiResponse<any>> => {
    try {
        const res = await api.delete(`/api/TinTuc/${id}`);
        const data = res.data;
        
        // Xử lý cả Success/Message và success/message
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message || data.message || "Xóa tin tức thành công."
            };
        }
        
        return {
            success: data.success ?? false,
            message: data.message || "Xóa tin tức thành công."
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi xóa tin tức:", e.response?.data || e.message);
        
        const errorData = e.response?.data;
        if (errorData) {
            return {
                success: false,
                message: errorData.Message || errorData.message || "Không thể xóa tin tức."
            };
        }

        return {
            success: false,
            message: "Không thể kết nối đến server!"
        };
    }
};



