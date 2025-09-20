import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { getAllSeekers, deleteUser, suspendUser, unsuspendUser } from '../../utils/firestoreUtils';
import UserCard from './UserCard';

const Seekers = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [seekers, setSeekers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const fetchSeekers = async () => {
            setIsLoading(true);
            const data = await getAllSeekers();
            setSeekers(data);
            setIsLoading(false);
        };

    useEffect(() => {
        fetchSeekers();
    }, []);

    return (
        <div>
            <div className="flex flex-row items-center text-white gap-3 mb-6">
                <button
                    onClick={() => navigate('/users')}
                    className="cursor-pointer hover:scale-115 p-1 rounded-lg duration-200 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF">
                        <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                    </svg>
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
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center"></th>
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
                                        <button
                                            onClick={() => setSelectedUserId(seeker.id)}
                                            className='bg-mainBlue px-3 py-1 rounded-lg hover:bg-hoverBlue hover:cursor-pointer duration-300 transition'
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                                                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                                            </svg>
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

                {selectedUserId && (
                    <UserCard
                        userId={selectedUserId}
                        onClose={() => setSelectedUserId(null)}
                    />
                )}

            </div>
        </div>
    );
};

export default Seekers;