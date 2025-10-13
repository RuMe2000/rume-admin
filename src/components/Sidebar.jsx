import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/rume_logo.png';

const Sidebar = () => {
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setAdminName(`${userDoc.data().firstName} ${userDoc.data().lastName}`);
                    } else {
                        console.warn("No user document found for current user.");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setAdminName('');
            }
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        navigate('./login');
    };

    const baseLinkClasses =
        'flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 ease-in-out';
    const activeLinkClasses =
        'bg-gradient-to-r from-mainBlue to-transparent text-white font-medium shadow-inner';
    const inactiveLinkClasses =
        'text-gray-300 hover:bg-gradient-to-r hover:from-hoverBlue hover:to-transparent hover:text-white hover:translate-x-1 hover:opacity-95 transition-all duration-300 ease-in-out';

    return (
        <nav className="h-[97vh] w-64 bg-bgBlue rounded-r-2xl border-r border-y border-darkGray text-white py-4 my-3 flex flex-col justify-between shadow-lg">
            <div>
                {/* Logo Section */}
                <div className="flex flex-col items-center justify-center border-b border-darkGray pb-3 mb-3">
                    <div className="flex items-center justify-center gap-1">
                        <img src={logo} className="h-14" alt="RuMe Logo" />
                        <h1 className="text-3xl font-bold tracking-tight">RuMe.</h1>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Admin</p>
                </div>

                {/* Admin Info */}
                <div className="flex flex-col items-center mb-4 px-2">
                    <div className="flex items-center justify-center gap-2 bg-darkBlue px-3 py-2 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-440q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0-80q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0 440q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-400Zm0-315-240 90v189q0 54 15 105t41 96q42-21 88-33t96-12q50 0 96 12t88 33q26-45 41-96t15-105v-189l-240-90Zm0 515q-36 0-70 8t-65 22q29 30 63 52t72 34q38-12 72-34t63-52q-31-14-65-22t-70-8Z" /></svg>
                        <span className="text-sm font-medium">
                            {adminName || 'Loading...'}
                        </span>
                    </div>
                </div>

                {/* Nav Links */}
                <ul className="space-y-1 px-1 overflow-y-auto max-h-[65vh]">
                    <li>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                            }
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z" /></svg>
                            <span>Dashboard</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/users"
                            className={({ isActive }) =>
                                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                            }
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z" /></svg>
                            <span>User Management</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/properties"
                            className={({ isActive }) =>
                                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                            }
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M120-120v-560h160v-160h400v320h160v400H520v-160h-80v160H120Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 320h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Z" /></svg>                            <span>Property Management</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/transactions"
                            className={({ isActive }) =>
                                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                            }
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400Zm440 240H120q-33 0-56.5-23.5T40-240v-440h80v440h680v80ZM280-400v-320 320Z" /></svg>
                            <span>Transactions</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/feedback"
                            className={({ isActive }) =>
                                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                            }
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-360q17 0 28.5-11.5T520-400q0-17-11.5-28.5T480-440q-17 0-28.5 11.5T440-400q0 17 11.5 28.5T480-360Zm-40-160h80v-240h-80v240ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" /></svg>                            <span>Feedback Moderation</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/analytics"
                            className={({ isActive }) =>
                                `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                            }
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M280-280h80v-200h-80v200Zm320 0h80v-400h-80v400Zm-160 0h80v-120h-80v120Zm0-200h80v-80h-80v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" /></svg>
                            <span>Analytics</span>
                        </NavLink>
                    </li>
                </ul>
            </div>

            {/* Sign Out */}
            <div className="border-t border-darkGray mt-3 pt-3 px-3">
                <button
                    onClick={handleSignOut}
                    className="w-full py-2 bg-mainBlue rounded-xl text-sm font-semibold hover:bg-hoverBlue transition duration-300"
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
