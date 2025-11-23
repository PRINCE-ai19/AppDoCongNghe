import api from "../api/api";

export interface DanhMuc {
    id: number;
    tenDanhMuc: string;
    moTa?: string;
    viTri: number
}

export interface DanhMucRequest {
    tenDanhMuc: string;
    moTa?: string | null;
    viTri?: number | null;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface DanhMucPagingResponse {
    success: boolean;
    message: string;
    data: {
        items: DanhMuc[];
        total: number;
        page: number;
        pageSize: number;
    };
}

/**
 * Lấy tất cả danh mục (không phân trang)
 */
export const LayTatCaDanhMuc = async (): Promise<ApiResponse<DanhMuc[]>> => {
    try {
        const res = await api.get(`/api/DanhMuc`);
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
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi lấy danh mục:", e.response?.data || e.message);
        return {
            success: false,
            message: "Không thể kết nối đến server!",
            data: []
        };
    }
}

/**
 * Lấy danh mục có phân trang (dành cho admin)
 * API: GET /api/DanhMuc/paging?page={page}&pageSize={pageSize}
 */
export const layDanhMucPhanTrang = async (
    page: number = 1,
    pageSize: number = 10
): Promise<DanhMucPagingResponse> => {
    try {
        const res = await api.get(
            `/api/DanhMuc/paging?page=${page}&pageSize=${pageSize}`
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
        console.error("Lỗi khi tải danh mục:", error);
        return {
            success: false,
            message: "Không thể tải danh sách danh mục.",
            data: { items: [], total: 0, page, pageSize },
        };
    }
};

/**
 * Lấy danh mục theo ID
 */
export const layDanhMucTheoId = async (id: number): Promise<ApiResponse<DanhMuc>> => {
    try {
        const res = await api.get(`/api/DanhMuc/${id}`);
        const data = res.data;
        
        // Xử lý cả Success/Message/Data và success/message/data
        if (data.Success !== undefined) {
            return {
                success: data.Success,
                message: data.Message,
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
        console.error("Lỗi khi lấy danh mục theo ID:", e.response?.data || e.message);
        return {
            success: false,
            message: "Không thể kết nối đến server!",
            data: {} as DanhMuc
        };
    }
};

export const themDanhMuc = async (model: DanhMucRequest): Promise<{
    success: boolean;
    data?: DanhMuc;
    message: string;
}> => {
    try {
        const res = await api.post("/api/DanhMuc", model);
        
       
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
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi thêm danh mục:", e.response?.data || e.message);
        return {
            success: false,
            message: e.response?.data?.Message || e.response?.data?.message || "Không thể thêm danh mục"
        };
    }
};


export const suaDanhMuc = async (id: number, model: DanhMucRequest): Promise<{
    success: boolean;
    data?: DanhMuc;
    message: string;
}> => {
    try {
        const res = await api.put(`/api/DanhMuc/${id}`, model);
        
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
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi sửa danh mục:", e.response?.data || e.message);
        return {
            success: false,
            message: e.response?.data?.Message || e.response?.data?.message || "Không thể cập nhật danh mục"
        };
    }
};

export const xoaDanhMuc = async (id: number): Promise<{
    success: boolean;
    message: string;
}> => {
    try {
        const res = await api.delete(`/api/DanhMuc/${id}`);
        
        // Xử lý cả Success/Message và success/message
        if (res.data.Success !== undefined) {
            return {
                success: res.data.Success,
                message: res.data.Message
            };
        }
        
        return {
            success: res.data.success ?? false,
            message: res.data.message ?? ""
        };
        /* eslint-disable  @typescript-eslint/no-explicit-any */
    } catch (e: any) {
        console.error("Lỗi khi xóa danh mục:", e.response?.data || e.message);
        return {
            success: false,
            message: e.response?.data?.Message || e.response?.data?.message || "Không thể xóa danh mục"
        };
    }
};