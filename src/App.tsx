import LoginView from "./pages/Dangnhap/LoginView"
import { Routes, Route } from "react-router-dom";
import RegisterView from "./pages/Dangnhap/RegisterView";
import SendOtpView from "./pages/Dangnhap/SendOtpView";
import ResetPassword from "./pages/Dangnhap/ResetPassword";
import AdminView from "./pages/Admin/AdminView";
import MainLayout from "./layouts/MainLayout";
import UserLayout from "./layouts/UserLayout";
import AdminProduct from "./pages/Admin/AdminProduct";
import AdminCategoryView from "./pages/Admin/AdminCategoryView";
import AccountView from "./pages/Admin/AccountView";
import HomeView from "./pages/Home/HomeView";
import ProductDetail from "./pages/Product/ProductDetail";
import CategoryView from "./pages/Category/CategoryView";
import CartView from "./pages/Cart/CartView";
import CheckoutView from "./pages/Checkout/CheckoutView";
import AdminNew from "./pages/Admin/AdminNew";
import AdminDiscount from "./pages/Admin/AdminDiscount";
import AdminCart from "./pages/Admin/AdminCart";
import VoucherView from "./pages/Voucher/VoucherView";
import NotificationView from "./pages/Notification/NotificationView";
import NewsDetailView from "./pages/News/NewsDetailView";
import ProductListView from "./pages/Product/ProductListView";
import OrderHistoryView from "./pages/Order/OrderHistoryView";
import ProfileView from "./pages/Profile/ProfileView";
import ContactView from "./pages/Contact/ContactView";
import AdminContact from "./pages/Admin/AdminContact";
import AdminKhuyenMai from "./pages/Admin/AdminKhuyenMai";
import AdminOrder from "./pages/Admin/AdminOrder";

function App() {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<HomeView />} />
        <Route path="products" element={<ProductListView />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="category/:id" element={<CategoryView />} />
        <Route path="cart" element={<CartView />} />
        <Route path="checkout" element={<CheckoutView />} />
        <Route path="voucher" element={<VoucherView />} />
        <Route path="thongbao" element={<NotificationView />} />
        <Route path="news/:id" element={<NewsDetailView />} />
        <Route path="donhang" element={<OrderHistoryView />} />
        <Route path="profile" element={<ProfileView />} />
        <Route path="lienhe" element={<ContactView />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<MainLayout />}>
        <Route index element={<AdminView />} />
        <Route path="sanpham" element={<AdminProduct />} />
        <Route path="danhmuc" element={<AdminCategoryView />} />
        <Route path="taikhoan" element={<AccountView />} />
        <Route path="tintuc" element={<AdminNew/>}/>
        <Route path="giamgia" element={<AdminDiscount/>}/>
        <Route path="khuyenmai" element={<AdminKhuyenMai/>}/>
        <Route path="giohang" element={<AdminCart/>}/>
        <Route path="lienhe" element={<AdminContact/>}/>
        <Route path="donhang" element={<AdminOrder/>}/>
      </Route>

      {/* Auth Routes */}
      <Route path="/dangnhap" element={<LoginView />} />
      <Route path="/dangky" element={<RegisterView />} />
      <Route path="/guiemail" element={<SendOtpView />} />
      <Route path="/datlaimatkhau" element={<ResetPassword />} />
    </Routes>
  )
}

export default App
