import { motion } from 'framer-motion';
import '../Styles/BookNavigationButton.css';

function BookNavigationButton({text, isActive, hasActiveButton, onClick}) {
    return (
            <motion.div
                className={`inner-div ${isActive ? 'active' : ''}`}
                whileHover={{
                    fontWeight: 300
                }}
                animate={{
                    filter: hasActiveButton && !isActive ? 'blur(1.5px)' : 'blur(0px)',
                }}
                initial={{
                    color: 'white'  
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