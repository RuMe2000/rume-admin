import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllOwners } from '../../utils/firestoreUtils';

const Owners = () => {
    const navigate = useNavigate();

    const [owners, setOwners] = useState([]);

    useEffect(() => {
        const fetchOwners = async () => {
            const data = await getAllOwners();
            setOwners(data);
        };

        fetchOwners();
    }, []);

    return (
        <div>
            <div className="flex flex-row items-center text=white gap-3 mb-6">
                <button onClick={() => navigate('/users')} className="cursor-pointer hover:scale-115 p-1 rounded-lg duration-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                </button>
                <h1 className="text-3xl font-semibold">Owners</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-white rounded-md">
                    <thead>
                        <tr>
                            <th className="w-50 px-4 py-2 border-b-3 border-darkGray text-center">ID</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Name</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Email</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Role</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Date Created</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {owners.map((owner, index) => (
                            <tr key={owner.id} className='text-center border-b border-darkGray'>
                                <td className='px-4 py-2'>{owner.id}</td>
                                <td className='px-4 py-2'>
                                    {owner?.firstName || owner?.lastName
                                        ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim()
                                        : 'N/A'}
                                </td>
                                <td className='px-4 py-2'>{owner.email || 'N/A'}</td>
                                <td className='px-4 py-2'>{owner.role || 'N/A'}</td>
                                <td className='px-4 py-2'>{owner.createdAt ? new Date(owner.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                                <td className='px-4 py-2'>
                                    <button className='bg-errorRed px-3 py-1 rounded-lg hover:bg-red-800 duration-300 transition'>Delete</button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Owners;