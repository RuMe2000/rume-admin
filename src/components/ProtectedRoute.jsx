import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

function ProtectedRoute({ children }) {
    const [user, loading] = useAuthState(auth);

    // Show loading screen while Firebase reinitializes user session
    if (loading) {
        return (
            <div className='fixed top-0 left-0 w-full h-full z-50 flex bg-radial from-hoverBlue via-darkBlue to-bgBlue text-white justify-center items-center'>
                <p className='text-center font-bold text-3xl'>Loading...</p>
            </div>
        );
    }

    // If no user after loading, redirect to login
    if (!user) {
        return <Navigate to='/login' replace />;
    }

    // Otherwise, render the protected content
    return children;
}

export default ProtectedRoute;
