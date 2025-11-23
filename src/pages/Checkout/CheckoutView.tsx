import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import {
    xemThongTinThanhToan,
    datHang,
    type SanPhamThanhToan,
    type VoucherInfo,
    type KhachHangInfo,
    type DatHangRequest,
} from "../../services/repositories/ThanhToan";

const CheckoutView: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [sanPhams, setSanPhams] = useState<SanPhamThanhToan[]>([]);
    const [tongTien, setTongTien] = useState(0);
    const [khachHang, setKhachHang] = useState<KhachHangInfo | null>(null);
    const [vouchers, setVouchers] = useState<VoucherInfo[]>([]);

    const [selectedVoucher, setSelectedVoucher] = useState<string>("");
    const [maPhieuGiamGia, setMaPhieuGiamGia] = useState("");
    const [tienGiam, setTienGiam] = useState(0);
    const [tongTienSauGiam, setTongTienSauGiam] = useState(0);

    const [diaChiGiao, setDiaChiGiao] = useState("");
    const [ghiChu, setGhiChu] = useState("");
    const [phuongThucThanhToan, setPhuongThucThanhToan] = useState<number>(0); // 0 = COD, 1 = VNPay

    useEffect(() => {
        loadCheckoutData();
    }, []);

    useEffect(() => {
        calculateDiscount();
    }, [selectedVoucher, maPhieuGiamGia, tongTien, vouchers]);

    const loadCheckoutData = async () => {
        const userInfoStr = sessionStorage.getItem("userInfo");
        if (!userInfoStr) {
            alert("Vui lòng đăng nhập để thanh toán!");
            navigate("/dangnhap");
            return;
        }

        setLoading(true);
        try {
            const userInfo = JSON.parse(userInfoStr);
            const res = await xemThongTinThanhToan(userInfo.id);

            if (res.success && res.data && res.data.length > 0) {
                setSanPhams(res.data);
                setTongTien(res.tongTien || 0);
                setKhachHang(res.khachHang || null);
                setVouchers(res.vouchers || []);
                setDiaChiGiao(res.khachHang?.diaChi || "");
            } else {
                showMessage("error", res.message || "Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng!");
                setTimeout(() => navigate("/cart"), 2000);
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin thanh toán:", error);
            showMessage("error", "Có lỗi xảy ra khi tải thông tin thanh toán.");
        } finally {
            setLoading(false);
        }
    };

    const calculateDiscount = () => {
        if (!selectedVoucher && !maPhieuGiamGia) {
            setTienGiam(0);
            setTongTienSauGiam(tongTien);
            return;
        }

        // Tìm voucher được chọn
        let voucher: VoucherInfo | undefined;
        if (selectedVoucher) {
            voucher = vouchers.find((v) => v.id.toString() === selectedVoucher);
        } else if (maPhieuGiamGia) {
            voucher = vouchers.find((v) => v.maPhieu.toLowerCase() === maPhieuGiamGia.toLowerCase().trim());
        }

        if (!voucher) {
            setTienGiam(0);
            setTongTienSauGiam(tongTien);
            return;
        }

        // Tính tiền giảm
        let giam = 0;
        if (voucher.kieuGiam === "percentage") {
            const phanTram = Math.min(voucher.giaTriGiam, 99);
            giam = tongTien * (phanTram / 100);
        } else {
            giam = voucher.giaTriGiam;
            if (giam > tongTien) {
                giam = tongTien;
            }
        }

        setTienGiam(giam);
        setTongTienSauGiam(Math.max(0, tongTien - giam));
    };

    const handleVoucherSelect = (voucherId: string) => {
        setSelectedVoucher(voucherId);
        setMaPhieuGiamGia("");
        const voucher = vouchers.find((v) => v.id.toString() === voucherId);
        if (voucher) {
            setMaPhieuGiamGia(voucher.maPhieu);
        }
    };

    const handleVoucherInput = (maPhieu: string) => {
        setMaPhieuGiamGia(maPhieu);
        setSelectedVoucher("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!diaChiGiao.trim()) {
            showMessage("error", "Vui lòng nhập địa chỉ giao hàng!");
            return;
        }

        const userInfoStr = sessionStorage.getItem("userInfo");
        if (!userInfoStr) {
            navigate("/dangnhap");
            return;
        }

        setSubmitting(true);
        try {
            const userInfo = JSON.parse(userInfoStr);
            const request: DatHangRequest = {
                payment: phuongThucThanhToan,
                taiKhoanId: userInfo.id,
                diaChiGiao: diaChiGiao.trim(),
                ghiChu: ghiChu.trim() || undefined,
                phuongThucThanhToan: phuongThucThanhToan === 0 ? "COD" : "VNPay",
                maPhieuGiamGia: maPhieuGiamGia.trim() || (selectedVoucher ? vouchers.find(v => v.id.toString() === selectedVoucher)?.maPhieu : undefined),
            };

            const res = await datHang(request);

            if (res.success || res.statusCode === 201) {
                if (res.url) {
                    // Chuyển đến trang thanh toán VNPay
                    window.location.href = res.url;
                } else {
                    // Thanh toán COD thành công
                    showMessage("success", res.message || "Đặt hàng thành công!");
                    // Dispatch event để cập nhật giỏ hàng
                    window.dispatchEvent(new CustomEvent("cartUpdated"));
                    setTimeout(() => {
                        navigate("/");
                    }, 2000);
                }
            } else {
                showMessage("error", res.message || "Không thể đặt hàng.");
            }
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            showMessage("error", "Có lỗi xảy ra khi đặt hàng.");
        } finally {
            setSubmitting(false);
        }
    };

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowBackIcon />
                        <span>Quay lại trang chủ</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
                </div>

                {message && (
                    <div
                        className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-lg ${
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

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Thông tin khách hàng */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin giao hàng</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                                    <input
                                        type="text"
                                        value={khachHang?.hoTen || ""}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={khachHang?.email || ""}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Địa chỉ giao hàng <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={diaChiGiao}
                                        onChange={(e) => setDiaChiGiao(e.target.value)}
                                        required
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập địa chỉ giao hàng chi tiết"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                                    <textarea
                                        value={ghiChu}
                                        onChange={(e) => setGhiChu(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mã giảm giá */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <LocalOfferIcon className="text-pink-500" />
                                <h2 className="text-xl font-bold text-gray-900">Mã giảm giá</h2>
                            </div>
                            <div className="space-y-4">
                                {vouchers.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Chọn voucher đã nhận
                                        </label>
                                        <select
                                            value={selectedVoucher}
                                            onChange={(e) => handleVoucherSelect(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        >
                                            <option value="">-- Chọn voucher --</option>
                                            {vouchers.map((voucher) => (
                                                <option key={voucher.id} value={voucher.id.toString()}>
                                                    {voucher.maPhieu} - {voucher.kieuGiam === "percentage" ? `${voucher.giaTriGiam}%` : formatPrice(voucher.giaTriGiam)} (Hết hạn: {formatDate(voucher.ngayKetThuc)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hoặc nhập mã giảm giá
                                    </label>
                                    <input
                                        type="text"
                                        value={maPhieuGiamGia}
                                        onChange={(e) => handleVoucherInput(e.target.value)}
                                        placeholder="Nhập mã giảm giá"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                                {tienGiam > 0 && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            <span className="font-semibold">Đã áp dụng mã giảm giá!</span> Bạn được giảm{" "}
                                            {formatPrice(tienGiam)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <PaymentIcon className="text-blue-500" />
                                <h2 className="text-xl font-bold text-gray-900">Phương thức thanh toán</h2>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={0}
                                        checked={phuongThucThanhToan === 0}
                                        onChange={(e) => setPhuongThucThanhToan(Number(e.target.value))}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                                        <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={1}
                                        checked={phuongThucThanhToan === 1}
                                        onChange={(e) => setPhuongThucThanhToan(Number(e.target.value))}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                                            <CreditCardIcon className="h-5 w-5" />
                                            Thanh toán online (VNPay)
                                        </div>
                                        <div className="text-sm text-gray-500">Thanh toán qua cổng VNPay</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Đơn hàng của bạn</h2>
                            <div className="space-y-4 mb-6">
                                {sanPhams.map((sp) => (
                                    <div key={sp.sanPhamId} className="flex gap-3">
                                        {sp.anhDaiDien && (
                                            <img
                                                src={sp.anhDaiDien}
                                                alt={sp.tenSanPham}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-2">{sp.tenSanPham}</p>
                                            <p className="text-xs text-gray-500">Số lượng: {sp.soLuong}</p>
                                            <div className="mt-1">
                                                {sp.giaGiam && sp.giaGiam < sp.gia ? (
                                                    <>
                                                        <p className="text-xs text-gray-500 line-through">{formatPrice(sp.gia * sp.soLuong)}</p>
                                                        <p className="text-sm font-semibold text-red-600">{formatPrice(sp.thanhTien)}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm font-semibold text-gray-900">{formatPrice(sp.thanhTien)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tạm tính:</span>
                                    <span className="text-gray-900">{formatPrice(tongTien)}</span>
                                </div>
                                {tienGiam > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Giảm giá:</span>
                                        <span>-{formatPrice(tienGiam)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                    <span>Tổng cộng:</span>
                                    <span className="text-blue-600">{formatPrice(tongTienSauGiam)}</span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Đang xử lý..." : phuongThucThanhToan === 1 ? "Thanh toán VNPay" : "Đặt hàng"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutView;

