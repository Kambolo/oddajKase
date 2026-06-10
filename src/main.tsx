import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { ProtectedRoute } from "./components/common/ProtectedRoute.tsx";
import { PublicRoute } from "./components/common/PublicRoute.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import "./index.css";
import { initContentsquare } from "./initContentsquare";

// Load Contentsquare immediately for all pages
initContentsquare();
import SignInPage from "./pages/AuthPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import GroupPage from "./pages/GroupPage.tsx";
import { store } from "./store/store.ts";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/signin" replace />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/signin",
    element: (
      <PublicRoute>
        <SignInPage />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <SignInPage initialMode="register" />
      </PublicRoute>
    ),
  },
  {
    path: "/groups",
    element: (
      <ProtectedRoute>
        <GroupPage />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  </StrictMode>,
);
