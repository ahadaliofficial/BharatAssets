import { BrowserRouter, Routes, Route } from "react-router-dom";
import BharatAssets from "./BharatAssets"; // Your website file
import BharatAdmin from "./BharatAdmin";   // Your admin file

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The main website link */}
        <Route path="/" element={<BharatAssets />} />
        
        {/* The secret admin link */}
        <Route path="/admin" element={<BharatAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
