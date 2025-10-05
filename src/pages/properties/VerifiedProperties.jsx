import { useNavigate } from 'react-router-dom';
import StatusPropertyCard from '../../components/StatusPropertyCard';

const VerifiedProperties = () => {
    const navigate = useNavigate();

    return (
        <div className='p-6'>
            <div className='flex flex-row items-center text-white gap-3 mb-2'>
                <button
                    onClick={() => navigate('/properties')}
                    className='cursor-pointer hover:scale-115 p-1 rounded-2xl duration-200 transition'
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="30px"
                        viewBox="0 -960 960 960"
                        width="30px"
                        fill="#FFFFFF"
                    >
                        <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                    </svg>
                </button>
                <h1 className='text-3xl font-bold'>Verified Properties</h1>
            </div>

            <StatusPropertyCard status="verified" />

        </div>
    );
};

export default VerifiedProperties;
