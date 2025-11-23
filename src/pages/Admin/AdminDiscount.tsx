import React, { useEffect, useMemo, useState } from "react";
import DiscountIcon from "@mui/icons-material/Discount";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
    layPhieuGiamGiaPhanTrang,
    taoPhieuGiamGia,
    capNhatPhieuGiamGia,
    xoaPhieuGiamGia,
    type PhieuGiamGia,
    type PhieuGiamGiaRequest,
} from "../../services/repositories/PhieuGiamGia";

const defaultForm: PhieuGiamGiaRequest = {
    maPhieu: "",
    moTa: "",
    giaTriGiam: 0,
    kieuGiam: "percentage",
    ngayBatDau: "",
    ngayKetThuc: "",
    soLuong: 0,
    trangThai: true,
};

const formatCurrencyInput = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, "");
    if (!numeric) return { display: "", numericValue: 0 };
    const number = Number(numeric);
    return {
        display: number.toLocaleString("vi-VN"),
        numericValue: number,
    };
};

const AdminDiscount: React.FC = () => {
    const [giaTriGiamDisplay, setGiaTriGiamDisplay] = useState("");

    const [vouchers, setVouchers] = useState<PhieuGiamGia[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<PhieuGiamGia | null>(null);
    const [formData, setFormData] = useState<PhieuGiamGiaRequest>(defaultForm);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState<PhieuGiamGia | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const loadVouchers = async (page: number = currentPage) => {
        setLoading(true);
        try {
            const res = await layPhieuGiamGiaPhanTrang(page, pageSize);
            if (res.success && res.data) {
                setVouchers(res.data.items || []);
                setTotal(res.data.total || 0);
                setCurrentPage(res.data.page || page);
            } else {
                showMessage("error", res.message || "Không thể tải danh sách phiếu giảm giá.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi tải danh sách phiếu giảm giá.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVouchers(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize]);

    useEffect(() => {
        loadVouchers(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const filteredVouchers = useMemo(() => {
        if (!searchTerm.trim()) return vouchers;
        const keyword = searchTerm.toLowerCase();
        return vouchers.filter((voucher) =>
            voucher.maPhieu.toLowerCase().includes(keyword) ||
            (voucher.moTa && voucher.moTa.toLowerCase().includes(keyword))
        );
    }, [vouchers, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }
        return pages;
    };

    const resetForm = () => {
        setFormData(defaultForm);
        setGiaTriGiamDisplay("");
        setEditingItem(null);
    };

    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (voucher: PhieuGiamGia) => {
        setEditingItem(voucher);
        setFormData({
            maPhieu: voucher.maPhieu,
            moTa: voucher.moTa ?? "",
            giaTriGiam: voucher.giaTriGiam,
            kieuGiam: voucher.kieuGiam,
            ngayBatDau: voucher.ngayBatDau.split("T")[0],
            ngayKetThuc: voucher.ngayKetThuc.split("T")[0],
            soLuong: voucher.soLuong,
            trangThai: voucher.trangThai,
        });
        setGiaTriGiamDisplay(
            voucher.kieuGiam === "percentage"
                ? String(voucher.giaTriGiam)
                : voucher.giaTriGiam.toLocaleString("vi-VN")
        );
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const validateForm = () => {
        if (!formData.maPhieu.trim()) {
            showMessage("error", "Vui lòng nhập mã phiếu.");
            return false;
        }
        if (formData.giaTriGiam <= 0) {
            showMessage("error", "Giá trị giảm phải lớn hơn 0.");
            return false;
        }
        if (!formData.ngayBatDau || !formData.ngayKetThuc) {
            showMessage("error", "Vui lòng chọn ngày bắt đầu và kết thúc.");
            return false;
        }
        if (new Date(formData.ngayKetThuc) < new Date(formData.ngayBatDau)) {
            showMessage("error", "Ngày kết thúc phải lớn hơn ngày bắt đầu.");
            return false;
        }
        if (formData.soLuong < 0) {
            showMessage("error", "Số lượng không hợp lệ.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload: PhieuGiamGiaRequest = {
                ...formData,
                maPhieu: formData.maPhieu.trim(),
                moTa: formData.moTa?.trim() || undefined,
                kieuGiam: formData.kieuGiam.trim(),
            };

            const res = editingItem
                ? await capNhatPhieuGiamGia(editingItem.id, payload)
                : await taoPhieuGiamGia(payload);

            if (res.success) {
                showMessage("success", editingItem ? "Cập nhật phiếu giảm giá thành công!" : "Thêm phiếu giảm giá thành công!");
                handleCloseModal();
                loadVouchers(currentPage);
            } else {
                showMessage("error", res.message || "Không thể lưu phiếu giảm giá.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi lưu phiếu giảm giá.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (voucher: PhieuGiamGia) => {
        setVoucherToDelete(voucher);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!voucherToDelete) return;
        setLoading(true);
        try {
            const res = await xoaPhieuGiamGia(voucherToDelete.id);
            if (res.success) {
                showMessage("success", "Đã xóa phiếu giảm giá.");
                const isLastItemOnPage = vouchers.length === 1 && currentPage > 1;
                const nextPage = isLastItemOnPage ? currentPage - 1 : currentPage;
                setShowDeleteConfirm(false);
                setVoucherToDelete(null);
                loadVouchers(nextPage);
            } else {
                showMessage("error", res.message || "Không thể xóa phiếu.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi xóa phiếu.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN");
    };

    const getVoucherStatus = (voucher: PhieuGiamGia) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        
        const ngayKetThuc = new Date(voucher.ngayKetThuc);
        ngayKetThuc.setHours(0, 0, 0, 0);
        
        // Nếu ngày kết thúc đã qua thì hiển thị "Đã hết hạn"
        if (ngayKetThuc < now) {
            return {
                text: "Đã hết hạn",
                className: "bg-red-100 text-red-700"
            };
        }
        
        // Nếu chưa hết hạn, kiểm tra trạng thái
        if (voucher.trangThai) {
            return {
                text: "Đang kích hoạt",
                className: "bg-green-100 text-green-700"
            };
        } else {
            return {
                text: "Ngừng áp dụng",
                className: "bg-gray-200 text-gray-600"
            };
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                        <DiscountIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý phiếu giảm giá</h1>
                        <p className="text-sm text-gray-500">Tạo, sửa, xóa và theo dõi phiếu giảm giá.</p>
                    </div>
                </div>
                <button
                    onClick={handleAddNew}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
                >
                    <AddIcon className="h-5 w-5" />
                    <span>Thêm phiếu</span>
                </button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã phiếu, mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white shadow-sm"
                />
            </div>

            {message && (
                <div
                    className={`mb-4 p-4 rounded-xl flex items-center gap-3 shadow-lg ${
                        message.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                    }`}
                >
                    {message.type === "success" ? <CheckCircleIcon className="h-5 w-5" /> : <ErrorIcon className="h-5 w-5" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {loading && vouchers.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-rose-500"></div>
                    <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                </div>
            ) : filteredVouchers.length === 0 ? (
                <div className="p-12 text-center">
                    <DiscountIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                        {searchTerm ? "Không tìm thấy phiếu giảm giá nào" : "Chưa có phiếu giảm giá nào"}
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STT</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mã phiếu</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Giá trị</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày áp dụng</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Số lượng</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredVouchers.map((voucher, index) => (
                                    <tr key={voucher.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{voucher.maPhieu}</div>
                                            <p className="text-xs text-gray-500 line-clamp-2">{voucher.moTa || "—"}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {voucher.kieuGiam === "percentage" ? `${voucher.giaTriGiam}%` : `${voucher.giaTriGiam.toLocaleString("vi-VN")}₫`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div>Từ: {formatDate(voucher.ngayBatDau)}</div>
                                            <div>Đến: {formatDate(voucher.ngayKetThuc)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{voucher.soLuong}</td>
                                        <td className="px-6 py-4 text-center">
                                            {(() => {
                                                const status = getVoucherStatus(voucher);
                                                return (
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${status.className}`}
                                                    >
                                                        {status.text}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(voucher)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                >
                                                    <EditIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(voucher)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <DeleteIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> đến{" "}
                            <span className="font-semibold">{Math.min(currentPage * pageSize, total)}</span> trong tổng số{" "}
                            <span className="font-semibold">{total}</span> phiếu
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700">Hiển thị:</label>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Trang đầu"
                            >
                                <FirstPageIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Trang trước"
                            >
                                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((page, index) =>
                                    page === "..." ? (
                                        <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === page
                                                    ? "bg-rose-500 text-white shadow-md"
                                                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Trang sau"
                            >
                                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Trang cuối"
                            >
                                <LastPageIcon className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </>
            )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40" onClick={handleCloseModal}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-white">
                                <DiscountIcon className="h-6 w-6" />
                                <h3 className="text-lg font-bold">{editingItem ? "Sửa phiếu giảm giá" : "Thêm phiếu giảm giá"}</h3>
                            </div>
                            <button onClick={handleCloseModal} className="text-white hover:bg-white/20 rounded-lg p-1 transition">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mã phiếu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.maPhieu}
                                        onChange={(e) => setFormData({ ...formData, maPhieu: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kiểu giảm</label>
                                    <select
                                        value={formData.kieuGiam}
                                        onChange={(e) => setFormData({ ...formData, kieuGiam: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="percentage">Giảm theo %</option>
                                        <option value="amount">Giảm theo số tiền</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giá trị giảm <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        {formData.kieuGiam === "percentage" ? (
                                            <input
                                                type="number"
                                                min={0}
                                                max={99}
                                                step={1}
                                                value={formData.giaTriGiam === 0 ? "" : formData.giaTriGiam}
                                                onChange={(e) => {
                                                    const { value } = e.target;
                                                    setFormData({
                                                        ...formData,
                                                        giaTriGiam: value === "" ? 0 : Number(value),
                                                    });
                                                    setGiaTriGiamDisplay(value);
                                                }}
                                                className="w-full pr-14 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                required
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={giaTriGiamDisplay}
                                                onChange={(e) => {
                                                    const { display, numericValue } = formatCurrencyInput(e.target.value);
                                                    setGiaTriGiamDisplay(display);
                                                    setFormData({ ...formData, giaTriGiam: numericValue });
                                                }}
                                                onBlur={() => {
                                                    setGiaTriGiamDisplay(
                                                        formData.giaTriGiam === 0
                                                            ? ""
                                                            : formData.giaTriGiam.toLocaleString("vi-VN")
                                                    );
                                                }}
                                                className="w-full pr-14 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                required
                                            />
                                        )}
                                        <span className="absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-gray-600">
                                            {formData.kieuGiam === "percentage" ? "%" : "₫"}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.kieuGiam === "percentage"
                                            ? "Nhập phần trăm giảm (0 - 100%)."
                                            : "Nhập số tiền giảm (VNĐ)."}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={formData.soLuong === 0 ? "" : formData.soLuong}
                                        onChange={(e) => {
                                            const { value } = e.target;
                                            setFormData({
                                                ...formData,
                                                soLuong: value === "" ? 0 : Number(value),
                                            });
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày bắt đầu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.ngayBatDau}
                                        onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày kết thúc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.ngayKetThuc}
                                        onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        required
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                    <textarea
                                        value={formData.moTa}
                                        onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                                        rows={3}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, trangThai: !prev.trangThai }))}
                                        className={`w-full px-4 py-3 rounded-xl font-semibold transition ${
                                            formData.trangThai
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                    >
                                        {formData.trangThai ? "Đang kích hoạt" : "Ngừng áp dụng"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    <CancelIcon className="h-5 w-5" />
                                    <span>Hủy</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : (
                                        <>
                                            <SaveIcon className="h-5 w-5" />
                                            <span>{editingItem ? "Cập nhật" : "Thêm mới"}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && voucherToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => {
                            setShowDeleteConfirm(false);
                            setVoucherToDelete(null);
                        }}
                    ></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <WarningAmberIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa</h3>
                                <p className="text-sm text-gray-500">Hành động này sẽ không thể hoàn tác.</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Bạn có chắc chắn muốn xóa phiếu <span className="font-semibold">{voucherToDelete.maPhieu}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setVoucherToDelete(null);
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Đang xóa..." : "Xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDiscount;

