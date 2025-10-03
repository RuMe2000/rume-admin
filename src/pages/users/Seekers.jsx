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
        <div className="p-6">
            <div className="flex flex-row items-center text-white gap-3 mb-2">
                <button
                    onClick={() => navigate('/users')}
                    className="cursor-pointer hover:scale-115 p-1 rounded-2xl duration-200 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF">
                        <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                    </svg>
                </button>
                <h1 className="text-3xl font-bold">Seekers</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-white rounded-md">
                    <thead>
                        <tr>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Status</th>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Name</th>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Email</th>
                            <th className="w-70 px-4 py-2 border-b-3 border-darkGray text-center">ID</th>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Joined On</th>
                            <th className="w-15 px-4 py-2 border-b-3 border-darkGray text-center"></th>
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
                                    <td className='px-2 py-2'>
                                        <span className={`inline-flex items-center justify-center w-20 h-7 rounded-full text-sm font-semibold
                                            ${seeker.status === 'searching' ? 'bg-yellow-500 text-white' : 'bg-gray-400'}
                                            ${seeker.status === 'booked' ? 'bg-green-500 text-white': 'bg-gray-400'}`}>
                                            {
                                                seeker?.status
                                                    ? seeker.status.charAt(0).toUpperCase() + seeker.status.slice(1)
                                                    : 'Unkown'
                                            }
                                        </span>
                                    </td>
                                    <td className='px-4 py-2'>
                                        {seeker?.firstName || seeker?.lastName
                                            ? `${seeker.firstName.charAt(0).toUpperCase() + seeker.firstName.slice(1)} 
                                            ${seeker.lastName.charAt(0).toUpperCase() + seeker.lastName.slice(1)}`.trim()
                                            : 'Unknown'}
                                    </td>
                                    <td className='px-4 py-2'>{seeker.email || 'Unknown'}</td> 
                                    <td className='px-4 py-2 relative group cursor-pointer transition-all duration-200'>
                                        <span className='group-hover:hidden'>
                                            {seeker.id.substring(0, 12)}...
                                        </span>
                                        <span className='hidden group-hover:inline-block transition-all duration-200'>
                                            {seeker.id}
                                        </span>
                                    </td>                                   
                                    <td className='px-4 py-2'>
                                        {seeker.createdAt ? new Date(seeker.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                                    </td>
                                    <td className='px-4 py-2 flex items-center justify-center gap-2'>
                                        <button
                                            onClick={() => setSelectedUserId(seeker.id)}
                                            className='bg-transparent px-3 py-1 rounded-2xl hover:scale-120 hover:cursor-pointer duration-300 transition'
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
                        role='seeker'
                        onClose={() => {
                            setSelectedUserId(null);
                            fetchSeekers();
                        }}
                    />
                )}

            </div>
        </div>
    );
};

export default Seekers;