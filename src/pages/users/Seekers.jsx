import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { getAllSeekers } from '../../utils/firestoreUtils';

const Seekers = () => {
    const navigate = useNavigate();

    const [seekers, setSeekers] = useState([]);

    useEffect(() => {
        const fetchSeekers = async () => {
            const data = await getAllSeekers();
            setSeekers(data);
        };

        fetchSeekers();
    }, []);

    return (
        <div>
            <div className="flex flex-row items-center text=white gap-3 mb-6">
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
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Date Created</th>
                            <th className="px-4 py-2 border-b-3 border-darkGray text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seekers.map((seeker, index) => (
                            <tr key={seeker.id} className='text-center border-b border-darkGray'>
                                <td className='px-4 py-2'>{seeker.id}</td>
                                <td className='px-4 py-2'>{seeker.name || 'N/A'}</td>
                                <td className='px-4 py-2'>{seeker.email || 'N/A'}</td>
                                <td className='px-4 py-2'>{seeker.role || 'N/A'}</td>
                                <td className='px-4 py-2'>{seeker.createdAt ? new Date(seeker.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
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

export default Seekers;