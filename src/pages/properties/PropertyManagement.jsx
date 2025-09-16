import { getAllPropertyCount, getPropertyCountByStatus } from "../../utils/firestoreUtils";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AllPropertyButton, StatusPropertyButton } from "../../components/PropertyButton";

const PropertyManagement = () => {
    //get all property count
    const [allPropertiesCount, setAllPropertiesCount] = useState(0);
    const [verifiedPropertiesCount, setVerifiedPropertiesCount] = useState(0);
    const [pendingPropertiesCount, setPendingPropertiesCount] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            const all = await getAllPropertyCount();
            const pending = await getPropertyCountByStatus("pending");
            const verified = await getPropertyCountByStatus("verified");

            setAllPropertiesCount(all);
            setPendingPropertiesCount(pending);
            setVerifiedPropertiesCount(verified);
        };

        fetchCounts();
    }, []);

    const navigate = useNavigate();

    return (
        <div>
            <h1 className="text-start text-3xl font-semibold mb-4">Property Management</h1>
            <div className="flex flex-row">
                <AllPropertyButton count={allPropertiesCount} onManage={() => navigate('/properties/all')} />
                <StatusPropertyButton statusName="Pending" count={pendingPropertiesCount} onManage={() => navigate('/properties/pending')} />
                <StatusPropertyButton statusName="Verified" count={verifiedPropertiesCount} onManage={() => navigate('/properties/verified')} />
            </div>
        </div>
    );
};

export default PropertyManagement;