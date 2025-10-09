export default function RoomCard({ room, onManage }) {
    return (
        <div
            className={`relative rounded-2xl overflow-hidden shadow-md shadow-bgBlue cursor-pointer transition duration-300 hover:scale-105 h-48 flex items-center justify-center
                ${room.verificationStatus === 'pending'
                    ? 'border-3 border-yellow-500'
                    : room.verificationStatus === 'reverify'
                    ? 'border-3 border-orange-500'
                    : room.verificationStatus === 'verified'
                    ? 'border-3 border-successGreen'
                    : 'border 3 border-gray-400'
                }`}
            onClick={onManage}
        >
            {/* Background Image */}
            <img
                src={room.images[1]}
                alt={room.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />

            {/* Overlay (darkens the image for readability) */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Room Name */}
            <h3 className="relative z-10 text-2xl font-semibold text-white text-center">
                {room.name}
            </h3>
        </div>
    );
}
