import UserButton from '../../components/UserButton';
import { getUserCountByRole, getAllOwners, getAllSeekers } from '../../utils/firestoreUtils';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserCard from './UserCard';

const UserManagement = () => {
    //get user count by role
    const [ownersCount, setOwnersCount] = useState(0);
    const [seekersCount, setSeekersCount] = useState(0);
    const [adminsCount, setAdminsCount] = useState(0);

    //users list
    const [owners, setOwners] = useState([]);
    const [seekers, setSeekers] = useState([]);

    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [filterRole, setFilterRole] = useState("owners");

    const fetchCounts = async () => {
        const owners = await getUserCountByRole("owner");
        const seekers = await getUserCountByRole("seeker");
        const admins = await getUserCountByRole('admin');

        setOwnersCount(owners);
        setSeekersCount(seekers);
        setAdminsCount(admins);
    };

    const fetchOwners = async () => {
        setIsLoading(true);
        const data = await getAllOwners();
        setOwners(data);
        setIsLoading(false);
    };

    const fetchSeekers = async () => {
        setIsLoading(true);
        const data = await getAllSeekers();
        setSeekers(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCounts();

        fetchSeekers();
        fetchOwners();
    }, []);

    const navigate = useNavigate();

    const handleNavigate = (role) => {
        if (role === 'Owners') {
            navigate('/users/owners');
        } else if (role === 'Seekers') {
            navigate('/users/seekers');
        } else if (role === 'Admins') {
            navigate('/users/admins');
        }
    };

    const displayedUsers = filterRole === "owners" ? owners : seekers;

    // toggle function
    const toggleRole = () => {
        setFilterRole((prev) => (prev === "owners" ? "seekers" : "owners"));
    };

    return (
        <div className='p-6'>
            <h1 className="text-start text-3xl font-bold mb-4">User Management</h1>

            <div className='flex flex-row'>
                <UserButton roleName="Owners" count={ownersCount} onManage={() => handleNavigate('Owners')} />
                <UserButton roleName="Seekers" count={seekersCount} onManage={() => handleNavigate('Seekers')} />
                <UserButton roleName="Admins" count={adminsCount} onManage={() => handleNavigate('Admins')} />
            </div>

            <div className="overflow-x-auto mt-8">
                <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-darkGray">
                    <table className="min-w-full text-white rounded-xl">
                        <thead className='sticky top-0 z-10 bg-darkBlue'>
                            <tr>
                                {/* 🔽 Clickable "Role" header */}
                                <th
                                    onClick={toggleRole}
                                    title='Toggle Role'
                                    className="w-30 px-4 py-2 border-b-3 border-darkGray text-center cursor-pointer hover:bg-hoverBlue transition"
                                >
                                    Role ({filterRole === "owners" ? "Owners" : "Seekers"})
                                </th>
                                <th className="w-40 px-4 py-2 border-b-3 border-darkGray text-center">Name</th>
                                <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">Email</th>
                                <th className="w-30 px-4 py-2 border-b-3 border-darkGray text-center">Status</th>
                                <th className="w-70 px-4 py-2 border-b-3 border-darkGray text-center">ID</th>
                                <th className="w-15 px-4 py-2 border-b-3 border-darkGray text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">Loading users...</td>
                                </tr>
                            ) : displayedUsers.length > 0 ? (
                                displayedUsers.map((user) => (
                                    <tr key={user.id} className='text-center border-b border-darkGray'>
                                        <td className='px-4 py-2'>
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1) || 'Unknown'}
                                        </td>
                                        <td className='px-4 py-2'>
                                            {user?.firstName || user?.lastName
                                                ? `${user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)} 
                                                   ${user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)}`.trim()
                                                : 'Unknown'}
                                        </td>
                                        <td className='px-4 py-2'>{user.email || 'Unknown'}</td>
                                        <td className='px-2 py-2'>
                                            <span className={`inline-flex items-center justify-center w-20 h-7 rounded-full text-sm capitalize font-semibold
                                                ${user.status === 'unverified' ? 'bg-yellow-500 text-white' : 'bg-gray-400'}
                                                ${user.status === 'verified' ? 'bg-green-500 text-white' : 'bg-gray-400'}
                                                ${user.status === 'searching' ? 'bg-yellow-500 text-white' : 'bg-gray-400'}
                                                ${user.status === 'booked' ? 'bg-green-500 text-white' : 'bg-gray-400'}`}>
                                                {user.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className='px-4 py-2 relative group cursor-pointer transition-all duration-200'>
                                            <span className='group-hover:hidden'>
                                                {user.id.substring(0, 12)}...
                                            </span>
                                            <span className='hidden group-hover:inline-block transition-all duration-200'>
                                                {user.id}
                                            </span>
                                        </td>
                                        <td className='px-4 py-2 flex items-center justify-center gap-2'>
                                            <button
                                                onClick={() => setSelectedUserId(user.id)}
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
                                    <td colSpan="7" className="text-center py-4">No {filterRole} found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedUserId && (
                    <UserCard
                        userId={selectedUserId}
                        role={filterRole === "owners" ? "owner" : "seeker"}
                        onClose={() => {
                            setSelectedUserId(null);
                            filterRole === "owners" ? fetchOwners() : fetchSeekers(); // refresh list
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default UserManagement;