import { getAllPropertyCount, getPropertyCountByStatus } from "../../utils/firestoreUtils";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AllPropertyButton, StatusPropertyButton } from "../../components/PropertyButton";
import PropertyCard from "../../components/PropertyCard";

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
        <div className="p-6">
            <h1 className="text-start text-3xl font-bold mb-4">Property Management</h1>
            <div className="flex flex-row">
                <AllPropertyButton count={allPropertiesCount} onManage={() => navigate('/properties/all')} />
                <StatusPropertyButton statusName="Verified" count={verifiedPropertiesCount} onManage={() => navigate('/properties/verified')} />
                <StatusPropertyButton statusName="Pending" count={pendingPropertiesCount} onManage={() => navigate('/properties/pending')} />
            </div>
            <PropertyCard />
        </div>
    );
};

export default PropertyManagement;