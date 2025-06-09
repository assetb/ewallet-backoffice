import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ManagerPaymentsPage from "./pages/Manager/ManagerPayments";
import FinanceRedemptionPage from "./pages/Finance/FinanceRedemption";
import SupervisorApprovalsPage from "./pages/Supervisor/SupervisorApprovals";
import ProtectedRoute from "./layouts/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import { ToastContainer } from "react-toastify";

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Менеджер */}
          <Route
            path="manager/payments"
            element={
              <ProtectedRoute roles={["manager"]}>
                <ManagerPaymentsPage />
              </ProtectedRoute>
            }
          />

          {/* Финансист */}
          <Route
            path="finance/redemption"
            element={
              <ProtectedRoute roles={["finance"]}>
                <FinanceRedemptionPage />
              </ProtectedRoute>
            }
          />

          {/* Руководитель */}
          <Route
            path="supervisor/approvals"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <SupervisorApprovalsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Все прочие */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer position="top-right" />
    </>
  );
};

export default App;
