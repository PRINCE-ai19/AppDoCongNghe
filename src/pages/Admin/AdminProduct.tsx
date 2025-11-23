import React, { useState, useEffect, useRef } from "react";
import {
    laySanPhamPhanTrang,
    themSanPham,
    suaSanPham,
    xoaSanPham,
    type SanPham,
    type SanPhamRequest,
    type SanPhamImage,
    xoaAnhSanPham,
} from "../../services/repositories/SanPham";
import {
    LayTatCaDanhMuc,
    type DanhMuc,
} from "../../services/repositories/DanhMuc";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
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
import ImageIcon from '@mui/icons-material/Image';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const AdminProduct = () => {
    const [sanPhamList, setSanPhamList] = useState<SanPham[]>([]);
    const [danhMucList, setDanhMucList] = useState<DanhMuc[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<SanPham | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<SanPham | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    // Form state
    const [formData, setFormData] = useState<SanPhamRequest>({
        tenSanPham: "",
        danhMucId: undefined,
        thuongHieu: "",
        gia: 0,
        soLuongTon: 0,
        moTa: "",
        hinhanh: [],
    });

    // Preview cho ảnh mới thêm tạm thời
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    
    // Ảnh hiện có (từ server) kèm id để xoá
    const [existingImages, setExistingImages] = useState<SanPhamImage[]>([]);
    
    // State để lưu giá trị hiển thị của giá (có dấu phẩy)
    const [giaDisplay, setGiaDisplay] = useState<string>('');

    const revokePreviewUrls = (urls: string[]) => {
        urls.forEach(url => {
            if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
    };

    // Ref để track lần mount đầu tiên
    const isMountedRef = useRef(false);
    const pageSizeChangedRef = useRef(false);

    // Hàm format số với dấu phẩy phân cách hàng nghìn
    const formatNumber = (num: number | string): string => {
        if (!num || num === 0 || num === '0' || num === '') return '';
        const numStr = typeof num === 'number' ? num.toString() : num;
        // Loại bỏ dấu phẩy nếu có
        const cleanStr = numStr.replace(/,/g, '');
        // Chia phần nguyên và phần thập phân
        const parts = cleanStr.split('.');
        // Format phần nguyên với dấu phẩy
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    // Load danh sách danh mục
    const loadDanhMuc = async () => {
        try {
            const res = await LayTatCaDanhMuc();
        if (res.success) {
                setDanhMucList(res.data || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    // Load danh sách sản phẩm với phân trang
    const loadSanPham = async (page: number = currentPage) => {
        setLoading(true);
        try {
            const res = await laySanPhamPhanTrang(page, pageSize);
            if (res.success && res.data) {
                setSanPhamList(res.data.items || []);
                setTotal(res.data.total || 0);
                setCurrentPage(res.data.page || page);
            } else {
                showMessage('error', res.message || 'Không thể tải danh sách sản phẩm');
            }
        } catch (error) {
            showMessage('error', 'Lỗi khi tải danh sách sản phẩm');
        } finally {
        setLoading(false);
        }
    };

    // Load danh mục khi component mount (chỉ 1 lần)
    useEffect(() => {
        loadDanhMuc();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Xử lý khi pageSize thay đổi - reset về trang 1
    useEffect(() => {
        if (!isMountedRef.current) return; // Bỏ qua lần mount đầu
        pageSizeChangedRef.current = true;
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize]);

    // Load sản phẩm khi currentPage hoặc pageSize thay đổi
    useEffect(() => {
        // Lần mount đầu tiên
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            loadSanPham(1);
            return;
        }

        // Nếu pageSize thay đổi và đã reset currentPage về 1
        if (pageSizeChangedRef.current && currentPage === 1) {
            pageSizeChangedRef.current = false;
            loadSanPham(1);
            return;
        }

        // Các trường hợp khác (chuyển trang)
        if (currentPage > 0) {
            loadSanPham(currentPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    // Hiển thị thông báo
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    // Mở modal thêm mới
    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            tenSanPham: "",
            danhMucId: undefined,
            thuongHieu: "",
            gia: 0,
            soLuongTon: 0,
            moTa: "",
            hinhanh: [],
        });
        setGiaDisplay('');
        revokePreviewUrls(newImagePreviews);
        setNewImagePreviews([]);
        setExistingImages([]);
        setShowModal(true);
    };

    // Mở modal sửa
    const handleEdit = (item: SanPham) => {
        setEditingItem(item);
        setFormData({
            tenSanPham: item.tenSanPham,
            danhMucId: danhMucList.find(dm => dm.tenDanhMuc === item.danhMuc)?.id,
            thuongHieu: item.thuongHieu || "",
            gia: item.gia,
            soLuongTon: item.soLuongTon || 0,
            moTa: item.moTa || "",
            hinhanh: [],
        });
        // Format giá để hiển thị
        setGiaDisplay(item.gia ? formatNumber(item.gia) : '');
        // Hiển thị ảnh hiện tại nếu có
        setExistingImages(item.hinhAnh || []);
        revokePreviewUrls(newImagePreviews);
        setNewImagePreviews([]);
        setShowModal(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        // Cleanup object URLs để tránh memory leak
        revokePreviewUrls(newImagePreviews);
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            tenSanPham: "",
            danhMucId: undefined,
            thuongHieu: "",
            gia: 0,
            soLuongTon: 0,
            moTa: "",
            hinhanh: [],
        });
        setGiaDisplay('');
        setNewImagePreviews([]);
        setExistingImages([]);
    };

    // Xử lý chọn file ảnh (từ input hoặc drag & drop)
    const handleImageFiles = (files: FileList | File[]) => {
        const fileArray = Array.isArray(files) ? files : Array.from(files);
        if (fileArray.length > 0) {
            setFormData(prev => ({
                ...prev,
                hinhanh: [...(prev.hinhanh || []), ...fileArray],
            }));

            const newPreviews = fileArray.map(file => URL.createObjectURL(file));
            setNewImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    // Xử lý chọn file ảnh từ input
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            handleImageFiles(files);
        }
        // Reset input để có thể chọn lại file cùng tên
        e.target.value = '';
    };

    // Xử lý drag & drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // Lọc chỉ lấy file ảnh
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
            if (imageFiles.length > 0) {
                handleImageFiles(imageFiles);
            }
        }
    };

    // Xóa ảnh mới thêm (chưa upload)
    const handleRemoveNewImage = (index: number) => {
        setNewImagePreviews(prev => {
            const target = prev[index];
            if (target && target.startsWith('blob:')) {
                URL.revokeObjectURL(target);
            }
            return prev.filter((_, i) => i !== index);
        });

        setFormData(prev => {
            if (!prev.hinhanh || prev.hinhanh.length <= index) {
                return prev;
            }
            const newFiles = prev.hinhanh.filter((_, i) => i !== index);
            return { ...prev, hinhanh: newFiles };
        });
    };

    // Xóa ảnh hiện có trên server
    const handleDeleteExistingImage = async (imageId: number) => {
        if (!imageId || imageId < 0) return;

        setLoading(true);
        try {
            const res = await xoaAnhSanPham(imageId);
            if (res.success) {
                setExistingImages(prev => prev.filter(img => img.id !== imageId));
                showMessage('success', 'Đã xóa ảnh sản phẩm');
            } else {
                showMessage('error', res.message || 'Không thể xóa ảnh');
            }
        } catch (error) {
            showMessage('error', 'Có lỗi xảy ra khi xóa ảnh');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý submit form (thêm/sửa)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tenSanPham.trim()) {
            showMessage('error', 'Vui lòng nhập tên sản phẩm');
            return;
        }
        if (!formData.danhMucId) {
            showMessage('error', 'Vui lòng chọn danh mục');
            return;
        }
        if (formData.gia <= 0) {
            showMessage('error', 'Vui lòng nhập giá hợp lệ');
            return;
        }

        setLoading(true);
        try {
            const payload: SanPhamRequest = {
                tenSanPham: formData.tenSanPham.trim(),
                danhMucId: formData.danhMucId,
                thuongHieu: formData.thuongHieu?.trim() || undefined,
                gia: formData.gia,
                soLuongTon: formData.soLuongTon,
                moTa: formData.moTa?.trim() || undefined,
                hinhanh: formData.hinhanh && formData.hinhanh.length > 0 ? formData.hinhanh : undefined,
            };

            const res = editingItem
                ? await suaSanPham(editingItem.id, payload)
                : await themSanPham(payload);

            if (res.success) {
                showMessage('success', editingItem ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
                handleCloseModal();
                loadSanPham(currentPage);
            } else {
                showMessage('error', res.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            showMessage('error', 'Có lỗi xảy ra khi lưu sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý xóa
    const handleDeleteClick = (item: SanPham) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        setLoading(true);
        try {
            const res = await xoaSanPham(itemToDelete.id);
            if (res.success) {
                showMessage('success', 'Xóa sản phẩm thành công!');
                loadSanPham(currentPage);
            } else {
                showMessage('error', res.message || 'Không thể xóa sản phẩm');
            }
        } catch (error) {
            showMessage('error', 'Có lỗi xảy ra khi xóa sản phẩm');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    // Lọc danh sách theo search term (client-side filtering)
    const filteredList = sanPhamList.filter((item) =>
        item.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.thuongHieu && item.thuongHieu.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.moTa && item.moTa.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Tính toán số trang
    const totalPages = Math.ceil(total / pageSize);

    // Tạo danh sách số trang để hiển thị
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
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
                            <InventoryIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản Lý Sản Phẩm</h1>
                            <p className="text-sm text-gray-500">Thêm, sửa, xóa sản phẩm</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                    >
                        <AddIcon className="h-5 w-5" />
                        <span>Thêm Sản Phẩm</span>
                </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
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
                {loading && sanPhamList.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
                        <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="p-12 text-center">
                        <InventoryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
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
                                        Hình Ảnh
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Tên Sản Phẩm
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Danh Mục
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Thương Hiệu
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Giá
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Số Lượng
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
                                            {item.hinhAnhDaiDien ? (
                                                <img
                                                    src={item.hinhAnhDaiDien}
                                                    alt={item.tenSanPham}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {item.tenSanPham}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {item.danhMuc || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.thuongHieu || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                                            {item.gia.toLocaleString('vi-VN')} ₫
                                </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {item.soLuongTon || 0}
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
                                trong tổng số <span className="font-semibold">{total}</span> sản phẩm
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
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <InventoryIcon className="h-6 w-6 text-white" />
                                    <h3 className="text-xl font-bold text-white">
                                        {editingItem ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
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
                            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Tên Sản Phẩm */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tên Sản Phẩm <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.tenSanPham}
                                            onChange={(e) =>
                                                setFormData({ ...formData, tenSanPham: e.target.value })
                                            }
                                            required
                                            placeholder="Nhập tên sản phẩm"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Danh Mục */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Danh Mục <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.danhMucId || ""}
                                            onChange={(e) =>
                                                setFormData({ ...formData, danhMucId: e.target.value ? Number(e.target.value) : undefined })
                                            }
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {danhMucList.map((dm) => (
                                                <option key={dm.id} value={dm.id}>
                                                    {dm.tenDanhMuc}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Thương Hiệu */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Thương Hiệu
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.thuongHieu || ""}
                                            onChange={(e) =>
                                                setFormData({ ...formData, thuongHieu: e.target.value })
                                            }
                                            placeholder="Nhập thương hiệu"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Giá */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Giá <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={giaDisplay}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                // Loại bỏ tất cả dấu phẩy và khoảng trắng để xử lý
                                                value = value.replace(/,/g, '').replace(/\s/g, '');
                                                
                                                // Chỉ cho phép số và một dấu chấm
                                                const parts = value.split('.');
                                                if (parts.length > 2) {
                                                    value = parts[0] + '.' + parts.slice(1).join('');
                                                }
                                                value = value.replace(/[^0-9.]/g, '');
                                                
                                                // Loại bỏ số 0 ở đầu (trừ khi là "0" hoặc bắt đầu bằng "0.")
                                                if (value.length > 1) {
                                                    if (value.startsWith('0') && value[1] !== '.') {
                                                        value = value.replace(/^0+/, '');
                                                        if (value === '' || value === '.') {
                                                            value = '0';
                                                        }
                                                    }
                                                }
                                                
                                                // Chuyển đổi sang số
                                                const numValue = value === '' || value === '.' ? 0 : parseFloat(value);
                                                const finalValue = isNaN(numValue) ? 0 : (numValue >= 0 ? numValue : 0);
                                                
                                                // Cập nhật state với số thuần (không có dấu phẩy)
                                                setFormData({ ...formData, gia: finalValue });
                                                
                                                // Format và cập nhật giá trị hiển thị
                                                if (finalValue === 0) {
                                                    setGiaDisplay('');
                                                } else {
                                                    setGiaDisplay(formatNumber(value));
                                                }
                                            }}
                                            onBlur={(e) => {
                                                // Khi blur, đảm bảo giá trị hợp lệ và format lại
                                                const numValue = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                                                setFormData({ ...formData, gia: numValue >= 0 ? numValue : 0 });
                                                setGiaDisplay(numValue === 0 ? '' : formatNumber(numValue));
                                            }}
                                            required
                                            placeholder="Nhập giá (ví dụ: 1,000,000)"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Số Lượng */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số Lượng Tồn
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.soLuongTon === 0 ? '' : (formData.soLuongTon || 0).toString()}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                // Chỉ cho phép số (không có dấu chấm cho số lượng)
                                                value = value.replace(/[^0-9]/g, '');
                                                
                                                // Loại bỏ số 0 ở đầu (trừ khi chỉ có "0")
                                                if (value.length > 1 && value.startsWith('0')) {
                                                    // Loại bỏ tất cả số 0 ở đầu
                                                    value = value.replace(/^0+/, '');
                                                    // Nếu sau khi loại bỏ hết thì giữ lại "0"
                                                    if (value === '') {
                                                        value = '0';
                                                    }
                                                }
                                                
                                                // Chuyển đổi sang số nguyên
                                                const numValue = value === '' ? 0 : parseInt(value, 10);
                                                setFormData({ ...formData, soLuongTon: isNaN(numValue) ? 0 : (numValue >= 0 ? numValue : 0) });
                                            }}
                                            onBlur={(e) => {
                                                // Khi blur, đảm bảo giá trị hợp lệ
                                                const numValue = parseInt(e.target.value, 10) || 0;
                                                setFormData({ ...formData, soLuongTon: numValue >= 0 ? numValue : 0 });
                                            }}
                                            placeholder="Nhập số lượng"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Mô Tả */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mô Tả
                                        </label>
                                        <textarea
                                            value={formData.moTa || ""}
                                            onChange={(e) =>
                                                setFormData({ ...formData, moTa: e.target.value })
                                            }
                                            placeholder="Nhập mô tả sản phẩm"
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    {/* Upload Ảnh */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Hình Ảnh
                                        </label>
                                        <div 
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-400 transition-colors"
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="flex flex-col items-center justify-center cursor-pointer"
                                            >
                                                <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">
                                                    Click để chọn ảnh hoặc kéo thả ảnh vào đây
                                                </span>
                                                <span className="text-xs text-gray-500 mt-1">
                                                    (Có thể chọn nhiều ảnh)
                                                </span>
                                            </label>
                                        </div>

                                        {existingImages.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Ảnh hiện tại</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {existingImages.map((img) => (
                                                        <div key={img.id} className="relative group">
                                                            <img
                                                                src={img.hinhAnh}
                                                                alt="Ảnh sản phẩm"
                                                                className="w-full h-24 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteExistingImage(img.id)}
                                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <DeleteForeverIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {newImagePreviews.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Ảnh mới sẽ tải lên</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {newImagePreviews.map((preview, index) => (
                                                        <div key={`new-${index}`} className="relative group">
                                                            <img
                                                                src={preview}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveNewImage(index)}
                                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <DeleteForeverIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                Bạn có chắc chắn muốn xóa sản phẩm <strong>"{itemToDelete.tenSanPham}"</strong>?
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

export default AdminProduct;
