import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./index.css";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/dashboard/Dashboard";
import UserManagement from "./pages/users/UserManagement";
import Owners from "./pages/users/Owners";
import Seekers from "./pages/users/Seekers";
import Admins from "./pages/users/Admins";
import PropertyManagement from "./pages/properties/PropertyManagement";
import Transactions from "./pages/transactions/Transactions";
import FeedbackModeration from "./pages/moderation/FeedbackModeration";
import Analytics from "./pages/analytics/Analytics";
import AllProperties from "./pages/properties/AllProperties";
import ViewProperty from "./pages/properties/ViewProperty";
import PendingProperties from "./pages/properties/PendingProperties";
import VerifiedProperties from "./pages/properties/VerifiedProperties";
import ViewRoom from "./pages/properties/ViewRoom";
import ProtectedRoute from "./components/ProtectedRoute";
import PendingRooms from "./pages/properties/PendingRooms";
import OwnerWallets from "./pages/transactions/OwnerWallets";
import OwnerWalletDetails from "./pages/transactions/OwnerWalletDetails";
import PlatformWalletDetails from "./pages/transactions/PlatformWalletDetails.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";

function App() {
    const { user, loading, loginInProgress } = useAuth();

    if (loading) {
        return (
            <div className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center bg-radial from-darkBlue to-bgBlue text-white">
                <p className="text-2xl font-bold"></p>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <ToastContainer />

            <Routes>
                {/* ✅ Public routes - Don't redirect if login is in progress */}
                <Route
                    path="/login"
                    element={
                        loginInProgress ? (
                            <Login />
                        ) : user ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Login />
                        )
                    }
                />

                {/* Redirect root depending on auth */}
                <Route
                    path="/"
                    element={
                        user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
                    }
                />

                {/* Protected routes */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <div className="flex min-h-screen bg-bgBlue">
                                <div className="w-64 fixed top-0 left-0">
                                    <Sidebar />
                                </div>

                                <div className="flex-1 ml-64 overflow-y-auto p-4 bg-radial from-hoverBlue via-darkBlue to-bgBlue text-white">
                                    <Routes>
                                        <Route path="/dashboard" element={<Dashboard />} />

                                        {/* User Management */}
                                        <Route path="/users" element={<UserManagement />} />
                                        <Route path="/users/owners" element={<Owners />} />
                                        <Route path="/users/seekers" element={<Seekers />} />
                                        <Route path="/users/admins" element={<Admins />} />

                                        {/* Property Management */}
                                        <Route path="/properties" element={<PropertyManagement />} />
                                        <Route path="/properties/all" element={<AllProperties />} />
                                        <Route path="/properties/pending" element={<PendingProperties />} />
                                        <Route path="/properties/verified" element={<VerifiedProperties />} />
                                        <Route path="/properties/pendingRooms" element={<PendingRooms />} />
                                        <Route path="/properties/view/:propertyId" element={<ViewProperty />} />
                                        <Route
                                            path="/properties/view/:propertyId/room/:roomId"
                                            element={<ViewRoom />}
                                        />

                                        {/* Transactions */}
                                        <Route path="/transactions" element={<Transactions />} />
                                        <Route path="/transactions/ownerWallets" element={<OwnerWallets />} />
                                        <Route
                                            path="/transactions/ownerWallets/:walletId"
                                            element={<OwnerWalletDetails />}
                                        />
                                        <Route path="/transactions/platformWalletDetails" element={<PlatformWalletDetails />} />

                                        {/* Feedback & Analytics */}
                                        <Route path="/feedback" element={<FeedbackModeration />} />
                                        <Route path="/analytics" element={<Analytics />} />
                                    </Routes>
                                </div>
                            </div>
                        </ProtectedRoute>
                    }
                />
            </Routes>

        </BrowserRouter>
    );
}

export default App;