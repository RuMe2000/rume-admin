import { useEffect, useState } from 'react';
import { deleteUser, suspendUser, unsuspendUser, getUserById, verifyOwner, unverifyOwner } from '../../utils/firestoreUtils';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const UserCard = ({ userId, onClose }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profilePicUrl, setProfilePicUrl] = useState(null);

    // fetch user info and pic
    const fetchUserAndPic = async () => {
        setIsLoading(true);
        const data = await getUserById(userId);
        setUser(data);

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
                console.warn('No profile picture found:', err.message);
                setProfilePicUrl(null);
            }
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
            alert(`Owner ${userToUnverify.id} has been verified.`);
        } catch (error) {
            console.error('Error unverifying user:', error);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
            <div className="bg-bgBlue text-white rounded-2xl shadow-lg w-[500px] h-[600px] relative p-6 flex flex-col border-2 border-darkGray">
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
                                {profilePicUrl ? (
                                    <img
                                        src={profilePicUrl}
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
                                <p className={`mb-3 rounded-full px-3
                                    ${user?.status === 'active' || 'verified' ? 'bg-successGreen' : 'bg-gray-400'}
                                    ${user.status === 'suspended' || 'unverified' ? 'bg-orange-400' : 'bg-gray-400'}`}>
                                        {user?.status.charAt(0).toUpperCase() + user.status.slice(1) || 'N/A'}
                                </p>
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
                                    className="bg-yellow-500 font-semibold text-white px-4 py-2 rounded-lg hover:bg-yellow-700 duration-300 transition"
                                >
                                    UNVERIFY
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleVerifyOwner(user)}
                                    className="bg-green-600 font-semibold text-white px-4 py-2 rounded-lg hover:bg-green-700 duration-300 transition"
                                >
                                    VERIFY
                                </button>
                            )
                        )}


                        {user.status === 'suspended' ? (
                            <button
                                onClick={() => handleUnsuspendUser(user)}
                                className="bg-mainBlue text-white px-4 py-2 font-semibold rounded-lg hover:bg-hoverBlue duration-300 transition"
                            >
                                UNSUSPEND
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSuspendUser(user)}
                                className="bg-yellow-500 text-white px-4 py-2 font-semibold rounded-lg hover:bg-yellow-700 duration-300 transition"
                            >
                                SUSPEND
                            </button>
                        )}
                        <button
                            onClick={() => handleDeleteUser(user)}
                            className="bg-errorRed text-white px-4 py-2 font-semibold rounded-md hover:bg-red-700 duration-300 transition"
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
