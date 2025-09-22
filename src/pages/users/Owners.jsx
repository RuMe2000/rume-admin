import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllOwners } from '../../utils/firestoreUtils';
import UserCard from './UserCard';

const Owners = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [owners, setOwners] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const fetchOwners = async () => {
        setIsLoading(true);
        const data = await getAllOwners();
        setOwners(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchOwners();
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
                <h1 className="text-3xl font-semibold">Owners</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-white rounded-md">
                    <thead>
                        <tr>
                            <th className="w-70 px-4 py-2 border-b-3 border-darkGray text-center">ID</th>
                            <th className="w-70 px-4 py-2 border-b-3 border-darkGray text-center">Name</th>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Email</th>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Role</th>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Status</th>
                            <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Date Created</th>
                            <th className="w-15 px-4 py-2 border-b-3 border-darkGray text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">Loading owners...</td>
                            </tr>
                        ) : owners.length > 0 ? (
                            owners.map((owner) => (
                                <tr key={owner.id} className='text-center border-b border-darkGray'>
                                    <td className='px-4 py-2 relative group cursor-pointer transition-all duration-200'>
                                        <span className='group-hover:hidden'>
                                            {owner.id.substring(0, 12)}...
                                        </span>
                                        <span className='hidden group-hover:inline-block transition-all duration-200'>
                                            {owner.id}
                                        </span>
                                    </td>
                                    <td className='px-4 py-2'>
                                        {owner?.firstName || owner?.lastName
                                            ? `${owner.firstName.charAt(0).toUpperCase() + owner.firstName.slice(1)} 
                                            ${owner.lastName.charAt(0).toUpperCase() + owner.lastName.slice(1)}`.trim()
                                            : 'N/A'}
                                    </td>
                                    <td className='px-4 py-2'>{owner.email || 'N/A'}</td>
                                    <td className='px-4 py-2'>{owner.role.charAt(0).toUpperCase() + owner.role.slice(1) || 'N/A'}</td>
                                    <td className='px-2 py-2'>
                                        <span className={`inline-flex items-center justify-center w-20 h-7 rounded-full text-sm font-semibold
                                            ${owner.status === 'unverified' ? 'bg-yellow-500 text-white' : 'bg-gray-400'}
                                            ${owner.status === 'verified' ? 'bg-green-500 text-white': 'bg-gray-400'}`}>
                                            {
                                                owner?.status
                                                    ? owner.status.charAt(0).toUpperCase() + owner.status.slice(1)
                                                    : 'N/A'
                                            }
                                        </span>
                                    </td>
                                    <td className='px-4 py-2'>
                                        {owner.createdAt ? new Date(owner.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className='px-4 py-2 flex items-center justify-center gap-2'>
                                        <button
                                            onClick={() => setSelectedUserId(owner.id)}
                                            className='bg-transparent px-3 py-1 rounded-lg hover:scale-120 hover:cursor-pointer duration-300 transition'
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
                                <td colSpan="7" className="text-center py-4">No owners found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {selectedUserId && (
                    <UserCard
                        userId={selectedUserId}
                        role="owner"
                        onClose={() => {
                            setSelectedUserId(null);
                            fetchOwners(); // refresh owners list after closing
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Owners;