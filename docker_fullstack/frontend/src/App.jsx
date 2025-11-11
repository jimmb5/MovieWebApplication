import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProtectedRoute from "./contexts/ProtectedRoute";
import Movies from "./pages/Movies";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<ProtectedRoute><Movies /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
