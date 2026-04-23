import { useState, useEffect } from "react";

// ============================================================
// ADMIN PANEL — BHARATASSETS (Standalone File)
// ============================================================
// This file is SEPARATE from the user-facing BharatAssets.jsx.
// Never expose this URL to end users.
//
// HOW ADMIN ↔ USER COMMUNICATION WORKS:
//   - Admin approvals/rejections are written to localStorage
//     under the key "bharatassets_admin" (a JSON object).
//   - The user-facing app (BharatAssets.jsx) reads this key
//     on every dashboard load and via a storage event listener,
//     so changes made here reflect instantly on the user side
//     when both tabs are open on the same origin.
//
// LINKS:
//   - To go to Home: open your BharatAssets app URL
//   - To go to Dashboard: open your BharatAssets app URL then log in
// ============================================================

// ---- Shared storage helpers ----
const STORE_KEY = "bharatassets_admin";
const readStore = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch { return {}; }
};
const writeStore = (updater) => {
  const current = readStore();
  const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
  localStorage.setItem(STORE_KEY, JSON.stringify(next));
  // Dispatch a storage event so other tabs pick it up
  window.dispatchEvent(new StorageEvent("storage", { key: STORE_KEY, newValue: JSON.stringify(next) }));
  return next;
};

// ---- Design tokens (inline, self-contained) ----
const AdminStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

    :root {
      --blue: #0052CC; --blue-dark: #003380; --blue-mid: #0747A6;
      --blue-light: #1967D2; --blue-pale: #E9F0FE;
      --blue-glass: rgba(0,82,204,0.08);
      --cyan: #00C2E0; --cyan-dim: rgba(0,194,224,0.15);
      --orange: #FF5630; --orange-pale: #FFF0EC;
      --green: #00875A; --green-pale: #E3FCF5;
      --gold: #FFAB00; --gold-pale: #FFF8E6;
      --white: #FFFFFF;
      --slate-50: #F8FAFC; --slate-100: #F1F5F9; --slate-200: #E2E8F0;
      --slate-300: #CBD5E1; --slate-400: #94A3B8; --slate-500: #64748B;
      --slate-600: #475569; --slate-700: #334155; --slate-800: #1E293B;
      --slate-900: #0F172A; --ink: #0D1B2A;
      --radius-sm: 8px; --radius: 14px; --radius-lg: 20px; --radius-xl: 28px;
      --shadow-sm: 0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.06);
      --shadow: 0 4px 16px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.07);
      --shadow-lg: 0 12px 40px rgba(15,23,42,0.14), 0 4px 16px rgba(15,23,42,0.08);
      --shadow-blue: 0 8px 32px rgba(0,82,204,0.24);
      --transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; font-size: 16px; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--slate-50); color: var(--ink);
      line-height: 1.6; -webkit-font-smoothing: antialiased;
    }
    h1,h2,h3,h4,h5,h6 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      line-height: 1.2; letter-spacing: -0.02em;
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--slate-300); border-radius: 3px; }

    /* LAYOUT */
    .admin-layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 264px; background: var(--slate-900); position: fixed;
      top: 0; left: 0; height: 100vh; display: flex; flex-direction: column;
      z-index: 500; overflow-y: auto; flex-shrink: 0;
    }
    .sb-logo-section { padding: 24px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .nav-logo-mark {
      width: 40px; height: 40px; background: linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%);
      border-radius: 11px; display: flex; align-items: center; justify-content: center;
      font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 18px; color: white;
      box-shadow: 0 4px 12px rgba(0,82,204,0.30); flex-shrink: 0;
    }
    .nav-logo-text { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 800; color: white; letter-spacing: -0.03em; }
    .nav-logo-text span { color: var(--orange); }
    .sb-nav { padding: 16px 12px; flex: 1; }
    .sb-section-label { font-size: 9px; font-weight: 800; letter-spacing: 2px; color: rgba(255,255,255,0.2); text-transform: uppercase; padding: 12px 8px 6px; }
    .sb-nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: var(--radius-sm);
      font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.5);
      cursor: pointer; transition: var(--transition); margin-bottom: 2px;
    }
    .sb-nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }
    .sb-nav-item.active { background: var(--blue); color: white; font-weight: 600; }
    .sb-icon { width: 18px; flex-shrink: 0; text-align: center; font-size: 15px; }
    .sb-badge { margin-left: auto; background: var(--orange); color: white; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 10px; }
    .sb-logout { padding: 16px 12px 20px; border-top: 1px solid rgba(255,255,255,0.07); }
    .sb-logout-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: var(--radius-sm);
      font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.35);
      cursor: pointer; transition: var(--transition);
    }
    .sb-logout-btn:hover { background: rgba(255,86,48,0.15); color: #FF8C7A; }

    /* MAIN CONTENT */
    .admin-content { margin-left: 264px; flex: 1; min-height: 100vh; }
    .dash-topbar {
      background: white; border-bottom: 1px solid var(--slate-200);
      padding: 0 36px; height: 68px; display: flex; align-items: center;
      justify-content: space-between; position: sticky; top: 0; z-index: 100;
      box-shadow: var(--shadow-sm);
    }
    .dash-topbar-left h1 { font-size: 20px; font-weight: 800; }
    .dash-topbar-left p { font-size: 12.5px; color: var(--slate-500); }
    .topbar-actions { display: flex; align-items: center; gap: 12px; }
    .dash-area { padding: 32px 36px; }

    /* STAT CARDS */
    .stat-cards-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 32px; }
    .stat-card {
      background: white; border-radius: var(--radius-lg);
      border: 1.5px solid var(--slate-200); padding: 26px 24px;
      transition: var(--transition); position: relative; overflow: hidden;
    }
    .stat-card:hover { box-shadow: var(--shadow); transform: translateY(-2px); }
    .stat-card-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
    .stat-card-icon.blue { background: var(--blue-pale); }
    .stat-card-icon.green { background: var(--green-pale); }
    .stat-card-icon.gold { background: var(--gold-pale); }
    .stat-card-icon.cyan { background: var(--cyan-dim); }
    .stat-label { font-size: 12px; font-weight: 700; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
    .stat-value { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 26px; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
    .stat-change { font-size: 12px; font-weight: 600; color: var(--slate-500); }
    .stat-card-decoration { position: absolute; bottom: -20px; right: -20px; width: 90px; height: 90px; border-radius: 50%; opacity: 0.06; }
    .stat-card-decoration.blue { background: var(--blue); }
    .stat-card-decoration.green { background: var(--green); }
    .stat-card-decoration.gold { background: var(--gold); }
    .stat-card-decoration.cyan { background: var(--cyan); }

    /* TABLE */
    .dash-card { background: white; border-radius: var(--radius-lg); border: 1.5px solid var(--slate-200); overflow: hidden; margin-bottom: 24px; }
    .dash-card-header { padding: 22px 28px; border-bottom: 1px solid var(--slate-200); display: flex; justify-content: space-between; align-items: center; }
    .dash-card-title { font-size: 16px; font-weight: 700; }
    .dash-card-body { padding: 24px 28px; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th { padding: 12px 16px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: var(--slate-500); background: var(--slate-50); border-bottom: 1px solid var(--slate-200); text-align: left; }
    .admin-table td { padding: 14px 16px; font-size: 13.5px; border-bottom: 1px solid var(--slate-100); vertical-align: middle; }
    .admin-table tr:last-child td { border-bottom: none; }
    .admin-table tr:hover td { background: var(--slate-50); }

    /* STATUS BADGES */
    .txn-status { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 10px; display: inline-block; }
    .txn-status.approved, .txn-status.disbursed { background: var(--green-pale); color: var(--green); }
    .txn-status.pending { background: var(--gold-pale); color: #946800; }
    .txn-status.processing { background: var(--blue-pale); color: var(--blue); }
    .txn-status.rejected { background: var(--orange-pale); color: var(--orange); }
    .txn-status.submitted { background: var(--cyan-dim); color: #007A8C; }

    /* ACTION BUTTONS */
    .action-btn {
      padding: 6px 13px; border-radius: 7px; font-size: 12px; font-weight: 700;
      cursor: pointer; border: none; transition: var(--transition);
      font-family: 'DM Sans', sans-serif;
    }
    .action-btn.approve { background: var(--green-pale); color: var(--green); }
    .action-btn.approve:hover { background: var(--green); color: white; }
    .action-btn.reject { background: var(--orange-pale); color: var(--orange); }
    .action-btn.reject:hover { background: var(--orange); color: white; }
    .action-btn.view { background: var(--blue-pale); color: var(--blue); }
    .action-btn.view:hover { background: var(--blue); color: white; }

    /* FORM ELEMENTS */
    .form-group { margin-bottom: 22px; }
    .form-label { font-size: 13px; font-weight: 700; color: var(--slate-700); margin-bottom: 8px; display: block; }
    .form-input {
      width: 100%; padding: 13px 14px;
      border: 1.5px solid var(--slate-300); border-radius: var(--radius-sm);
      font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--ink);
      background: white; outline: none; transition: var(--transition);
    }
    .form-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(0,82,204,0.10); }

    /* BUTTONS */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 22px; border-radius: var(--radius-sm);
      font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
      cursor: pointer; border: none; transition: var(--transition);
    }
    .btn-primary { background: var(--blue); color: white; box-shadow: 0 2px 8px rgba(0,82,204,0.28); }
    .btn-primary:hover { background: var(--blue-mid); transform: translateY(-1px); }
    .btn-lg { padding: 14px 32px; font-size: 16px; border-radius: var(--radius); }
    .btn-danger { background: var(--orange); color: white; }
    .btn-danger:hover { background: #e04020; }

    /* PAGE HEADER */
    .page-header { margin-bottom: 28px; }
    .page-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .page-header p { font-size: 14px; color: var(--slate-500); }

    /* TOAST */
    @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
    .toast {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      background: var(--ink); color: white; padding: 14px 22px;
      border-radius: var(--radius); font-size: 14px; font-weight: 600;
      box-shadow: var(--shadow-lg); animation: slideInRight 0.3s ease;
      display: flex; align-items: center; gap: 10px; max-width: 340px;
    }
    .toast.success { background: var(--green); }
    .toast.error { background: var(--orange); }

    /* LOGIN */
    .login-wrap {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(155deg, #030B1A 0%, #001855 50%, #0052CC 100%);
    }
    .login-box {
      background: white; border-radius: var(--radius-xl); padding: 48px 44px;
      width: 100%; max-width: 420px; box-shadow: var(--shadow-lg);
    }

    /* LIVE BADGE */
    .live-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(74,229,74,0.15); color: #00875A;
      font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px;
    }
    .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #4AE54A; }
  `}</style>
);

// ---- Toast notification ----
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  return <div className={`toast ${type}`}><span>{icon}</span>{msg}</div>;
};

// ---- Admin login guard ----
const ADMIN_PASSWORD = "admin@bharat2025"; // Change this to your real password
const AdminLogin = ({ onLogin }) => {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) { onLogin(); }
    else { setErr("Invalid password. Please try again."); }
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div className="nav-logo-mark">B</div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 20, fontWeight: 800 }}>Admin<span style={{ color: "var(--orange)" }}>Panel</span></div>
            <div style={{ fontSize: 12, color: "var(--slate-500)" }}>BharatAssets — Restricted Access</div>
          </div>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Sign In</h2>
        <p style={{ fontSize: 14, color: "var(--slate-500)", marginBottom: 28 }}>This page is for authorised administrators only.</p>
        <div className="form-group">
          <label className="form-label">Admin Password</label>
          <input
            className="form-input" type="password" placeholder="Enter admin password"
            value={pw} onChange={e => { setPw(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoFocus
          />
          {err && <div style={{ color: "var(--orange)", fontSize: 12, marginTop: 6, fontWeight: 600 }}>{err}</div>}
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={handleLogin}>
          🔐 Access Admin Panel
        </button>
        <div style={{ marginTop: 20, fontSize: 12, color: "var(--slate-400)", textAlign: "center" }}>
          Users cannot see this page. Keep this URL private.
        </div>
      </div>
    </div>
  );
};

// ---- Main Admin App ----
export default function BharatAdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_authed") === "1");
  const [activeSection, setActiveSection] = useState("overview");
  const [store, setStore] = useState(readStore);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });
  const hideToast = () => setToast(null);

  const applyAction = (key, value, message) => {
    const next = writeStore(s => ({ ...s, [key]: value }));
    setStore(next);
    showToast(message, "success");
  };

  const handleLogin = () => {
    sessionStorage.setItem("admin_authed", "1");
    setAuthed(true);
  };

  if (!authed) return <><AdminStyles /><AdminLogin onLogin={handleLogin} /></>;

  const adminNav = [
    { section: "Overview" },
    { id: "overview", icon: "📊", label: "Dashboard" },
    { section: "Management" },
    { id: "users", icon: "👥", label: "User Management" },
    { id: "kyc", icon: "🪪", label: "KYC Approvals", badge: "12" },
    { id: "transactions", icon: "💳", label: "Transaction Queue", badge: "5" },
    { section: "Configuration" },
    { id: "roi", icon: "📈", label: "ROI Manager" },
    { id: "assets", icon: "🏛️", label: "Asset Log Editor" },
    { id: "support", icon: "💬", label: "Support Settings" },
  ];

  return (
    <>
      <AdminStyles />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={hideToast} />}

      <div className="admin-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sb-logo-section">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="nav-logo-mark">B</div>
              <div className="nav-logo-text">Admin<span>Panel</span></div>
            </div>
          </div>

          {/* Navigation links back to user app */}
          <div style={{ padding: "12px 16px", background: "rgba(0,82,204,0.12)", margin: "12px", borderRadius: "var(--radius-sm)", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 6 }}>🔗 User App Links</div>
            <div>Open your BharatAssets app in another tab to view the user perspective. Approvals reflect there in real-time.</div>
          </div>

          <div className="sb-nav">
            {adminNav.map((item, i) => {
              if (item.section) return <div key={i} className="sb-section-label">{item.section}</div>;
              return (
                <div key={i} className={`sb-nav-item${activeSection === item.id ? " active" : ""}`} onClick={() => setActiveSection(item.id)}>
                  <span className="sb-icon">{item.icon}</span>
                  {item.label}
                  {item.badge && <span className="sb-badge">{item.badge}</span>}
                </div>
              );
            })}
          </div>

          <div className="sb-logout">
            <div className="sb-logout-btn" onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }}>
              <span>🚪</span> Logout
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content">
          <div className="dash-topbar">
            <div className="dash-topbar-left">
              <h1>BharatAssets Admin</h1>
              <p>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="topbar-actions">
              <div className="live-pill"><div className="live-dot" /> Live Admin</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--blue-pale)", borderRadius: 10, padding: "8px 14px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14 }}>A</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Admin</div>
              </div>
            </div>
          </div>

          <div className="dash-area">

            {/* ---- OVERVIEW ---- */}
            {activeSection === "overview" && (
              <>
                <div className="stat-cards-grid">
                  {[
                    { icon: "👥", color: "blue", label: "Total Users", val: "48,247", change: "+127 today" },
                    { icon: "💰", color: "green", label: "Total AUM", val: "₹240Cr", change: "+₹1.2Cr today" },
                    { icon: "⏳", color: "gold", label: "Pending KYC", val: "12", change: "Needs review" },
                    { icon: "💸", color: "cyan", label: "Pending Payouts", val: "₹4,82,500", change: "5 requests" },
                  ].map(({ icon, color, label, val, change }) => (
                    <div key={label} className="stat-card">
                      <div className={`stat-card-icon ${color}`}>{icon}</div>
                      <div className="stat-label">{label}</div>
                      <div className="stat-value">{val}</div>
                      <div className="stat-change">{change}</div>
                      <div className={`stat-card-decoration ${color}`} />
                    </div>
                  ))}
                </div>

                {/* Storage state viewer */}
                <div className="dash-card" style={{ marginBottom: 24 }}>
                  <div className="dash-card-header">
                    <span className="dash-card-title">🔗 Live User Sync Status</span>
                    <div className="live-pill"><div className="live-dot" /> Synced via localStorage</div>
                  </div>
                  <div className="dash-card-body">
                    <p style={{ fontSize: 13, color: "var(--slate-500)", marginBottom: 16 }}>
                      All approvals you make here are instantly visible to the logged-in user on the BharatAssets app (same browser). The current shared state:
                    </p>
                    <pre style={{ background: "var(--slate-50)", borderRadius: 10, padding: 16, fontSize: 12, color: "var(--slate-700)", border: "1px solid var(--slate-200)", overflow: "auto", maxHeight: 200 }}>
                      {JSON.stringify(store, null, 2) || "{}"}
                    </pre>
                    <button className="btn btn-danger" style={{ marginTop: 16, fontSize: 13, padding: "8px 18px" }} onClick={() => { localStorage.removeItem(STORE_KEY); setStore({}); showToast("Store cleared. User app reset to defaults.", "error"); }}>
                      🗑️ Reset All Admin State
                    </button>
                  </div>
                </div>

                {/* Recent signups */}
                <div className="dash-card">
                  <div className="dash-card-header"><span className="dash-card-title">Recent User Registrations</span></div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="admin-table">
                      <thead>
                        <tr><th>User</th><th>Email</th><th>Phone</th><th>KYC Status</th><th>Joined</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {[
                          ["Rahul Sharma","rahul@example.com","9876543210","demo_user","approved","18 Jan 2025"],
                          ["Priya Mehta","priya@example.com","9123456780","user_priya","submitted","18 Jan 2025"],
                          ["Amit Singh","amit@example.com","9000000001","user_amit","pending","17 Jan 2025"],
                          ["Kavita Verma","kavita@example.com","9111222333","user_kavita","submitted","17 Jan 2025"],
                          ["Rajan Patel","rajan@example.com","9444555666","user_rajan","pending","16 Jan 2025"],
                        ].map(([name, email, phone, uid, kyc, date]) => {
                          const currentKyc = store[`kyc_${uid}`] || kyc;
                          return (
                            <tr key={email}>
                              <td><strong>{name}</strong></td>
                              <td style={{ color: "var(--slate-500)" }}>{email}</td>
                              <td>{phone}</td>
                              <td><span className={`txn-status ${currentKyc}`}>{currentKyc}</span></td>
                              <td style={{ color: "var(--slate-500)", fontSize: 13 }}>{date}</td>
                              <td style={{ display: "flex", gap: 6 }}>
                                <button className="action-btn view" onClick={() => setActiveSection("kyc")}>View KYC</button>
                                <button className="action-btn approve" onClick={() => applyAction(`kyc_${uid}`, "approved", `✅ KYC approved for ${name}`)}>✓ Approve</button>
                                <button className="action-btn reject" onClick={() => applyAction(`kyc_${uid}`, "rejected", `❌ KYC rejected for ${name}`)}>✗ Reject</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ---- KYC APPROVALS ---- */}
            {activeSection === "kyc" && (
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">KYC Approval Queue</span>
                  <span style={{ fontSize: 13, color: "var(--orange)", fontWeight: 700 }}>12 Pending</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr><th>User</th><th>Document</th><th>Doc Number</th><th>Submitted</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {[
                        ["Priya Mehta","Aadhaar","XXXX XXXX 1234","Today 10:15 AM","user_priya"],
                        ["Amit Singh","PAN","ABCDE1234F","Yesterday","user_amit"],
                        ["Kavita Verma","Aadhaar","XXXX XXXX 5678","Yesterday","user_kavita"],
                        ["Rajan Patel","PAN","PQRST5678G","2 days ago","user_rajan"],
                        ["Meera Shah","Voter ID","ABC1234567","2 days ago","user_meera"],
                        ["Demo User","Aadhaar","XXXX XXXX 9012","Today 8:00 AM","demo_user"],
                      ].map(([name, doc, num, date, uid]) => {
                        const status = store[`kyc_${uid}`] || "submitted";
                        return (
                          <tr key={uid}>
                            <td><strong>{name}</strong></td>
                            <td>{doc}</td>
                            <td style={{ fontFamily: "monospace", fontSize: 13 }}>{num}</td>
                            <td style={{ fontSize: 13, color: "var(--slate-500)" }}>{date}</td>
                            <td><span className={`txn-status ${status}`}>{status}</span></td>
                            <td style={{ display: "flex", gap: 6 }}>
                              <button className="action-btn view">View Docs</button>
                              <button
                                className="action-btn approve"
                                onClick={() => applyAction(`kyc_${uid}`, "approved", `✅ KYC approved for ${name}. Reflected on user dashboard.`)}
                              >✓ Approve</button>
                              <button
                                className="action-btn reject"
                                onClick={() => applyAction(`kyc_${uid}`, "rejected", `❌ KYC rejected for ${name}.`)}
                              >✗ Reject</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ---- TRANSACTION QUEUE ---- */}
            {activeSection === "transactions" && (
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">Transaction Queue</span>
                  <span style={{ fontSize: 13, color: "var(--orange)", fontWeight: 700 }}>5 Pending</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr><th>Ref</th><th>User</th><th>Type</th><th>Amount</th><th>UTR</th><th>Status</th><th>Time</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {[
                        ["DEP-8A92BC","Rahul S.","Deposit","₹50,000","UTR123456","pending","Today 3:42 PM","txn_dep_8A92BC"],
                        ["WD-K3M2NP","Priya M.","Withdrawal","₹8,750","—","pending","Today 11:22 AM","txn_wd_K3M2NP"],
                        ["DEP-7R93CD","Amit K.","Deposit","₹1,00,000","UTR789012","pending","Yesterday","txn_dep_7R93CD"],
                        ["WD-P4Q5RS","Kavita V.","Withdrawal","₹12,400","—","pending","Yesterday","txn_wd_P4Q5RS"],
                        ["DEP-AB12CD","Rajan P.","Deposit","₹25,000","UTR345678","processing","2 days ago","txn_dep_AB12CD"],
                      ].map(([ref, user, type, amount, utr, defaultStatus, time, storeKey]) => {
                        const status = store[storeKey] || defaultStatus;
                        return (
                          <tr key={ref}>
                            <td style={{ fontWeight: 700, fontSize: 12, color: "var(--slate-500)" }}>{ref}</td>
                            <td><strong>{user}</strong></td>
                            <td>
                              <span className="txn-status" style={{ background: type === "Deposit" ? "var(--green-pale)" : "var(--blue-pale)", color: type === "Deposit" ? "var(--green)" : "var(--blue)" }}>
                                {type}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700 }}>{amount}</td>
                            <td style={{ fontSize: 12, color: "var(--slate-500)" }}>{utr}</td>
                            <td><span className={`txn-status ${status}`}>{status}</span></td>
                            <td style={{ fontSize: 12, color: "var(--slate-500)" }}>{time}</td>
                            <td style={{ display: "flex", gap: 6 }}>
                              <button
                                className="action-btn approve"
                                onClick={() => applyAction(storeKey, "approved", `✅ ${ref} approved. ₹ credited/disbursed to user.`)}
                              >✓ Approve</button>
                              <button
                                className="action-btn reject"
                                onClick={() => applyAction(storeKey, "rejected", `❌ ${ref} rejected.`)}
                              >✗ Reject</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ---- USER MANAGEMENT ---- */}
            {activeSection === "users" && (
              <div>
                <div className="page-header"><h2>User Management</h2><p>Search, view, and manage all registered users.</p></div>
                <div className="dash-card" style={{ marginBottom: 24 }}>
                  <div className="dash-card-body">
                    <div style={{ display: "flex", gap: 14 }}>
                      <input className="form-input" style={{ maxWidth: 340 }} placeholder="🔍 Search by name, email or phone..." />
                      <select className="form-input" style={{ maxWidth: 180 }}>
                        <option>All KYC Status</option>
                        <option>Approved</option>
                        <option>Pending</option>
                        <option>Rejected</option>
                      </select>
                      <button className="btn btn-primary">Search</button>
                    </div>
                  </div>
                </div>
                <div className="dash-card">
                  <div style={{ overflowX: "auto" }}>
                    <table className="admin-table">
                      <thead>
                        <tr><th>User</th><th>Email</th><th>Phone</th><th>KYC</th><th>Balance</th><th>Invested</th><th>Joined</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {[
                          ["Rahul Sharma","rahul@example.com","9876543210","demo_user","₹1,24,750","₹2,25,000","18 Jan"],
                          ["Priya Mehta","priya@example.com","9123456780","user_priya","₹45,000","₹1,00,000","18 Jan"],
                          ["Amit Singh","amit@example.com","9000000001","user_amit","₹0","₹0","17 Jan"],
                          ["Kavita Verma","kavita@example.com","9111222333","user_kavita","₹12,500","₹50,000","17 Jan"],
                          ["Rajan Patel","rajan@example.com","9444555666","user_rajan","₹0","₹0","16 Jan"],
                        ].map(([name, email, phone, uid, bal, inv, date]) => {
                          const kyc = store[`kyc_${uid}`] || (uid === "demo_user" ? "approved" : "pending");
                          return (
                            <tr key={email}>
                              <td><strong>{name}</strong></td>
                              <td style={{ color: "var(--slate-500)", fontSize: 13 }}>{email}</td>
                              <td>{phone}</td>
                              <td><span className={`txn-status ${kyc}`}>{kyc}</span></td>
                              <td style={{ fontWeight: 700 }}>{bal}</td>
                              <td style={{ fontWeight: 700, color: "var(--blue)" }}>{inv}</td>
                              <td style={{ color: "var(--slate-500)", fontSize: 13 }}>{date}</td>
                              <td style={{ display: "flex", gap: 6 }}>
                                <button className="action-btn view">View</button>
                                <button className="action-btn approve" onClick={() => applyAction(`kyc_${uid}`, "approved", `KYC approved for ${name}`)}>KYC ✓</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---- ROI MANAGER ---- */}
            {activeSection === "roi" && (
              <div style={{ maxWidth: 700 }}>
                <div className="page-header"><h2>ROI Manager</h2><p>Adjust profit rates and calculator formulas.</p></div>
                <div className="dash-card">
                  <div className="dash-card-body">
                    {[
                      ["FD 3 Months Total Return (%)","21","fd3_rate"],
                      ["FD 6 Months Total Return (%)","45","fd6_rate"],
                      ["FD 12 Months Total Return (%)","100","fd12_rate"],
                      ["Smart Plan Daily Rate <60 days (%)","1.5","smart_short"],
                      ["Smart Plan Daily Rate ≥60 days (%)","2.0","smart_long"],
                      ["Lifetime Annuity Daily Rate (%)","1.0","annuity_rate"],
                      ["TDS Deduction Percentage (%)","2","tds_pct"],
                      ["Minimum Withdrawal Amount (₹)","500","min_withdrawal"],
                      ["Referral Bonus Percentage (%)","2","referral_bonus"],
                    ].map(([label, val, key]) => (
                      <div key={key} style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 16, alignItems: "center", padding: "16px 0", borderBottom: "1px solid var(--slate-100)" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                          <div style={{ fontSize: 12, color: "var(--slate-500)" }}>Key: {key}</div>
                        </div>
                        <input className="form-input" defaultValue={store[`roi_${key}`] || val} style={{ textAlign: "right", fontWeight: 700, fontSize: 16 }}
                          onChange={e => writeStore(s => ({ ...s, [`roi_${key}`]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 24 }} onClick={() => showToast("ROI rates saved and synced to user calculator.", "success")}>
                      💾 Save All Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---- ASSET LOG ---- */}
            {activeSection === "assets" && (
              <div>
                <div className="page-header"><h2>Asset Log Editor</h2><p>Update fund utilization statuses for corporate groups.</p></div>
                {[
                  { emoji: "🏗️", name: "Adani Group", sector: "Infrastructure & Ports", note: "Capital deployed in Mundra Port expansion and ATGL gas distribution.", alloc: 580, util: 88, growth: "22.1%" },
                  { emoji: "🛢️", name: "Reliance Industries", sector: "Energy & Retail", note: "Funds active in JioMart digital retail logistics and green energy.", alloc: 920, util: 94, growth: "18.4%" },
                  { emoji: "🏦", name: "HDFC Group", sector: "Banking & Finance", note: "Wholesale lending book and housing finance segment.", alloc: 430, util: 76, growth: "14.7%" },
                  { emoji: "🚗", name: "Tata Motors", sector: "EV & Automotive", note: "Tata Nexon EV supply chain and Jaguar turnaround programme.", alloc: 310, util: 82, growth: "31.2%" },
                ].map((a, i) => (
                  <div key={i} className="dash-card" style={{ marginBottom: 16 }}>
                    <div className="dash-card-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 28 }}>{a.emoji}</span>
                        <div><div style={{ fontWeight: 700 }}>{a.name}</div><div style={{ fontSize: 12, color: "var(--slate-500)" }}>{a.sector}</div></div>
                      </div>
                      <button className="action-btn view">Save Changes</button>
                    </div>
                    <div className="dash-card-body">
                      <div className="form-group">
                        <label className="form-label">Fund Utilization Note</label>
                        <textarea className="form-input" rows={2} defaultValue={a.note} style={{ resize: "vertical" }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Allocated (Cr)</label>
                          <input className="form-input" defaultValue={a.alloc} type="number" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Utilised %</label>
                          <input className="form-input" defaultValue={a.util} type="number" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">YoY Growth</label>
                          <input className="form-input" defaultValue={a.growth} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ---- SUPPORT SETTINGS ---- */}
            {activeSection === "support" && (
              <div style={{ maxWidth: 600 }}>
                <div className="page-header"><h2>Support Chat Settings</h2></div>
                <div className="dash-card">
                  <div className="dash-card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: "1px solid var(--slate-100)" }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>Support Chat Active</div>
                        <div style={{ fontSize: 13, color: "var(--slate-500)" }}>Toggle live chat availability</div>
                      </div>
                      <div style={{ width: 52, height: 28, borderRadius: 14, background: "var(--green)", cursor: "pointer", display: "flex", alignItems: "center", padding: 3 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "white", marginLeft: "auto", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
                      </div>
                    </div>
                    <div style={{ padding: "20px 0", borderBottom: "1px solid var(--slate-100)" }}>
                      <div style={{ fontWeight: 700, marginBottom: 16 }}>Active Hours (IST)</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {[["Start Time", "10:00"], ["End Time", "16:00"]].map(([l, v]) => (
                          <div key={l} className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">{l}</label>
                            <input className="form-input" type="time" defaultValue={v} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: "20px 0" }}>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>Offline Message</div>
                      <textarea className="form-input" rows={3} defaultValue="Support is available 10 AM – 4 PM IST, Monday to Saturday. Please leave your query and we'll respond shortly." style={{ resize: "vertical" }} />
                    </div>
                    <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={() => showToast("Support settings saved.", "success")}>💾 Save Settings</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
