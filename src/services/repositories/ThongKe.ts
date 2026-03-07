import api from "../api/api";
import type { ApiResponse } from "./SanPham";

export interface DoanhThuThang {
    thang: string;
    doanhThu: number;
}

export interface TopFavoriteProduct {
    sanPhamId: number;
    tenSanPham: string;
    hinhAnh: string;
    soLuongYeuThich: number;
}

export interface BestSellingProduct {
    sanPhamId: number;
    tenSanPham: string;
    hinhAnh: string;
    soLuongDaBan: number;
    gia: number;
}

export const layDoanhThuTheoThang = async (): Promise<ApiResponse<DoanhThuThang[]>> => {
    try {
        const res = await api.get("/api/ThongKe/DoanhThuTheoThang");
        return res.data;
    } catch (error: any) {
        console.error("Lỗi khi lấy thống kê doanh thu:", error);
        return { success: false, message: "Không thể lấy thống kê doanh thu.", data: [] };
    }
};

export const layTopFavoriteProducts = async (): Promise<ApiResponse<TopFavoriteProduct[]>> => {
    try {
        const res = await api.get("/api/ThongKe/TopFavoriteProducts");
        return res.data;
    } catch (error: any) {
        console.error("Lỗi khi lấy top yêu thích:", error);
        return { success: false, message: "Không thể lấy top yêu thích.", data: [] };
    }
};

export const layBestSellingProducts = async (): Promise<ApiResponse<BestSellingProduct[]>> => {
    try {
        const res = await api.get("/api/ThongKe/BestSellingProducts");
        return res.data;
    } catch (error: any) {
        console.error("Lỗi khi lấy top bán chạy:", error);
        return { success: false, message: "Không thể lấy top bán chạy.", data: [] };
    }
};
