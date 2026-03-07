


import { useState, useEffect } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell 
} from 'recharts';
import { 
    layDoanhThuTheoThang, layTopFavoriteProducts, layBestSellingProducts
} from '../../services/repositories/ThongKe';
import type { DoanhThuThang, TopFavoriteProduct, BestSellingProduct } from '../../services/repositories/ThongKe';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleIcon from '@mui/icons-material/People';

const AdminView = () => {
    const [revenueData, setRevenueData] = useState<DoanhThuThang[]>([]);
    const [topFavorites, setTopFavorites] = useState<TopFavoriteProduct[]>([]);
    const [bestSellers, setBestSellers] = useState<BestSellingProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [revRes, favRes, sellRes] = await Promise.all([
                layDoanhThuTheoThang(),
                layTopFavoriteProducts(),
                layBestSellingProducts()
            ]);

            if (revRes.success) setRevenueData(revRes.data || []);
            if (favRes.success) setTopFavorites(favRes.data || []);
            if (sellRes.success) setBestSellers(sellRes.data || []);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Tổng quan hệ thống</h1>
                <p className="text-gray-500 mt-1">Chào mừng bạn trở lại! Dưới đây là thống kê mới nhất.</p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Doanh thu năm nay" 
                    value={formatPrice(revenueData.reduce((acc, curr) => acc + curr.doanhThu, 0))}
                    icon={<TrendingUpIcon className="text-blue-600" />}
                    trend="+12% so với năm ngoái"
                    color="bg-blue-50"
                />
                <StatCard 
                    title="Yêu thích nhiều nhất" 
                    value={topFavorites[0]?.tenSanPham || 'N/A'}
                    subtitle={`${topFavorites[0]?.soLuongYeuThich || 0} lượt thích`}
                    icon={<FavoriteIcon className="text-pink-600" />}
                    color="bg-pink-50"
                />
                <StatCard 
                    title="Bán chạy nhất" 
                    value={bestSellers[0]?.tenSanPham || 'N/A'}
                    subtitle={`${bestSellers[0]?.soLuongDaBan || 0} sản phẩm`}
                    icon={<ShoppingBagIcon className="text-purple-600" />}
                    color="bg-purple-50"
                />
                <StatCard 
                    title="Tổng số tháng" 
                    value="12"
                    icon={<PeopleIcon className="text-orange-600" />}
                    color="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Biểu đồ doanh thu năm {new Date().getFullYear()}</h2>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="thang" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} tickFormatter={(value: number) => `${value/1000000}M`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [formatPrice(value), 'Doanh thu']}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="doanhThu" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4} 
                                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Best Sellers distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Top sản phẩm bán chạy</h2>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bestSellers} layout="vertical" margin={{ left: -20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="tenSanPham" type="category" axisLine={false} tickLine={false} width={120} tick={{fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="soLuongDaBan" radius={[0, 4, 4, 0]}>
                                    {bestSellers.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Products List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FavoriteIcon className="text-pink-600" />
                        Sản phẩm được yêu thích
                    </h2>
                    <div className="space-y-4">
                        {topFavorites.map((item) => (
                            <div key={item.sanPhamId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                        {item.hinhAnh ? (
                                            <img src={item.hinhAnh} alt={item.tenSanPham} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">📱</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.tenSanPham}</p>
                                        <p className="text-xs text-gray-500">ID: {item.sanPhamId}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-pink-600">{item.soLuongYeuThich}</p>
                                    <p className="text-xs text-gray-500">lượt thích</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Best Sellers List with images */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <ShoppingBagIcon className="text-blue-600" />
                        Sản phẩm bán chạy nhất
                    </h2>
                    <div className="space-y-4">
                        {bestSellers.map((item) => (
                            <div key={item.sanPhamId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                        {item.hinhAnh ? (
                                            <img src={item.hinhAnh} alt={item.tenSanPham} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">💻</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.tenSanPham}</p>
                                        <p className="text-xs text-blue-600 font-medium">{formatPrice(item.gia)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600">{item.soLuongDaBan}</p>
                                    <p className="text-xs text-gray-500">đã bán</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, subtitle, icon, trend, color }: any) => (
    <div className={`p-6 rounded-2xl shadow-sm border border-gray-100 bg-white hover:shadow-md transition`}>
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
            {trend && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 mt-1 truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
);

export default AdminView;

