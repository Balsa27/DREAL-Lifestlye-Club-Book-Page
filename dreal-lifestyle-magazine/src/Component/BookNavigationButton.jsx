import { motion } from 'framer-motion';
import '../Styles/BookNavigationButton.css';

function BookNavigationButton({text, isActive, hasActiveButton, onClick}) {
    return (
            <motion.div
                className={`inner-div ${isActive ? 'active' : ''}`}
                whileHover={{
                    textShadow: "0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 255, 255, 1)",
                    fontWeight: 300
                }}
                animate={{
                    filter: hasActiveButton && !isActive ? 'blur(1.5px)' : 'blur(0px)',
                    opacity: hasActiveButton && !isActive ? 0.6 : 1,
                }}
                onClick={onClick}
                transition={{
                    filter: { duration: 0.5, ease: "easeInOut" },
                    opacity: { duration: 0.3, ease: "easeInOut" },
                    textShadow: { duration: 0.2 },
                    fontWeight: { duration: 0.2 },
                }}
            >
                {text}
            </motion.div>
    );
}

export default BookNavigationButton;