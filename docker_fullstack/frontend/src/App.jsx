import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProtectedRoute from "./contexts/ProtectedRoute";
import Movies from "./pages/Movies";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<ProtectedRoute><Movies /></ProtectedRoute>} />
        <Route path="/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/:username/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/:username/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
        <Route path="/:username/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
