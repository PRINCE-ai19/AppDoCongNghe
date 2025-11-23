import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import { layTinTucTheoId, layTatCaTinTuc, type TinTuc } from "../../services/repositories/TinTuc";

const formatDateTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const NewsDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [article, setArticle] = useState<TinTuc | null>(null);
    const [related, setRelated] = useState<TinTuc[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Scroll to top when component mounts or id changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

    useEffect(() => {
        const loadArticle = async () => {
            if (!id) {
                setError("Không tìm thấy bài viết.");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const numericId = Number(id);
                if (Number.isNaN(numericId)) {
                    setError("ID bài viết không hợp lệ.");
                    setLoading(false);
                    return;
                }

                const res = await layTinTucTheoId(numericId);
                if (res.success && res.data) {
                    setArticle(res.data);
                    setError(null);
                    loadRelatedNews(numericId);
                } else {
                    setError(res.message || "Không tìm thấy bài viết.");
                }
            } catch (err) {
                console.error(err);
                setError("Có lỗi xảy ra khi tải bài viết.");
            } finally {
                setLoading(false);
            }
        };

        const loadRelatedNews = async (currentId: number) => {
            try {
                const res = await layTatCaTinTuc();
                if (res.success && Array.isArray(res.data)) {
                    const suggestions = res.data
                        .filter((item) => item.id !== currentId && item.hienThi !== false)
                        .sort((a, b) => (new Date(b.ngayTao || "").getTime() - new Date(a.ngayTao || "").getTime()))
                        .slice(0, 4);
                    setRelated(suggestions);
                }
            } catch (err) {
                console.error("Không thể tải tin tức liên quan:", err);
            }
        };

        loadArticle();
    }, [id]);

    const renderContent = (content?: string) => {
        if (!content) return null;
        return (
            <div
                className="prose prose-lg max-w-none text-gray-800 leading-7"
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br />") }}
            />
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md">
                    <NewspaperIcon className="text-gray-300" sx={{ fontSize: 64 }} />
                    <p className="mt-4 text-gray-700">{error || "Không tìm thấy bài viết."}</p>
                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                        >
                            <ArrowBackIcon fontSize="small" />
                            Quay lại
                        </button>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowBackIcon />
                        <span>Quay lại</span>
                    </button>
                    <Link
                        to="/news"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                    >
                        <NewspaperIcon fontSize="small" />
                        Xem tất cả tin tức
                    </Link>
                </div>

                <article className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {article.image && (
                        <div className="h-80 bg-gray-100">
                            <img
                                src={article.image}
                                alt={article.tieuDe}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <AccessTimeIcon fontSize="small" />
                            <span>
                                {article.ngaySua ? `Cập nhật ${formatDateTime(article.ngaySua)}` : formatDateTime(article.ngayTao)}
                            </span>
                            {article.hienThi === false && (
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">
                                    Ẩn khỏi trang chủ
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{article.tieuDe}</h1>
                        {article.moTa && (
                            <p className="text-lg text-gray-600 border-l-4 border-blue-500 pl-4">{article.moTa}</p>
                        )}
                        {renderContent(article.noiDung)}
                    </div>
                </article>

                {related.length > 0 && (
                    <section className="bg-white rounded-3xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold text-gray-900">Tin tức liên quan</h2>
                            <span className="text-sm text-gray-500">{related.length} bài viết</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {related.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/news/${item.id}`}
                                    className="flex gap-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition p-4"
                                >
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.tieuDe}
                                            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                            📰
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2">{item.tieuDe}</h3>
                                        {item.ngayTao && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                {formatDateTime(item.ngayTao)}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default NewsDetailView;

