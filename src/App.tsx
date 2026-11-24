import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DataProvider } from "./state/data";
import { KeranjangProvider } from "./state/keranjang";
import { ToastProvider } from "./state/toast";
import { AuthProvider } from "./state/auth";
import { Home, TidakDitemukan } from "./pages/Home";
import { Login } from "./pages/admin/Login";
import { AdminLayout } from "./pages/admin/Layout";
import { Ringkasan } from "./pages/admin/Ringkasan";
import { ProdukAdmin } from "./pages/admin/Produk";
import { PesananAdmin } from "./pages/admin/Pesanan";
import { Rekap } from "./pages/admin/Rekap";
import { PengaturanAdmin } from "./pages/admin/Pengaturan";

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <DataProvider>
          <AuthProvider>
            <KeranjangProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Ringkasan />} />
                  <Route path="produk" element={<ProdukAdmin />} />
                  <Route path="pesanan" element={<PesananAdmin />} />
                  <Route path="rekap" element={<Rekap />} />
                  <Route path="pengaturan" element={<PengaturanAdmin />} />
                </Route>
                <Route path="*" element={<TidakDitemukan />} />
              </Routes>
            </KeranjangProvider>
          </AuthProvider>
        </DataProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
