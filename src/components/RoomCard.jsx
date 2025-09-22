export default function RoomCard({ room }) {
    return (
        <div className="bg-successGreen rounded-xl p-4 hover:scale-105 cursor-pointer transition duration-200 max-w-[230px] h-20 flex items-center justify-center">
            <h3 className="text-lg font-bold text-white">{room.name}</h3>
        </div>
    );
}
