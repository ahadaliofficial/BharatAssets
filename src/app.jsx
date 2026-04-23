import { BrowserRouter, Routes, Route } from "react-router-dom";
import BharatAssets from "./BharatAssets"; 
import BharatAdmin from "./BharatAdmin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BharatAssets />} />
        <Route path="/admin" element={<BharatAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}
