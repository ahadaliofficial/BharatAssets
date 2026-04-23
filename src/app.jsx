import { BrowserRouter, Routes, Route } from "react-router-dom";
import BharatAssets from "./BharatAssets"; // Capital B and A
import BharatAdmin from "./BharatAdmin";   // Capital B and A

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
