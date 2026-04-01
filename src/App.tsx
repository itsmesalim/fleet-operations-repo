// Main application component with routing
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ToastContainer } from "./components/ui/Toast";

import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Routes as RoutesPage } from "./pages/Routes";
import { Teams } from "./pages/Teams";
import { Orders } from "./pages/Orders";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Main App component with routing and providers
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {/* Toast notification container */}
            <ToastContainer />

            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/routes"
                element={<Navigate to="/dashboard/routes" replace />}
              />
              <Route
                path="/teams"
                element={<Navigate to="/dashboard/teams" replace />}
              />
              <Route
                path="/orders"
                element={<Navigate to="/dashboard/orders" replace />}
              />
              <Route
                path="/analytics"
                element={<Navigate to="/dashboard/analytics" replace />}
              />
              <Route
                path="/settings"
                element={<Navigate to="/dashboard/settings" replace />}
              />

              {/* Protected dashboard routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="routes" element={<RoutesPage />} />
                <Route path="teams" element={<Teams />} />
                <Route path="orders" element={<Orders />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* 404 catch-all */}
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                    <div className="text-center">
                      <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
                        404
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        Page not found
                      </p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>

        {/* React Query DevTools (only in development) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
