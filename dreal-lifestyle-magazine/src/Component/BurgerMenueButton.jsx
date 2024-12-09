import { motion } from 'framer-motion';
import '../Styles/Burger.css';

const Burger = ({ isOpen, toggle }) => (
    <motion.button
        animate={{
            opacity: isOpen ? 0.5 : 1, 
        }}
        whileHover={{ opacity: 0.5 }} 
        transition={{ duration: 0.2 }}
        onClick={toggle} 
        className="burger">
        <motion.span
            className="line"
            initial={{ x: -50, opacity: 0 }}
            animate={{
                x: 0,
                opacity: 1,
                rotate: isOpen ? 45 : 0,
                y: isOpen ? 10 : 0
            }}
            transition={{ duration: 0.5 }}
        />
        <motion.span
            className="line"
            initial={{ opacity: 0 }}
            animate={{
                opacity: isOpen ? 0 : 1,
                scale: isOpen ? 0 : 1
            }}
            transition={{ duration: 0.3 }}
        />
        <motion.span
            className="line"
            initial={{ x: 50, opacity: 0 }}
            animate={{
                x: 0,
                opacity: 1,
                rotate: isOpen ? -45 : 0,
                y: isOpen ? -10 : 0
            }}
            transition={{ duration: 0.5 }}
        />
    </motion.button>
);

export default Burger;