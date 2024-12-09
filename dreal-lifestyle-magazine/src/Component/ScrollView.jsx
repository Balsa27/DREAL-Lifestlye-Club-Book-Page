import {useScroll, motion} from "framer-motion";
import '../Styles/ScrollView.css';

const CustomScroll = ({ children }) => {
    const { scrollYProgress } = useScroll();

    return (
        <motion.div className="scroll-container">
            <motion.div className="scroll-content">
                {children}
                <motion.div className="scroll-bar">
                    <motion.div
                        className="scroll-thumb"
                        style={{ scaleY: scrollYProgress }}
                    />
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default CustomScroll;