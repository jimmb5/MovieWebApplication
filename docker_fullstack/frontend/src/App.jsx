import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProtectedRoute from "./contexts/ProtectedRoute";
import MediaDetails from "./pages/MediaDetails";
import Profile from "./pages/profile/Profile";
import Groups from "./pages/profile/OwnGroups";
import PublicGroups from "./pages/groups/PublicGroups";
import Favorites from "./pages/profile/Favorites";
import Settings from "./pages/profile/ProfileSettings";
import Group from "./pages/groups/Group";
import GroupSettings from "./pages/groups/GroupSettings";
import GroupMembers from "./pages/groups/GroupMembers";
import GroupPendingRequests from "./pages/groups/GroupPendingRequests";
import Movies from "./pages/Movies";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/groups" element={<PublicGroups />} />
        <Route
          path="/groups/:groupId"
          element={
            <ProtectedRoute>
              <Group />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/members"
          element={
            <ProtectedRoute>
              <GroupMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/pending-requests"
          element={
            <ProtectedRoute>
              <GroupPendingRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId/settings"
          element={
            <ProtectedRoute>
              <GroupSettings />
            </ProtectedRoute>
          }
        />
        <Route path="/movie/:id" element={<MediaDetails />} />
        <Route
          path="/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:username/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:username/groups"
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route path="/:username/favorites" element={<Favorites />} />

      </Route>
    </Routes>
  );
}

export default App;
