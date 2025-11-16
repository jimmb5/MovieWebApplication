import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProtectedRoute from "./contexts/ProtectedRoute";
import Movies from "./pages/Movies";
import Profile from "./pages/Profile";
import Groups from "./pages/OwnGroups";
import PublicGroups from "./pages/PublicGroups";
import Favorites from "./pages/Favorites";
import Settings from "./pages/ProfileSettings";
import Group from "./pages/Group";
import GroupSettings from "./pages/GroupSettings";
import GroupMembers from "./pages/GroupMembers";
import GroupPendingRequests from "./pages/GroupPendingRequests";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/groups" element={<PublicGroups />} />
        <Route path="/groups/:groupId" element={<ProtectedRoute><Group /></ProtectedRoute>} />
        <Route path="/groups/:groupId/members" element={<ProtectedRoute><GroupMembers /></ProtectedRoute>} />
        <Route path="/groups/:groupId/pending-requests" element={<ProtectedRoute><GroupPendingRequests /></ProtectedRoute>} />
        <Route path="/groups/:groupId/settings" element={<ProtectedRoute><GroupSettings /></ProtectedRoute>} />
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
