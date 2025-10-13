import { getAllPropertyCount, getPropertyCountByStatus } from "../../utils/firestoreUtils";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AllPropertyButton, StatusPropertyButton } from "../../components/PropertyButton";
import PropertyCard from "../../components/PropertyCard";
import { RoomVerificationCard } from "../../components/RoomVerificationCard";

const PropertyManagement = () => {
    const [allPropertiesCount, setAllPropertiesCount] = useState(0);
    const [verifiedPropertiesCount, setVerifiedPropertiesCount] = useState(0);
    const [pendingPropertiesCount, setPendingPropertiesCount] = useState(0);
    const navigate = useNavigate();

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

    return (
        <div className="p-6 flex flex-col overflow-hidden">
            {/* Title */}
            <h1 className="text-start text-3xl font-bold mb-4 flex-shrink-0">
                Property Management
            </h1>

            {/* Buttons section */}
            <div className="flex flex-row items-start mb-6 flex-shrink-0">
                <div className="flex flex-row gap-5">
                    {/* <AllPropertyButton count={allPropertiesCount} onManage={() => navigate('/properties/all')} /> */}
                    <StatusPropertyButton
                        statusName="Verified"
                        count={verifiedPropertiesCount}
                        onManage={() => navigate('/properties/verified')}
                    />
                    <StatusPropertyButton
                        statusName="Pending"
                        count={pendingPropertiesCount}
                        onManage={() => navigate('/properties/pending')}
                    />
                </div>

                <div className="h-53 border-l border-gray-600 mx-4"></div>

                <RoomVerificationCard onManage={() => navigate('/properties/pendingRooms')} />
            </div>

            <PropertyCard />
        </div>
    );
};

export default PropertyManagement;
