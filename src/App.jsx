import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute";

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
import PropertyEdit from "./pages/properties/PropertyEdit";
import PendingProperties from "./pages/properties/PendingProperties";
import VerifiedProperties from "./pages/properties/VerifiedProperties";
import UserCard from './pages/users/UserCard';

function App() {
    return (
        <BrowserRouter>
            <ToastContainer />

            <Routes>
                {/* <Route path="/login" element={<Login />} /> */}

                {/* protected routes */}
                <Route
                    path="/*"
                    element={
                        <div className="flex min-h-screen bg-bgBlue">
                            <Sidebar />
                            {/* <ProtectedRoute> */}
                            <div className="flex-1 p-5 bg-radial from-hoverBlue via-darkBlue to-bgBlue text-white">
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
                                    <Route path="/properties/edit/:propertyId" element={<PropertyEdit />} />

                                    <Route path="/transactions" element={<Transactions />} />
                                    <Route path="/feedback" element={<FeedbackModeration />} />
                                    <Route path="/analytics" element={<Analytics />} />

                                    {/* default display after login */}
                                    <Route path="/" element={<Dashboard />} />
                                </Routes>
                            </div>

                            {/* </ProtectedRoute> */}
                        </div>
                    }
                />

            </Routes >

        </BrowserRouter >
    );
}

export default App;
