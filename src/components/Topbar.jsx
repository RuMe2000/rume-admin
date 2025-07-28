const Topbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 z-10 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">RuMe.</h1>
                
                <div>
                    
                    <span className="mr-4">Welcome, Admin</span>
                    
                </div>
            </div>
        </nav>
    );
}
export default Topbar;