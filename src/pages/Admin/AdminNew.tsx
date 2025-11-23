import React, { useEffect, useRef, useState } from "react";
import ArticleIcon from "@mui/icons-material/Article";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ImageIcon from "@mui/icons-material/Image";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
    layTinTucPhanTrang,
    themTinTuc,
    suaTinTuc,
    xoaTinTuc,
    type TinTuc,
    type TinTucRequest,
} from "../../services/repositories/TinTuc";

type MessageState = { type: "success" | "error"; text: string } | null;

const initialFormState: TinTucRequest = {
    tieuDe: "",
    moTa: "",
    noiDung: "",
    hienThi: true,
};

const AdminNew = () => {
    const [tinTucList, setTinTucList] = useState<TinTuc[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<TinTuc | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<TinTuc | null>(null);
    const [message, setMessage] = useState<MessageState>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    const [formData, setFormData] = useState<TinTucRequest>(initialFormState);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const objectUrlRef = useRef<string | null>(null);

    const isMountedRef = useRef(false);
    const pageSizeChangedRef = useRef(false);

    const resetForm = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
        setFormData(initialFormState);
        setPreviewImage(null);
    };

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const loadTinTuc = async (page: number = currentPage) => {
        setLoading(true);
        try {
            const res = await layTinTucPhanTrang(page, pageSize);
            if (res.success && res.data) {
                setTinTucList(res.data.items || []);
                setTotal(res.data.total || 0);
                setCurrentPage(res.data.page || page);
            } else {
                showMessage("error", res.message || "Không thể tải danh sách tin tức");
            }
        } catch (error) {
            console.error("loadTinTuc error", error);
            showMessage("error", "Có lỗi xảy ra khi tải tin tức");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            loadTinTuc(1);
            return;
        }

        if (pageSizeChangedRef.current) {
            pageSizeChangedRef.current = false;
            loadTinTuc(1);
            return;
        }

        loadTinTuc(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    useEffect(() => {
        if (!isMountedRef.current) return;
        pageSizeChangedRef.current = true;
        setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize]);

    const handleAddNew = () => {
        setEditingItem(null);
        resetForm();
        setShowModal(true);
    };

    const handleEdit = (item: TinTuc) => {
        setEditingItem(item);
        resetForm();
        setFormData({
            tieuDe: item.tieuDe,
            moTa: item.moTa || "",
            noiDung: item.noiDung || "",
            hienThi: item.hienThi ?? true,
        });
        if (item.image) {
            setPreviewImage(item.image);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        resetForm();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        const url = URL.createObjectURL(file);
        objectUrlRef.current = url;
        setPreviewImage(url);
        setFormData((prev) => ({ ...prev, image: file }));

        e.target.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tieuDe.trim()) {
            showMessage("error", "Vui lòng nhập tiêu đề");
            return;
        }

        setLoading(true);
        try {
            const payload: TinTucRequest = {
                ...formData,
                tieuDe: formData.tieuDe.trim(),
                moTa: formData.moTa?.trim() || undefined,
                noiDung: formData.noiDung?.trim() || undefined,
            };

            const res = editingItem
                ? await suaTinTuc(editingItem.id, payload)
                : await themTinTuc(payload);

            if (res.success) {
                showMessage("success", editingItem ? "Cập nhật tin tức thành công!" : "Thêm tin tức thành công!");
                handleCloseModal();
                loadTinTuc(currentPage);
            } else {
                showMessage("error", res.message || "Không thể lưu tin tức");
            }
        } catch (error) {
            console.error("handleSubmit error", error);
            showMessage("error", "Có lỗi xảy ra trong quá trình lưu");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item: TinTuc) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setLoading(true);
        try {
            const res = await xoaTinTuc(itemToDelete.id);
            if (res.success) {
                showMessage("success", "Xóa tin tức thành công!");
                loadTinTuc(currentPage);
            } else {
                showMessage("error", res.message || "Không thể xóa tin tức");
            }
        } catch (error) {
            console.error("handleConfirmDelete error", error);
            showMessage("error", "Có lỗi xảy ra khi xóa tin tức");
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    const filteredList = tinTucList.filter((item) => {
        const keyword = searchTerm.toLowerCase();
        return (
            item.tieuDe.toLowerCase().includes(keyword) ||
            (item.moTa && item.moTa.toLowerCase().includes(keyword)) ||
            (item.noiDung && item.noiDung.toLowerCase().includes(keyword))
        );
    });

    const totalPages = Math.ceil(total / pageSize) || 1;

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

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(date);
        } catch {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <ArticleIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản Lý Tin Tức</h1>
                            <p className="text-sm text-gray-500">Thêm, sửa, xóa tin tức</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                    >
                        <AddIcon className="h-5 w-5" />
                        <span>Thêm Tin Tức</span>
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tin tức..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white shadow-sm"
                    />
                </div>
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
                {loading && tinTucList.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-rose-500"></div>
                        <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="p-12 text-center">
                        <ArticleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? "Không tìm thấy tin tức nào" : "Chưa có tin tức nào"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        STT
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Hình ảnh
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Tiêu đề
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Mô tả
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Hiển thị
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Ngày sửa
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredList.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.tieuDe}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{item.tieuDe}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">
                                            <p className="line-clamp-3">{item.moTa || "—"}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                                    item.hienThi
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {item.hienThi ? (
                                                    <>
                                                        <VisibilityIcon className="h-4 w-4" /> Hiển thị
                                                    </>
                                                ) : (
                                                    <>
                                                        <VisibilityOffIcon className="h-4 w-4" /> Ẩn
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {formatDate(item.ngayTao)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {formatDate(item.ngaySua)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <EditIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
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
                )}

                {total > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-700">
                                Hiển thị{" "}
                                <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> đến{" "}
                                <span className="font-semibold">
                                    {Math.min(currentPage * pageSize, total)}
                                </span>{" "}
                                trong tổng số <span className="font-semibold">{total}</span> tin tức
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700">Hiển thị:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                    }}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Trang đầu"
                                >
                                    <FirstPageIcon className="h-5 w-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                                key={page as number}
                                                onClick={() => handlePageChange(page as number)}
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
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Trang sau"
                                >
                                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Trang cuối"
                                >
                                    <LastPageIcon className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseModal}></div>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ArticleIcon className="h-6 w-6 text-white" />
                                    <h3 className="text-xl font-bold text-white">
                                        {editingItem ? "Sửa Tin Tức" : "Thêm Tin Tức Mới"}
                                    </h3>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                                >
                                    <CloseIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tiêu đề <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.tieuDe}
                                            onChange={(e) => setFormData({ ...formData, tieuDe: e.target.value })}
                                            required
                                            placeholder="Nhập tiêu đề tin tức"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn</label>
                                        <textarea
                                            value={formData.moTa || ""}
                                            onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                                            placeholder="Nhập mô tả (tối đa 300 ký tự)"
                                            maxLength={300}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                                        <textarea
                                            value={formData.noiDung || ""}
                                            onChange={(e) => setFormData({ ...formData, noiDung: e.target.value })}
                                            placeholder="Nhập nội dung chi tiết"
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm font-medium text-gray-700">Trạng thái hiển thị</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({ ...prev, hienThi: !(prev.hienThi ?? true) }))
                                            }
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                                formData.hienThi
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-200 text-gray-700"
                                            }`}
                                        >
                                            {formData.hienThi ? (
                                                <>
                                                    <VisibilityIcon className="h-4 w-4" />
                                                    Đang hiển thị
                                                </>
                                            ) : (
                                                <>
                                                    <VisibilityOffIcon className="h-4 w-4" />
                                                    Đang ẩn
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-rose-400 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                id="news-image-upload"
                                            />
                                            <label
                                                htmlFor="news-image-upload"
                                                className="flex flex-col items-center justify-center cursor-pointer"
                                            >
                                                <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">Click để chọn ảnh</span>
                                                <span className="text-xs text-gray-500 mt-1">Kích thước khuyến nghị 800x400px</span>
                                            </label>
                                        </div>
                                        {previewImage && (
                                            <div className="mt-4 relative group">
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-xl border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (objectUrlRef.current) {
                                                            URL.revokeObjectURL(objectUrlRef.current);
                                                            objectUrlRef.current = null;
                                                        }
                                                        setPreviewImage(null);
                                                        setFormData((prev) => ({ ...prev, image: undefined }));
                                                    }}
                                                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <DeleteForeverIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        <CancelIcon className="h-5 w-5" />
                                        <span>Hủy</span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                </div>
            )}

            {showDeleteConfirm && itemToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setItemToDelete(null);
                            }}
                        ></div>

                        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <DeleteIcon className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa</h3>
                                    <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-6">
                                Bạn có chắc chắn muốn xóa tin tức <strong>"{itemToDelete.tieuDe}"</strong>?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setItemToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Đang xóa..." : "Xóa"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNew;

