import { useEffect, useState } from "react";
import type { DonHang } from "../../services/repositories/DonHang";
import {
    ORDER_STATUSES,
    layDonHangAdmin,
    getNextStatuses,
    canCancelOrder,
    capNhatTrangThaiDonHang,
    huyDonHangAdmin,
} from "../../services/repositories/DonHang";

const formatCurrency = (value?: number) => {
    if (!value) return "0 ₫";
    return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("vi-VN");
};

const AdminOrder = () => {
    const [orders, setOrders] = useState<DonHang[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<Record<number, string>>({});
    const [noteByOrder, setNoteByOrder] = useState<Record<number, string>>({});
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, page]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        const res = await layDonHangAdmin(statusFilter || undefined, page, pageSize);
        if (res.success && res.data) {
            setOrders(res.data.items);
            setTotal(res.data.total);
        } else {
            setError(res.message || "Không thể tải đơn hàng.");
        }
        setLoading(false);
    };

    const handleSelectStatus = (orderId: number, value: string) => {
        setSelectedStatus((prev) => ({
            ...prev,
            [orderId]: value,
        }));
    };

    const handleUpdateStatus = async (orderId: number) => {
        const nextStatus = selectedStatus[orderId];
        if (!nextStatus) {
            setError("Vui lòng chọn trạng thái mới trước khi cập nhật.");
            return;
        }

        setLoading(true);
        const note = noteByOrder[orderId];
        const res = await capNhatTrangThaiDonHang(orderId, nextStatus, note);
        if (res.success) {
            setSuccess("Cập nhật trạng thái thành công.");
            setError(null);
            await fetchOrders();
        } else {
            setError(res.message || "Không thể cập nhật trạng thái.");
            setSuccess(null);
        }
        setLoading(false);
    };

    const handleCancelOrder = async (orderId: number) => {
        const lyDo = window.prompt("Nhập lý do hủy đơn (có thể để trống):") ?? "";
        setLoading(true);
        const res = await huyDonHangAdmin(orderId, lyDo);
        if (res.success) {
            setSuccess("Đã hủy đơn hàng.");
            setError(null);
            await fetchOrders();
        } else {
            setError(res.message || "Không thể hủy đơn hàng.");
            setSuccess(null);
        }
        setLoading(false);
    };

    const renderStatusBadge = (status?: string) => {
        let color = "bg-gray-200 text-gray-700";
        if (status === ORDER_STATUSES[0]) color = "bg-yellow-100 text-yellow-800";
        if (status === ORDER_STATUSES[1]) color = "bg-blue-100 text-blue-800";
        if (status === ORDER_STATUSES[2]) color = "bg-indigo-100 text-indigo-800";
        if (status === ORDER_STATUSES[3]) color = "bg-green-100 text-green-800";
        if (status === ORDER_STATUSES[4]) color = "bg-red-100 text-red-800";
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
                {status || "Không xác định"}
            </span>
        );
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                    <p className="text-gray-500">Theo dõi và cập nhật trạng thái đơn hàng</p>
                </div>
                <div className="flex gap-3">
                    <select
                        className="border rounded-lg px-4 py-2 text-sm shadow-sm bg-white"
                        value={statusFilter}
                        onChange={(e) => {
                            setPage(1);
                            setStatusFilter(e.target.value);
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={fetchOrders}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
                    >
                        Làm mới
                    </button>
                </div>
            </div>

            {(error || success) && (
                <div
                    className={`p-4 rounded-lg ${
                        error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                    }`}
                >
                    {error || success}
                </div>
            )}

            {loading ? (
                <div className="w-full py-20 text-center text-gray-500">Đang tải dữ liệu...</div>
            ) : orders.length === 0 ? (
                <div className="w-full py-20 text-center text-gray-500">
                    Không có đơn hàng nào phù hợp.
                </div>
            ) : (
                <div className="space-y-5">
                    {orders.map((order) => {
                        const nextStatuses = getNextStatuses(order.trangThai);
                        const isExpanded = expandedOrder === order.id;

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Mã đơn #{order.id}</p>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {formatCurrency(order.tongTien)}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Ngày đặt: {formatDate(order.ngayDat)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {renderStatusBadge(order.trangThai)}
                                        <button
                                            onClick={() =>
                                                setExpandedOrder(isExpanded ? null : order.id)
                                            }
                                            className="text-sm text-indigo-600 hover:text-indigo-800"
                                        >
                                            {isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm text-gray-700">
                                        <p>
                                            <span className="font-medium">Địa chỉ giao:</span>{" "}
                                            {order.diaChiGiao || "Chưa cập nhật"}
                                        </p>
                                        <p>
                                            <span className="font-medium">Ghi chú:</span>{" "}
                                            {order.ghiChu || "—"}
                                        </p>
                                        <div className="space-y-2">
                                            <p className="font-medium">Sản phẩm:</p>
                                            <ul className="space-y-1">
                                                {order.chiTietDonHangs?.map((item) => (
                                                    <li
                                                        key={item.id}
                                                        className="flex justify-between text-sm text-gray-600"
                                                    >
                                                        <span>
                                                            {item.sanPham?.tenSanPham} × {item.soLuong}
                                                        </span>
                                                        <span>
                                                            {formatCurrency(
                                                                (item.donGia || 0) * (item.soLuong || 0)
                                                            )}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                    {nextStatuses.length > 0 ? (
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                            <div className="flex flex-col">
                                                <label className="text-sm text-gray-600 mb-1">
                                                    Trạng thái tiếp theo
                                                </label>
                                                <select
                                                    className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
                                                    value={selectedStatus[order.id] || ""}
                                                    onChange={(e) =>
                                                        handleSelectStatus(order.id, e.target.value)
                                                    }
                                                >
                                                    <option value="">Chọn trạng thái</option>
                                                    {nextStatuses.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <textarea
                                                className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm min-w-[220px]"
                                                placeholder="Ghi chú (không bắt buộc)"
                                                rows={2}
                                                value={noteByOrder[order.id] || ""}
                                                onChange={(e) =>
                                                    setNoteByOrder((prev) => ({
                                                        ...prev,
                                                        [order.id]: e.target.value,
                                                    }))
                                                }
                                            />
                                            <button
                                                onClick={() => handleUpdateStatus(order.id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-sm"
                                            >
                                                Cập nhật
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Đơn hàng đã hoàn tất.
                                        </p>
                                    )}

                                    {canCancelOrder(order.trangThai) && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm hover:bg-red-100 transition"
                                        >
                                            Hủy đơn
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {orders.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-gray-500">
                        Trang {page} / {totalPages} — Tổng {total} đơn hàng
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminOrder;

