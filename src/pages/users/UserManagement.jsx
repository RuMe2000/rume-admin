import UserButton from '../../components/UserButton';
import { getUserCountByRole } from '../../utils/firestoreUtils';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    //get user count by role
    const [ownersCount, setOwnersCount] = useState(0);
    const [seekersCount, setSeekersCount] = useState(0);
    const [adminsCount, setAdminsCount] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            const owners = await getUserCountByRole("owner");
            const seekers = await getUserCountByRole("seeker");
            const admins = await getUserCountByRole('admin');

            setOwnersCount(owners);
            setSeekersCount(seekers);
            setAdminsCount(admins);
        };

        fetchCounts();
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

    return (
        <div className='p-6'>
            <h1 className="text-start text-3xl font-bold mb-4">User Management</h1>

            <div className='flex flex-row'>
                <UserButton roleName="Owners" count={ownersCount} onManage={() => handleNavigate('Owners')} />
                <UserButton roleName="Seekers" count={seekersCount} onManage={() => handleNavigate('Seekers')} />
                <UserButton roleName="Admins" count={adminsCount} onManage={() => handleNavigate('Admins')} />
            </div>

        </div>
    );
};

export default UserManagement;