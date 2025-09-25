export default function RoomCard({ room, onManage }) {
    return (
        <div
            className="bg-mainBlue rounded-2xl p-4 hover:scale-105 hover:bg-hoverBlue shadow-md shadow-bgBlue cursor-pointer transition duration-300 h-25 flex items-center justify-center"
            onClick={onManage}
        >
            <h3 className="text-xl font-semibold text-white">{room.name}</h3>
        </div>
    );
}
