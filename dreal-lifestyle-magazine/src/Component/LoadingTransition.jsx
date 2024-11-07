import { motion } from 'framer-motion';

function LoadingTransition({ isLoading, logo, children }) {
    return (
        <>
            {isLoading ? (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="loading-screen"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'black',
                        zIndex: 1000
                    }}
                >
                    <motion.img
                        src={logo}
                        alt="loading logo"
                        animate={{
                            rotate: 360,
                            scale: [0.6, 0.6, 0.6],
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            width: '100px', // Adjust as needed
                            height: 'auto'
                        }}
                    />
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    {children}
                </motion.div>
            )}
        </>
    );
}

export default LoadingTransition;