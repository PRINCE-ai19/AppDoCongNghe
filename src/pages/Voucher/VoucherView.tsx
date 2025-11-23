import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DiscountIcon from "@mui/icons-material/Discount";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    layTatCaPhieuGiamGia,
    claimPhieuGiamGia,
    type PhieuGiamGia,
} from "../../services/repositories/PhieuGiamGia";

type MessageState = { type: "success" | "error"; text: string } | null;
type FilterType = "all" | "active" | "expired";

const VoucherView: React.FC = () => {
    const navigate = useNavigate();
    const [vouchers, setVouchers] = useState<PhieuGiamGia[]>([]);
    const [loading, setLoading] = useState(false);
    const [claimingId, setClaimingId] = useState<number | null>(null);
    const [message, setMessage] = useState<MessageState>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const res = await layTatCaPhieuGiamGia();
            if (res.success && res.data) {
                setVouchers(res.data);
            } else {
                showMessage("error", res.message || "Không thể tải danh sách phiếu giảm giá.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi tải phiếu giảm giá.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVouchers();
    }, []);

    const getUserId = () => {
        const raw = sessionStorage.getItem("userInfo");
        if (!raw) return null;
        try {
            const user = JSON.parse(raw);
            return user?.id ?? null;
        } catch {
            return null;
        }
    };

    const handleClaim = async (voucher: PhieuGiamGia) => {
        const userId = getUserId();
        if (!userId) {
            showMessage("error", "Bạn cần đăng nhập để nhận phiếu.");
            navigate("/dangnhap");
            return;
        }

        if (!voucher.trangThai) {
            showMessage("error", "Phiếu này đang tạm ngưng.");
            return;
        }
        if (voucher.soLuong <= 0) {
            showMessage("error", "Phiếu đã hết số lượng.");
            return;
        }

        setClaimingId(voucher.id);
        try {
            const res = await claimPhieuGiamGia({
                taiKhoanID: userId,
                phieuGiamGiaID: voucher.id,
            });
            if (res.success) {
                showMessage("success", "Nhận phiếu thành công!");
                loadVouchers();
            } else {
                showMessage("error", res.message || "Không thể nhận phiếu.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi nhận phiếu.");
        } finally {
            setClaimingId(null);
        }
    };

    const filteredVouchers = useMemo(() => {
        const keyword = searchTerm.toLowerCase();
        const now = new Date();
        return vouchers.filter((voucher) => {
            const matchesSearch =
                voucher.maPhieu.toLowerCase().includes(keyword) ||
                (voucher.moTa && voucher.moTa.toLowerCase().includes(keyword));

            if (!matchesSearch) return false;

            const start = new Date(voucher.ngayBatDau);
            const end = new Date(voucher.ngayKetThuc);
            const isActive = voucher.trangThai && voucher.soLuong > 0 && now >= start && now <= end;
            const isExpired = now > end || voucher.soLuong <= 0;

            if (filter === "active") return isActive;
            if (filter === "expired") return isExpired;
            return true;
        });
    }, [vouchers, searchTerm, filter]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN");
    };

    const formatValue = (voucher: PhieuGiamGia) =>
        voucher.kieuGiam === "percentage"
            ? `${voucher.giaTriGiam}%`
            : `${voucher.giaTriGiam.toLocaleString("vi-VN")}₫`;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 ease-out"
                    >
                        <ArrowBackIcon />
                        <span>Quay lại trang chủ</span>
                    </Link>
                </div>

                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                            <DiscountIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Săn phiếu giảm giá</h1>
                            <p className="text-gray-500 text-sm">Nhận phiếu và sử dụng khi đặt hàng.</p>
                        </div>
                    </div>
                </header>

                {message && (
                    <div
                        className={`mb-4 p-4 rounded-xl flex items-center gap-3 shadow ${
                            message.type === "success"
                                ? "bg-green-50 border border-green-200 text-green-800"
                                : "bg-red-50 border border-red-200 text-red-800"
                        }`}
                    >
                        {message.type === "success" ? <CheckCircleIcon /> : <ErrorIcon />}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div className="relative flex-1 max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm theo mã phiếu, mô tả..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <FilterListIcon className="text-gray-500" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as FilterType)}
                            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white shadow-sm text-sm"
                        >
                            <option value="all">Tất cả</option>
                            <option value="active">Đang diễn ra</option>
                            <option value="expired">Đã hết hạn/Hết lượt</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-pink-500"></div>
                        <p className="mt-4 text-gray-500">Đang tải phiếu giảm giá...</p>
                    </div>
                ) : filteredVouchers.length === 0 ? (
                    <div className="py-24 text-center">
                        <DiscountIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Không có phiếu giảm giá phù hợp.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredVouchers.map((voucher) => {
                            const now = new Date();
                            const start = new Date(voucher.ngayBatDau);
                            const end = new Date(voucher.ngayKetThuc);
                            const isActive = voucher.trangThai && voucher.soLuong > 0 && now >= start && now <= end;
                            const isExpired = now > end || voucher.soLuong <= 0;

                            return (
                                <div
                                    key={voucher.id}
                                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase text-gray-400 tracking-wide">Mã phiếu</p>
                                            <h3 className="text-xl font-bold text-gray-900">{voucher.maPhieu}</h3>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                isExpired
                                                    ? "bg-gray-200 text-gray-600"
                                                    : isActive
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-yellow-100 text-yellow-600"
                                            }`}
                                        >
                                            {isExpired ? "Hết hạn" : isActive ? "Đang diễn ra" : "Chưa đến ngày"}
                                        </span>
                                    </div>
                                    <div className="text-4xl font-extrabold text-pink-500">{formatValue(voucher)}</div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{voucher.moTa || "Không có mô tả"}</p>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p>Áp dụng từ: <span className="font-medium text-gray-700">{formatDate(voucher.ngayBatDau)}</span></p>
                                        <p>Đến hết: <span className="font-medium text-gray-700">{formatDate(voucher.ngayKetThuc)}</span></p>
                                        <p>Số lượng còn: <span className="font-semibold text-gray-900">{voucher.soLuong}</span></p>
                                    </div>
                                    <button
                                        disabled={claimingId === voucher.id || isExpired || !voucher.trangThai}
                                        onClick={() => handleClaim(voucher)}
                                        className={`mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition ${
                                            claimingId === voucher.id
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                : isExpired || !voucher.trangThai
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:-translate-y-0.5"
                                        }`}
                                    >
                                        {claimingId === voucher.id ? "Đang nhận..." : "Nhận phiếu"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoucherView;

