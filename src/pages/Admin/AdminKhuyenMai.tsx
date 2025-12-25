import React, { useEffect, useMemo, useState } from "react";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
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
import InventoryIcon from "@mui/icons-material/Inventory";
import RemoveIcon from "@mui/icons-material/Remove";
import {
    layKhuyenMaiPhanTrang,
    taoKhuyenMai,
    capNhatKhuyenMai,
    xoaKhuyenMai,
    ganSanPhamKhuyenMai,
    xoaSanPhamKhoiKhuyenMai,
    laySanPhamTrongKhuyenMai,
    layTatCaKhuyenMai,
    type KhuyenMai,
    type KhuyenMaiRequest,
    type SanPhamTrongKhuyenMai,
} from "../../services/repositories/KhuyenMai";
import { layTatCaSanPham, type SanPham } from "../../services/repositories/SanPham";

const defaultForm: KhuyenMaiRequest = {
    tenKhuyenMai: "",
    moTa: "",
    phanTramGiam: 0,
    ngayBatDau: "",
    ngayKetThuc: "",
};

const AdminKhuyenMai: React.FC = () => {
    const [khuyenMais, setKhuyenMais] = useState<KhuyenMai[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<KhuyenMai | null>(null);
    const [formData, setFormData] = useState<KhuyenMaiRequest>(defaultForm);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [khuyenMaiToDelete, setKhuyenMaiToDelete] = useState<KhuyenMai | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedKhuyenMai, setSelectedKhuyenMai] = useState<KhuyenMai | null>(null);
    const [productsInPromo, setProductsInPromo] = useState<SanPhamTrongKhuyenMai[]>([]);
    const [allProducts, setAllProducts] = useState<SanPham[]>([]);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [showDeleteProductConfirm, setShowDeleteProductConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState<SanPhamTrongKhuyenMai | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const loadKhuyenMais = async (page: number = currentPage): Promise<KhuyenMai[]> => {
        setLoading(true);
        try {
            const res = await layKhuyenMaiPhanTrang(page, pageSize);
            if (res.success && res.data) {
                const items = res.data.items || [];
                setKhuyenMais(items);
                setTotal(res.data.total || 0);
                setCurrentPage(res.data.page || page);
                return items;
            } else {
                showMessage("error", res.message || "Không thể tải danh sách khuyến mãi.");
                return [];
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi tải danh sách khuyến mãi.");
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadKhuyenMais(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageSize]);

    useEffect(() => {
        loadKhuyenMais(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const filteredKhuyenMais = useMemo(() => {
        if (!searchTerm.trim()) return khuyenMais;
        const keyword = searchTerm.toLowerCase();
        return khuyenMais.filter(
            (km) =>
                km.tenKhuyenMai?.toLowerCase().includes(keyword) ||
                km.moTa?.toLowerCase().includes(keyword)
        );
    }, [khuyenMais, searchTerm]);

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData(defaultForm);
        setShowModal(true);
    };

    const handleEdit = (item: KhuyenMai) => {
        setEditingItem(item);
        setFormData({
            tenKhuyenMai: item.tenKhuyenMai || "",
            moTa: item.moTa || "",
            phanTramGiam: item.phanTramGiam || 0,
            ngayBatDau: item.ngayBatDau || "",
            ngayKetThuc: item.ngayKetThuc || "",
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData(defaultForm);
    };

    const handleSave = async () => {
        if (!formData.tenKhuyenMai.trim()) {
            showMessage("error", "Vui lòng nhập tên khuyến mãi.");
            return;
        }
        if (formData.phanTramGiam < 0 || formData.phanTramGiam > 100) {
            showMessage("error", "Phần trăm giảm phải từ 0 đến 100.");
            return;
        }
        if (!formData.ngayBatDau || !formData.ngayKetThuc) {
            showMessage("error", "Vui lòng chọn ngày bắt đầu và ngày kết thúc.");
            return;
        }
        if (new Date(formData.ngayKetThuc) < new Date(formData.ngayBatDau)) {
            showMessage("error", "Ngày kết thúc phải sau ngày bắt đầu.");
            return;
        }

        setLoading(true);
        try {
            const payload: KhuyenMaiRequest = {
                ...formData,
                ngayBatDau: formData.ngayBatDau,
                ngayKetThuc: formData.ngayKetThuc,
            };

            const res = editingItem
                ? await capNhatKhuyenMai(editingItem.id, payload)
                : await taoKhuyenMai(payload);

            if (res.success) {
                showMessage("success", editingItem ? "Cập nhật khuyến mãi thành công!" : "Thêm khuyến mãi thành công!");
                handleCloseModal();
                loadKhuyenMais(currentPage);
            } else {
                showMessage("error", res.message || "Không thể lưu khuyến mãi.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi lưu khuyến mãi.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (item: KhuyenMai) => {
        setKhuyenMaiToDelete(item);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!khuyenMaiToDelete) return;
        setLoading(true);
        try {
            const res = await xoaKhuyenMai(khuyenMaiToDelete.id);
            if (res.success) {
                showMessage("success", "Đã xóa khuyến mãi.");
                const isLastItemOnPage = khuyenMais.length === 1 && currentPage > 1;
                const nextPage = isLastItemOnPage ? currentPage - 1 : currentPage;
                setShowDeleteConfirm(false);
                setKhuyenMaiToDelete(null);
                loadKhuyenMais(nextPage);
            } else {
                showMessage("error", res.message || "Không thể xóa khuyến mãi.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi xóa khuyến mãi.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewProducts = async (item: KhuyenMai) => {
        setSelectedKhuyenMai(item);
        setLoading(true);
        try {
            const res = await laySanPhamTrongKhuyenMai(item.id);
            if (res.success && res.data) {
                setProductsInPromo(res.data);
            } else {
                showMessage("error", res.message || "Không thể tải danh sách sản phẩm.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi tải danh sách sản phẩm.");
        } finally {
            setLoading(false);
        }
        setShowProductModal(true);
    };

    const handleAddProduct = async () => {
        if (!selectedProductId || !selectedKhuyenMai) {
            showMessage("error", "Vui lòng chọn sản phẩm.");
            return;
        }

        setLoading(true);
        try {
            const res = await ganSanPhamKhuyenMai({
                sanPhamId: selectedProductId,
                khuyenMaiId: selectedKhuyenMai.id,
            });
            if (res.success) {
                showMessage("success", "Gán sản phẩm vào khuyến mãi thành công!");
                setShowAddProductModal(false);
                setSelectedProductId(null);
                // Reload danh sách khuyến mãi để cập nhật số lượng sản phẩm
                const updatedKhuyenMais = await loadKhuyenMais(currentPage);
                // Cập nhật lại selectedKhuyenMai với số lượng mới
                const updatedKhuyenMai = updatedKhuyenMais.find(km => km.id === selectedKhuyenMai.id);
                if (updatedKhuyenMai) {
                    setSelectedKhuyenMai(updatedKhuyenMai);
                }
                // Reload danh sách sản phẩm trong modal
                await handleViewProducts(updatedKhuyenMai || selectedKhuyenMai);
            } else {
                showMessage("error", res.message || "Không thể gán sản phẩm.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi gán sản phẩm.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveProductClick = (product: SanPhamTrongKhuyenMai) => {
        setProductToDelete(product);
        setShowDeleteProductConfirm(true);
    };

    const handleConfirmRemoveProduct = async () => {
        if (!selectedKhuyenMai || !productToDelete) return;
        setLoading(true);
        try {
            const res = await xoaSanPhamKhoiKhuyenMai(productToDelete.id, selectedKhuyenMai.id);
            if (res.success) {
                showMessage("success", "Đã xóa sản phẩm khỏi khuyến mãi.");
                setShowDeleteProductConfirm(false);
                setProductToDelete(null);
                // Reload danh sách khuyến mãi để cập nhật số lượng sản phẩm
                const updatedKhuyenMais = await loadKhuyenMais(currentPage);
                // Cập nhật lại selectedKhuyenMai với số lượng mới
                const updatedKhuyenMai = updatedKhuyenMais.find(km => km.id === selectedKhuyenMai.id);
                if (updatedKhuyenMai) {
                    setSelectedKhuyenMai(updatedKhuyenMai);
                }
                // Reload danh sách sản phẩm trong modal
                await handleViewProducts(updatedKhuyenMai || selectedKhuyenMai);
            } else {
                showMessage("error", res.message || "Không thể xóa sản phẩm.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi xóa sản phẩm.");
        } finally {
            setLoading(false);
        }
    };

    const loadAllProducts = async () => {
        try {
            const res = await layTatCaSanPham(1, 1000); // Lấy nhiều sản phẩm
            if (res.success && res.data && res.data.items) {
                setAllProducts(res.data.items);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (showAddProductModal) {
            loadAllProducts();
        }
    }, [showAddProductModal]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN");
    };

    const getStatus = (item: KhuyenMai) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ngayKetThuc = new Date(item.ngayKetThuc);
        ngayKetThuc.setHours(0, 0, 0, 0);
        const ngayBatDau = new Date(item.ngayBatDau);
        ngayBatDau.setHours(0, 0, 0, 0);

        if (ngayKetThuc < today) {
            return { text: "Hết hạn", className: "bg-red-100 text-red-700" };
        }
        if (ngayBatDau > today) {
            return { text: "Sắp diễn ra", className: "bg-blue-100 text-blue-700" };
        }
        return { text: "Đang diễn ra", className: "bg-green-100 text-green-700" };
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                        <LocalOfferIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý khuyến mãi</h1>
                        <p className="text-sm text-gray-500">Tạo, sửa, xóa và gán sản phẩm vào khuyến mãi.</p>
                    </div>
                </div>
                <button
                    onClick={handleAddNew}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
                >
                    <AddIcon className="h-5 w-5" />
                    <span>Thêm khuyến mãi</span>
                </button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên khuyến mãi, mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
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
                {loading && khuyenMais.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-500"></div>
                        <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredKhuyenMais.length === 0 ? (
                    <div className="p-12 text-center">
                        <LocalOfferIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? "Không tìm thấy khuyến mãi nào" : "Chưa có khuyến mãi nào"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STT</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên khuyến mãi</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phần trăm giảm</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày áp dụng</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Số sản phẩm</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredKhuyenMais.map((item, index) => {
                                        const status = getStatus(item);
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                                    {(currentPage - 1) * pageSize + index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">{item.tenKhuyenMai}</div>
                                                    <p className="text-xs text-gray-500 line-clamp-2">{item.moTa || "—"}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                                                    {item.phanTramGiam}%
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    <div>Từ: {formatDate(item.ngayBatDau)}</div>
                                                    <div>Đến: {formatDate(item.ngayKetThuc)}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{item.soSanPham || 0}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${status.className}`}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleViewProducts(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Xem sản phẩm"
                                                        >
                                                            <InventoryIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                            title="Sửa"
                                                        >
                                                            <EditIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(item)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Xóa"
                                                        >
                                                            <DeleteIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">
                                        Trang {currentPage} / {totalPages} ({total} khuyến mãi)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        <FirstPageIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        <ChevronLeftIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        <ChevronRightIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                    >
                                        <LastPageIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal thêm/sửa khuyến mãi */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingItem ? "Sửa khuyến mãi" : "Thêm khuyến mãi mới"}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition">
                                <CloseIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tên khuyến mãi *</label>
                                <input
                                    type="text"
                                    value={formData.tenKhuyenMai}
                                    onChange={(e) => setFormData({ ...formData, tenKhuyenMai: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Nhập tên khuyến mãi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                <textarea
                                    value={formData.moTa || ""}
                                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    rows={3}
                                    placeholder="Nhập mô tả khuyến mãi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phần trăm giảm (%) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formData.phanTramGiam}
                                    onFocus={(e) => {
                                        // Khi focus vào input có giá trị 0, select all để dễ dàng thay thế
                                        if (formData.phanTramGiam === 0) {
                                            e.target.select();
                                        }
                                    }}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Nếu input rỗng, giữ nguyên để người dùng có thể nhập
                                        if (value === "") {
                                            setFormData({ ...formData, phanTramGiam: 0 });
                                        } else {
                                            const numValue = parseFloat(value);
                                            setFormData({ ...formData, phanTramGiam: isNaN(numValue) ? 0 : numValue });
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // Khi người dùng bắt đầu nhập số (không phải 0) và giá trị hiện tại là 0, xóa 0
                                        if (formData.phanTramGiam === 0 && /[1-9]/.test(e.key)) {
                                            e.currentTarget.value = "";
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="0-100"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu *</label>
                                    <input
                                        type="date"
                                        value={formData.ngayBatDau}
                                        onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc *</label>
                                    <input
                                        type="date"
                                        value={formData.ngayKetThuc}
                                        onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                            >
                                <CancelIcon className="h-5 w-5" />
                                <span>Hủy</span>
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <SaveIcon className="h-5 w-5" />
                                <span>Lưu</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa */}
            {showDeleteConfirm && khuyenMaiToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa khuyến mãi <strong>"{khuyenMaiToDelete.tenKhuyenMai}"</strong>? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setKhuyenMaiToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={loading}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xem sản phẩm trong khuyến mãi */}
            {showProductModal && selectedKhuyenMai && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                Sản phẩm trong khuyến mãi: {selectedKhuyenMai.tenKhuyenMai}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowProductModal(false);
                                    setSelectedKhuyenMai(null);
                                    setProductsInPromo([]);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <CloseIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 flex justify-end">
                                <button
                                    onClick={() => setShowAddProductModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition"
                                >
                                    <AddIcon className="h-5 w-5" />
                                    <span>Thêm sản phẩm</span>
                                </button>
                            </div>
                            {loading && productsInPromo.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-orange-500"></div>
                                    <p className="mt-4 text-gray-500">Đang tải...</p>
                                </div>
                            ) : productsInPromo.length === 0 ? (
                                <div className="text-center py-8">
                                    <InventoryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Chưa có sản phẩm nào trong khuyến mãi này</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {productsInPromo.map((product) => (
                                        <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition relative group">
                                            {product.hinhAnhDaiDien && (
                                                <img
                                                    src={product.hinhAnhDaiDien}
                                                    alt={product.tenSanPham}
                                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                                />
                                            )}
                                            <h3 className="font-semibold text-gray-800 mb-1">{product.tenSanPham}</h3>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-500 line-through">{product.gia.toLocaleString("vi-VN")}₫</p>
                                                    <p className="text-lg font-bold text-orange-500">
                                                        {product.giaGiam?.toLocaleString("vi-VN") || product.gia.toLocaleString("vi-VN")}₫
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveProductClick(product)}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition hover:scale-110 shadow-lg"
                                                title="Xóa khỏi khuyến mãi"
                                            >
                                                <DeleteIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thêm sản phẩm vào khuyến mãi */}
            {showAddProductModal && selectedKhuyenMai && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Thêm sản phẩm vào khuyến mãi</h2>
                            <button
                                onClick={() => {
                                    setShowAddProductModal(false);
                                    setSelectedProductId(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <CloseIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn sản phẩm</label>
                                <select
                                    value={selectedProductId || ""}
                                    onChange={(e) => setSelectedProductId(parseInt(e.target.value) || null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">-- Chọn sản phẩm --</option>
                                    {allProducts
                                        .filter((p) => !productsInPromo.some((pp) => pp.id === p.id))
                                        .map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.tenSanPham} - {product.gia.toLocaleString("vi-VN")}₫
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowAddProductModal(false);
                                        setSelectedProductId(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddProduct}
                                    disabled={loading || !selectedProductId}
                                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa sản phẩm khỏi khuyến mãi */}
            {showDeleteProductConfirm && productToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Xác nhận xóa sản phẩm</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa sản phẩm <strong>"{productToDelete.tenSanPham}"</strong> khỏi khuyến mãi <strong>"{selectedKhuyenMai?.tenKhuyenMai}"</strong>?
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteProductConfirm(false);
                                    setProductToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmRemoveProduct}
                                disabled={loading}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminKhuyenMai;

