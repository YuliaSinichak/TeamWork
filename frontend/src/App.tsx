import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyResourcesPage from "./pages/MyResourcesPage";
import AddResourcePage from "./pages/AddResourcePage";
import SavedResourcesPage from "./pages/SavedResourcesPage";
import ProfilePage from "./pages/ProfilePage";
import ResourceDetailPage from "./pages/ResourceDetailPage";
import AdminPage from "./pages/AdminPage";
import UserProfilePage from "./pages/UserProfilePage";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Footer from "./components/Footer";
import "./App.css";
import api from "./api";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const auth = useContext(AuthContext);
  return auth?.isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const auth = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth?.isAuthenticated) {
        try {
          const response = await api.get("/users/users/me/");
          setIsAdmin(response.data.is_staff || false);
        } catch (error) {
          console.error(error);
        }
      }
      setLoading(false);
    };
    checkAdmin();
  }, [auth?.isAuthenticated]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

const AppContent: React.FC = () => {
  const auth = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth?.isAuthenticated) {
        try {
          const response = await api.get("/users/users/me/");
          setIsAdmin(response.data.is_staff || false);
        } catch (error) {
          console.error(error);
        }
      }
    };
    checkAdmin();
  }, [auth?.isAuthenticated]);

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="logo">
            LibraryHub
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              Home
            </Link>
            {auth?.isAuthenticated ? (
              <>
                <Link to="/my-resources" className="nav-link">
                  My Resources
                </Link>
                <Link to="/add-resource" className="nav-link">
                  Add Resource
                </Link>
                <Link to="/saved-resources" className="nav-link">
                  Saved
                </Link>
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="nav-link"
                    style={{ color: "var(--primary)" }}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={auth.logout}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/resource/:id" element={<ResourceDetailPage />} />
          <Route path="/user/:id" element={<UserProfilePage />} />
          <Route
            path="/my-resources"
            element={
              <PrivateRoute>
                <MyResourcesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-resource"
            element={
              <PrivateRoute>
                <AddResourcePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/saved-resources"
            element={
              <PrivateRoute>
                <SavedResourcesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
