export default function RoomCard({ room, onManage }) {
    return (
        <div
            className="bg-successGreen rounded-xl p-4 hover:scale-105 hover:bg-successGreen/30 cursor-pointer transition duration-300 max-w-[230px] h-20 flex items-center justify-center"
            onClick={onManage}
        >
            <h3 className="text-lg font-bold text-white">{room.name}</h3>
        </div>
    );
}
