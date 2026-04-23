import { BrowserRouter, Routes, Route } from "react-router-dom";
import BharatAssets from "./BharatAssets"; // MUST match filename exactly
import BharatAdmin from "./BharatAdmin";   // MUST match filename exactly

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BharatAssets />} />
        <Route path="/admin" element={<BharatAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
