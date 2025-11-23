import React, { useState, useEffect } from "react";
import {
    layDanhMucPhanTrang,
    themDanhMuc,
    suaDanhMuc,
    xoaDanhMuc,
    type DanhMuc,
    type DanhMucRequest,
} from "../../services/repositories/DanhMuc";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const AdminCategoryView = () => {
    const [danhMucList, setDanhMucList] = useState<DanhMuc[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<DanhMuc | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<DanhMuc | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // Form state
    const [formData, setFormData] = useState<DanhMucRequest>({
        tenDanhMuc: "",
        moTa: "",
        viTri: 0,
    });

    // Load danh sách danh mục với phân trang
    const loadDanhMuc = async (page: number = currentPage) => {
        setLoading(true);
        try {
            const res = await layDanhMucPhanTrang(page, pageSize);
            if (res.success && res.data) {
                setDanhMucList(res.data.items || []);
                setTotal(res.data.total || 0);
                setCurrentPage(res.data.page || page);
            } else {
                showMessage('error', res.message || 'Không thể tải danh sách danh mục');
            }
        } catch (error) {
            showMessage('error', 'Lỗi khi tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    // Load dữ liệu khi component mount
    useEffect(() => {
        loadDanhMuc(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load khi thay đổi pageSize
    useEffect(() => {
        setCurrentPage(1);
        loadDanhMuc(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize]);

    // Load khi thay đổi trang
    useEffect(() => {
        if (currentPage > 0) {
            loadDanhMuc(currentPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    // Hiển thị thông báo
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    // Mở modal thêm mới
    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            tenDanhMuc: "",
            moTa: "",
            viTri: 0,
        });
        setShowModal(true);
    };

    // Mở modal sửa
    const handleEdit = (item: DanhMuc) => {
        setEditingItem(item);
        setFormData({
            tenDanhMuc: item.tenDanhMuc,
            moTa: item.moTa || "",
            viTri: item.viTri,
        });
        setShowModal(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            tenDanhMuc: "",
            moTa: "",
            viTri: 0,
        });
    };

    // Xử lý submit form (thêm/sửa)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tenDanhMuc.trim()) {
            showMessage('error', 'Vui lòng nhập tên danh mục');
            return;
        }

        setLoading(true);
        try {
            let res;
            if (editingItem) {
                // Sửa
                res = await suaDanhMuc(editingItem.id, formData);
            } else {
                // Thêm mới
                res = await themDanhMuc(formData);
            }

            if (res.success) {
                showMessage('success', editingItem ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!');
                handleCloseModal();
                loadDanhMuc();
            } else {
                showMessage('error', res.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            showMessage('error', 'Có lỗi xảy ra khi lưu danh mục');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý xóa
    const handleDeleteClick = (item: DanhMuc) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        setLoading(true);
        try {
            const res = await xoaDanhMuc(itemToDelete.id);
            if (res.success) {
                showMessage('success', 'Xóa danh mục thành công!');
                loadDanhMuc();
            } else {
                showMessage('error', res.message || 'Không thể xóa danh mục');
            }
        } catch (error) {
            showMessage('error', 'Có lỗi xảy ra khi xóa danh mục');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    // Lọc danh sách theo search term (client-side filtering)
    const filteredList = danhMucList.filter((item) =>
        item.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.moTa && item.moTa.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Tính toán số trang
    const totalPages = Math.ceil(total / pageSize);

    // Tạo danh sách số trang để hiển thị
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5; // Số trang tối đa hiển thị

        if (totalPages <= maxVisible) {
            // Nếu tổng số trang <= maxVisible, hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Hiển thị logic: [1] ... [current-1] [current] [current+1] ... [total]
            if (currentPage <= 3) {
                // Gần đầu
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Gần cuối
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Ở giữa
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    // Xử lý chuyển trang
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <CategoryIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản Lý Danh Mục</h1>
                            <p className="text-sm text-gray-500">Thêm, sửa, xóa danh mục sản phẩm</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                    >
                        <AddIcon className="h-5 w-5" />
                        <span>Thêm Danh Mục</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    />
                </div>
            </div>

            {/* Message Alert */}
            {message && (
                <div
                    className={`mb-4 p-4 rounded-xl flex items-center gap-3 shadow-lg ${
                        message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                        <ErrorIcon className="h-5 w-5" />
                    )}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* Table/List */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {loading && danhMucList.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
                        <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="p-12 text-center">
                        <CategoryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
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
                                        Tên Danh Mục
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Mô Tả
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Vị Trí
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Thao Tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredList.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {item.tenDanhMuc}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 max-w-md truncate">
                                                {item.moTa || <span className="text-gray-400">Không có mô tả</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {item.viTri}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Info */}
                            <div className="text-sm text-gray-700">
                                Hiển thị <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> đến{' '}
                                <span className="font-semibold">
                                    {Math.min(currentPage * pageSize, total)}
                                </span>{' '}
                                trong tổng số <span className="font-semibold">{total}</span> danh mục
                            </div>

                            {/* Page Size Selector */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700">Hiển thị:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
        </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-2">
                                {/* First Page */}
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Trang đầu"
                                >
                                    <FirstPageIcon className="h-5 w-5 text-gray-600" />
                                </button>

                                {/* Previous Page */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Trang trước"
                                >
                                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {getPageNumbers().map((page, index) => {
                                        if (page === '...') {
                                            return (
                                                <span
                                                    key={`ellipsis-${index}`}
                                                    className="px-2 text-gray-500"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }
                                        const pageNum = page as number;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Next Page */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Trang sau"
                                >
                                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                                </button>

                                {/* Last Page */}
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

            {/* Modal Thêm/Sửa */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={handleCloseModal}
                        ></div>

                        {/* Modal Panel */}
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CategoryIcon className="h-6 w-6 text-white" />
                                    <h3 className="text-xl font-bold text-white">
                                        {editingItem ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                                    </h3>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                                >
                                    <CloseIcon className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên Danh Mục <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tenDanhMuc}
                                        onChange={(e) =>
                                            setFormData({ ...formData, tenDanhMuc: e.target.value })
                                        }
                                        required
                                        placeholder="Nhập tên danh mục"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô Tả
                                    </label>
                                    <textarea
                                        value={formData.moTa || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, moTa: e.target.value })
                                        }
                                        placeholder="Nhập mô tả (tùy chọn)"
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vị Trí
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.viTri || 0}
                                        onChange={(e) =>
                                            setFormData({ ...formData, viTri: parseInt(e.target.value) || 0 })
                                        }
                                        min="0"
                                        placeholder="Nhập vị trí"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Buttons */}
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
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                <span>Đang xử lý...</span>
                                            </>
                                        ) : (
                                            <>
                                                <SaveIcon className="h-5 w-5" />
                                                <span>{editingItem ? 'Cập Nhật' : 'Thêm Mới'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Dialog */}
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
                                    <h3 className="text-lg font-bold text-gray-900">Xác Nhận Xóa</h3>
                                    <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-6">
                                Bạn có chắc chắn muốn xóa danh mục <strong>"{itemToDelete.tenDanhMuc}"</strong>?
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
                                    {loading ? 'Đang xóa...' : 'Xóa'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoryView;
