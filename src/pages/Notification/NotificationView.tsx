import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import {
    layThongBaoTheoUser,
    xemChiTietThongBao,
    xoaThongBao,
    type ThongBao,
} from "../../services/repositories/ThongBao";

type MessageState = { type: "success" | "error"; text: string } | null;

const NotificationView: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<ThongBao[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selected, setSelected] = useState<ThongBao | null>(null);
    const [message, setMessage] = useState<MessageState>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 2500);
    };

    const userId = useMemo(() => {
        const raw = sessionStorage.getItem("userInfo");
        if (!raw) return null;
        try {
            const user = JSON.parse(raw);
            return user?.id ?? null;
        } catch {
            return null;
        }
    }, []);

    const loadNotifications = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await layThongBaoTheoUser(userId);
            if (res.success && Array.isArray(res.data)) {
                setNotifications(res.data);
            } else {
                setNotifications([]);
                if (res.message) showMessage("error", res.message);
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Không thể tải thông báo.");
        } finally {
            setLoading(false);
        }
    };

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (!userId) {
            showMessage("error", "Bạn cần đăng nhập để xem thông báo.");
            navigate("/dangnhap");
            return;
        }
        loadNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleViewDetail = async (id: number) => {
        setDetailLoading(true);
        try {
            const res = await xemChiTietThongBao(id);
            if (res.success && res.data) {
                setSelected(res.data);
                setNotifications((prev) =>
                    prev.map((item) =>
                        item.id === res.data!.id ? { ...item, daXem: true } : item
                    )
                );
            } else {
                showMessage("error", res.message || "Không thể xem thông báo.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi xem thông báo.");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
        setDeletingId(id);
        try {
            const res = await xoaThongBao(id);
            if (res.success) {
                showMessage("success", res.message || "Đã xóa thông báo.");
                setNotifications((prev) => prev.filter((item) => item.id !== id));
                if (selected?.id === id) {
                    setSelected(null);
                }
            } else {
                showMessage("error", res.message || "Không thể xóa thông báo.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi xóa thông báo.");
        } finally {
            setDeletingId(null);
        }
    };

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.daXem).length,
        [notifications]
    );

    const filteredNotifications = useMemo(() => {
        if (!searchTerm.trim()) return notifications;
        const keyword = searchTerm.toLowerCase();
        return notifications.filter(
            (item) =>
                item.tieuDe.toLowerCase().includes(keyword) ||
                item.noiDung.toLowerCase().includes(keyword)
        );
    }, [notifications, searchTerm]);

    const formatDate = (value: string) => {
        const date = new Date(value);
        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    if (!userId) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowBackIcon />
                        <span>Quay lại trang chủ</span>
                    </button>
                    <button
                        onClick={loadNotifications}
                        className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition"
                        disabled={loading}
                    >
                        <RefreshIcon className={loading ? "animate-spin" : ""} />
                        <span>Làm mới</span>
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500 uppercase">Thông báo của bạn</p>
                            <h1 className="text-2xl font-semibold text-gray-900 mt-1">
                                Trung tâm thông báo
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Tất cả</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {notifications.length}
                                </p>
                            </div>
                            <div className="w-px h-10 bg-gray-200" />
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Chưa đọc</p>
                                <p className="text-xl font-semibold text-blue-600">{unreadCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                            <NotificationsNoneIcon className="absolute left-4 top-3.5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {message && (
                    <div
                        className={`mb-6 rounded-xl px-4 py-3 flex items-center gap-3 text-sm ${
                            message.type === "success"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        <NotificationsNoneIcon />
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-md">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-sm text-gray-500">Đang tải thông báo...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="py-16 text-center px-6">
                            <NotificationsNoneIcon className="text-gray-300" sx={{ fontSize: 48 }} />
                            <p className="mt-4 text-gray-600">
                                {searchTerm
                                    ? "Không tìm thấy thông báo phù hợp."
                                    : "Bạn chưa có thông báo nào."}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {filteredNotifications.map((item) => (
                                <li
                                    key={item.id}
                                    className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                    item.daXem
                                                        ? "bg-gray-100 text-gray-600"
                                                        : "bg-blue-100 text-blue-600"
                                                }`}
                                            >
                                                {item.daXem ? "Đã xem" : "Chưa xem"}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(item.ngayTao)}
                                            </span>
                                        </div>
                                        <h3 className="mt-2 text-lg font-semibold text-gray-900">
                                            {item.tieuDe}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                            {item.noiDung}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleViewDetail(item.id)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition"
                                        >
                                            <VisibilityIcon fontSize="small" />
                                            Xem
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingId === item.id}
                                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                            {deletingId === item.id ? "Đang xóa..." : "Xóa"}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 relative">
                        <button
                            onClick={() => setSelected(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <CloseIcon />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <NotificationsNoneIcon className="text-blue-600" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Thông báo</p>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {selected.tieuDe}
                                </h2>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-4">
                            {detailLoading
                                ? "Đang tải..."
                                : `Gửi lúc ${formatDate(selected.ngayTao)}`}
                        </p>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {selected.noiDung}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationView;

