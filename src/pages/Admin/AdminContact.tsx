import React, { useEffect, useState, useMemo } from "react";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import MessageIcon from "@mui/icons-material/Message";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import {
    layTatCaLienHe,
    xoaLienHe,
    type LienHe,
} from "../../services/repositories/LienHe";

const AdminContact: React.FC = () => {
    const [contacts, setContacts] = useState<LienHe[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<LienHe | null>(null);
    const [deleting, setDeleting] = useState(false);

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const loadContacts = async () => {
        setLoading(true);
        try {
            const res = await layTatCaLienHe();
            if (res.success && res.data) {
                setContacts(Array.isArray(res.data) ? res.data : []);
            } else {
                showMessage("error", res.message || "Không thể tải danh sách liên hệ.");
                setContacts([]);
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi tải danh sách liên hệ.");
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, []);

    const filteredContacts = useMemo(() => {
        if (!searchTerm.trim()) return contacts;
        const keyword = searchTerm.toLowerCase();
        return contacts.filter((contact) =>
            contact.hoTen.toLowerCase().includes(keyword) ||
            contact.email.toLowerCase().includes(keyword) ||
            (contact.soDienThoai && contact.soDienThoai.toLowerCase().includes(keyword)) ||
            contact.noiDung.toLowerCase().includes(keyword)
        );
    }, [contacts, searchTerm]);

    const handleDeleteClick = (contact: LienHe) => {
        setContactToDelete(contact);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!contactToDelete) return;

        setDeleting(true);
        try {
            const res = await xoaLienHe(contactToDelete.id);
            if (res.success) {
                showMessage("success", "Xóa liên hệ thành công!");
                setContacts(contacts.filter((c) => c.id !== contactToDelete.id));
                setShowDeleteConfirm(false);
                setContactToDelete(null);
            } else {
                showMessage("error", res.message || "Không thể xóa liên hệ.");
            }
        } catch (error) {
            console.error(error);
            showMessage("error", "Có lỗi xảy ra khi xóa liên hệ.");
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ContactMailIcon sx={{ fontSize: 32, color: "#3b82f6" }} />
                            <h1 className="text-2xl font-bold text-gray-800">Quản lý liên hệ</h1>
                        </div>
                        <div className="text-sm text-gray-500">
                            Tổng số: <span className="font-semibold text-blue-600">{filteredContacts.length}</span> liên hệ
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                            message.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                        {message.type === "success" ? (
                            <span className="text-green-600">✓</span>
                        ) : (
                            <span className="text-red-600">✗</span>
                        )}
                        {message.text}
                    </div>
                )}

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, số điện thoại hoặc nội dung..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Contacts List */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Đang tải danh sách liên hệ...</p>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <ContactMailIcon sx={{ fontSize: 64, color: "#9ca3af", margin: "0 auto 16px" }} />
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? "Không tìm thấy liên hệ nào." : "Chưa có liên hệ nào."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <PersonIcon className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">{contact.hoTen}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <EmailIcon sx={{ fontSize: 16 }} />
                                                        <span>{contact.email}</span>
                                                    </div>
                                                    {contact.soDienThoai && (
                                                        <div className="flex items-center gap-1">
                                                            <PhoneIcon sx={{ fontSize: 16 }} />
                                                            <span>{contact.soDienThoai}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                                        <span>{formatDate(contact.ngayGui)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                            <div className="flex items-start gap-2 mb-2">
                                                <MessageIcon sx={{ fontSize: 18, color: "#6b7280" }} />
                                                <span className="text-sm font-medium text-gray-700">Nội dung:</span>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-wrap ml-6">{contact.noiDung}</p>
                                        </div>
                                    </div>

                                    <div className="ml-4">
                                        <button
                                            onClick={() => handleDeleteClick(contact)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Xóa liên hệ"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && contactToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa liên hệ từ <strong>{contactToDelete.hoTen}</strong> không?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setContactToDelete(null);
                                }}
                                disabled={deleting}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang xóa...</span>
                                    </>
                                ) : (
                                    "Xóa"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContact;

