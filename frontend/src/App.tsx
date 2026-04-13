import { BrowserRouter, Route, Routes } from 'react-router'
import ChatAppPage from './pages/ChatAppPage'
import SignInPage from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { Toaster } from 'sonner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { useSocketStore } from './stores/useSocketStore';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import { useFriendStore } from './stores/useFriendStore';

function App() {
  const { accessToken } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();
  const { getAllFriendRequests, getFriends } = useFriendStore();

  useEffect(() => {
    if (accessToken) {
      connectSocket();
      getAllFriendRequests();
      getFriends();
    }

    return () => disconnectSocket();
  }, [accessToken]);

  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>

          {/* public routes */}
          <Route
            path="/signin"
            element={<SignInPage />}
          />

          <Route
            path="/signup"
            element={<SignUpPage />}
          />

          <Route
            path="/auth/google/callback"
            element={<GoogleCallbackPage />}
          />

          {/* protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={<ChatAppPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App
