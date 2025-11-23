import React, { useEffect, useMemo, useState } from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
    layGioHangPhanTrang,
    xoaGioHang,
    type GioHang,
} from "../../services/repositories/GioHang";

const AdminCart: React.FC = () => {
    const [carts, setCarts] = useState<GioHang[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [cartToDelete, setCartToDelete] = useState<GioHang | null>(null);

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const loadCarts = async (page: number = currentPage) => {
        setLoading(true);
        try {
            const res = await layGioHangPhanTrang(page, pageSize);
            if (res.success && res.data) {
                setCarts(res.data.items || []);
                setTotal(res.data.total || 0);
                setCurrentPage(res.data.page || page);
            } else {
                showMessage("error", res.message || "Không thể tải danh sách giỏ hàng.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi tải danh sách giỏ hàng.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCarts(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize]);

    useEffect(() => {
        loadCarts(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const filteredCarts = useMemo(() => {
        if (!searchTerm.trim()) return carts;
        const keyword = searchTerm.toLowerCase();
        return carts.filter((cart) =>
            cart.taiKhoan?.hoTen?.toLowerCase().includes(keyword) ||
            cart.taiKhoan?.email?.toLowerCase().includes(keyword) ||
            cart.id.toString().includes(keyword) ||
            (cart.taiKhoanId && cart.taiKhoanId.toString().includes(keyword))
        );
    }, [carts, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }
        return pages;
    };

    const handleDeleteClick = (cart: GioHang) => {
        setCartToDelete(cart);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!cartToDelete) return;
        setLoading(true);
        try {
            const res = await xoaGioHang(cartToDelete.id);
            if (res.success) {
                showMessage("success", "Đã xóa giỏ hàng.");
                // Nếu xóa hết trang hiện tại thì lùi về trang trước
                const isLastItemOnPage = carts.length === 1 && currentPage > 1;
                const nextPage = isLastItemOnPage ? currentPage - 1 : currentPage;
                setShowDeleteConfirm(false);
                setCartToDelete(null);
                loadCarts(nextPage);
            } else {
                showMessage("error", res.message || "Không thể xóa giỏ hàng.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi xóa giỏ hàng.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN");
        } catch {
            return "—";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                        <ShoppingCartIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý giỏ hàng</h1>
                        <p className="text-sm text-gray-500">Xem và xóa giỏ hàng của người dùng.</p>
                    </div>
                </div>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo ID, tên user, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
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
                    {message.type === "success" ? (
                        <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                        <ErrorIcon className="h-5 w-5" />
                    )}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {loading && carts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
                        <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredCarts.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? "Không tìm thấy giỏ hàng nào" : "Chưa có giỏ hàng nào"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STT</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID Giỏ hàng</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Người dùng</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày tạo</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCarts.map((cart, index) => (
                                        <tr key={cart.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                                {(currentPage - 1) * pageSize + index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{cart.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {cart.taiKhoan?.hoTen || `User ID: ${cart.taiKhoanId || "N/A"}`}
                                                </div>
                                                {cart.taiKhoanId && !cart.taiKhoan?.hoTen && (
                                                    <div className="text-xs text-gray-500">ID: {cart.taiKhoanId}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {cart.taiKhoan?.email || "—"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {formatDate(cart.ngayTao)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteClick(cart)}
                                                    className="inline-flex items-center gap-1 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                                                >
                                                    <DeleteIcon className="h-4 w-4" />
                                                    <span>Xóa</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-gray-700">
                                Hiển thị{" "}
                                <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> đến{" "}
                                <span className="font-semibold">{Math.min(currentPage * pageSize, total)}</span>{" "}
                                trong tổng số <span className="font-semibold">{total}</span> giỏ hàng
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700">Hiển thị:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                                        ? "bg-blue-600 text-white shadow-md"
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

            {showDeleteConfirm && cartToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => {
                            setShowDeleteConfirm(false);
                            setCartToDelete(null);
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
                            Bạn có chắc chắn muốn xóa giỏ hàng{" "}
                            <span className="font-semibold">#{cartToDelete.id}</span>
                            {cartToDelete.taiKhoan?.hoTen && (
                                <> của <span className="font-semibold">{cartToDelete.taiKhoan.hoTen}</span></>
                            )}
                            ?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setCartToDelete(null);
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

export default AdminCart;

