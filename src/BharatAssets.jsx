import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// SHARED STATE HELPERS (localStorage bridge with Admin Panel)
// ============================================================
const getAdminStore = () => {
  try { return JSON.parse(localStorage.getItem('bharatassets_admin') || '{}'); } catch { return {}; }
};
const watchAdminStore = (cb) => {
  const handler = (e) => { if (e.key === 'bharatassets_admin') cb(getAdminStore()); };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};

// ============================================================
// DESIGN SYSTEM & GLOBAL STYLES
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

    :root {
      --blue: #0052CC;
      --blue-dark: #003380;
      --blue-mid: #0747A6;
      --blue-light: #1967D2;
      --blue-pale: #E9F0FE;
      --blue-glass: rgba(0,82,204,0.08);
      --cyan: #00C2E0;
      --cyan-dim: rgba(0,194,224,0.15);
      --orange: #FF5630;
      --orange-pale: #FFF0EC;
      --green: #00875A;
      --green-pale: #E3FCF5;
      --gold: #FFAB00;
      --gold-pale: #FFF8E6;
      --white: #FFFFFF;
      --slate-50: #F8FAFC;
      --slate-100: #F1F5F9;
      --slate-200: #E2E8F0;
      --slate-300: #CBD5E1;
      --slate-400: #94A3B8;
      --slate-500: #64748B;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1E293B;
      --slate-900: #0F172A;
      --ink: #0D1B2A;
      --radius-sm: 8px;
      --radius: 14px;
      --radius-lg: 20px;
      --radius-xl: 28px;
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
      background: var(--slate-50);
      color: var(--ink);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    h1,h2,h3,h4,h5,h6 {
      font-family: 'Poppins', sans-serif;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    /* SCROLLBAR */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--slate-300); border-radius: 3px; }

    /* TICKER ANIMATION */
    @keyframes ticker-move {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* SHIMMER */
    @keyframes shimmer {
      0% { background-position: -800px 0; }
      100% { background-position: 800px 0; }
    }
    .shimmer {
      background: linear-gradient(90deg, #f0f4ff 0%, #e4ecff 50%, #f0f4ff 100%);
      background-size: 800px 100%;
      animation: shimmer 1.6s infinite linear;
    }

    /* FADE IN UP */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(28px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(32px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes count-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes bar-grow {
      from { height: 0; }
      to { height: var(--bar-h); }
    }
    @keyframes ring-fill {
      from { stroke-dashoffset: 283; }
      to { stroke-dashoffset: var(--dash); }
    }

    .animate-in { animation: fadeInUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
    .animate-in-delay-1 { animation-delay: 0.1s; }
    .animate-in-delay-2 { animation-delay: 0.2s; }
    .animate-in-delay-3 { animation-delay: 0.3s; }
    .animate-in-delay-4 { animation-delay: 0.4s; }
    .animate-in-delay-5 { animation-delay: 0.5s; }

    /* NAV */
    .nav-root {
      position: sticky; top: 0; z-index: 900;
      background: rgba(255,255,255,0.94);
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(0,82,204,0.08);
      transition: var(--transition);
    }
    .nav-root.scrolled {
      box-shadow: 0 4px 24px rgba(0,82,204,0.10);
    }
    .nav-inner {
      max-width: 1320px; margin: 0 auto;
      padding: 0 32px;
      height: 70px;
      display: flex; align-items: center; justify-content: space-between; gap: 32px;
    }
    .nav-logo {
      display: flex; align-items: center; gap: 10px;
      cursor: pointer; flex-shrink: 0;
    }
    .nav-logo-mark {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%);
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Poppins', sans-serif;
      font-weight: 800; font-size: 18px; color: white;
      box-shadow: 0 4px 12px rgba(0,82,204,0.30);
    }
    .nav-logo-text {
      font-family: 'Poppins', sans-serif;
      font-size: 20px; font-weight: 800;
      color: var(--ink); letter-spacing: -0.03em;
    }
    .nav-logo-text span { color: var(--blue); }
    .nav-links {
      display: flex; align-items: center; gap: 4px;
      list-style: none; flex: 1; justify-content: center;
    }
    .nav-links a {
      padding: 8px 14px; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 500; color: var(--slate-600);
      cursor: pointer; transition: var(--transition);
      white-space: nowrap;
    }
    .nav-links a:hover { background: var(--blue-pale); color: var(--blue); }
    .nav-links a.active { color: var(--blue); font-weight: 600; }
    .nav-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 22px; border-radius: var(--radius-sm);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px; font-weight: 600;
      cursor: pointer; border: none; transition: var(--transition);
      white-space: nowrap; text-decoration: none;
    }
    .btn-ghost { background: transparent; color: var(--slate-700); }
    .btn-ghost:hover { background: var(--slate-100); color: var(--ink); }
    .btn-primary {
      background: var(--blue); color: white;
      box-shadow: 0 2px 8px rgba(0,82,204,0.28);
    }
    .btn-primary:hover {
      background: var(--blue-mid); transform: translateY(-1px);
      box-shadow: var(--shadow-blue);
    }
    .btn-primary:active { transform: translateY(0); }
    .btn-outline {
      background: transparent; color: var(--blue);
      border: 1.5px solid rgba(0,82,204,0.3);
    }
    .btn-outline:hover { background: var(--blue-pale); border-color: var(--blue); }
    .btn-lg { padding: 14px 32px; font-size: 16px; border-radius: var(--radius); }
    .btn-white { background: white; color: var(--blue); box-shadow: var(--shadow); }
    .btn-white:hover { background: var(--blue-pale); box-shadow: var(--shadow-lg); }
    .btn-cyan {
      background: linear-gradient(135deg, var(--cyan), #00A8C4);
      color: var(--ink); font-weight: 700;
    }
    .btn-cyan:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,194,224,0.35); }

    /* TICKER BAR */
    .ticker-bar {
      background: linear-gradient(90deg, var(--blue-dark) 0%, var(--blue) 50%, var(--blue-light) 100%);
      height: 42px; overflow: hidden; position: relative;
    }
    .ticker-bar::before, .ticker-bar::after {
      content: ''; position: absolute; top: 0; height: 100%; width: 120px; z-index: 2;
    }
    .ticker-bar::before { left: 0; background: linear-gradient(90deg, var(--blue-dark), transparent); }
    .ticker-bar::after { right: 0; background: linear-gradient(-90deg, var(--blue-light), transparent); }
    .ticker-live-badge {
      position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
      background: rgba(255,255,255,0.18); color: white;
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      padding: 3px 10px; border-radius: 20px; z-index: 3;
      display: flex; align-items: center; gap: 5px;
    }
    .live-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #4AE54A;
      animation: pulse-dot 1.4s ease-in-out infinite;
    }
    .ticker-track {
      display: flex; align-items: center;
      width: max-content;
      animation: ticker-move 50s linear infinite;
      padding-left: 160px;
    }
    .ticker-track:hover { animation-play-state: paused; }
    .ticker-item {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 0 28px; white-space: nowrap;
      color: rgba(255,255,255,0.88); font-size: 13px; font-weight: 500;
    }
    .ticker-icon {
      width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; flex-shrink: 0;
    }
    .ticker-invest .ticker-icon { background: rgba(0,194,224,0.3); }
    .ticker-payout .ticker-icon { background: rgba(74,229,74,0.3); }
    .ticker-sep { color: rgba(255,255,255,0.25); font-size: 16px; }
    .ticker-amount { color: white; font-weight: 700; }
    .ticker-name { color: rgba(255,255,255,0.75); }

    /* HERO */
    .hero {
      background: linear-gradient(155deg, #030B1A 0%, #001855 40%, #0035A0 70%, #0052CC 100%);
      padding: 96px 32px 120px;
      position: relative; overflow: hidden;
      min-height: 90vh; display: flex; align-items: center;
    }
    .hero-bg-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .hero-bg-orb-1 {
      position: absolute; width: 700px; height: 700px; border-radius: 50%;
      background: radial-gradient(circle, rgba(0,194,224,0.14) 0%, transparent 70%);
      top: -200px; right: -100px; pointer-events: none;
    }
    .hero-bg-orb-2 {
      position: absolute; width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle, rgba(0,82,204,0.2) 0%, transparent 70%);
      bottom: -150px; left: -100px; pointer-events: none;
    }
    .hero-inner {
      max-width: 1320px; margin: 0 auto; width: 100%;
      display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
      position: relative; z-index: 1;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.18); border-radius: 30px;
      padding: 7px 16px; font-size: 12.5px; color: rgba(255,255,255,0.85);
      margin-bottom: 28px; font-weight: 500; letter-spacing: 0.3px;
    }
    .hero-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--cyan); }
    .hero h1 {
      font-size: clamp(38px, 4.5vw, 60px); font-weight: 800;
      color: white; line-height: 1.1; margin-bottom: 24px;
    }
    .hero h1 .gradient-text {
      background: linear-gradient(135deg, var(--cyan), #7EC8FF);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-sub {
      font-size: 18px; color: rgba(255,255,255,0.68);
      line-height: 1.75; margin-bottom: 40px; max-width: 500px;
    }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 56px; }
    .hero-stats { display: flex; gap: 40px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.12); }
    .hero-stat-val {
      font-family: 'Poppins', sans-serif;
      font-size: 30px; font-weight: 800; color: white;
      line-height: 1; margin-bottom: 4px;
    }
    .hero-stat-val .accent { color: var(--cyan); }
    .hero-stat-lbl { font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 500; letter-spacing: 0.3px; }

    /* HERO CARD */
    .hero-card-stack { position: relative; height: 480px; }
    .hero-main-card {
      background: rgba(255,255,255,0.07); backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.14); border-radius: var(--radius-xl);
      padding: 32px; position: absolute; left: 0; right: 40px; top: 0;
      box-shadow: 0 32px 80px rgba(0,0,0,0.3);
      animation: float 6s ease-in-out infinite;
    }
    .hc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .hc-label { font-size: 13px; color: rgba(255,255,255,0.6); font-weight: 500; }
    .hc-live-pill {
      display: flex; align-items: center; gap: 5px;
      background: rgba(74,229,74,0.2); color: #4AE54A;
      font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 20px;
    }
    .hc-amount { font-family: 'Poppins', sans-serif; font-size: 46px; font-weight: 800; color: white; margin-bottom: 4px; }
    .hc-sub { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 28px; }
    .hc-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .hc-metric {
      background: rgba(255,255,255,0.07); border-radius: 12px;
      padding: 14px; border: 1px solid rgba(255,255,255,0.08);
    }
    .hc-m-label { font-size: 10px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .hc-m-val { font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 700; color: white; }
    .hc-m-val.pos { color: #4AE54A; }
    .hc-m-val.cyan { color: var(--cyan); }
    .hc-chart-row { display: flex; align-items: flex-end; gap: 5px; height: 52px; }
    .hc-bar {
      flex: 1; border-radius: 4px 4px 0 0;
      background: rgba(255,255,255,0.15);
      transition: var(--transition);
    }
    .hc-bar.active { background: linear-gradient(180deg, var(--cyan) 0%, rgba(0,194,224,0.4) 100%); }

    .hero-float-card {
      background: white; border-radius: var(--radius-lg);
      padding: 18px 22px; position: absolute;
      box-shadow: var(--shadow-lg); border: 1px solid var(--slate-200);
      animation: float 5s ease-in-out infinite 1s;
    }
    .hero-float-card.card-payout { right: 0; bottom: 80px; width: 200px; }
    .hero-float-card.card-plans { right: 20px; top: 380px; width: 180px; }

    /* SECTION */
    .section { padding: 96px 32px; }
    .section-inner { max-width: 1320px; margin: 0 auto; }
    .section-tag {
      display: inline-flex; align-items: center; gap: 7px;
      background: var(--blue-pale); color: var(--blue);
      font-size: 12px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; padding: 6px 14px; border-radius: 30px;
      margin-bottom: 16px;
    }
    .section-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); }
    .section-title {
      font-size: clamp(28px, 3vw, 42px); font-weight: 800; color: var(--ink);
      margin-bottom: 16px; max-width: 700px;
    }
    .section-sub { font-size: 17px; color: var(--slate-500); max-width: 600px; line-height: 1.75; }

    /* PLANS */
    .plans-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 56px; }
    .plan-card {
      background: white; border-radius: var(--radius-xl);
      border: 1.5px solid var(--slate-200);
      padding: 36px 32px;
      transition: var(--transition); position: relative; overflow: hidden;
      cursor: pointer;
    }
    .plan-card::before {
      content: ''; position: absolute; inset: 0; opacity: 0;
      background: linear-gradient(135deg, var(--blue-pale), rgba(0,194,224,0.05));
      transition: var(--transition);
    }
    .plan-card:hover { border-color: var(--blue); box-shadow: var(--shadow-blue); transform: translateY(-6px); }
    .plan-card:hover::before { opacity: 1; }
    .plan-card.featured {
      background: linear-gradient(145deg, var(--blue-dark) 0%, var(--blue) 100%);
      border-color: transparent; color: white;
    }
    .plan-card.featured .plan-desc, .plan-card.featured .plan-tag-label { color: rgba(255,255,255,0.7); }
    .plan-badge {
      position: absolute; top: 24px; right: -28px;
      background: var(--orange); color: white;
      font-size: 10px; font-weight: 800; letter-spacing: 1px;
      padding: 5px 50px; transform: rotate(45deg);
    }
    .plan-icon-wrap {
      width: 60px; height: 60px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px; font-size: 26px;
    }
    .plan-icon-wrap.blue { background: var(--blue-pale); }
    .plan-icon-wrap.white { background: rgba(255,255,255,0.15); }
    .plan-icon-wrap.gold { background: var(--gold-pale); }
    .plan-name { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
    .plan-desc { font-size: 14px; color: var(--slate-500); line-height: 1.7; margin-bottom: 28px; }
    .plan-rates-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 28px; }
    .plan-rate-box {
      background: var(--slate-50); border-radius: var(--radius-sm);
      padding: 12px 8px; text-align: center; border: 1px solid var(--slate-200);
    }
    .plan-card.featured .plan-rate-box { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); }
    .plan-rate-pct { font-family: 'Poppins', sans-serif; font-size: 20px; font-weight: 800; color: var(--blue); }
    .plan-card.featured .plan-rate-pct { color: var(--cyan); }
    .plan-rate-label { font-size: 10px; color: var(--slate-500); font-weight: 600; letter-spacing: 0.3px; }
    .plan-card.featured .plan-rate-label { color: rgba(255,255,255,0.5); }
    .plan-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 28px; }
    .plan-tag {
      padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
    }
    .plan-tag.blue { background: var(--blue-pale); color: var(--blue); }
    .plan-tag.green { background: var(--green-pale); color: var(--green); }
    .plan-tag.gold { background: var(--gold-pale); color: #946800; }
    .plan-tag.white { background: rgba(255,255,255,0.15); color: white; }
    .plan-cta { width: 100%; padding: 13px; border-radius: var(--radius-sm); font-size: 15px; font-weight: 700; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: var(--transition); }
    .plan-cta.blue-cta { background: var(--blue); color: white; }
    .plan-cta.blue-cta:hover { background: var(--blue-dark); }
    .plan-cta.white-cta { background: white; color: var(--blue); }
    .plan-cta.white-cta:hover { background: var(--blue-pale); }
    .plan-cta.gold-cta { background: var(--gold); color: var(--ink); }
    .plan-cta.gold-cta:hover { background: #E09A00; }

    /* CALCULATOR */
    .calc-section {
      background: linear-gradient(155deg, #030B1A 0%, #001855 50%, #002E8C 100%);
      padding: 96px 32px; position: relative; overflow: hidden;
    }
    .calc-section .section-title { color: white; }
    .calc-section .section-sub { color: rgba(255,255,255,0.6); }
    .calc-section .section-tag { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.9); }
    .calc-card {
      background: rgba(255,255,255,0.06); backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-xl);
      padding: 48px; margin-top: 56px;
    }
    .calc-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 56px; align-items: start; }
    .calc-label { font-size: 13px; color: rgba(255,255,255,0.65); font-weight: 600; margin-bottom: 10px; letter-spacing: 0.3px; }
    .calc-select, .calc-input {
      width: 100%; padding: 14px 16px;
      background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.15);
      border-radius: var(--radius-sm); color: white;
      font-family: 'DM Sans', sans-serif; font-size: 15px; outline: none;
      transition: var(--transition);
    }
    .calc-select option { background: var(--blue-dark); color: white; }
    .calc-select:focus, .calc-input:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(0,194,224,0.15); }
    .calc-input::placeholder { color: rgba(255,255,255,0.35); }
    .calc-field { margin-bottom: 24px; }
    .calc-slider-wrap { padding: 8px 0 0; }
    .calc-slider {
      width: 100%; -webkit-appearance: none; height: 4px;
      border-radius: 2px; background: rgba(255,255,255,0.2); outline: none;
      cursor: pointer;
    }
    .calc-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 20px; height: 20px;
      border-radius: 50%; background: var(--cyan);
      cursor: pointer; box-shadow: 0 0 0 4px rgba(0,194,224,0.2);
    }
    .calc-results {
      background: rgba(255,255,255,0.05); border-radius: var(--radius-lg);
      border: 1px solid rgba(255,255,255,0.1); padding: 36px;
    }
    .calc-result-title { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
    .calc-result-main { font-family: 'Poppins', sans-serif; font-size: 52px; font-weight: 800; color: white; line-height: 1; margin-bottom: 6px; }
    .calc-result-sub { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 36px; }
    .calc-breakdown { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .calc-breakdown-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: rgba(255,255,255,0.05); border-radius: var(--radius-sm); }
    .cbr-label { font-size: 13px; color: rgba(255,255,255,0.6); }
    .cbr-val { font-size: 15px; font-weight: 700; color: white; }
    .cbr-val.profit { color: #4AE54A; }

    /* ASSETS */
    .assets-section { background: white; }
    .assets-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 56px; }
    .asset-card {
      background: var(--slate-50); border-radius: var(--radius-lg);
      border: 1.5px solid var(--slate-200); padding: 28px;
      transition: var(--transition); cursor: pointer;
    }
    .asset-card:hover { border-color: var(--blue); background: var(--blue-pale); box-shadow: var(--shadow); transform: translateY(-2px); }
    .asset-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .asset-logo {
      width: 52px; height: 52px; border-radius: 14px;
      background: white; border: 1.5px solid var(--slate-200);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; box-shadow: var(--shadow-sm);
    }
    .asset-name { font-size: 17px; font-weight: 700; margin-bottom: 3px; }
    .asset-sector { font-size: 12px; color: var(--slate-500); font-weight: 500; }
    .asset-status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: var(--green-pale); color: var(--green); }
    .asset-progress-section { margin-bottom: 16px; }
    .asset-progress-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; }
    .asset-progress-label { color: var(--slate-500); font-weight: 600; }
    .asset-progress-pct { color: var(--blue); font-weight: 700; }
    .asset-progress-bar { height: 5px; background: var(--slate-200); border-radius: 3px; overflow: hidden; }
    .asset-progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--blue), var(--cyan)); transition: width 1.2s cubic-bezier(0.22,1,0.36,1); }
    .asset-meta { display: flex; justify-content: space-between; font-size: 13px; }
    .asset-meta-item .aml { color: var(--slate-500); font-size: 11px; margin-bottom: 2px; }
    .asset-meta-item .amv { font-weight: 700; color: var(--ink); }

    /* STATS BAND */
    .stats-band {
      background: var(--blue); padding: 56px 32px;
    }
    .stats-band-inner { max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; text-align: center; }
    .stat-band-item { color: white; }
    .stat-band-num { font-family: 'Poppins', sans-serif; font-size: 42px; font-weight: 800; line-height: 1; margin-bottom: 8px; }
    .stat-band-num .cyan { color: var(--cyan); }
    .stat-band-label { font-size: 14px; color: rgba(255,255,255,0.65); font-weight: 500; }

    /* HOW IT WORKS */
    .how-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 32px; margin-top: 64px; position: relative; }
    .how-grid::before {
      content: ''; position: absolute;
      top: 44px; left: calc(12.5% + 22px); right: calc(12.5% + 22px);
      height: 2px; background: linear-gradient(90deg, var(--blue), var(--cyan));
      z-index: 0;
    }
    .how-step { text-align: center; position: relative; z-index: 1; }
    .how-num-wrap {
      width: 88px; height: 88px; border-radius: 50%;
      background: linear-gradient(135deg, var(--blue), var(--cyan));
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      box-shadow: 0 8px 28px rgba(0,82,204,0.30);
    }
    .how-num { font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 800; color: white; }
    .how-title { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
    .how-desc { font-size: 14px; color: var(--slate-500); line-height: 1.7; }

    /* DASHBOARD PREVIEW */
    .dash-preview-section { background: var(--slate-50); }
    .dash-preview-wrap {
      border-radius: var(--radius-xl); overflow: hidden;
      box-shadow: var(--shadow-lg); border: 1.5px solid var(--slate-200);
      margin-top: 56px;
    }
    .dash-preview-topbar {
      background: white; border-bottom: 1px solid var(--slate-200);
      padding: 16px 28px; display: flex; align-items: center; justify-content: space-between;
    }
    .dash-preview-sidebar {
      background: var(--slate-900); padding: 28px 24px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .dash-sidebar-item {
      padding: 10px 14px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.5);
      cursor: pointer; display: flex; align-items: center; gap: 10px;
    }
    .dash-sidebar-item.active { background: var(--blue); color: white; }
    .dash-sidebar-item:hover:not(.active) { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.8); }

    /* TESTIMONIALS */
    .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 56px; }
    .testi-card {
      background: white; border-radius: var(--radius-lg);
      border: 1.5px solid var(--slate-200); padding: 32px;
      transition: var(--transition);
    }
    .testi-card:hover { box-shadow: var(--shadow); border-color: var(--blue); transform: translateY(-4px); }
    .testi-stars { color: var(--gold); font-size: 14px; letter-spacing: 1px; margin-bottom: 16px; }
    .testi-text { font-size: 15px; color: var(--slate-600); line-height: 1.8; margin-bottom: 24px; font-style: italic; }
    .testi-author { display: flex; align-items: center; gap: 14px; }
    .testi-avatar {
      width: 46px; height: 46px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 18px; color: white;
    }
    .testi-name { font-weight: 700; font-size: 15px; }
    .testi-loc { font-size: 12px; color: var(--slate-500); }

    /* SECURITY */
    .security-section { background: var(--ink); }
    .security-section .section-title { color: white; }
    .security-section .section-sub { color: rgba(255,255,255,0.55); }
    .sec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 56px; }
    .sec-card {
      background: rgba(255,255,255,0.05); border-radius: var(--radius-lg);
      border: 1px solid rgba(255,255,255,0.08); padding: 32px;
      transition: var(--transition);
    }
    .sec-card:hover { background: rgba(255,255,255,0.09); border-color: rgba(0,194,224,0.3); }
    .sec-icon {
      width: 56px; height: 56px; border-radius: 14px;
      background: var(--cyan-dim); display: flex; align-items: center; justify-content: center;
      font-size: 24px; margin-bottom: 20px;
    }
    .sec-title { font-size: 17px; font-weight: 700; color: white; margin-bottom: 10px; }
    .sec-desc { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; }

    /* FOOTER */
    .footer { background: var(--slate-900); padding: 72px 32px 36px; }
    .footer-grid { max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1.2fr; gap: 48px; margin-bottom: 56px; }
    .footer-about-text { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.8; margin-top: 20px; margin-bottom: 24px; }
    .footer-socials { display: flex; gap: 10px; }
    .social-btn {
      width: 38px; height: 38px; border-radius: 10px;
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: var(--transition); font-size: 16px;
    }
    .social-btn:hover { background: var(--blue); border-color: var(--blue); }
    .footer-col-title { font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 700; color: white; margin-bottom: 20px; letter-spacing: 0.5px; }
    .footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .footer-links li a { font-size: 14px; color: rgba(255,255,255,0.45); cursor: pointer; transition: var(--transition); text-decoration: none; }
    .footer-links li a:hover { color: var(--cyan); }
    .footer-contact-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
    .fci-icon { font-size: 16px; color: var(--cyan); margin-top: 2px; flex-shrink: 0; }
    .fci-text { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; }
    .footer-bottom { max-width: 1320px; margin: 0 auto; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: gap; gap: 16px; }
    .footer-disclaimer { font-size: 12px; color: rgba(255,255,255,0.25); max-width: 700px; line-height: 1.7; }
    .footer-copy { font-size: 13px; color: rgba(255,255,255,0.3); white-space: nowrap; }

    /* SUPPORT BUTTON */
    .support-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 800;
      cursor: pointer;
    }
    .support-fab-btn {
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, var(--blue), var(--cyan));
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 28px rgba(0,82,204,0.40);
      transition: var(--transition); font-size: 24px; color: white;
    }
    .support-fab-btn:hover { transform: scale(1.1) rotate(15deg); }
    .support-fab-badge {
      position: absolute; top: 2px; right: 2px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #4AE54A; border: 2.5px solid white;
    }

    /* DASHBOARD PAGE */
    .app-layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 264px; background: var(--slate-900); position: fixed;
      top: 0; left: 0; height: 100vh; display: flex; flex-direction: column;
      z-index: 500; overflow-y: auto; flex-shrink: 0;
    }
    .sb-logo-section {
      padding: 24px 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .sb-profile {
      padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .sb-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, var(--blue), var(--cyan));
      display: flex; align-items: center; justify-content: center;
      font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 18px; color: white;
      margin-bottom: 10px;
    }
    .sb-user-name { font-size: 14px; font-weight: 700; color: white; margin-bottom: 2px; }
    .sb-user-email { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
    .sb-kyc-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700;
    }
    .sb-kyc-badge.approved { background: rgba(0,135,90,0.3); color: #4AE5A0; }
    .sb-kyc-badge.pending { background: rgba(255,171,0,0.2); color: #FFAB00; }
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
    .sb-nav-item .sb-icon { width: 18px; flex-shrink: 0; text-align: center; font-size: 15px; }
    .sb-nav-item .sb-badge { margin-left: auto; background: var(--orange); color: white; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 10px; }
    .sb-logout {
      padding: 16px 12px 20px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }
    .sb-logout-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: var(--radius-sm);
      font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.35);
      cursor: pointer; transition: var(--transition);
    }
    .sb-logout-btn:hover { background: rgba(255,86,48,0.15); color: #FF8C7A; }

    /* DASHBOARD CONTENT */
    .dash-content { margin-left: 264px; flex: 1; min-height: 100vh; }
    .dash-topbar {
      background: white; border-bottom: 1px solid var(--slate-200);
      padding: 0 36px; height: 68px; display: flex; align-items: center;
      justify-content: space-between; position: sticky; top: 0; z-index: 100;
      box-shadow: var(--shadow-sm);
    }
    .dash-topbar-left h1 { font-size: 20px; font-weight: 800; }
    .dash-topbar-left p { font-size: 12.5px; color: var(--slate-500); }
    .topbar-actions { display: flex; align-items: center; gap: 12px; }
    .topbar-icon-btn {
      width: 42px; height: 42px; border-radius: var(--radius-sm);
      background: var(--slate-100); border: 1.5px solid var(--slate-200);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: var(--transition); position: relative;
      font-size: 17px; color: var(--slate-600);
    }
    .topbar-icon-btn:hover { background: var(--blue-pale); border-color: var(--blue); color: var(--blue); }
    .notif-badge-dot { position: absolute; top: 5px; right: 5px; width: 8px; height: 8px; border-radius: 50%; background: var(--orange); border: 2px solid white; }
    .dash-area { padding: 32px 36px; }

    /* STAT CARDS */
    .stat-cards-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 32px; }
    .stat-card {
      background: white; border-radius: var(--radius-lg);
      border: 1.5px solid var(--slate-200); padding: 26px 24px;
      transition: var(--transition); position: relative; overflow: hidden;
    }
    .stat-card:hover { box-shadow: var(--shadow); transform: translateY(-2px); }
    .stat-card-icon {
      width: 48px; height: 48px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; margin-bottom: 16px;
    }
    .stat-card-icon.blue { background: var(--blue-pale); }
    .stat-card-icon.green { background: var(--green-pale); }
    .stat-card-icon.gold { background: var(--gold-pale); }
    .stat-card-icon.cyan { background: var(--cyan-dim); }
    .stat-label { font-size: 12px; font-weight: 700; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
    .stat-value { font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
    .stat-change { font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; color: var(--green); }
    .stat-change.neutral { color: var(--slate-500); }
    .stat-card-decoration {
      position: absolute; bottom: -20px; right: -20px;
      width: 90px; height: 90px; border-radius: 50%; opacity: 0.06;
    }
    .stat-card-decoration.blue { background: var(--blue); }
    .stat-card-decoration.green { background: var(--green); }
    .stat-card-decoration.gold { background: var(--gold); }
    .stat-card-decoration.cyan { background: var(--cyan); }

    /* INVESTMENT CARDS */
    .inv-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .inv-card {
      background: white; border-radius: var(--radius-lg);
      border: 1.5px solid var(--slate-200); padding: 28px;
      transition: var(--transition);
    }
    .inv-card:hover { box-shadow: var(--shadow); border-color: var(--blue); }
    .inv-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .inv-plan-badge {
      display: inline-block; padding: 4px 12px; border-radius: 20px;
      font-size: 11px; font-weight: 800; letter-spacing: 0.5px;
    }
    .badge-fd { background: var(--blue-pale); color: var(--blue); }
    .badge-smart { background: var(--cyan-dim); color: #007A8C; }
    .badge-annuity { background: var(--gold-pale); color: #946800; }
    .inv-status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .inv-status-dot.active { background: var(--green); box-shadow: 0 0 0 3px rgba(0,135,90,0.2); }
    .inv-status-dot.pending { background: var(--gold); }
    .inv-status-dot.matured { background: var(--slate-400); }
    .inv-amount-big { font-family: 'Poppins', sans-serif; font-size: 32px; font-weight: 800; color: var(--ink); margin-bottom: 4px; }
    .inv-profit-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
    .inv-profit-val { font-size: 14px; font-weight: 700; color: var(--green); }
    .inv-rate-pill { background: var(--green-pale); color: var(--green); padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .inv-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .inv-meta-item .iml { font-size: 10px; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
    .inv-meta-item .imv { font-size: 13px; font-weight: 700; color: var(--ink); }
    .inv-progress-wrap { margin-bottom: 20px; }
    .inv-progress-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 7px; }
    .inv-progress-label { color: var(--slate-500); font-weight: 600; }
    .inv-progress-pct { color: var(--blue); font-weight: 700; }
    .inv-progress-bar { height: 5px; background: var(--slate-200); border-radius: 3px; overflow: hidden; }
    .inv-progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--blue), var(--cyan)); }
    .inv-actions-row { display: flex; gap: 10px; }
    .inv-act-btn {
      padding: 8px 16px; border-radius: var(--radius-sm); font-size: 12.5px;
      font-weight: 700; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif;
      transition: var(--transition); display: flex; align-items: center; gap: 6px;
    }
    .inv-act-btn.primary { background: var(--blue); color: white; }
    .inv-act-btn.primary:hover { background: var(--blue-dark); }
    .inv-act-btn.outline { background: transparent; color: var(--blue); border: 1.5px solid rgba(0,82,204,0.25); }
    .inv-act-btn.outline:hover { background: var(--blue-pale); }
    .inv-act-btn.green { background: var(--green-pale); color: var(--green); }
    .inv-act-btn.green:hover { background: var(--green); color: white; }

    /* TWO-COL DASHBOARD LAYOUT */
    .dash-two-col { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }

    /* CARD */
    .dash-card { background: white; border-radius: var(--radius-lg); border: 1.5px solid var(--slate-200); overflow: hidden; }
    .dash-card-header { padding: 22px 28px; border-bottom: 1px solid var(--slate-200); display: flex; justify-content: space-between; align-items: center; }
    .dash-card-title { font-size: 16px; font-weight: 700; }
    .dash-card-link { font-size: 13px; color: var(--blue); font-weight: 600; cursor: pointer; }
    .dash-card-body { padding: 24px 28px; }

    /* TRANSACTIONS */
    .txn-list { display: flex; flex-direction: column; }
    .txn-item { display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--slate-100); }
    .txn-item:last-child { border-bottom: none; }
    .txn-icon-wrap { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; }
    .txn-icon-wrap.deposit { background: var(--green-pale); }
    .txn-icon-wrap.withdraw { background: #FFEBEE; }
    .txn-icon-wrap.profit { background: var(--blue-pale); }
    .txn-desc-col { flex: 1; }
    .txn-title { font-size: 13.5px; font-weight: 700; margin-bottom: 2px; }
    .txn-ref { font-size: 11px; color: var(--slate-500); }
    .txn-amount-col { text-align: right; }
    .txn-amount { font-size: 15px; font-weight: 800; }
    .txn-amount.credit { color: var(--green); }
    .txn-amount.debit { color: var(--orange); }
    .txn-status { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
    .txn-status.approved,.txn-status.disbursed { background: var(--green-pale); color: var(--green); }
    .txn-status.pending { background: var(--gold-pale); color: #946800; }
    .txn-status.processing { background: var(--blue-pale); color: var(--blue); }
    .txn-status.rejected { background: #FFEBEE; color: var(--orange); }

    /* QUICK ACTIONS */
    .quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .qa-item {
      background: var(--slate-50); border: 1.5px solid var(--slate-200);
      border-radius: var(--radius); padding: 18px 14px; text-align: center;
      cursor: pointer; transition: var(--transition);
    }
    .qa-item:hover { background: var(--blue-pale); border-color: var(--blue); }
    .qa-item-icon { font-size: 24px; margin-bottom: 8px; }
    .qa-item-label { font-size: 12px; font-weight: 700; color: var(--slate-700); }

    /* PROFIT WALLET */
    .profit-wallet-box {
      background: linear-gradient(135deg, var(--blue), var(--cyan));
      border-radius: var(--radius); padding: 22px; margin-bottom: 16px; color: white;
    }
    .pwb-label { font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
    .pwb-amount { font-family: 'Poppins', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 16px; }
    .pwb-btn { width: 100%; padding: 11px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .pwb-btn:hover { background: rgba(255,255,255,0.3); }

    /* WITHDRAWAL TRACKER */
    .wd-tracker { }
    .wd-step { display: flex; align-items: flex-start; gap: 16px; padding: 14px 0; position: relative; }
    .wd-step:not(:last-child)::after { content: ''; position: absolute; left: 19px; top: 52px; bottom: -4px; width: 2px; background: var(--slate-200); }
    .wd-step.completed::after { background: var(--blue); }
    .wd-step-circle { width: 38px; height: 38px; border-radius: 50%; border: 2.5px solid var(--slate-300); background: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; color: var(--slate-400); transition: var(--transition); }
    .wd-step.completed .wd-step-circle { background: var(--blue); border-color: var(--blue); color: white; }
    .wd-step.active .wd-step-circle { border-color: var(--blue); color: var(--blue); background: var(--blue-pale); box-shadow: 0 0 0 4px rgba(0,82,204,0.12); }
    .wd-step-info .wsi-title { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
    .wd-step-info .wsi-time { font-size: 11px; color: var(--slate-500); }

    /* KYC PAGE */
    .kyc-steps-bar { display: flex; align-items: center; margin-bottom: 40px; }
    .kyc-step { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
    .kyc-step-circle { width: 40px; height: 40px; border-radius: 50%; border: 2.5px solid var(--slate-300); background: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: var(--slate-400); transition: var(--transition); }
    .kyc-step.done .kyc-step-circle { background: var(--green); border-color: var(--green); color: white; }
    .kyc-step.active .kyc-step-circle { background: var(--blue); border-color: var(--blue); color: white; }
    .kyc-step-label { font-size: 12px; font-weight: 600; color: var(--slate-500); text-align: center; }
    .kyc-step.active .kyc-step-label { color: var(--blue); }
    .kyc-step-line { flex: 1; height: 2px; background: var(--slate-200); margin: 0 8px; margin-bottom: 24px; }
    .kyc-step-line.done { background: var(--green); }
    .kyc-upload-zone {
      border: 2px dashed var(--slate-300); border-radius: var(--radius-lg);
      padding: 48px 32px; text-align: center; cursor: pointer;
      transition: var(--transition); background: var(--slate-50);
    }
    .kyc-upload-zone:hover { border-color: var(--blue); background: var(--blue-pale); }
    .kyc-upload-icon { font-size: 48px; margin-bottom: 16px; }
    .kyc-upload-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .kyc-upload-sub { font-size: 13px; color: var(--slate-500); }

    /* FORM ELEMENTS */
    .form-group { margin-bottom: 22px; }
    .form-label { font-size: 13px; font-weight: 700; color: var(--slate-700); margin-bottom: 8px; display: block; letter-spacing: 0.2px; }
    .form-input-wrap { position: relative; }
    .form-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--slate-400); font-size: 16px; pointer-events: none; }
    .form-input {
      width: 100%; padding: 13px 14px 13px 42px;
      border: 1.5px solid var(--slate-300); border-radius: var(--radius-sm);
      font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--ink);
      background: white; outline: none; transition: var(--transition);
    }
    .form-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(0,82,204,0.10); }
    .form-input.no-icon { padding-left: 14px; }
    .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 18px; padding-right: 36px; }
    .form-hint { font-size: 12px; color: var(--slate-500); margin-top: 6px; }
    .form-error { font-size: 12px; color: var(--orange); margin-top: 6px; }
    .otp-inputs { display: flex; gap: 12px; justify-content: center; margin: 24px 0; }
    .otp-input { width: 54px; height: 64px; border: 2px solid var(--slate-300); border-radius: var(--radius); font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 800; text-align: center; color: var(--blue); outline: none; transition: var(--transition); background: white; }
    .otp-input:focus { border-color: var(--blue); box-shadow: 0 0 0 4px rgba(0,82,204,0.12); }

    /* ADMIN */
    .admin-layout { display: flex; min-height: 100vh; }
    .admin-sidebar { background: var(--ink); }
    .admin-badge { background: rgba(255,86,48,0.2); color: var(--orange); padding: 3px 10px; border-radius: 20px; font-size: 9px; font-weight: 800; letter-spacing: 1px; }
    .admin-stat-card { background: white; border-radius: var(--radius-lg); border: 1.5px solid var(--slate-200); padding: 24px; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th { padding: 12px 16px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: var(--slate-500); background: var(--slate-50); border-bottom: 1px solid var(--slate-200); text-align: left; }
    .admin-table td { padding: 14px 16px; font-size: 13.5px; border-bottom: 1px solid var(--slate-100); vertical-align: middle; }
    .admin-table tr:last-child td { border-bottom: none; }
    .admin-table tr:hover td { background: var(--slate-50); }
    .action-btn { padding: 6px 14px; border-radius: 7px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: var(--transition); }
    .action-btn.approve { background: var(--green-pale); color: var(--green); }
    .action-btn.approve:hover { background: var(--green); color: white; }
    .action-btn.reject { background: #FFEBEE; color: var(--orange); }
    .action-btn.reject:hover { background: var(--orange); color: white; }
    .action-btn.view { background: var(--blue-pale); color: var(--blue); }
    .action-btn.view:hover { background: var(--blue); color: white; }

    /* ALERT/TOAST */
    .alert { padding: 14px 18px; border-radius: var(--radius-sm); font-size: 14px; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
    .alert-warn { background: var(--gold-pale); border: 1px solid rgba(255,171,0,0.3); color: #7A5200; }
    .alert-info { background: var(--blue-pale); border: 1px solid rgba(0,82,204,0.2); color: var(--blue); }
    .alert-success { background: var(--green-pale); border: 1px solid rgba(0,135,90,0.2); color: var(--green); }
    .alert-error { background: #FFEBEE; border: 1px solid rgba(255,86,48,0.2); color: var(--orange); }

    /* MISC */
    .page-header { margin-bottom: 32px; }
    .page-header h2 { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
    .page-header p { font-size: 14px; color: var(--slate-500); }
    .empty-state { text-align: center; padding: 56px 32px; }
    .empty-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.3; }
    .empty-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--slate-700); }
    .empty-sub { font-size: 14px; color: var(--slate-500); margin-bottom: 24px; }

    /* MOBILE HAMBURGER */
    .mob-hamburger {
      display: none; flex-direction: column; justify-content: center; gap: 5px;
      width: 40px; height: 40px; border-radius: var(--radius-sm);
      background: transparent; border: none;
      cursor: pointer; padding: 6px; flex-shrink: 0;
    }
    .mob-hamburger span {
      display: block; height: 2px; background: var(--ink); border-radius: 2px;
      transition: var(--transition);
    }
    .sidebar-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.55); z-index: 499; backdrop-filter: blur(2px);
    }
    .sidebar-overlay.active { display: block; }

    /* ── RESPONSIVE ── */
    @media (max-width: 1100px) {
      .hero-inner { grid-template-columns: 1fr; }
      .hero-card-stack { display: none; }
      .plans-grid { grid-template-columns: 1fr 1fr; }
      .how-grid { grid-template-columns: 1fr 1fr; }
      .how-grid::before { display: none; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .dash-two-col { grid-template-columns: 1fr; }
      .stat-cards-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 768px) {
      html, body { overflow-x: hidden; }

      /* ---- NAVBAR ---- */
      .nav-inner { padding: 0 18px; height: 60px; }
      .nav-links { display: none; }
      .nav-actions .btn-ghost { display: none; }
      .nav-actions .btn-primary { padding: 8px 14px; font-size: 13px; }
      .mob-hamburger { display: flex; }
      .mob-nav-menu {
        position: fixed; top: 60px; left: 0; right: 0; z-index: 890;
        background: white; border-bottom: 1px solid var(--slate-200);
        padding: 12px 18px 20px; display: flex; flex-direction: column; gap: 4px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      }
      .mob-nav-menu a {
        padding: 12px 14px; border-radius: var(--radius-sm);
        font-size: 15px; font-weight: 500; color: var(--slate-700);
        cursor: pointer; display: block;
      }
      .mob-nav-menu a:hover, .mob-nav-menu a.active { background: var(--blue-pale); color: var(--blue); }
      .mob-nav-divider { height: 1px; background: var(--slate-200); margin: 8px 0; }
      .mob-nav-btn { width: 100%; text-align: center; margin-top: 4px; }

      /* ---- TICKER ---- */
      .ticker-bar { height: 36px; }
      .ticker-live-badge { display: none; }
      .ticker-track { padding-left: 16px; }

      /* ---- HERO ---- */
      .hero { padding: 60px 20px 72px; min-height: auto; }
      .hero h1 { font-size: clamp(28px, 7vw, 42px); }
      .hero-sub { font-size: 15px; margin-bottom: 28px; }
      .hero-actions { gap: 10px; }
      .hero-actions .btn-lg { padding: 12px 20px; font-size: 14px; }
      .hero-stats { gap: 24px; flex-wrap: wrap; }
      .hero-stat-val { font-size: 22px; }
      .hero-badge { font-size: 11px; padding: 5px 12px; }

      /* ---- STATS BAND ---- */
      .stats-band { padding: 36px 20px; }
      .stats-band-inner { grid-template-columns: 1fr 1fr; gap: 24px; }
      .stat-band-num { font-size: 30px; }

      /* ---- SECTION ---- */
      .section { padding: 56px 18px; }
      .section-title { font-size: clamp(22px, 5vw, 32px); }
      .section-sub { font-size: 14px; }

      /* ---- PLANS ---- */
      .plans-grid { grid-template-columns: 1fr; }
      .plan-card { padding: 28px 22px; }

      /* ---- CALCULATOR ---- */
      .calc-section { padding: 56px 18px; }
      .calc-card { padding: 24px 18px; margin-top: 32px; }
      .calc-grid { grid-template-columns: 1fr; gap: 32px; }
      .calc-result-main { font-size: 38px; }

      /* ---- ASSETS ---- */
      .assets-grid { grid-template-columns: 1fr; }

      /* ---- HOW IT WORKS ---- */
      .how-grid { grid-template-columns: 1fr; gap: 24px; }
      .how-num-wrap { width: 68px; height: 68px; }
      .how-num { font-size: 22px; }

      /* ---- TESTIMONIALS ---- */
      .testi-grid { grid-template-columns: 1fr; }

      /* ---- SECURITY ---- */
      .sec-grid { grid-template-columns: 1fr; }

      /* ---- FOOTER ---- */
      .footer { padding: 48px 18px 28px; }
      .footer-grid { grid-template-columns: 1fr; gap: 32px; margin-bottom: 36px; }
      .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }

      /* ---- DASHBOARD SIDEBAR ---- */
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        z-index: 600;
      }
      .sidebar.mobile-open { transform: translateX(0); }
      .dash-content { margin-left: 0 !important; }

      /* ---- DASHBOARD TOPBAR ---- */
      .dash-topbar { padding: 0 16px; gap: 10px; }
      .dash-topbar-left p { display: none; }
      .dash-topbar-left h1 { font-size: 16px; }
      .mob-hamburger { display: flex; }
      .mob-hamburger span { background: var(--ink); }

      /* ---- DASHBOARD AREA ---- */
      .dash-area { padding: 16px; }

      /* ---- STAT CARDS ---- */
      .stat-cards-grid { grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
      .stat-card { padding: 16px 14px; }
      .stat-value { font-size: 20px; }
      .stat-card-icon { width: 40px; height: 40px; font-size: 18px; margin-bottom: 12px; }

      /* ---- INV CARDS ---- */
      .inv-cards-grid { grid-template-columns: 1fr; }
      .inv-amount-big { font-size: 26px; }
      .inv-actions-row { flex-wrap: wrap; }

      /* ---- DASH TWO COL ---- */
      .dash-two-col { grid-template-columns: 1fr; }

      /* ---- DASH CARD ---- */
      .dash-card-header { padding: 16px 18px; flex-wrap: wrap; gap: 8px; }
      .dash-card-body { padding: 16px 18px; }

      /* ---- ADMIN TABLE ---- */
      .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .admin-table { min-width: 560px; }
      .admin-table th, .admin-table td { padding: 10px 12px; font-size: 12.5px; }

      /* ---- FORMS (Login / Register) ---- */
      .auth-page-wrap { padding: 20px 16px !important; }
      .auth-box { padding: 32px 20px !important; }
      .otp-input { width: 42px !important; height: 52px !important; font-size: 22px !important; }
      .otp-inputs { gap: 8px !important; }

      /* ---- KYC ---- */
      .kyc-upload-zone { padding: 32px 20px; }
      .kyc-upload-icon { font-size: 36px; }

      /* ---- DEPOSIT/WITHDRAW FORMS ---- */
      .deposit-grid { grid-template-columns: 1fr !important; }

      /* ---- SUPPORT FAB ---- */
      .support-fab { bottom: 80px; right: 16px; }
      .support-fab-btn { width: 50px; height: 50px; font-size: 20px; }

      /* ---- DASH TOPBAR btn & icon ---- */
      .topbar-actions .btn-primary { font-size: 12px; padding: 8px 12px; }
      .topbar-icon-btn { width: 36px; height: 36px; font-size: 15px; }

      /* ---- REGISTER / LOGIN PAGES ---- */
      .register-page-grid { grid-template-columns: 1fr !important; }
      .register-hero-col { display: none !important; }
      .login-page-grid { grid-template-columns: 1fr !important; }
      .login-hero-col { display: none !important; }
      .login-form-col { padding: 32px 20px !important; }
    }

    @media (max-width: 420px) {
      .stat-cards-grid { grid-template-columns: 1fr; }
      .hero-stats { gap: 16px; }
      .plans-grid { grid-template-columns: 1fr; }
      .how-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

// ============================================================
// DATA
// ============================================================
const TICKER_DATA = [
  { type: "invest", name: "Rahul S***", amount: "₹25,000", city: "Mumbai" },
  { type: "payout", name: "Priya M***", amount: "₹8,750", city: "Bangalore" },
  { type: "invest", name: "Amit K***", amount: "₹1,00,000", city: "Delhi" },
  { type: "payout", name: "Sneha R***", amount: "₹12,400", city: "Hyderabad" },
  { type: "invest", name: "Vikram P***", amount: "₹75,000", city: "Chennai" },
  { type: "payout", name: "Anita D***", amount: "₹1,500", city: "Pune" },
  { type: "invest", name: "Rajesh T***", amount: "₹50,000", city: "Kolkata" },
  { type: "payout", name: "Meera B***", amount: "₹9,800", city: "Jaipur" },
  { type: "invest", name: "Suresh N***", amount: "₹30,000", city: "Ahmedabad" },
  { type: "payout", name: "Kavita G***", amount: "₹5,200", city: "Lucknow" },
  { type: "invest", name: "Deepak V***", amount: "₹2,00,000", city: "Noida" },
  { type: "payout", name: "Rupa S***", amount: "₹15,000", city: "Surat" },
];

const ASSETS_DATA = [
  { name: "Tata Group", sector: "Conglomerate", emoji: "🏗️", alloc: 500, util: 84, note: "Tata Steel & TCS infra projects. Q4 expansion active.", growth: "18%" },
  { name: "Reliance Industries", sector: "Energy & Retail", emoji: "⚡", alloc: 800, util: 89, note: "Jio Platforms expansion, retail across Tier-2 cities.", growth: "22%" },
  { name: "Adani Group", sector: "Infrastructure", emoji: "🌉", alloc: 450, util: 84, note: "Port and logistics expansion, Gujarat & Maharashtra.", growth: "15%" },
  { name: "HDFC Group", sector: "Banking & Finance", emoji: "🏦", alloc: 600, util: 91, note: "Mortgage portfolio, digital banking infrastructure.", growth: "12%" },
  { name: "Mahindra Group", sector: "Auto & Tech", emoji: "🚗", alloc: 350, util: 83, note: "EV division scale-up, farm equipment expansion.", growth: "19%" },
  { name: "Bajaj Group", sector: "Finance & Auto", emoji: "🏍️", alloc: 400, util: 85, note: "Bajaj Finance consumer lending, EV initiatives.", growth: "16%" },
  { name: "Wipro & HCL Tech", sector: "IT Services", emoji: "💻", alloc: 300, util: 87, note: "AI/ML platforms, US enterprise contracts.", growth: "20%" },
  { name: "Larsen & Toubro", sector: "Engineering", emoji: "⚙️", alloc: 550, util: 85, note: "Smart city, metro rail, defence manufacturing.", growth: "14%" },
  { name: "ITC Limited", sector: "FMCG & Hotels", emoji: "🏨", alloc: 250, util: 84, note: "FMCG diversification, South India hotel expansion.", growth: "14%" },
  { name: "Sun Pharma", sector: "Pharmaceuticals", emoji: "💊", alloc: 200, util: 85, note: "US FDA generics pipeline, specialty pharma.", growth: "17%" },
];

const DUMMY_INVESTMENTS = [
  { id: 1, ref: "INV7A2B9C", plan: "Smart Custom Plan", type: "smart", principal: 50000, profit: 2100, rate: "2.0%/day", start: "01 Jan 2025", maturity: "01 Apr 2025", daysTotal: 90, daysElapsed: 42, status: "active", profitEarned: 42000 },
  { id: 2, ref: "INV3D8E1F", plan: "FD – 12 Months", type: "fd", principal: 100000, profit: 100000, rate: "100% total", start: "15 Dec 2024", maturity: "15 Dec 2025", daysTotal: 365, daysElapsed: 58, status: "active", profitEarned: 15890 },
  { id: 3, ref: "INV9G4H5K", plan: "Lifetime Annuity", type: "annuity", principal: 75000, profit: 750, rate: "1%/day", start: "10 Nov 2024", maturity: "Lifetime", daysTotal: null, daysElapsed: 93, status: "active", profitEarned: 69750 },
];

const DUMMY_TRANSACTIONS = [
  { id: 1, type: "profit", title: "Daily Profit Credit", ref: "PRF-20250118", amount: 2107.24, date: "Today, 12:00 AM", status: "approved" },
  { id: 2, type: "deposit", title: "Wallet Deposit", ref: "DEP-8A92BC", amount: 50000, date: "16 Jan 2025, 3:42 PM", status: "approved" },
  { id: 3, type: "withdraw", title: "Withdrawal Request", ref: "WD-K3M2NP", amount: 8750, date: "14 Jan 2025, 11:22 AM", status: "disbursed" },
  { id: 4, type: "profit", title: "Daily Profit Credit", ref: "PRF-20250115", amount: 2000.88, date: "15 Jan 2025, 12:00 AM", status: "approved" },
  { id: 5, type: "deposit", title: "Wallet Deposit", ref: "DEP-7R93CD", amount: 100000, date: "10 Jan 2025, 5:12 PM", status: "approved" },
];

// ============================================================
// COMPONENTS
// ============================================================

const Ticker = () => {
  const items = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <div className="ticker-bar">
      <div className="ticker-live-badge">
        <span className="live-dot" />
        LIVE
      </div>
      <div style={{ paddingLeft: 160, overflow: "hidden", height: "100%", display: "flex", alignItems: "center" }}>
        <div className="ticker-track">
          {items.map((item, i) => (
            <span key={i} className={`ticker-item ticker-${item.type}`}>
              <span className="ticker-icon">{item.type === "invest" ? "📈" : "💰"}</span>
              <span className="ticker-name">{item.name}</span>
              <span>{item.type === "invest" ? "invested" : "withdrew"}</span>
              <span className="ticker-amount">{item.amount}</span>
              <span>from {item.city}</span>
              <span className="ticker-sep">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ page, setPage, scrolled }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [["home","Home"], ["plans","Plans"], ["calculator","Calculator"], ["assets","Assets"], ["how","How It Works"]];
  return (
    <nav className={`nav-root${scrolled ? " scrolled" : ""}`}>
      <div className="nav-inner">
        <div className="nav-logo" onClick={() => { setPage("home"); setMenuOpen(false); }}>
          <div className="nav-logo-mark">B</div>
          <div className="nav-logo-text">Bharat<span>Assets</span></div>
        </div>
        <ul className="nav-links">
          {navLinks.map(([p, label]) => (
            <li key={p}><a className={page === p ? "active" : ""} onClick={() => setPage(p)}>{label}</a></li>
          ))}
        </ul>
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => setPage("login")}>Login</button>
          <button className="btn btn-primary" onClick={() => setPage("register")}>
            <span>🚀</span> Start Investing
          </button>
          <div className="mob-hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="mob-nav-menu">
          {navLinks.map(([p, label]) => (
            <a key={p} className={page === p ? "active" : ""} onClick={() => { setPage(p); setMenuOpen(false); }}>{label}</a>
          ))}
          <div className="mob-nav-divider" />
          <button className="btn btn-ghost mob-nav-btn" onClick={() => { setPage("login"); setMenuOpen(false); }}>Login</button>
          <button className="btn btn-primary mob-nav-btn" onClick={() => { setPage("register"); setMenuOpen(false); }}>🚀 Start Investing</button>
        </div>
      )}
    </nav>
  );
};

const HeroCard = () => {
  const bars = [35, 52, 45, 68, 58, 78, 72, 88, 80, 95, 85, 100];
  return (
    <div className="hero-card-stack">
      <div className="hero-main-card">
        <div className="hc-header">
          <span className="hc-label">My Portfolio</span>
          <span className="hc-live-pill"><span className="live-dot" />LIVE</span>
        </div>
        <div className="hc-amount">₹3,24,750</div>
        <div className="hc-sub">Total portfolio value · Updated just now</div>
        <div className="hc-metrics">
          <div className="hc-metric"><div className="hc-m-label">Today</div><div className="hc-m-val pos">+₹3,247</div></div>
          <div className="hc-metric"><div className="hc-m-label">This Month</div><div className="hc-m-val cyan">₹74,750</div></div>
          <div className="hc-metric"><div className="hc-m-label">Plans</div><div className="hc-m-val">3 Active</div></div>
        </div>
        <div style={{ marginTop: 8, marginBottom: 6, fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", fontWeight: 700, textTransform: "uppercase" }}>Monthly Growth</div>
        <div className="hc-chart-row">
          {bars.map((h, i) => (
            <div key={i} className={`hc-bar${i >= bars.length - 4 ? " active" : ""}`} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="hero-float-card card-payout">
        <div style={{ fontSize: 11, color: "#999", marginBottom: 6, fontWeight: 700 }}>LAST PAYOUT</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#00875A" }}>+₹2,107</div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Today 12:00 AM</div>
      </div>
    </div>
  );
};

const HeroSection = ({ setPage }) => (
  <section className="hero">
    <div className="hero-bg-grid" />
    <div className="hero-bg-orb-1" />
    <div className="hero-bg-orb-2" />
    <div className="hero-inner">
      <div>
        <div className="hero-badge animate-in">
          <span className="hero-badge-dot" />
          SEBI-Aligned · Regulated Framework · 48,000+ Investors
        </div>
        <h1 className="animate-in animate-in-delay-1">
          India's Most Trusted<br />
          <span className="gradient-text">Investment Platform</span>
        </h1>
        <p className="hero-sub animate-in animate-in-delay-2">
          Fixed Deposits, Smart Custom Plans & Lifetime Annuities — 
          designed for consistent, transparent daily returns. Profit credited every midnight.
        </p>
        <div className="hero-actions animate-in animate-in-delay-3">
          <button className="btn btn-white btn-lg" onClick={() => setPage("register")}>
            <span>🚀</span> Start Investing Today
          </button>
          <button className="btn btn-lg" style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }} onClick={() => setPage("calculator")}>
            <span>🧮</span> Calculate Returns
          </button>
        </div>
        <div className="hero-stats animate-in animate-in-delay-4">
          {[["₹240Cr+","Total AUM"], ["48,000+","Active Investors"], ["100%","Payout Rate"], ["₹890Cr+","Disbursed"]].map(([v, l]) => (
            <div key={l}>
              <div className="hero-stat-val">{v.includes("₹") ? <><span className="accent">{v}</span></> : v}</div>
              <div className="hero-stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="animate-in animate-in-delay-2">
        <HeroCard />
      </div>
    </div>
  </section>
);

const StatsBand = () => (
  <div className="stats-band">
    <div className="stats-band-inner">
      {[["₹", "240", "Cr+", "Assets Under Management"], ["", "48,000", "+", "Active Investors"], ["", "100", "%", "On-time Payout Rate"], ["₹", "890", "Cr+", "Total Payouts Disbursed"]].map(([pre, num, suf, lbl], i) => (
        <div key={i} className="stat-band-item">
          <div className="stat-band-num">{pre}<span className="cyan">{num}</span>{suf}</div>
          <div className="stat-band-label">{lbl}</div>
        </div>
      ))}
    </div>
  </div>
);

const PlansSection = ({ setPage }) => (
  <section className="section" id="plans" style={{ background: "white" }}>
    <div className="section-inner">
      <div className="section-tag"><span className="section-tag-dot" /> Investment Plans</div>
      <h2 className="section-title">Three Ways to Grow Your Wealth</h2>
      <p className="section-sub">Choose the plan that matches your financial goals and risk preference.</p>
      <div className="plans-grid">
        {/* Tier A */}
        <div className="plan-card animate-in" onClick={() => setPage("register")}>
          <div className="plan-icon-wrap blue">🔒</div>
          <div className="plan-name">Tier A · Fixed Deposit</div>
          <div className="plan-desc">Principal locked until maturity. Guaranteed returns with complete capital protection. Ideal for conservative investors.</div>
          <div className="plan-rates-grid">
            <div className="plan-rate-box"><div className="plan-rate-pct">21%</div><div className="plan-rate-label">3 Months</div></div>
            <div className="plan-rate-box"><div className="plan-rate-pct">45%</div><div className="plan-rate-label">6 Months</div></div>
            <div className="plan-rate-box"><div className="plan-rate-pct">100%</div><div className="plan-rate-label">12 Months</div></div>
          </div>
          <div className="plan-tags">
            <span className="plan-tag blue">🔒 Principal Locked</span>
            <span className="plan-tag green">📜 Certificate Issued</span>
          </div>
          <button className="plan-cta blue-cta">Invest in FD →</button>
        </div>
        {/* Tier B - Featured */}
        <div className="plan-card featured animate-in animate-in-delay-1" onClick={() => setPage("register")}>
          <div className="plan-badge">POPULAR</div>
          <div className="plan-icon-wrap white">🧠</div>
          <div className="plan-name">Tier B · Smart Custom Plan</div>
          <div className="plan-desc">Flexible duration with escalating daily returns. The longer you stay, the more you earn every single day.</div>
          <div className="plan-rates-grid">
            <div className="plan-rate-box"><div className="plan-rate-pct">1.5%</div><div className="plan-rate-label">Daily &lt;60d</div></div>
            <div className="plan-rate-box"><div className="plan-rate-pct">2.0%</div><div className="plan-rate-label">Daily ≥60d</div></div>
            <div className="plan-rate-box"><div className="plan-rate-pct">730%</div><div className="plan-rate-label">Max Year</div></div>
          </div>
          <div className="plan-tags">
            <span className="plan-tag white">⚡ Flexible Duration</span>
            <span className="plan-tag white">📈 Escalating Rate</span>
          </div>
          <button className="plan-cta white-cta">Start Smart Plan →</button>
        </div>
        {/* Tier C */}
        <div className="plan-card animate-in animate-in-delay-2" onClick={() => setPage("register")}>
          <div className="plan-icon-wrap gold">♾️</div>
          <div className="plan-name">Tier C · Lifetime Annuity</div>
          <div className="plan-desc">Premium forever plan. Earn 1% daily on your investment indefinitely. True passive income with no end date.</div>
          <div className="plan-rates-grid">
            <div className="plan-rate-box"><div className="plan-rate-pct" style={{ color: "#946800" }}>1%</div><div className="plan-rate-label">Daily Forever</div></div>
            <div className="plan-rate-box"><div className="plan-rate-pct" style={{ color: "#946800" }}>365%</div><div className="plan-rate-label">Per Year</div></div>
            <div className="plan-rate-box"><div className="plan-rate-pct" style={{ color: "#946800" }}>∞</div><div className="plan-rate-label">Duration</div></div>
          </div>
          <div className="plan-tags">
            <span className="plan-tag gold">💎 Min ₹50,000</span>
            <span className="plan-tag green">♾️ Lifetime Income</span>
          </div>
          <button className="plan-cta gold-cta">Activate Annuity →</button>
        </div>
      </div>
    </div>
  </section>
);

const CalculatorSection = () => {
  const [plan, setPlan] = useState("smart_long");
  const [amount, setAmount] = useState(50000);
  const [days, setDays] = useState(90);

  const calc = () => {
    let profit = 0;
    if (plan === "fd3") profit = amount * 0.21;
    else if (plan === "fd6") profit = amount * 0.45;
    else if (plan === "fd12") profit = amount * 1.0;
    else if (plan === "smart_short") profit = amount * 0.015 * Math.min(days, 59);
    else if (plan === "smart_long") profit = amount * 0.02 * days;
    else if (plan === "annuity") profit = amount * 0.01 * days;
    return { profit: Math.round(profit), total: amount + Math.round(profit) };
  };
  const { profit, total } = calc();
  const fmt = (n) => "₹" + n.toLocaleString("en-IN");

  return (
    <section className="calc-section" id="calculator">
      <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div className="section-tag" style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}>
          <span className="section-tag-dot" style={{ background: "rgba(255,255,255,0.8)" }} /> ROI Calculator
        </div>
        <h2 className="section-title" style={{ color: "white" }}>See Your Returns Before Investing</h2>
        <p className="section-sub" style={{ color: "rgba(255,255,255,0.6)" }}>Real-time projection. Adjust sliders and watch your wealth grow.</p>
        <div className="calc-card">
          <div className="calc-grid">
            <div>
              <div className="calc-field">
                <div className="calc-label">Investment Plan</div>
                <select className="calc-select" value={plan} onChange={e => setPlan(e.target.value)}>
                  <option value="fd3">Fixed Deposit – 3 Months (21%)</option>
                  <option value="fd6">Fixed Deposit – 6 Months (45%)</option>
                  <option value="fd12">Fixed Deposit – 12 Months (100%)</option>
                  <option value="smart_short">Smart Plan – Short (&lt;60 days, 1.5%/day)</option>
                  <option value="smart_long">Smart Plan – Long (60+ days, 2.0%/day)</option>
                  <option value="annuity">Lifetime Annuity (1%/day)</option>
                </select>
              </div>
              <div className="calc-field">
                <div className="calc-label">Investment Amount — {fmt(amount)}</div>
                <input className="calc-input" type="number" value={amount} onChange={e => setAmount(+e.target.value)} placeholder="Enter amount" min={1000} />
                <div className="calc-slider-wrap">
                  <input type="range" className="calc-slider" min={1000} max={1000000} step={1000} value={amount} onChange={e => setAmount(+e.target.value)} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                    <span>₹1K</span><span>₹10L</span>
                  </div>
                </div>
              </div>
              {!["fd3","fd6","fd12"].includes(plan) && (
                <div className="calc-field">
                  <div className="calc-label">Duration — {days} Days</div>
                  <input type="range" className="calc-slider" min={1} max={730} value={days} onChange={e => setDays(+e.target.value)} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                    <span>1 Day</span><span>730 Days</span>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 8, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>⚠️ Daily profits include ±₹0.15 random variation for realism. 2% TDS applies on withdrawals.</div>
              </div>
            </div>
            <div className="calc-results">
              <div className="calc-result-title">Projected Returns</div>
              <div className="calc-result-main" key={total}>{fmt(total)}</div>
              <div className="calc-result-sub">Maturity Amount</div>
              <div className="calc-breakdown">
                <div className="calc-breakdown-row">
                  <span className="cbr-label">Principal Invested</span>
                  <span className="cbr-val">{fmt(amount)}</span>
                </div>
                <div className="calc-breakdown-row">
                  <span className="cbr-label">Total Profit</span>
                  <span className="cbr-val profit">+ {fmt(profit)}</span>
                </div>
                <div className="calc-breakdown-row">
                  <span className="cbr-label">Profit Rate</span>
                  <span className="cbr-val">{amount > 0 ? ((profit / amount) * 100).toFixed(1) : 0}%</span>
                </div>
                {!["fd3","fd6","fd12"].includes(plan) && (
                  <div className="calc-breakdown-row">
                    <span className="cbr-label">Daily Earnings</span>
                    <span className="cbr-val profit">+ {fmt(Math.round(profit / Math.max(days, 1)))}/day</span>
                  </div>
                )}
              </div>
              <button className="btn btn-cyan btn-lg" style={{ width: "100%", borderRadius: 12 }}>
                🚀 Start This Investment
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AssetsSection = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 600); return () => clearTimeout(t); }, []);

  return (
    <section className="section assets-section" id="assets">
      <div className="section-inner">
        <div className="section-tag"><span className="section-tag-dot" /> Asset Portfolio</div>
        <h2 className="section-title">Funds Deployed Across Top Indian Corporates</h2>
        <p className="section-sub">Your investments actively working across India's most trusted conglomerates and sectors.</p>
        <div className="assets-grid">
          {ASSETS_DATA.map((a, i) => (
            <div key={i} className="asset-card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="asset-header">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="asset-logo">{a.emoji}</div>
                  <div>
                    <div className="asset-name">{a.name}</div>
                    <div className="asset-sector">{a.sector}</div>
                  </div>
                </div>
                <span className="asset-status-badge">● Active</span>
              </div>
              <div className="asset-progress-section">
                <div className="asset-progress-header">
                  <span className="asset-progress-label">Fund Utilisation</span>
                  <span className="asset-progress-pct">{a.util}%</span>
                </div>
                <div className="asset-progress-bar">
                  <div className="asset-progress-fill" style={{ width: loaded ? `${a.util}%` : "0%" }} />
                </div>
              </div>
              <div className="asset-meta">
                <div className="asset-meta-item"><div className="aml">Allocated</div><div className="amv">₹{a.alloc}Cr</div></div>
                <div className="asset-meta-item"><div className="aml">YoY Growth</div><div className="amv" style={{ color: "var(--green)" }}>↑ {a.growth}</div></div>
              </div>
              <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--slate-500)", lineHeight: 1.6 }}>{a.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => (
  <section className="section" id="how" style={{ background: "var(--slate-50)" }}>
    <div className="section-inner">
      <div style={{ textAlign: "center", marginBottom: 0 }}>
        <div className="section-tag" style={{ margin: "0 auto 16px" }}><span className="section-tag-dot" /> How It Works</div>
        <h2 className="section-title" style={{ textAlign: "center", margin: "0 auto 16px" }}>Start Earning in 4 Simple Steps</h2>
        <p className="section-sub" style={{ textAlign: "center", margin: "0 auto" }}>From registration to daily profit credits — completely seamless.</p>
      </div>
      <div className="how-grid">
        {[
          ["1", "🔐", "Create Account", "Register with email & phone in 2 minutes. Instant KYC with Aadhaar & PAN."],
          ["2", "💳", "Add Funds via UPI", "Scan QR code or use UPI ID. Upload payment screenshot for verification."],
          ["3", "📊", "Choose Your Plan", "Pick FD, Smart Custom, or Lifetime Annuity. Get digital certificate instantly."],
          ["4", "💸", "Earn Daily Profits", "Profits auto-credited every midnight. Withdraw or reinvest with one click."],
        ].map(([n, emoji, title, desc], i) => (
          <div key={i} className="how-step animate-in" style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="how-num-wrap"><div className="how-num">{n}</div></div>
            <div style={{ fontSize: 36, marginBottom: 14 }}>{emoji}</div>
            <div className="how-title">{title}</div>
            <div className="how-desc">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const TestimonialsSection = () => {
  const testimonials = [
    { text: "Started with ₹25,000 in the Smart Plan. Within 3 months I earned back ₹11,250 in pure profit. The midnight credit is like clockwork!", name: "Rajan Mehta", loc: "Mumbai, Maharashtra", avatar: "R", color: "#0052CC" },
    { text: "The Lifetime Annuity changed my life. Invested ₹1 Lakh, now I get ₹1,000 deposited every single day. True passive income!", name: "Priyanka Sharma", loc: "Bangalore, Karnataka", avatar: "P", color: "#00875A" },
    { text: "The 12-month FD doubled my money exactly. The certificate is very professional. Withdrawal processed in under 24 hours. Superb!", name: "Amit Kumar Singh", loc: "Delhi NCR", avatar: "A", color: "#946800" },
  ];
  return (
    <section className="section" style={{ background: "white" }}>
      <div className="section-inner">
        <div className="section-tag"><span className="section-tag-dot" /> Testimonials</div>
        <h2 className="section-title">Trusted by 48,000+ Indian Investors</h2>
        <div className="testi-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testi-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">"{t.text}"</div>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>{t.avatar}</div>
                <div><div className="testi-name">{t.name}</div><div className="testi-loc">{t.loc}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SecuritySection = () => (
  <section className="section security-section">
    <div className="section-inner">
      <div className="section-tag" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)" }}>
        <span className="section-tag-dot" style={{ background: "var(--cyan)" }} /> Security & Trust
      </div>
      <h2 className="section-title" style={{ color: "white" }}>Bank-Grade Security. Always.</h2>
      <p className="section-sub" style={{ color: "rgba(255,255,255,0.55)" }}>Multiple layers of protection secure your funds and personal data at every step.</p>
      <div className="sec-grid">
        {[
          ["🔐","256-bit SSL Encryption","All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols."],
          ["📲","Mandatory Email OTP","Every login and withdrawal requires OTP verification sent to your registered email. No exceptions."],
          ["🪪","KYC Verification","All investors must complete Aadhaar/PAN verification. This protects the community and ensures compliance."],
          ["💳","Secure UPI Payments","P2P UPI with UTR verification. Every deposit verified manually before crediting your wallet."],
          ["📜","Digital Certificates","Investment certificates with unique digital seals generated for every active plan. Legally valid."],
          ["🛡️","2% TDS Compliance","Transparent 2% TDS deduction on withdrawals as per government norms. Fully compliant and disclosed upfront."],
        ].map(([icon, title, desc], i) => (
          <div key={i} className="sec-card animate-in" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="sec-icon">{icon}</div>
            <div className="sec-title">{title}</div>
            <div className="sec-desc">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = ({ setPage }) => (
  <footer className="footer">
    <div className="footer-grid">
      <div>
        <div className="nav-logo" style={{ cursor: "pointer" }} onClick={() => setPage("home")}>
          <div className="nav-logo-mark">B</div>
          <div className="nav-logo-text" style={{ color: "white" }}>Bharat<span>Assets</span></div>
        </div>
        <p className="footer-about-text">India's premier investment platform offering Fixed Deposits, Smart Plans, and Lifetime Annuities. Transparent returns, daily profit credits, and complete security.</p>
        <div className="footer-socials">
          {["𝕏", "📘", "💼", "▶️"].map((s, i) => <div key={i} className="social-btn">{s}</div>)}
        </div>
      </div>
      <div>
        <div className="footer-col-title">Invest</div>
        <ul className="footer-links">
          {["Fixed Deposit Plans", "Smart Custom Plan", "Lifetime Annuity", "ROI Calculator", "Asset Portfolio"].map(l => <li key={l}><a>{l}</a></li>)}
        </ul>
      </div>
      <div>
        <div className="footer-col-title">Company</div>
        <ul className="footer-links">
          {["About BharatAssets", "Our Team", "Testimonials", "Careers", "Press Kit"].map(l => <li key={l}><a>{l}</a></li>)}
        </ul>
      </div>
      <div>
        <div className="footer-col-title">Support</div>
        <div className="footer-contact-item"><span className="fci-icon">✉️</span><div className="fci-text">support@bharatassets.com</div></div>
        <div className="footer-contact-item"><span className="fci-icon">📞</span><div className="fci-text">+91 98765 43210<br /><span style={{ fontSize: 11 }}>Mon–Sat, 10AM–6PM IST</span></div></div>
        <div className="footer-contact-item"><span className="fci-icon">💬</span><div className="fci-text">Live Chat: 10AM–4PM IST</div></div>
      </div>
    </div>
    <div className="footer-bottom">
      <p className="footer-disclaimer">⚠️ Investment involves market risk. Past returns are not indicative of future performance. BharatAssets is not a registered NBFC. This is not financial advice. Read all terms before investing. All figures shown are illustrative.</p>
      <span className="footer-copy">© 2025 BharatAssets</span>
    </div>
  </footer>
);

// ============================================================
// AUTH PAGES
// ============================================================
const LoginPage = ({ setPage }) => {
  const [step, setStep] = useState(1);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const inputRefs = useRef([]);

  const handleOtp = (val, i) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const newVals = [...otpValues];
    newVals[i] = v;
    setOtpValues(newVals);
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (e, i) => {
    if (e.key === "Backspace" && !otpValues[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }} className="login-page-grid">
      {/* Left panel */}
      <div className="login-hero-col" style={{ background: "linear-gradient(155deg, #030B1A 0%, #001855 50%, #0052CC 100%)", padding: "60px 50px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,194,224,0.12) 0%, transparent 70%)", top: -100, right: -100 }} />
        <div className="nav-logo" style={{ marginBottom: 48, cursor: "pointer" }} onClick={() => setPage("home")}>
          <div className="nav-logo-mark">B</div>
          <div className="nav-logo-text" style={{ color: "white" }}>Bharat<span>Assets</span></div>
        </div>
        <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: 36, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 20, position: "relative", zIndex: 1 }}>
          Welcome Back<br />to Your<br /><span style={{ color: "var(--cyan)" }}>Wealth Dashboard</span>
        </h2>
        <div style={{ position: "relative", zIndex: 1 }}>
          {[["📊", "View live portfolio performance"], ["💸", "Check your daily profit credits"], ["🏦", "Request instant withdrawals"], ["🔐", "OTP-secured login every time"]].map(([e, t]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, color: "rgba(255,255,255,0.75)", fontSize: 15 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,194,224,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{e}</span>
              {t}
            </div>
          ))}
        </div>
      </div>
      {/* Right panel */}
      <div className="login-form-col" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", background: "var(--slate-50)", overflow: "auto" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {step === 1 ? (
            <>
              <h1 style={{ fontFamily: "Poppins, sans-serif", fontSize: 30, fontWeight: 800, marginBottom: 8 }}>Sign In</h1>
              <p style={{ fontSize: 14, color: "var(--slate-500)", marginBottom: 32 }}>New here? <a style={{ color: "var(--blue)", fontWeight: 700, cursor: "pointer" }} onClick={() => setPage("register")}>Create an account</a></p>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon">✉️</span>
                  <input className="form-input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label className="form-label">Password</label>
                  <a style={{ fontSize: 13, color: "var(--blue)", fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>Forgot password?</a>
                </div>
                <div className="form-input-wrap">
                  <span className="form-input-icon">🔐</span>
                  <input className="form-input" type={showPw ? "text" : "password"} placeholder="Your password" value={pw} onChange={e => setPw(e.target.value)} style={{ paddingRight: 44 }} />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--slate-400)" }}>{showPw ? "🙈" : "👁️"}</button>
                </div>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }} onClick={() => setStep(2)}>
                Continue with OTP →
              </button>
              <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--slate-500)" }}>
                An OTP will be sent to your registered email for verification.
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--blue-pale)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>🔐</div>
                <h1 style={{ fontFamily: "Poppins, sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>OTP Verification</h1>
                <p style={{ fontSize: 14, color: "var(--slate-500)" }}>We sent a 6-digit code to<br /><strong style={{ color: "var(--ink)" }}>{email || "you@email.com"}</strong></p>
              </div>
              <div className="otp-inputs">
                {otpValues.map((v, i) => (
                  <input key={i} ref={el => inputRefs.current[i] = el} className="otp-input" type="text" maxLength={1} value={v} onChange={e => handleOtp(e.target.value, i)} onKeyDown={e => handleOtpKey(e, i)} inputMode="numeric" />
                ))}
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={() => setPage("dashboard")}>
                ✓ Verify & Login
              </button>
              <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--slate-500)" }}>
                Didn't receive it? <a style={{ color: "var(--blue)", fontWeight: 700, cursor: "pointer" }}>Resend OTP</a> · <a style={{ color: "var(--slate-500)", cursor: "pointer" }} onClick={() => setStep(1)}>Change email</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const RegisterPage = ({ setPage }) => {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const strength = !pw ? 0 : [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/, pw.length >= 8].filter(Boolean).length;
  const strengthColors = ["", "#FF5630", "#FF9800", "#FFC107", "#00875A"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }} className="register-page-grid">
      <div style={{ background: "linear-gradient(155deg, #030B1A 0%, #001855 50%, #0052CC 100%)", padding: "60px 50px", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", position: "relative" }} className="register-hero-col">
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,194,224,0.10) 0%, transparent 70%)", bottom: -200, left: -100 }} />
        <div className="nav-logo" style={{ marginBottom: 48, cursor: "pointer" }} onClick={() => setPage("home")}>
          <div className="nav-logo-mark">B</div>
          <div className="nav-logo-text" style={{ color: "white" }}>Bharat<span>Assets</span></div>
        </div>
        <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: 36, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 20, position: "relative", zIndex: 1 }}>
          Join <span style={{ color: "var(--cyan)" }}>48,000+</span><br />Investors<br />Earning Daily
        </h2>
        <div style={{ position: "relative", zIndex: 1 }}>
          {[["💹","Up to 2% daily returns on investment"],["⏱️","Profits credited every midnight IST"],["📜","Digital investment certificate issued"],["🔒","Bank-grade security with OTP protection"],["🎁","Earn referral bonuses on every invite"]].map(([e, t]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, color: "rgba(255,255,255,0.78)", fontSize: 14.5 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,194,224,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>{e}</span>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", background: "var(--slate-50)", overflow: "auto" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <h1 style={{ fontFamily: "Poppins, sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create Your Account</h1>
          <p style={{ fontSize: 14, color: "var(--slate-500)", marginBottom: 28 }}>Already have an account? <a style={{ color: "var(--blue)", fontWeight: 700, cursor: "pointer" }} onClick={() => setPage("login")}>Sign in here</a></p>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="form-input-wrap">
              <span className="form-input-icon">👤</span>
              <input className="form-input" type="text" placeholder="Your full legal name" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">✉️</span>
                <input className="form-input" type="email" placeholder="you@email.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">📱</span>
                <input className="form-input" type="tel" placeholder="10-digit mobile" maxLength={10} />
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔐</span>
                <input className="form-input" type={showPw ? "text" : "password"} placeholder="Min 8 chars" value={pw} onChange={e => setPw(e.target.value)} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "var(--slate-400)" }}>{showPw ? "🙈" : "👁️"}</button>
              </div>
              {pw && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 3, borderRadius: 2, background: "var(--slate-200)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${strength * 25}%`, background: strengthColors[strength], transition: "all 0.3s", borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 11, color: strengthColors[strength], marginTop: 4, fontWeight: 600 }}>{strengthLabels[strength]}</div>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔐</span>
                <input className="form-input" type="password" placeholder="Repeat password" />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Referral Code <span style={{ color: "var(--slate-400)", fontWeight: 400 }}>(Optional)</span></label>
            <div className="form-input-wrap">
              <span className="form-input-icon">🎁</span>
              <input className="form-input" type="text" placeholder="Enter referral code" style={{ textTransform: "uppercase" }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24 }}>
            <input type="checkbox" style={{ width: 18, height: 18, marginTop: 2, accentColor: "var(--blue)", cursor: "pointer" }} />
            <label style={{ fontSize: 13, color: "var(--slate-600)", lineHeight: 1.6 }}>I agree to the <a style={{ color: "var(--blue)", fontWeight: 700 }}>Terms of Service</a> and <a style={{ color: "var(--blue)", fontWeight: 700 }}>Privacy Policy</a>. I understand investments carry risk.</label>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={() => setPage("verify")}>
            🚀 Create My Account
          </button>
        </div>
      </div>
    </div>
  );
};

const VerifyEmailPage = ({ setPage }) => {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const handleOtp = (val, i) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const newVals = [...otpValues];
    newVals[i] = v;
    setOtpValues(newVals);
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
  };
  return (
    <div style={{ minHeight: "100vh", background: "var(--slate-50)", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ background: "white", borderRadius: "var(--radius-xl)", border: "1.5px solid var(--slate-200)", padding: "56px 48px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--blue-pale)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36 }}>📧</div>
        <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 12 }}>Verify Your Email</h2>
        <p style={{ fontSize: 14.5, color: "var(--slate-500)", marginBottom: 32, lineHeight: 1.7 }}>We've sent a 6-digit verification code to your email. Enter it below to activate your account.</p>
        <div className="otp-inputs" style={{ justifyContent: "center" }}>
          {otpValues.map((v, i) => (
            <input key={i} ref={el => inputRefs.current[i] = el} className="otp-input" type="text" maxLength={1} value={v} onChange={e => handleOtp(e.target.value, i)} onKeyDown={e => { if (e.key === "Backspace" && !v && i > 0) inputRefs.current[i - 1]?.focus(); }} inputMode="numeric" />
          ))}
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: "100%", marginBottom: 16 }} onClick={() => setPage("kyc")}>✓ Verify Email</button>
        <p style={{ fontSize: 13, color: "var(--slate-500)" }}>Didn't receive it? <a style={{ color: "var(--blue)", fontWeight: 700, cursor: "pointer" }}>Resend OTP</a> (valid 10 mins)</p>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const DashboardSidebar = ({ activePage, setActivePage, setPage, onClose }) => {
  const navItems = [
    { section: "Portfolio" },
    { id: "overview", icon: "📊", label: "Dashboard" },
    { id: "investments", icon: "💼", label: "My Investments" },
    { id: "new-invest", icon: "➕", label: "New Investment" },
    { id: "certificates", icon: "📜", label: "Certificates" },
    { section: "Finance" },
    { id: "deposit", icon: "⬇️", label: "Deposit Funds" },
    { id: "withdraw", icon: "💸", label: "Withdraw" },
    { id: "transactions", icon: "📋", label: "Transactions" },
    { id: "profit-logs", icon: "📈", label: "Profit Logs" },
    { section: "Account" },
    { id: "kyc", icon: "🪪", label: "KYC Verification" },
    { id: "referrals", icon: "👥", label: "Referrals" },
    { id: "notifications", icon: "🔔", label: "Notifications", badge: "3" },
    { id: "profile", icon: "⚙️", label: "Profile" },
    { id: "support", icon: "💬", label: "Support Chat" },
  ];

  return (
    <>
      <div className="sb-logo-section">
        <div className="nav-logo" style={{ cursor: "pointer" }} onClick={() => { setPage("home"); onClose && onClose(); }}>
          <div className="nav-logo-mark">B</div>
          <div className="nav-logo-text" style={{ color: "white" }}>Bharat<span>Assets</span></div>
        </div>
      </div>
      <div className="sb-profile">
        <div className="sb-avatar">R</div>
        <div className="sb-user-name">Rahul Sharma</div>
        <div className="sb-user-email">rahul.sharma@gmail.com</div>
        <span className="sb-kyc-badge approved">✓ KYC Approved</span>
      </div>
      <div className="sb-nav">
        {navItems.map((item, i) => {
          if (item.section) return <div key={i} className="sb-section-label">{item.section}</div>;
          return (
            <div key={i} className={`sb-nav-item${activePage === item.id ? " active" : ""}`} onClick={() => { setActivePage(item.id); onClose && onClose(); }}>
              <span className="sb-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="sb-badge">{item.badge}</span>}
            </div>
          );
        })}
      </div>
      <div className="sb-logout">
        <div className="sb-logout-btn" onClick={() => { setPage("home"); onClose && onClose(); }}>
          <span>🚪</span> Logout
        </div>
      </div>
    </>
  );
};

const DashboardOverview = ({ setActivePage }) => {
  const [adminStore, setAdminStore] = useState(getAdminStore);
  useEffect(() => watchAdminStore(setAdminStore), []);
  const kycStatus = adminStore['kyc_demo_user'] || 'approved';
  return (
  <div className="dash-area">
    {/* KYC Alert - driven by admin approvals */}
    {kycStatus === 'approved' ? (
      <div className="alert alert-info" style={{ marginBottom: 28, display:"flex", gap:14, alignItems:"flex-start" }}>
        <span style={{ fontSize: 18 }}>✅</span>
        <div><strong>KYC Verified!</strong> Your account is fully activated. All features are unlocked.</div>
      </div>
    ) : kycStatus === 'rejected' ? (
      <div style={{ marginBottom: 28, background: '#FFF0EC', border: '1.5px solid rgba(255,86,48,0.25)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 14 }}>
        <span style={{ fontSize: 18 }}>❌</span>
        <div><strong style={{ color: 'var(--orange)' }}>KYC Rejected.</strong> Your documents were not verified. Please re-submit.</div>
      </div>
    ) : (
      <div style={{ marginBottom: 28, background: 'var(--gold-pale)', border: '1.5px solid rgba(255,171,0,0.3)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 14 }}>
        <span style={{ fontSize: 18 }}>⏳</span>
        <div><strong>KYC Pending.</strong> Documents under review. Usually takes 2–4 hours.</div>
      </div>
    )}

    {/* Stat Cards */}
    <div className="stat-cards-grid">
      {[
        { icon: "💰", color: "blue", label: "Wallet Balance", val: "₹1,24,750", change: "Available to invest" },
        { icon: "📊", color: "green", label: "Total Invested", val: "₹2,25,000", change: "↑ 3 active plans" },
        { icon: "🏆", color: "gold", label: "Profit Wallet", val: "₹1,27,500", change: "+₹3,247 today" },
        { icon: "🏦", color: "cyan", label: "Total Withdrawn", val: "₹64,750", change: "₹8,750 this month" },
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

    {/* Investments */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: 20, fontWeight: 800 }}>Active Investments</h3>
      <button className="btn btn-primary" style={{ padding: "9px 20px" }} onClick={() => setActivePage("new-invest")}>➕ New Investment</button>
    </div>
    <div className="inv-cards-grid">
      {DUMMY_INVESTMENTS.map(inv => (
        <div key={inv.id} className="inv-card">
          <div className="inv-card-top">
            <span className={`inv-plan-badge badge-${inv.type}`}>{inv.type === "fd" ? "Fixed Deposit" : inv.type === "smart" ? "Smart Custom" : "Lifetime Annuity"}</span>
            <span className="inv-status-dot active" title="Active" />
          </div>
          <div className="inv-amount-big">₹{inv.principal.toLocaleString("en-IN")}</div>
          <div className="inv-profit-row">
            <span className="inv-profit-val">+₹{inv.profitEarned.toLocaleString("en-IN")} earned</span>
            <span className="inv-rate-pill">{inv.rate}</span>
          </div>
          <div className="inv-meta-grid">
            <div className="inv-meta-item"><div className="iml">Start Date</div><div className="imv">{inv.start}</div></div>
            <div className="inv-meta-item"><div className="iml">Maturity</div><div className="imv">{inv.maturity}</div></div>
            <div className="inv-meta-item"><div className="iml">Days Elapsed</div><div className="imv">{inv.daysElapsed} days</div></div>
            <div className="inv-meta-item"><div className="iml">Ref No.</div><div className="imv" style={{ fontSize: 11 }}>#{inv.ref}</div></div>
          </div>
          {inv.daysTotal && (
            <div className="inv-progress-wrap">
              <div className="inv-progress-header">
                <span className="inv-progress-label">Progress to maturity</span>
                <span className="inv-progress-pct">{Math.round((inv.daysElapsed / inv.daysTotal) * 100)}%</span>
              </div>
              <div className="inv-progress-bar">
                <div className="inv-progress-fill" style={{ width: `${(inv.daysElapsed / inv.daysTotal) * 100}%` }} />
              </div>
            </div>
          )}
          <div className="inv-actions-row">
            <button className="inv-act-btn outline">👁️ Details</button>
            <button className="inv-act-btn outline">📜 Certificate</button>
            <button className="inv-act-btn green" onClick={() => setActivePage("new-invest")}>♻️ Reinvest</button>
          </div>
        </div>
      ))}
    </div>

    {/* Bottom row */}
    <div className="dash-two-col">
      <div className="dash-card">
        <div className="dash-card-header">
          <span className="dash-card-title">Recent Transactions</span>
          <span className="dash-card-link" onClick={() => setActivePage("transactions")}>View All →</span>
        </div>
        <div className="dash-card-body">
          <div className="txn-list">
            {DUMMY_TRANSACTIONS.map(txn => (
              <div key={txn.id} className="txn-item">
                <div className={`txn-icon-wrap ${txn.type}`}>{txn.type === "profit" ? "📈" : txn.type === "deposit" ? "⬇️" : "⬆️"}</div>
                <div className="txn-desc-col">
                  <div className="txn-title">{txn.title}</div>
                  <div className="txn-ref">{txn.ref} · {txn.date}</div>
                </div>
                <div className="txn-amount-col">
                  <div className={`txn-amount ${txn.type === "withdraw" ? "debit" : "credit"}`}>{txn.type === "withdraw" ? "-" : "+"}₹{txn.amount.toLocaleString("en-IN")}</div>
                  <span className={`txn-status ${txn.status}`}>{txn.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Quick actions */}
        <div className="dash-card">
          <div className="dash-card-header"><span className="dash-card-title">Quick Actions</span></div>
          <div className="dash-card-body">
            <div className="quick-actions-grid">
              {[["⬇️","Deposit","deposit"],["💸","Withdraw","withdraw"],["🚀","Invest","new-invest"],["♻️","Reinvest","new-invest"]].map(([icon, label, target]) => (
                <div key={label} className="qa-item" onClick={() => setActivePage(target)}>
                  <div className="qa-item-icon">{icon}</div>
                  <div className="qa-item-label">{label}</div>
                </div>
              ))}
            </div>
            {/* Profit wallet reinvest */}
            <div className="profit-wallet-box">
              <div className="pwb-label">Profit Wallet Balance</div>
              <div className="pwb-amount">₹1,27,500</div>
              <button className="pwb-btn" onClick={() => setActivePage("new-invest")}>♻️ Move to Investment Plan</button>
            </div>
          </div>
        </div>
        {/* Withdrawal tracker */}
        <div className="dash-card">
          <div className="dash-card-header"><span className="dash-card-title">Last Withdrawal Status</span></div>
          <div className="dash-card-body">
            <div style={{ marginBottom: 12, background: "var(--slate-50)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>₹8,750 → ₹8,575</span>
                <span className="txn-status disbursed">Disbursed</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--slate-500)" }}>WD-K3M2NP · 14 Jan 2025</div>
            </div>
            <div className="wd-tracker">
              {[["✓","Request Received","14 Jan, 11:22 AM","completed"],["✓","Processing","14 Jan, 12:05 PM","completed"],["✓","Disbursed","14 Jan, 6:30 PM","completed"]].map(([icon, title, time, state]) => (
                <div key={title} className={`wd-step ${state}`}>
                  <div className="wd-step-circle">{icon}</div>
                  <div className="wd-step-info">
                    <div className="wsi-title">{title}</div>
                    <div className="wsi-time">{time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

const DepositPage = ({ setActivePage }) => {
  const [amount, setAmount] = useState(10000);
  const [utr, setUtr] = useState("");
  const presets = [1000, 5000, 10000, 25000, 50000, 100000];

  return (
    <div className="dash-area">
      <div className="page-header">
        <h2>Deposit Funds</h2>
        <p>Add money to your BharatAssets wallet via UPI.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, maxWidth: 900 }}>
        {/* UPI Panel */}
        <div className="dash-card">
          <div className="dash-card-header"><span className="dash-card-title">📱 Pay via UPI</span></div>
          <div className="dash-card-body">
            <div style={{ background: "linear-gradient(135deg, var(--blue), var(--cyan))", borderRadius: "var(--radius-lg)", padding: 28, textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 180, height: 180, background: "white", borderRadius: 12, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 56 }}>📲</div>
                <div style={{ fontSize: 12, color: "var(--slate-500)", fontWeight: 600 }}>QR Code Here</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "12px 16px", color: "white", fontSize: 16, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>bharatassets@upi</span>
                <button style={{ background: "rgba(255,255,255,0.25)", border: "none", color: "white", padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>📋 Copy</button>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
                {["PhonePe", "GPay", "Paytm", "BHIM"].map(app => <span key={app} style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20 }}>{app}</span>)}
              </div>
            </div>
            <div style={{ background: "var(--gold-pale)", border: "1px solid rgba(255,171,0,0.3)", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#7A5200" }}>
              ⚠️ Always include your registered mobile number in UPI payment remarks for faster verification.
            </div>
          </div>
        </div>
        {/* Form */}
        <div className="dash-card">
          <div className="dash-card-header"><span className="dash-card-title">✍️ Submit Payment Details</span></div>
          <div className="dash-card-body">
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {presets.map(p => (
                  <button key={p} onClick={() => setAmount(p)} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${amount === p ? "var(--blue)" : "var(--slate-300)"}`, background: amount === p ? "var(--blue-pale)" : "white", color: amount === p ? "var(--blue)" : "var(--slate-700)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                    ₹{p.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
              <div className="form-input-wrap">
                <span className="form-input-icon">₹</span>
                <input className="form-input" type="number" value={amount} onChange={e => setAmount(+e.target.value)} placeholder="Enter amount (min ₹500)" min={500} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">UTR / Transaction ID *</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">#</span>
                <input className="form-input" type="text" value={utr} onChange={e => setUtr(e.target.value)} placeholder="e.g. 123456789012" />
              </div>
              <div className="form-hint">Find this in your UPI app payment history.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Screenshot</label>
              <div style={{ border: "2px dashed var(--slate-300)", borderRadius: "var(--radius)", padding: "32px 20px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "var(--slate-50)" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.background = "var(--blue-pale)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "var(--slate-300)"; e.currentTarget.style.background = "var(--slate-50)"; }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📤</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Click to upload screenshot</div>
                <div style={{ fontSize: 12, color: "var(--slate-500)" }}>JPG, PNG, PDF · Max 5MB</div>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: "100%" }}>📨 Submit Deposit Request</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WithdrawPage = () => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(5000);
  const tds = Math.round(amount * 0.02);
  const net = amount - tds;
  const fmt = n => "₹" + n.toLocaleString("en-IN");

  return (
    <div className="dash-area">
      <div className="page-header">
        <h2>Withdraw Funds</h2>
        <p>Withdraw your profits or wallet balance securely with OTP verification.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 28, maxWidth: 900 }}>
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">{step === 1 ? "💸 Withdrawal Request" : "🔐 OTP Verification"}</span>
          </div>
          <div className="dash-card-body">
            {/* Balance display */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
              <div style={{ background: "linear-gradient(135deg, var(--blue), #0069D9)", borderRadius: 12, padding: 18, color: "white" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase" }}>Profit Wallet</div>
                <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 24, fontWeight: 800 }}>₹1,27,500</div>
              </div>
              <div style={{ background: "linear-gradient(135deg, #00875A, #00A86B)", borderRadius: 12, padding: 18, color: "white" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 6, fontWeight: 700, textTransform: "uppercase" }}>Main Wallet</div>
                <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 24, fontWeight: 800 }}>₹1,24,750</div>
              </div>
            </div>

            {step === 1 ? (
              <>
                <div className="form-group">
                  <label className="form-label">Withdraw From</label>
                  <select className="form-input form-select no-icon" style={{ paddingLeft: 14 }}>
                    <option>Profit Wallet (₹1,27,500)</option>
                    <option>Main Wallet (₹1,24,750)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">₹</span>
                    <input className="form-input" type="number" value={amount} onChange={e => setAmount(+e.target.value)} min={500} />
                  </div>
                </div>
                {/* TDS Notice */}
                <div style={{ background: "#FFF8E6", border: "1px solid rgba(255,171,0,0.3)", borderRadius: 12, padding: "16px 18px", marginBottom: 22, fontSize: 13, color: "#7A5200" }}>
                  <strong>📋 TDS Deduction Notice (Govt. Regulation)</strong>
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Withdrawal Amount</span><span style={{ fontWeight: 700 }}>{fmt(amount)}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>TDS @ 2%</span><span style={{ fontWeight: 700, color: "var(--orange)" }}>- {fmt(tds)}</span></div>
                    <div style={{ height: 1, background: "rgba(255,171,0,0.3)", margin: "4px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span><strong>Net Payout</strong></span><span style={{ fontWeight: 800, color: "var(--green)", fontSize: 15 }}>{fmt(net)}</span></div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">UPI ID</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">@</span>
                    <input className="form-input" type="text" placeholder="yourname@upibank" />
                  </div>
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={() => setStep(2)}>🔐 Send OTP to Authorize</button>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--blue-pale)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>🛡️</div>
                <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Authorize Withdrawal</h3>
                <p style={{ fontSize: 14, color: "var(--slate-500)", marginBottom: 24 }}>OTP sent to your registered email</p>
                <div style={{ background: "var(--slate-50)", borderRadius: 14, padding: "18px 20px", marginBottom: 24, textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}><span style={{ color: "var(--slate-500)" }}>Amount</span><span style={{ fontWeight: 700 }}>{fmt(amount)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}><span style={{ color: "var(--slate-500)" }}>TDS (2%)</span><span style={{ fontWeight: 700, color: "var(--orange)" }}>- {fmt(tds)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}><span style={{ fontWeight: 700 }}>Net Payout</span><span style={{ fontWeight: 800, color: "var(--green)" }}>{fmt(net)}</span></div>
                </div>
                <div className="otp-inputs" style={{ justifyContent: "center" }}>
                  {[...Array(6)].map((_, i) => <input key={i} className="otp-input" type="text" maxLength={1} inputMode="numeric" />)}
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: "100%" }}>✓ Confirm Withdrawal</button>
                <div style={{ marginTop: 14, fontSize: 13, color: "var(--slate-500)", cursor: "pointer" }} onClick={() => setStep(1)}>← Cancel & go back</div>
              </div>
            )}
          </div>
        </div>
        {/* Tracker */}
        <div className="dash-card" style={{ height: "fit-content" }}>
          <div className="dash-card-header"><span className="dash-card-title">📦 Withdrawal Tracker</span></div>
          <div className="dash-card-body">
            <div style={{ marginBottom: 20, background: "var(--slate-50)", borderRadius: 12, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>₹8,750</span>
                <span className="txn-status disbursed">Disbursed</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--slate-500)", marginBottom: 16 }}>WD-K3M2NP · 14 Jan 2025</div>
              <div className="wd-tracker">
                {[["✓","Request Received","14 Jan, 11:22 AM","completed"],["✓","Processing","14 Jan, 12:05 PM","completed"],["✓","Disbursed to UPI","14 Jan, 6:30 PM","completed"]].map(([icon, title, time, state]) => (
                  <div key={title} className={`wd-step ${state}`}>
                    <div className="wd-step-circle">{icon}</div>
                    <div className="wd-step-info">
                      <div className="wsi-title">{title}</div>
                      <div className="wsi-time">{time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "var(--slate-50)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--slate-500)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Processing in Progress</div>
              {[["✓","Request Received","Today, 9:15 AM","completed"],["⟳","Processing",null,"active"],["","Disbursed",null,"pending"]].map(([icon, title, time, state]) => (
                <div key={title} className={`wd-step ${state}`}>
                  <div className="wd-step-circle">{icon || "○"}</div>
                  <div className="wd-step-info">
                    <div className="wsi-title">{title}</div>
                    {time && <div className="wsi-time">{time}</div>}
                    {state === "active" && <div className="wsi-time" style={{ color: "var(--blue)" }}>In progress · Est. 2–4 hrs</div>}
                    {state === "pending" && <div className="wsi-time">Pending payment</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KYCPage = () => {
  const [kycStep, setKycStep] = useState(1);
  const steps = ["Document Type", "Upload Docs", "Selfie", "Review"];

  return (
    <div className="dash-area">
      <div className="page-header">
        <h2>KYC Verification</h2>
        <p>Complete your identity verification to unlock all features.</p>
      </div>
      <div style={{ maxWidth: 700 }}>
        {/* Step bar */}
        <div className="kyc-steps-bar">
          {steps.map((s, i) => (
            <div key={i} style={{ display: "contents" }}>
              <div className={`kyc-step ${i + 1 < kycStep ? "done" : i + 1 === kycStep ? "active" : ""}`}>
                <div className="kyc-step-circle">{i + 1 < kycStep ? "✓" : i + 1}</div>
                <div className="kyc-step-label" style={{ width: 70 }}>{s}</div>
              </div>
              {i < steps.length - 1 && <div className={`kyc-step-line ${i + 1 < kycStep ? "done" : ""}`} />}
            </div>
          ))}
        </div>

        <div className="dash-card">
          <div className="dash-card-body">
            {kycStep === 1 && (
              <>
                <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Select Document Type</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
                  {[["🪪","Aadhaar Card","Most recommended"],["📄","PAN Card","Required for Tax"],["📕","Passport","International ID"],["🗳️","Voter ID","Government issued"]].map(([emoji, name, sub], i) => (
                    <div key={name} onClick={() => {}} style={{ background: i === 0 ? "var(--blue-pale)" : "var(--slate-50)", border: `1.5px solid ${i === 0 ? "var(--blue)" : "var(--slate-200)"}`, borderRadius: "var(--radius)", padding: "20px 16px", cursor: "pointer", transition: "all 0.2s", textAlign: "center" }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>{emoji}</div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{name}</div>
                      <div style={{ fontSize: 12, color: "var(--slate-500)" }}>{sub}</div>
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Document Number *</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">#</span>
                    <input className="form-input" type="text" placeholder="Enter Aadhaar / PAN number" />
                  </div>
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={() => setKycStep(2)}>Continue to Upload →</button>
              </>
            )}
            {kycStep === 2 && (
              <>
                <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Upload Documents</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                  {[["📄 Front Side", "Clear photo of front of document"], ["📄 Back Side", "Clear photo of back of document"]].map(([title, sub]) => (
                    <div key={title} className="kyc-upload-zone">
                      <div className="kyc-upload-icon">📤</div>
                      <div className="kyc-upload-title">{title}</div>
                      <div className="kyc-upload-sub">{sub}<br /><span style={{ fontSize: 11, marginTop: 4, display: "block" }}>JPG, PNG, PDF · Max 5MB</span></div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={() => setKycStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" style={{ flex: 2 }} onClick={() => setKycStep(3)}>Continue →</button>
                </div>
              </>
            )}
            {kycStep === 3 && (
              <>
                <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Take a Selfie</h3>
                <p style={{ fontSize: 14, color: "var(--slate-500)", marginBottom: 28 }}>Hold your Aadhaar/PAN next to your face. Ensure good lighting.</p>
                <div className="kyc-upload-zone" style={{ marginBottom: 28 }}>
                  <div className="kyc-upload-icon">🤳</div>
                  <div className="kyc-upload-title">Upload Selfie with Document</div>
                  <div className="kyc-upload-sub">Face must be clearly visible<br /><span style={{ fontSize: 11 }}>JPG, PNG · Max 5MB</span></div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={() => setKycStep(2)}>← Back</button>
                  <button className="btn btn-primary btn-lg" style={{ flex: 2 }} onClick={() => setKycStep(4)}>Review Submission →</button>
                </div>
              </>
            )}
            {kycStep === 4 && (
              <>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 64, marginBottom: 20 }}>📋</div>
                  <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Ready to Submit</h3>
                  <p style={{ fontSize: 14, color: "var(--slate-500)", marginBottom: 28, lineHeight: 1.7 }}>Your documents have been uploaded. Our team will review and approve within 2–4 hours. You'll receive an email notification once verified.</p>
                  <div className="alert alert-info" style={{ textAlign: "left", marginBottom: 28 }}>
                    <span>ℹ️</span>
                    <div>After KYC approval, you can make withdrawals and access higher investment limits.</div>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={() => setKycStep(3)}>← Back</button>
                    <button className="btn btn-primary btn-lg" style={{ flex: 2 }}>✓ Submit for Verification</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NewInvestPage = () => {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(10000);
  const [days, setDays] = useState(60);

  const plans = [
    { id: "fd3", name: "FD – 3 Months", type: "fd", min: 5000, profit: 21, total: true, duration: 90 },
    { id: "fd6", name: "FD – 6 Months", type: "fd", min: 5000, profit: 45, total: true, duration: 180 },
    { id: "fd12", name: "FD – 12 Months", type: "fd", min: 5000, profit: 100, total: true, duration: 365 },
    { id: "smart", name: "Smart Custom Plan", type: "smart", min: 1000, profit: 2.0, total: false },
    { id: "annuity", name: "Lifetime Annuity", type: "annuity", min: 50000, profit: 1.0, total: false },
  ];

  const calcProfit = () => {
    if (!selected) return { profit: 0, total: 0 };
    const p = plans.find(pl => pl.id === selected);
    if (!p) return { profit: 0, total: 0 };
    let profit = 0;
    if (p.total) profit = amount * (p.profit / 100);
    else if (p.type === "smart") profit = amount * ((days >= 60 ? 2.0 : 1.5) / 100) * days;
    else profit = amount * (1 / 100) * days;
    return { profit: Math.round(profit), total: amount + Math.round(profit) };
  };
  const { profit, total } = calcProfit();

  return (
    <div className="dash-area">
      <div className="page-header">
        <h2>New Investment</h2>
        <p>Choose a plan and start earning daily returns.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28 }}>
        <div>
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Select Investment Plan</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {plans.map(plan => (
                <div key={plan.id} onClick={() => setSelected(plan.id)} style={{ background: selected === plan.id ? "var(--blue-pale)" : "white", border: `2px solid ${selected === plan.id ? "var(--blue)" : "var(--slate-200)"}`, borderRadius: "var(--radius)", padding: "20px 24px", cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontSize: 13, color: "var(--slate-500)" }}>Min ₹{plan.min.toLocaleString("en-IN")} · {plan.total ? `${plan.profit}% Total Return` : `${plan.profit}%/day`}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 22, fontWeight: 800, color: "var(--blue)" }}>{plan.profit}%</div>
                      <div style={{ fontSize: 11, color: "var(--slate-500)" }}>{plan.total ? "total" : "per day"}</div>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${selected === plan.id ? "var(--blue)" : "var(--slate-300)"}`, background: selected === plan.id ? "var(--blue)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, transition: "all 0.2s" }}>
                      {selected === plan.id ? "✓" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {selected && (
            <div className="dash-card">
              <div className="dash-card-header"><span className="dash-card-title">Configure Investment</span></div>
              <div className="dash-card-body">
                <div className="form-group">
                  <label className="form-label">Investment Amount (₹)</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">₹</span>
                    <input className="form-input" type="number" value={amount} onChange={e => setAmount(+e.target.value)} />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {[10000, 25000, 50000, 100000].map(p => (
                      <button key={p} onClick={() => setAmount(p)} style={{ padding: "5px 12px", borderRadius: 7, border: "1.5px solid var(--slate-200)", background: amount === p ? "var(--blue-pale)" : "white", color: amount === p ? "var(--blue)" : "var(--slate-700)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        ₹{p.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>
                {(selected === "smart" || selected === "annuity") && (
                  <div className="form-group">
                    <label className="form-label">Duration — {days} Days {selected === "smart" && <span style={{ color: "var(--blue)", fontWeight: 700 }}>({days >= 60 ? "2.0%" : "1.5%"}/day)</span>}</label>
                    <input type="range" style={{ width: "100%", accentColor: "var(--blue)" }} min={1} max={730} value={days} onChange={e => setDays(+e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Summary */}
        <div style={{ position: "sticky", top: 88, height: "fit-content" }}>
          <div className="dash-card">
            <div className="dash-card-header"><span className="dash-card-title">Investment Summary</span></div>
            <div className="dash-card-body">
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "var(--slate-500)", marginBottom: 6 }}>Maturity Amount</div>
                <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 38, fontWeight: 800, color: "var(--ink)" }}>₹{total.toLocaleString("en-IN")}</div>
              </div>
              {[["Principal", `₹${amount.toLocaleString("en-IN")}`], ["Expected Profit", `+ ₹${profit.toLocaleString("en-IN")}`], ["Plan", plans.find(p => p.id === selected)?.name || "—"], ...(selected && !["fd3","fd6","fd12"].includes(selected) ? [["Duration", `${days} days`]] : []), ["Certificate", "✓ Issued on activation"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--slate-100)", fontSize: 14 }}>
                  <span style={{ color: "var(--slate-500)" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: v.startsWith("+") ? "var(--green)" : "var(--ink)" }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: 14, background: "var(--gold-pale)", borderRadius: 10, fontSize: 12.5, color: "#7A5200", marginBottom: 20 }}>
                💡 2% TDS will be deducted from profits at the time of withdrawal as per government norms.
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={!selected || amount <= 0}>
                🚀 Activate Investment
              </button>
              <div style={{ fontSize: 12, color: "var(--slate-500)", textAlign: "center", marginTop: 12 }}>Digital certificate issued instantly upon activation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD PAGE WRAPPER
// ============================================================
const DashboardPage = ({ setPage }) => {
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activePage) {
      case "overview": return <DashboardOverview setActivePage={setActivePage} />;
      case "deposit": return <DepositPage setActivePage={setActivePage} />;
      case "withdraw": return <WithdrawPage />;
      case "kyc": return <KYCPage />;
      case "new-invest": return <NewInvestPage />;
      default:
        return (
          <div className="dash-area">
            <div className="page-header"><h2 style={{ textTransform: "capitalize" }}>{activePage.replace("-", " ")}</h2></div>
            <div className="dash-card">
              <div className="dash-card-body">
                <div className="empty-state">
                  <div className="empty-icon">🚧</div>
                  <div className="empty-title">Coming Soon</div>
                  <div className="empty-sub">This section is under development.</div>
                  <button className="btn btn-primary" onClick={() => setActivePage("overview")}>← Back to Dashboard</button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? " active" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className={`sidebar${sidebarOpen ? " mobile-open" : ""}`}>
        <DashboardSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          setPage={setPage}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="dash-content">
        <div className="dash-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="mob-hamburger" onClick={() => setSidebarOpen(o => !o)}>
              <span /><span /><span />
            </div>
            <div className="dash-topbar-left">
              <h1>{activePage.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</h1>
              <p>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="topbar-icon-btn" onClick={() => setActivePage("notifications")}>🔔<div className="notif-badge-dot" /></div>
            <button className="btn btn-primary" style={{ padding: "9px 18px", fontSize: 13 }} onClick={() => setActivePage("deposit")}>+ Add Funds</button>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

// ============================================================
// HOME PAGE
// ============================================================
const HomePage = ({ setPage }) => (
  <>
    <HeroSection setPage={setPage} />
    <StatsBand />
    <PlansSection setPage={setPage} />
    <CalculatorSection />
    <AssetsSection />
    <HowItWorks />
    <TestimonialsSection />
    <SecuritySection />
    <Footer setPage={setPage} />
  </>
);

// ============================================================
// SUPPORT FAB
// ============================================================
const SupportFAB = () => {
  const [clicked, setClicked] = useState(false);
  const hour = new Date().getHours();
  const isActive = hour >= 10 && hour < 16;

  return (
    <div className="support-fab" onClick={() => setClicked(true)} title={isActive ? "Live Support Active" : "Support: 10AM–4PM IST"}>
      <div className="support-fab-btn">💬</div>
      <div className="support-fab-badge" style={{ background: isActive ? "#4AE54A" : "#FF9800" }} />
      {clicked && (
        <div style={{ position: "absolute", bottom: 70, right: 0, background: "white", borderRadius: "var(--radius-lg)", padding: 20, width: 280, boxShadow: "var(--shadow-lg)", border: "1.5px solid var(--slate-200)" }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontFamily: "Poppins, sans-serif" }}>Support Chat</div>
          {isActive ? (
            <div style={{ fontSize: 13, color: "var(--slate-600)", lineHeight: 1.7 }}>Our team is online! Click to start a chat. Average response time: 2 mins.</div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--slate-600)", lineHeight: 1.7 }}>Support is available <strong>10 AM – 4 PM IST</strong>. Leave a message and we'll respond when online.</div>
          )}
          <button style={{ width: "100%", marginTop: 14, padding: "10px", borderRadius: 10, background: "var(--blue)", color: "white", border: "none", fontWeight: 700, cursor: "pointer" }}>Start Chat</button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function BharatAssetsApp() {
  const [page, setPage] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  const isFullPage = ["login", "register", "verify", "dashboard"].includes(page);

  return (
    <>
      <GlobalStyles />
      {!isFullPage && (
        <>
          <Ticker />
          <Navbar page={page} setPage={setPage} scrolled={scrolled} />
        </>
      )}
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "plans" && <><PlansSection setPage={setPage} /><Footer setPage={setPage} /></>}
      {page === "calculator" && <><CalculatorSection /><Footer setPage={setPage} /></>}
      {page === "assets" && <><AssetsSection /><Footer setPage={setPage} /></>}
      {page === "how" && <><HowItWorks /><Footer setPage={setPage} /></>}
      {page === "login" && <LoginPage setPage={setPage} />}
      {page === "register" && <RegisterPage setPage={setPage} />}
      {page === "verify" && <VerifyEmailPage setPage={setPage} />}
      {page === "kyc" && (
        <div className="app-layout">
          <div className="dash-content" style={{ marginLeft: 0 }}>
            <div className="dash-topbar">
              <div className="dash-topbar-left"><h1>KYC Verification</h1><p>Complete your identity verification</p></div>
              <button className="btn btn-ghost" onClick={() => setPage("dashboard")}>← Back to Dashboard</button>
            </div>
            <KYCPage />
          </div>
        </div>
      )}
      {page === "dashboard" && <DashboardPage setPage={setPage} />}
      {!isFullPage && <SupportFAB />}

      {/* Demo navigation bar */}
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "rgba(15,23,42,0.92)", backdropFilter: "blur(12px)", borderRadius: 30, padding: "10px 20px", display: "flex", gap: 8, zIndex: 999, border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        {[["🏠","Home","home"],["📊","Dashboard","dashboard"]].map(([emoji, label, target]) => (
          <button key={target} onClick={() => setPage(target)} style={{ background: page === target ? "var(--blue)" : "rgba(255,255,255,0.08)", color: page === target ? "white" : "rgba(255,255,255,0.7)", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", fontFamily: "DM Sans" }}>
            {emoji} {label}
          </button>
        ))}
      </div>
    </>
  );
}
