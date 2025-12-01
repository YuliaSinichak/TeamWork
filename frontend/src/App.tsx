import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyResourcesPage from './pages/MyResourcesPage';
import AddResourcePage from './pages/AddResourcePage';
import SavedResourcesPage from './pages/SavedResourcesPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext, ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const auth = useContext(AuthContext);
  return auth?.isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  const auth = useContext(AuthContext);

  return (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
        {auth?.isAuthenticated && (
          <>
            | <Link to="/my-resources">My Resources</Link>
            | <Link to="/add-resource">Add Resource</Link>
            | <Link to="/saved-resources">Saved Resources</Link>
            | <Link to="/profile">Profile</Link>
            <button onClick={auth.logout}>Logout</button>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
      </Routes>
    </>
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
