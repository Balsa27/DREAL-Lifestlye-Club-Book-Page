// MagazineItem.jsx
import { motion } from 'framer-motion';
import '../Styles/MagazineItem.css';
import logo from "../Assets/logo_final_shape.svg";

const MagazineItem = ({id}) => {
    return (
        <div className="magazine-item">
            <div className="magazine-cover">
                <motion.div
                    className="magazine-image"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                >
                    <img src={`https://picsum.photos/400/500?random=${id}`} alt={`Magazine ${id}`} />
                </motion.div>
                <div className="magazine-overlay" />
            </div>
            <p className="magazine-title">Magazine {id}</p>
        </div>
    );
};

export default MagazineItem;