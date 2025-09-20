import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { getAllSeekers, deleteUser, suspendUser, unsuspendUser } from '../../utils/firestoreUtils';

const Seekers = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [seekers, setSeekers] = useState([]);

    const fetchSeekers = async () => {
            setIsLoading(true);
            const data = await getAllSeekers();
            setSeekers(data);
            setIsLoading(false);
        };

    useEffect(() => {
        fetchSeekers();
    }, []);

    // Function to handle permanent account deletion
    const handleDeleteUser = async (userToDelete) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete the account of ${userToDelete.email}? This action cannot be undone.`
        );

        if (confirmed) {
            try {
                // Call the function from the utility file
                await deleteUser(userToDelete.id);
                // Update UI state immediately by filtering out the deleted user
                setSeekers(prevSeekers => prevSeekers.filter(seeker => seeker.id !== userToDelete.id));

                alert(`User ${userToDelete.email} has been permanently deleted.`);
            } catch (error) {
                console.error("Error deleting user:", error);
                alert(`Failed to delete user: ${error.message}. Please check console for details.`);
            }
        }
    };

    // Function to handle account suspension
    const handleSuspendUser = async (userToSuspend) => {
        const daysToSuspend = prompt(`How many days do you want to suspend ${userToSuspend.email}?`);

        try {
            // Call the function from the utility file
            await suspendUser(userToSuspend.id, daysToSuspend);
            // Re-fetch data to update the UI with the new status
            await fetchSeekers();

            alert(`User ${userToSuspend.email} has been suspended for ${daysToSuspend} days.`);
        } catch (error) {
            console.error("Error suspending user:", error);
            alert(`Failed to suspend user: ${error.message}. Please check console for details.`);
        }
    };

    // Function to handle account unsuspension
    const handleUnsuspendUser = async (userToUnsuspend) => {
        try {
            // Call the function from the utility file
            await unsuspendUser(userToUnsuspend.id);
            // Re-fetch data to update the UI with the new status
            await fetchSeekers();

            alert(`User ${userToUnsuspend.email} has been unsuspended.`);
        } catch (error) {
            console.error("Error unsuspending user:", error);
            alert(`Failed to unsuspend user: ${error.message}. Please check console for details.`);
        }
    };

    return (
        <div>
            <div className="flex flex-row items-center text-white gap-3 mb-6">
                <button onClick={() => navigate('/users')} className="cursor-pointer hover:scale-115 p-1 rounded-lg duration-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                </button>
                <h1 className="text-3xl font-semibold">Seekers</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-white rounded-md">
                    <thead>
                        <tr>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">ID</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Name</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Email</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Role</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Status</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Date Created</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">Loading seekers...</td>
                            </tr>
                        ) : seekers.length > 0 ? (
                            seekers.map((seeker) => (
                                <tr key={seeker.id} className='text-center border-b border-darkGray'>
                                    <td className='px-4 py-2 relative group cursor-pointer transition-all duration-200'>
                                        <span className='group-hover:hidden'>
                                            {seeker.id.substring(0, 12)}...
                                        </span>
                                        <span className='hidden group-hover:inline-block transition-all duration-200'>
                                            {seeker.id}
                                        </span>
                                    </td>
                                    <td className='px-4 py-2'>
                                        {seeker?.firstName || seeker?.lastName
                                            ? `${seeker.firstName ?? ''} ${seeker.lastName ?? ''}`.trim()
                                            : 'N/A'}
                                    </td>
                                    <td className='px-4 py-2'>{seeker.email || 'N/A'}</td>
                                    <td className='px-4 py-2'>{seeker.role || 'N/A'}</td>
                                    <td className='px-4 py-2'>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold
                                            ${seeker.status === 'Suspended' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>
                                            {seeker.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className='px-4 py-2'>
                                        {seeker.createdAt ? new Date(seeker.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className='px-4 py-2 flex items-center justify-center gap-2'>
                                        {seeker.status === 'Suspended' ? (
                                            <button onClick={() => handleUnsuspendUser(seeker)}
                                            className="bg-blue-500 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 duration-300 transition"
                                        >
                                            Unsuspend
                                        </button>
                                        ) : (
                                            <button
                                            onClick={() => handleSuspendUser(seeker)}
                                            className='bg-orange-500 text-white text-sm px-3 py-1 rounded-md hover:bg-orange-700 duration-300 transition'
                                        >
                                            Suspend
                                        </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteUser(seeker)}
                                            className='bg-red-500 text-white text-sm px-3 py-1 rounded-md hover:bg-red-600 duration-300 transition'
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4">No seekers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Seekers;