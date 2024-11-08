import {motion, AnimatePresence} from 'framer-motion';
import {useAtom} from "jotai";
import {isMeshRenderingAtom} from "./Util";
import {useEffect} from "react";

function LoadingTransition({logo}) {
    const [isMeshRendering] = useAtom(isMeshRenderingAtom); //false

    useEffect(() => {
        console.log('LoadingTransition mounted, isMeshRendering:', isMeshRendering);
    }, []);

    return (
        <>
            <AnimatePresence mode="wait">
                {isMeshRendering &&
                    <motion.div
                        key="loader"
                        initial={{opacity: 1}}
                        exit={{
                            opacity: 0,
                            transition: {duration: 0.8, ease: "easeOut"}
                        }}
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
                            exit={{
                                scale: 0,
                                opacity: 0,
                                transition: {duration: 0.4, ease: "easeOut"}
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{
                                width: '100px',
                                height: 'auto'
                            }}
                        />
                    </motion.div>
                } 
            </AnimatePresence>
        </>
    );
}

export default LoadingTransition;