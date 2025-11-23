import { useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut" as const
        }
    }
};

const AnimatedOutlet = () => {
    const location = useLocation();

    return (
        <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            variants={pageVariants}
            className="w-full"
        >
            <Outlet />
        </motion.div>
    );
};

export default AnimatedOutlet;

