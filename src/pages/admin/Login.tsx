import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { useAuth } from "../../state/auth";
import { supabaseTersedia } from "../../services/supabase";
import { AdminTop } from "./Layout";

export function Login() {
  const { peran, masukPenjual, masukDemo, memeriksa } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"penjual" | "demo">(supabaseTersedia ? "penjual" : "demo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);

  if (!memeriksa && peran !== "tamu") return <Navigate to="/admin" replace />;

  const kirimPenjual = async (e: FormEvent) => {
    e.preventDefault();
    setGalat(null);
    if (!email.trim() || !password) { setGalat("Isi email dan password."); return; }
    setMemuat(true);
    const err = await masukPenjual(email, password);
    setMemuat(false);
    if (err) { setGalat(err); setPassword(""); } else nav("/admin", { replace: true });
  };

  const kirimDemo = (e: FormEvent) => {
    e.preventDefault();
    const r = masukDemo(user, pass);
    if (r.ok) { nav("/admin", { replace: true }); return; }
    setPass("");
    setGalat(r.alasan === "terkunci"
      ? "Login dikunci karena terlalu banyak percobaan. Coba lagi dalam " + r.menit + " menit."
      : "Username atau password salah. Sisa percobaan: " + r.sisaPercobaan + ".");
  };

  return (<>
    <AdminTop />
    <main className="login-wrap">
      <div className="login-card">
        <div className="songket thin" role="presentation" />
        <div className="login-body">
          <h1>Masuk dasbor penjual</h1>
          <p>Kelola produk, kuota, dan pesanan Meugang.</p>

          <div className="segmented login-tabs" role="tablist" aria-label="Cara masuk">
            <button type="button" role="tab" aria-selected={tab === "penjual"} disabled={!supabaseTersedia}
              onClick={() => { setTab("penjual"); setGalat(null); }}><Icon name="lock" />Akun penjual</button>
            <button type="button" role="tab" aria-selected={tab === "demo"} onClick={() => { setTab("demo"); setGalat(null); }}>Mode demo</button>
          </div>

          {galat && <p className="form-error-box" role="alert">{galat}</p>}

          {tab === "penjual" ? (
            <form onSubmit={kirimPenjual} noValidate>
              <div className="form-field"><label htmlFor="a-email">Email</label>
                <input className="input" id="a-email" type="email" autoComplete="username" maxLength={120} value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="form-field"><label htmlFor="a-pass">Password</label>
                <input className="input" id="a-pass" type="password" autoComplete="current-password" maxLength={128} value={password} onChange={e => setPassword(e.target.value)} /></div>
              <button className="btn btn-primary btn-block" type="submit" disabled={memuat}>{memuat ? "Memeriksa…" : "Masuk"}</button>
            </form>
          ) : (
            <form onSubmit={kirimDemo} noValidate>
              <p className="demo-cred">
                Akun demo untuk penilaian tugas: <strong>admin</strong> / <strong>admin</strong>. Mode demo memakai salinan data
                di browser ini, jadi tidak mengubah data toko yang asli. Login terkunci 5 menit setelah 5 kali salah.
              </p>
              <div className="form-field"><label htmlFor="d-user">Username</label>
                <input className="input" id="d-user" autoComplete="off" maxLength={30} value={user} onChange={e => setUser(e.target.value)} /></div>
              <div className="form-field"><label htmlFor="d-pass">Password</label>
                <input className="input" id="d-pass" type="password" autoComplete="off" maxLength={64} value={pass} onChange={e => setPass(e.target.value)} /></div>
              <button className="btn btn-primary btn-block" type="submit">Masuk mode demo</button>
            </form>
          )}
        </div>
      </div>
    </main>
  </>);
}
