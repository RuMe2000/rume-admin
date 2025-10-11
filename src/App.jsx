import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import './index.css';


import Login from "./pages/Login";
import Register from "./pages/Register";
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

function App() {
    return (
        <BrowserRouter>
            <ToastContainer />

            <Routes>
                <Route path="/login" element={<Login />} />

                {/* protected routes */}
                <Route
                    path="/*"
                    element={
                        <div className="flex min-h-screen bg-bgBlue">
                            <div className="w-64 fixed top-0 left-0">
                                <Sidebar />
                            </div>
                            
                            
                            <ProtectedRoute>
                            <div className="flex-1 ml-64 overflow-y-auto p-4 bg-radial from-hoverBlue via-darkBlue to-bgBlue text-white">
                            
                                <Routes>
                                    <Route path="/dashboard" element={<Dashboard />} />

                                    {/* user management routes */}
                                    <Route path="/users" element={<UserManagement />} />
                                    <Route path="/users/owners" element={<Owners />} />
                                    <Route path="/users/seekers" element={<Seekers />} />
                                    <Route path="/users/admins" element={<Admins />} />
                                    {/* <Route path="/users/usercard/:userId" element={<UserCard />} /> */}

                                    {/* property management routes */}
                                    <Route path="/properties" element={<PropertyManagement />} />
                                    <Route path="/properties/all" element={<AllProperties />} />
                                    <Route path="/properties/pending" element={<PendingProperties />} />
                                    <Route path="/properties/verified" element={<VerifiedProperties />} />
                                    <Route path="/properties/pendingRooms" element={<PendingRooms />} />
                                    <Route path="/properties/view/:propertyId" element={<ViewProperty />} />
                                    <Route path="/properties/view/:propertyId/room/:roomId" element={<ViewRoom />} />

                                    {/* transactions */}
                                    <Route path="/transactions" element={<Transactions />} />
                                    <Route path="/transactions/ownerWallets" element={<OwnerWallets />} />
                                    <Route path="/transactions/ownerWallets/:walletId" element={<OwnerWalletDetails />} />

                                    <Route path="/feedback" element={<FeedbackModeration />} />
                                
                                    <Route path="/analytics" element={<Analytics />} />

                                    {/* default display after login */}
                                    <Route path="/" element={<Dashboard />} />
                                </Routes>
                            </div>

                            </ProtectedRoute>
                        </div>
                    }
                />

            </Routes >

        </BrowserRouter >
    );
}

export default App;
