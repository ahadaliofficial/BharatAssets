import { BrowserRouter, Routes, Route } from "react-router-dom";
import BharatAssets from "./Bharatassets"; 
import BharatAdmin from "./Bharatadmin";   

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* This shows at: your-link.vercel.app/ */}
        <Route path="/" element={<BharatAssets />} />
        
        {/* This shows at: your-link.vercel.app/admin */}
        <Route path="/admin" element={<BharatAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}
