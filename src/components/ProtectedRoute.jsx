import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth'

function ProtectedRoute({children}) {
    const [user, loading] = useAuthState(auth);

    // if (loading) return <p className='text-center font-bold text-3xl'>Loading...</p>

    if (!user) {
        return <Navigate to='/login' replace />;
    }

    return children;
}

export default ProtectedRoute;