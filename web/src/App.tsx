import { Navigate, Route, Routes } from "react-router-dom";
import { AdminDashboardPage } from "@/admin/dashboard/AdminDashboardPage";
import { GroceryFormPage } from "@/admin/grocery/GroceryFormPage";
import { GroceryListPage } from "@/admin/grocery/GroceryListPage";
import { AdminLayout } from "@/admin/layouts/AdminLayout";
import { ShopFormPage } from "@/admin/shops/ShopFormPage";
import { ShopListPage } from "@/admin/shops/ShopListPage";
import { UserFormPage } from "@/admin/users/UserFormPage";
import { UserListPage } from "@/admin/users/UserListPage";
import { AboutPage } from "@/app/pages/AboutPage";
import { HomePage } from "@/app/pages/HomePage";
import { LoginPage } from "@/app/pages/LoginPage";
import { NotFoundPage } from "@/app/pages/NotFoundPage";
import { RegisterPage } from "@/app/pages/RegisterPage";
import { GroceryCatalogPage } from "@/app/grocery/GroceryCatalogPage";
import { AppLayout } from "@/app/layouts/AppLayout";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { ShareHistoryPage } from "@/app/shares/ShareHistoryPage";
import { SharedWithMePage } from "@/app/shares/SharedWithMePage";
import { ShoppingListPage } from "@/app/shopping-list/ShoppingListPage";
import { RequireAdmin } from "@/features/auth/RequireAdmin";
import { RequireAuth } from "@/features/auth/RequireAuth";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/app" element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="grocery" replace />} />
          <Route path="grocery" element={<GroceryCatalogPage />} />
          <Route path="shopping-list" element={<ShoppingListPage />} />
          <Route path="shared-with-me" element={<SharedWithMePage />} />
          <Route path="share-history" element={<ShareHistoryPage />} />
        </Route>
      </Route>

      <Route path="/admin" element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UserListPage />} />
          <Route path="users/new" element={<UserFormPage mode="create" />} />
          <Route path="users/:id/edit" element={<UserFormPage mode="edit" />} />
          <Route path="grocery" element={<GroceryListPage />} />
          <Route path="grocery/new" element={<GroceryFormPage mode="create" />} />
          <Route
            path="grocery/:id/edit"
            element={<GroceryFormPage mode="edit" />}
          />
          <Route path="shops" element={<ShopListPage />} />
          <Route path="shops/new" element={<ShopFormPage mode="create" />} />
          <Route path="shops/:id/edit" element={<ShopFormPage mode="edit" />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
