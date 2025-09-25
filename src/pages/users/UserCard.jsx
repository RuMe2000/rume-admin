import { useEffect, useState } from 'react';
import { deleteUser, suspendUser, unsuspendUser, getUserById, verifyOwner, unverifyOwner, getPropertiesByUser, getBookedRoomByUser } from '../../utils/firestoreUtils';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const UserCard = ({ userId, onClose }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profilePicUrl, setProfilePicUrl] = useState(null);

    const [ownedProperties, setOwnedProperties] = useState([]);
    const [bookedRoom, setBookedRoom] = useState(null);

    const fetchUserAndPic = async () => {
        setIsLoading(true);

        //fetch user info
        const data = await getUserById(userId);
        setUser(data);

        //fetch profile pic if exists
        if (data?.email) {
            try {
                const storage = getStorage();
                const picRef = ref(
                    storage,
                    `${data.role}/${data.email}/profile_pictures/profile.jpg`
                );
                const url = await getDownloadURL(picRef);
                setProfilePicUrl(url);
            } catch (err) {
                console.warn("No profile picture found:", err.message);
                setProfilePicUrl(null);
            }
        }

        //fetch properties or booked room
        if (data?.role === "owner") {
            //get properties owned by user
            const props = await getPropertiesByUser(userId);
            setOwnedProperties(props);
            setBookedRoom(null); //clear booked room
        } else if (data?.role === "seeker") {
            //get booked room
            const room = await getBookedRoomByUser(userId);
            setBookedRoom(room);
            setOwnedProperties([]); //clear properties
        } else {
            //neither role
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
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete the account of ${userToDelete.email}? This action cannot be undone.`
        );

        if (confirmed) {
            try {
                await deleteUser(userToDelete.id);
                alert(`User ${userToDelete.email} has been permanently deleted.`);
                onClose();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert(`Failed to delete user: ${error.message}. Please check console for details.`);
            }
        }
    };

    const handleSuspendUser = async (userToSuspend) => {
        const daysToSuspend = prompt(`How many days do you want to suspend ${userToSuspend.email}?`);
        try {
            await suspendUser(userToSuspend.id, daysToSuspend);
            await fetchUserAndPic();
            alert(`User ${userToSuspend.email} has been suspended for ${daysToSuspend} days.`);
        } catch (error) {
            console.error('Error suspending user:', error);
            alert(`Failed to suspend user: ${error.message}. Please check console for details.`);
        }
    };

    const handleUnsuspendUser = async (userToUnsuspend) => {
        try {
            await unsuspendUser(userToUnsuspend.id);
            await fetchUserAndPic();
            alert(`User ${userToUnsuspend.email} has been unsuspended.`);
        } catch (error) {
            console.error('Error unsuspending user:', error);
            alert(`Failed to unsuspend user: ${error.message}. Please check console for details.`);
        }
    };

    const handleVerifyOwner = async (userToVerify) => {
        try {
            await verifyOwner(userToVerify.id);
            await fetchUserAndPic();
            alert(`Owner ${userToVerify.id} has been verified.`);
        } catch (error) {
            console.error('Error verifying user:', error);
        }
    };

    const handleUnverifyOwner = async (userToUnverify) => {
        try {
            await unverifyOwner(userToUnverify.id);
            await fetchUserAndPic();
            alert(`Owner ${userToUnverify.id} has been unverified.`);
        } catch (error) {
            console.error('Error unverifying user:', error);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
            <div className="bg-bgBlue text-white rounded-2xl shadow-lg w-[500px] h-[650px] relative p-6 flex flex-col border-2 border-darkGray">
                {/* X Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white cursor-pointer hover:scale-110 transition duration-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                    >
                        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                    </svg>
                </button>

                {/* Body */}
                <div className="flex-1 overflow-y-auto mt-3">
                    {isLoading ? (
                        <p className="text-center text-white">Loading user...</p>
                    ) : user ? (
                        <>
                            {/* Profile picture centered */}
                            <div className="flex justify-center mb-4">
                                {user.profileImageUrl ? (
                                    <img
                                        src={user.profileImageUrl}
                                        alt="Profile"
                                        className="w-26 h-26 rounded-full object-cover border-2 border-darkGray"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center">
                                        <span className="text-sm text-white">No photo</span>
                                    </div>
                                )}
                            </div>

                            {/* User fields left-aligned */}
                            <div className="flex flex-col items-start">
                                <p className="font-bold">ID:</p>
                                <p className="mb-3">{user.id}</p>
                                <p className="font-bold">Email:</p>
                                <p className="mb-3">{user.email}</p>
                                <p className="font-bold">First Name:</p>
                                <p className="mb-3">{user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)}</p>
                                <p className="font-bold">Last Name:</p>
                                <p className="mb-3">{user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)}</p>
                                <p className="font-bold">Role:</p>
                                <p className="mb-3">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                                <p className='font-bold'>Status:</p>
                                <p
                                    className={`mb-3 rounded-full px-3 ${(user?.status === 'active' || user?.status === 'verified')
                                        ? 'bg-successGreen'
                                        : (user?.status === 'suspended' || user?.status === 'unverified')
                                            ? 'bg-yellow-500'
                                            : 'bg-gray-400'
                                        }`}
                                >
                                    {user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                                </p>
                                {(() => {
                                    switch (user?.role) {
                                        case 'owner':
                                            return (
                                                <div>
                                                    <p className='font-bold'>Properties Owned:</p>
                                                    {ownedProperties.length > 0 ? (
                                                        <ul className="list-disc ml-5">
                                                            {ownedProperties.map((prop) => (
                                                                <li key={prop.id}>{prop.name}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="italic text-gray-400">No properties posted yet.</p>
                                                    )}
                                                </div>
                                            );

                                        case 'seeker':
                                            return (
                                                <div>
                                                    <p className='font-bold'>Property Booked:</p>
                                                    {bookedRoom ? (
                                                        <p>
                                                            {bookedRoom.propertyName} – {bookedRoom.roomName}
                                                        </p>
                                                    ) : (
                                                        <p className="italic text-gray-400">No booked room yet.</p>
                                                    )}
                                                </div>
                                            );

                                        case 'admin':
                                            return <p>Admin</p>;

                                        default:
                                            return null;
                                    }
                                })()}

                            </div>
                        </>
                    ) : (
                        <p className="text-center text-white">User not found</p>
                    )}
                </div>

                {/* Buttons bottom-right */}
                {user && (
                    <div className="flex justify-end gap-3 mt-4">
                        {user.role === 'owner' && (
                            user.status === 'verified' ? (
                                <button
                                    onClick={() => handleUnverifyOwner(user)}
                                    className="bg-yellow-500 font-semibold text-white text-sm px-4 py-2 rounded-2xl hover:bg-yellow-700 duration-300 transition"
                                >
                                    UNVERIFY
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleVerifyOwner(user)}
                                    className="bg-green-600 font-semibold text-white text-sm px-4 py-2 rounded-2xl hover:bg-green-700 duration-300 transition"
                                >
                                    VERIFY
                                </button>
                            )
                        )}


                        {user.status === 'suspended' ? (
                            <button
                                onClick={() => handleUnsuspendUser(user)}
                                className="bg-mainBlue text-white text-sm px-4 py-2 font-semibold rounded-2xl hover:bg-hoverBlue duration-300 transition"
                            >
                                UNSUSPEND
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSuspendUser(user)}
                                className="bg-yellow-500 text-white text-sm px-4 py-2 font-semibold rounded-2xl hover:bg-yellow-700 duration-300 transition"
                            >
                                SUSPEND
                            </button>
                        )}
                        <button
                            onClick={() => handleDeleteUser(user)}
                            className="bg-errorRed text-white text-sm px-4 py-2 font-semibold rounded-md hover:bg-red-700 duration-300 transition"
                        >
                            DELETE
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserCard;
