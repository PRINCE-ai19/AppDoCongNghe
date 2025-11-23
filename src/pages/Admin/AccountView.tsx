import React, { useEffect, useMemo, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
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
    layTaiKhoanPhanTrang,
    xoaTaiKhoan,
    suaTaiKhoan,
    layTatCaLoaiTaiKhoan,
    type TaiKhoan,
    type TaiKhoanRequest,
    type LoaiTaiKhoan,
} from "../../services/repositories/TaiKhoan";

const AccountView: React.FC = () => {
    const [accounts, setAccounts] = useState<TaiKhoan[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<TaiKhoan | null>(null);
    const [loaiTaiKhoans, setLoaiTaiKhoans] = useState<LoaiTaiKhoan[]>([]);
    const [updatingAccountId, setUpdatingAccountId] = useState<number | null>(null);

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const loadAccounts = async (page: number = currentPage) => {
        setLoading(true);
        try {
            const res = await layTaiKhoanPhanTrang(page, pageSize);
            if (res.success && res.data) {
                setAccounts(res.data.items || []);
                setTotal(res.data.total || 0);
                setCurrentPage(res.data.page || page);
            } else {
                showMessage("error", res.message || "Không thể tải danh sách tài khoản.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi tải danh sách tài khoản.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts(1);
        loadLoaiTaiKhoans();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize]);

    const loadLoaiTaiKhoans = async () => {
        try {
            const res = await layTatCaLoaiTaiKhoan();
            console.log("API Response loại tài khoản:", res);
            if (res.success && res.data && Array.isArray(res.data)) {
                setLoaiTaiKhoans(res.data);
                console.log("Đã load loại tài khoản:", res.data);
            } else {
                console.warn("Không có dữ liệu loại tài khoản:", res);
            }
        } catch (error) {
            console.error("Lỗi khi tải loại tài khoản:", error);
        }
    };

    useEffect(() => {
        loadAccounts(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const filteredAccounts = useMemo(() => {
        if (!searchTerm.trim()) return accounts;
        const keyword = searchTerm.toLowerCase();
        return accounts.filter((acc) =>
            acc.hoTen.toLowerCase().includes(keyword) ||
            (acc.email && acc.email.toLowerCase().includes(keyword)) ||
            (acc.soDienThoai && acc.soDienThoai.toLowerCase().includes(keyword)) ||
            (acc.idLoaiTaiKhoanNavigation?.tenLoai &&
                acc.idLoaiTaiKhoanNavigation.tenLoai.toLowerCase().includes(keyword))
        );
    }, [accounts, searchTerm]);

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

    const handleLoaiTaiKhoanChange = async (account: TaiKhoan, newLoaiTaiKhoanId: number) => {
        if (account.idLoaiTaiKhoan === newLoaiTaiKhoanId) return;

        setUpdatingAccountId(account.id);
        try {
            const updateData: TaiKhoanRequest = {
                hoTen: account.hoTen,
                email: account.email,
                soDienThoai: account.soDienThoai || '',
                diaChi: account.diaChi || '',
                idLoaiTaiKhoan: newLoaiTaiKhoanId,
            };

            const res = await suaTaiKhoan(account.id, updateData);
            if (res.success) {
                showMessage("success", "Đã cập nhật loại tài khoản thành công!");
                loadAccounts(currentPage);
            } else {
                showMessage("error", res.message || "Không thể cập nhật loại tài khoản.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi cập nhật loại tài khoản.");
        } finally {
            setUpdatingAccountId(null);
        }
    };

    const handleDeleteClick = (account: TaiKhoan) => {
        setAccountToDelete(account);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!accountToDelete) return;
        setLoading(true);
        try {
            const res = await xoaTaiKhoan(accountToDelete.id);
            if (res.success) {
                showMessage("success", "Đã xóa tài khoản.");
                // Nếu xóa hết trang hiện tại thì lùi về trang trước
                const isLastItemOnPage = accounts.length === 1 && currentPage > 1;
                const nextPage = isLastItemOnPage ? currentPage - 1 : currentPage;
                setShowDeleteConfirm(false);
                setAccountToDelete(null);
                loadAccounts(nextPage);
            } else {
                showMessage("error", res.message || "Không thể xóa tài khoản.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi xóa tài khoản.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                        <PeopleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý tài khoản</h1>
                        <p className="text-sm text-gray-500">Xem, sửa và xóa tài khoản người dùng.</p>
                    </div>
                </div>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white shadow-sm"
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
                {loading && accounts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-violet-600"></div>
                        <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredAccounts.length === 0 ? (
                    <div className="p-12 text-center">
                        <PeopleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? "Không tìm thấy tài khoản nào" : "Chưa có tài khoản nào"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STT</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Họ tên</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Số điện thoại</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Địa chỉ</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Loại tài khoản</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAccounts.map((account, index) => (
                                        <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                                {(currentPage - 1) * pageSize + index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{account.hoTen}</div>
                                                {account.ngayTao && (
                                                    <div className="text-xs text-gray-500">
                                                        Tạo ngày: {new Date(account.ngayTao).toLocaleDateString("vi-VN")}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{account.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{account.soDienThoai || "—"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                                <p className="line-clamp-2">{account.diaChi || "—"}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {loaiTaiKhoans.length > 0 ? (
                                                    <select
                                                        value={account.idLoaiTaiKhoan || ''}
                                                        onChange={(e) => handleLoaiTaiKhoanChange(account, parseInt(e.target.value))}
                                                        disabled={updatingAccountId === account.id}
                                                        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-semibold bg-purple-50 text-purple-700 cursor-pointer hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                                                    >
                                                        {loaiTaiKhoans.map((loai) => (
                                                            <option key={loai.id} value={loai.id}>
                                                                {loai.tenLoai}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                                                        {account.idLoaiTaiKhoanNavigation?.tenLoai || "Không rõ"}
                                                    </span>
                                                )}
                                                {updatingAccountId === account.id && (
                                                    <span className="ml-2 text-xs text-gray-500">Đang cập nhật...</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleDeleteClick(account)}
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
                                trong tổng số <span className="font-semibold">{total}</span> tài khoản
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700">Hiển thị:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
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
                                                        ? "bg-violet-600 text-white shadow-md"
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

            {showDeleteConfirm && accountToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => {
                            setShowDeleteConfirm(false);
                            setAccountToDelete(null);
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
                            Bạn có chắc chắn muốn xóa tài khoản{" "}
                            <span className="font-semibold">{accountToDelete.hoTen}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setAccountToDelete(null);
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

export default AccountView;

