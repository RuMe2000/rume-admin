import { useEffect, useState } from 'react';
import {
    deleteUser,
    suspendUser,
    unsuspendUser,
    getUserById,
    verifyOwner,
    unverifyOwner,
    getPropertiesByUser,
    getBookedRoomByUser,
    getSeekerStayDuration,
} from '../../utils/firestoreUtils';
import useAlerts from '../../hooks/useAlerts';
import AlertContainer from '../../components/AlertContainer';
import ConfirmDialog from '../../components/ConfirmDialog';

const UserCard = ({ userId, onClose }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [ownedProperties, setOwnedProperties] = useState([]);
    const [bookedRoom, setBookedRoom] = useState([]);

    const { alerts, showAlert, removeAlert } = useAlerts();
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const fetchUserAndPic = async () => {
        setIsLoading(true);
        const data = await getUserById(userId);
        setUser(data);

        if (data?.role === 'owner') {
            const props = await getPropertiesByUser(userId);
            setOwnedProperties(props);
            setBookedRoom(null);
        } else if (data?.role === 'seeker') {
            const room = await getBookedRoomByUser(userId);
            if (room) {
                const duration = await getSeekerStayDuration(userId);
                setBookedRoom({ ...room, stayDuration: duration });
            } else {
                setBookedRoom(null);
            }
            setOwnedProperties([]);
        } else {
            setOwnedProperties([]);
            setBookedRoom(null);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchUserAndPic();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleDeleteUser = async (userToDelete) => {
        try {
            await deleteUser(userToDelete.id);
            showAlert("info", `User ${userToDelete.email} has been permanently deleted.`);
            onClose();
        } catch (error) {
            console.error('Error deleting user:', error);
            showAlert("error", `Failed to delete user.`);
        }
    };

    const handleVerifyOwner = async (userToVerify) => {
        try {
            await verifyOwner(userToVerify.id);
            await fetchUserAndPic();
            showAlert("success", `Owner ${userToVerify.email} verified successfully!.`);
        } catch (error) {
            console.error('Error verifying user:', error);
            showAlert("error", "Error verifying owner.");
        }
    };

    const handleUnverifyOwner = async (userToUnverify) => {
        try {
            await unverifyOwner(userToUnverify.id);
            await fetchUserAndPic();
            showAlert("info", `Owner ${userToUnverify.email} has been unverified.`);
        } catch (error) {
            console.error('Error unverifying owner:', error);
            showAlert("error", "Error unverifying owner.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm">
            <div className="bg-bgBlue text-white rounded-2xl shadow-2xl w-[550px] h-[550px] relative p-8 flex flex-col border border-darkGray">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white hover:scale-110 transition duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="currentColor">
                        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                    </svg>
                </button>

                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="text-gray-300">Loading user...</p>
                    </div>
                ) : user ? (
                    <>
                        {/* Header Section */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-500 shadow-md">
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white">
                                        No photo
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold mt-3">
                                {user.firstName?.charAt(0).toUpperCase() + user.firstName?.slice(1)}{' '}
                                {user.lastName?.charAt(0).toUpperCase() + user.lastName?.slice(1)}
                            </h2>
                            <p className="text-gray-300 text-sm">{user.email}</p>

                            {/* Status Badge */}
                            <div
                                className={`mt-3 px-4 py-1 rounded-full text-sm font-semibold ${user.status === 'verified' || user.status === 'booked'
                                    ? 'bg-successGreen text-white'
                                    : user.status === 'unverified' || user.status === 'searching'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-gray-500 text-white'
                                    }`}
                            >
                                {user.status === 'verified'
                                    ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z" /></svg>
                                    : user.status === 'unverified'
                                        ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m586-486 78-78-56-58-79 79 57 57Zm248 248-88-88-6-70 74-84-74-86 10-112-110-24-58-96-102 44-104-44-37 64-59-59 64-107 136 58 136-58 76 128 144 32-14 148 98 112-98 112 12 130Zm-456 76 102-44 104 44 38-64-148-148-36 36-142-142 56-56 86 84-21 21-203-203 6 68-74 86 74 84-10 114 110 24 58 96ZM344-60l-76-128-144-32 14-148-98-112 98-112-12-130-70-70 56-56 736 736-56 56-112-112-64 108-136-58-136 58Zm185-483Zm-145 79Z" /></svg>
                                        : user.status === 'searching'
                                            ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" /></svg>
                                            : user.status === 'booked'
                                                ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M713-600 600-713l56-57 57 57 141-142 57 57-198 198ZM200-120v-640q0-33 23.5-56.5T280-840h240v80H280v518l200-86 200 86v-278h80v400L480-240 200-120Zm80-640h240-240Z" /></svg>
                                                : 'Unknown'
                                }
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-gray-600 mb-5" />

                        {/* User Info Section */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                            <div>
                                <p className="font-semibold text-gray-300">User ID</p>
                                <p className="break-all">{user.id}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-300">Role</p>
                                <p>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</p>
                            </div>
                        </div>

                        {/* Role-specific Details */}
                        <div className="mt-6 bg-darkBlue p-4 rounded-xl border border-gray-700 max-h-[180px] overflow-y-auto">
                            {user.role === 'owner' && (
                                <>
                                    <h3 className="text-lg font-bold mb-2">Properties Owned</h3>
                                    {ownedProperties.length > 0 ? (
                                        <ul className="list-disc ml-6 text-gray-200">
                                            {ownedProperties.map((prop) => (
                                                <li key={prop.id}>{prop.name}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="italic text-gray-400">No properties posted yet.</p>
                                    )}
                                </>
                            )}

                            {user.role === 'seeker' && (
                                <>
                                    <h3 className="text-lg font-bold mb-2">Current Booking</h3>
                                    {bookedRoom ? (
                                        <>
                                            <p className="font-semibold">{bookedRoom.propertyName} – {bookedRoom.name}</p>
                                            <p className="text-gray-300 text-sm">
                                                Stay duration:{' '}
                                                {bookedRoom?.stayDuration?.duration
                                                    ? `${bookedRoom.stayDuration.duration.days} days (${bookedRoom.stayDuration.duration.months} months, ${bookedRoom.stayDuration.duration.years} years)`
                                                    : 'No booking found'}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="italic text-gray-400">No booked room yet.</p>
                                    )}
                                </>
                            )}

                            {user.role === 'admin' && <p className="text-gray-300 italic">Admin Account</p>}
                        </div>

                        {/* Buttons */}
                        <div className="absolute bottom-6 right-6 flex gap-3 mt-6">
                            {user.role === 'owner' && (
                                user.status === 'verified' ? (
                                    <button
                                        onClick={() => handleUnverifyOwner(user)}
                                        className="bg-yellow-500 font-semibold text-white text-sm px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-200"
                                    >
                                        UNVERIFY
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleVerifyOwner(user)}
                                        className="bg-green-600 font-semibold text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                                    >
                                        VERIFY
                                    </button>
                                )
                            )}
                            <button
                                onClick={() => setShowConfirmDelete(true)}
                                className="bg-errorRed font-semibold text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                            >
                                DELETE
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-300 mt-10">User not found</p>
                )}
            </div>

            <AlertContainer alerts={alerts} removeAlert={removeAlert} />

            <ConfirmDialog
                visible={showConfirmDelete}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={async () => {
                    setShowConfirmDelete(false);
                    await handleDeleteUser(user);
                }}
                onCancel={() => setShowConfirmDelete(false)}
            />

        </div>
    );
};

export default UserCard;
