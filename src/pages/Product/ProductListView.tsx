import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { layTatCaSanPham, searchProducts, laySanPhamTheoDanhMuc,laySanPhamYeuThich,toggleYeuThich,type SanPham 
} from '../../services/repositories/SanPham';
import { LayTatCaDanhMuc, type DanhMuc } from '../../services/repositories/DanhMuc';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
type ViewMode = 'grid' | 'list';

const ProductListView = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<SanPham[]>([]);
    const [categories, setCategories] = useState<DanhMuc[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        searchParams.get('category') ? parseInt(searchParams.get('category')!) : null
    );
    const [sortOption, setSortOption] = useState<SortOption>(
        (searchParams.get('sort') as SortOption) || 'default'
    );
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
    const itemsPerPage = 12;

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        loadCategories();
        loadFavoriteIds();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [selectedCategory, searchKeyword]);

    useEffect(() => {
        // Update URL params when filters change
        const params = new URLSearchParams();
        if (searchKeyword) params.set('q', searchKeyword);
        if (selectedCategory) params.set('category', selectedCategory.toString());
        if (sortOption !== 'default') params.set('sort', sortOption);
        setSearchParams(params, { replace: true });
    }, [searchKeyword, selectedCategory, sortOption, setSearchParams]);

    const loadCategories = async () => {
        try {
            const res = await LayTatCaDanhMuc();
            if (res.success && res.data) {
                setCategories(res.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
        }
    };

    const loadFavoriteIds = async () => {
        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) return;

        try {
            const userInfo = JSON.parse(userInfoStr);
            const ids = await laySanPhamYeuThich(userInfo.id);
            setFavoriteIds(ids);
        } catch (error) {
            console.error('Lỗi khi tải yêu thích:', error);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            let result;
            
            if (searchKeyword.trim()) {
                // Tìm kiếm
                result = await searchProducts(searchKeyword.trim());
            } else if (selectedCategory) {
                // Lọc theo danh mục
                result = await laySanPhamTheoDanhMuc(selectedCategory);
                // Convert SanPhamCategory[] to SanPham[]
                if (result.success && result.data) {
                    const converted = result.data.map(item => ({
                        id: item.id,
                        tenSanPham: item.tenSanPham,
                        thuongHieu: item.thuongHieu,
                        gia: item.gia,
                        giaGiam: item.giaGiam,
                        moTa: item.moTa,
                        hienThi: true,
                        soLuongTon: item.soLuongTon,
                        ngayThem: item.ngayThem,
                        danhMuc: item.danhMuc,
                        hinhAnhDaiDien: item.anhDaiDien,
                        hinhAnh: []
                    }));
                    setProducts(converted.filter(p => p.hienThi !== false));
                    setLoading(false);
                    return;
                }
            } else {
                // Lấy tất cả
                result = await layTatCaSanPham();
            }

            if (result.success && result.data) {
                // Filter products that are visible (hienThi !== false)
                const filtered = result.data.filter((p: SanPham) => p.hienThi !== false);
                setProducts(filtered);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        loadProducts();
    };

    const handleCategoryFilter = (categoryId: number | null) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);
    };

    const handleSortChange = (option: SortOption) => {
        setSortOption(option);
        setCurrentPage(1);
    };

    const handleToggleFavorite = async (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        e.stopPropagation();

        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) {
            alert('Vui lòng đăng nhập để thêm vào yêu thích');
            return;
        }

        try {
            const userInfo = JSON.parse(userInfoStr);
            const result = await toggleYeuThich(userInfo.id, productId);
            
            if (result.success) {
                if (result.isFavorite) {
                    setFavoriteIds(prev => [...prev, productId]);
                } else {
                    setFavoriteIds(prev => prev.filter(id => id !== productId));
                }
            }
        } catch (error) {
            console.error('Lỗi khi toggle yêu thích:', error);
        }
    };

    // Sắp xếp và phân trang
    const sortedAndPaginatedProducts = useMemo(() => {
        let sorted = [...products];

        // Sắp xếp
        switch (sortOption) {
            case 'price-asc':
                sorted.sort((a, b) => (a.giaGiam || a.gia) - (b.giaGiam || b.gia));
                break;
            case 'price-desc':
                sorted.sort((a, b) => (b.giaGiam || b.gia) - (a.giaGiam || a.gia));
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.tenSanPham.localeCompare(b.tenSanPham));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.tenSanPham.localeCompare(a.tenSanPham));
                break;
            default:
                break;
        }

        // Phân trang
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            items: sorted.slice(startIndex, endIndex),
            total: sorted.length,
            totalPages: Math.ceil(sorted.length / itemsPerPage)
        };
    }, [products, sortOption, currentPage]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const renderProductCard = (product: SanPham) => {
        const isFavorite = favoriteIds.includes(product.id);
        const hasDiscount = !!product.giaGiam;

        if (viewMode === 'list') {
            return (
                <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden flex flex-col md:flex-row group"
                >
                    <div className="relative w-full md:w-64 h-48 md:h-auto bg-gray-200 overflow-hidden flex-shrink-0">
                        {product.hinhAnhDaiDien ? (
                            <img
                                src={product.hinhAnhDaiDien}
                                alt={product.tenSanPham}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                📱
                            </div>
                        )}
                        {hasDiscount && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                                -{Math.round(((product.gia - product.giaGiam!) / product.gia) * 100)}%
                            </div>
                        )}
                        <button
                            onClick={(e) => handleToggleFavorite(e, product.id)}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition z-10"
                        >
                            {isFavorite ? (
                                <FavoriteIcon sx={{ color: '#ef4444', fontSize: 24 }} />
                            ) : (
                                <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                            )}
                        </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="font-semibold text-xl mb-2 group-hover:text-blue-600 transition">
                                {product.tenSanPham}
                            </h3>
                            {product.thuongHieu && (
                                <p className="text-sm text-gray-500 mb-2">
                                    {product.thuongHieu}
                                </p>
                            )}
                            {product.moTa && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {product.moTa}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                {hasDiscount ? (
                                    <div>
                                        <span className="text-red-600 font-bold text-2xl">
                                            {formatPrice(product.giaGiam!)}
                                        </span>
                                        <span className="text-gray-400 line-through ml-2 text-lg">
                                            {formatPrice(product.gia)}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-blue-600 font-bold text-2xl">
                                        {formatPrice(product.gia)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            );
        }

        // Grid view
        return (
            <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
            >
                <div className="relative h-64 bg-gray-200 overflow-hidden">
                    {product.hinhAnhDaiDien ? (
                        <img
                            src={product.hinhAnhDaiDien}
                            alt={product.tenSanPham}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                            📱
                        </div>
                    )}
                    {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                            -{Math.round(((product.gia - product.giaGiam!) / product.gia) * 100)}%
                        </div>
                    )}
                    <button
                        onClick={(e) => handleToggleFavorite(e, product.id)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition z-10"
                    >
                        {isFavorite ? (
                            <FavoriteIcon sx={{ color: '#ef4444', fontSize: 24 }} />
                        ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                        )}
                    </button>
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                        {product.tenSanPham}
                    </h3>
                    {product.thuongHieu && (
                        <p className="text-sm text-gray-500 mb-2">
                            {product.thuongHieu}
                        </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                        <div>
                            {hasDiscount ? (
                                <div>
                                    <span className="text-red-600 font-bold text-lg">
                                        {formatPrice(product.giaGiam!)}
                                    </span>
                                    <span className="text-gray-400 line-through ml-2 text-sm">
                                        {formatPrice(product.gia)}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-blue-600 font-bold text-lg">
                                    {formatPrice(product.gia)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowBackIcon />
                            <span className="font-medium">Quay lại</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-800">Danh sách sản phẩm</h1>
                    </div>
                    
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </form>

                    {/* Filters and View Options */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FilterListIcon />
                                <span className="font-medium">Sắp xếp:</span>
                            </div>
                            <select
                                value={sortOption}
                                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="default">Mặc định</option>
                                <option value="price-asc">Giá: Thấp → Cao</option>
                                <option value="price-desc">Giá: Cao → Thấp</option>
                                <option value="name-asc">Tên: A → Z</option>
                                <option value="name-desc">Tên: Z → A</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition ${
                                    viewMode === 'grid' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                <GridViewIcon />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition ${
                                    viewMode === 'list' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                <ViewListIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Categories */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-bold mb-4">Danh mục</h2>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => handleCategoryFilter(null)}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition ${
                                            selectedCategory === null
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        Tất cả sản phẩm
                                    </button>
                                </li>
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <button
                                            onClick={() => handleCategoryFilter(category.id)}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition ${
                                                selectedCategory === category.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            {category.tenDanhMuc}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                            </div>
                        ) : sortedAndPaginatedProducts.items.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm nào</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 text-gray-600">
                                    Hiển thị {sortedAndPaginatedProducts.items.length} / {sortedAndPaginatedProducts.total} sản phẩm
                                </div>
                                <div className={
                                    viewMode === 'grid'
                                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                        : 'space-y-4'
                                }>
                                    {sortedAndPaginatedProducts.items.map(renderProductCard)}
                                </div>

                                {/* Pagination */}
                                {sortedAndPaginatedProducts.totalPages > 1 && (
                                    <div className="mt-8 flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                                        >
                                            Trước
                                        </button>
                                        {Array.from({ length: sortedAndPaginatedProducts.totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                // Show first, last, current, and pages around current
                                                return page === 1 ||
                                                    page === sortedAndPaginatedProducts.totalPages ||
                                                    Math.abs(page - currentPage) <= 1;
                                            })
                                            .map((page, index, array) => {
                                                // Add ellipsis if needed
                                                const prevPage = array[index - 1];
                                                const showEllipsis = prevPage && page - prevPage > 1;
                                                return (
                                                    <div key={page} className="flex items-center gap-2">
                                                        {showEllipsis && <span className="px-2">...</span>}
                                                        <button
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`px-4 py-2 border rounded-lg transition ${
                                                                currentPage === page
                                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                                    : 'border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(sortedAndPaginatedProducts.totalPages, prev + 1))}
                                            disabled={currentPage === sortedAndPaginatedProducts.totalPages}
                                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductListView;

