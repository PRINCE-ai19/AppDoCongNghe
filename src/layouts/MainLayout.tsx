import Sidebar from '../components/Sidebar';
import AnimatedOutlet from '../components/AnimatedOutlet';

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-6 md:p-8">
                    <AnimatedOutlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
