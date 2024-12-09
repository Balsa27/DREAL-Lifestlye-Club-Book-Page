import {motion, AnimatePresence, useScroll} from 'framer-motion';
import {useCallback, useEffect, useRef, useState} from 'react';
import '../Styles/Sidebar.css';
import MagazineGrid from "./MagazineGrid";
import CustomInput from "./CustomInput";
import {MagazineService} from "../Service/MagazineService.ts";
import {lerpCameraForSidebar} from "./Util";
import {useAtom} from "jotai";

const lineVariants = {
    initial: {
        scaleY: 0,
        originY: 0
    },
    animate: {
        scaleY: 1,
        transition: {
            duration: 0.4,
            delay: 0.3
        }
    },
    exit: {
        scaleY: 0,
        originY: 1,
        transition: {duration: 0.8}
    }
};

const Sidebar = ({isOpen}) => {
    const [moveCamera, setMoveCamera] = useAtom(lerpCameraForSidebar);
    const [isHovered, setIsHovered] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isCreatingMagazine, setIsCreatingMagazine] = useState(false);
    const [newMagazineName, setNewMagazineName] = useState('');
    const [magazines, setMagazines] = useState([]);
    const [isValidFile, setIsValidFile] = useState(false);
    const [draggedFilesCount, setDraggedFilesCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);  
    const magazineService = new MagazineService();
    const titlesContainerRef = useRef(null);
    const [droppedFiles, setDroppedFiles] = useState(null);
    
    useEffect(() => {
        if (isOpen) {
            fetchMagazines();
        }
        else {
            setIsExpanded(false);
            setSelectedTitle(null);
            setIsCreatingMagazine(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isExpanded){
            setMoveCamera(true);
        }
        else {
            setMoveCamera(false);
        }
    }, [isExpanded]);

    const fetchMagazines = async () => {
        try {
            console.log("reee");
            const response = await magazineService.getAllUser();
            console.log("res", response);
            setMagazines(response);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching magazines:', error);
            setIsLoading(false);
        }
    };

    const isValidFileType = (file) => {
        if (!file) {
            console.log("isValidFileType received null file");
            return false;
        }
        const validTypes = ['image/jpeg'];
        const isValid = validTypes.includes(file.type);
        console.log(`isValidFileType checking ${file.type} against ${validTypes.join(', ')}: ${isValid}`);
        return isValid;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isExpanded) {
            const items = Array.from(e.dataTransfer.items);
            if (items.length > 0) {
                setDraggedFilesCount(items.length);

                const validationResults = items.map(item => {
                    console.log("Checking type:", item.type);
                    return item.type === 'image/jpeg';
                });

                const allValid = validationResults.every(Boolean);
                console.log(`DragOver validation - ${items.length} files, All valid: ${allValid}`);

                setIsValidFile(allValid);
            }
            setIsDraggingOver(true);
        }
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        setIsValidFile(false);  
        setDraggedFilesCount(0);
    };

    const renderDragOverlay = () => {
        console.log(`Rendering overlay - isValidFile: ${isValidFile}, Files count: ${draggedFilesCount}`);

        return (
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isValidFile ?
                        'rgba(0, 0, 0, 0.8)' :
                        'rgba(255, 0, 0, 0.15)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',   
                    justifyContent: 'center',
                    pointerEvents: 'none',
                }}
            >
                <motion.div
                    initial={{scale: 0.95, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    exit={{scale: 0.95, opacity: 0}}
                    style={{
                        color: isValidFile ? 'white' : '#ff3333',
                        fontSize: '20px',
                        fontFamily: 'Montserrat, sans-serif',
                        letterSpacing: '2px',
                        border: `2px dashed ${isValidFile ?
                            'rgba(255, 255, 255, 0.2)' :
                            'rgba(255, 51, 51, 0.5)'}`,
                        padding: '30px 40px',
                        borderRadius: '8px',
                        backgroundColor: isValidFile ?
                            'rgba(255, 255, 255, 0.05)' :
                            'rgba(255, 51, 51, 0.05)',
                        textAlign: 'center'
                    }}
                >
                    {isValidFile ? (
                        draggedFilesCount > 1 ?
                            'Drop multiple images to add' :
                            'Drop image to add'
                    ) : (
                        <div>
                            <div>Only PNG and JPEG files are supported</div>
                            <div style={{
                                fontSize: '14px',
                                marginTop: '8px',
                                opacity: 0.8
                            }}>
                                {draggedFilesCount > 1 ?
                                    'Remove unsupported files to continue' :
                                    'Try dropping a JPEG file'}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        );
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isExpanded) return;

        const files = Array.from(e.dataTransfer.files);
        const allValid = files.every(file => isValidFileType(file));

        if (!allValid) {
            setIsDraggingOver(false);
            setIsValidFile(false);
            setDraggedFilesCount(0);
            return;
        }

        setDroppedFiles(files);
        setIsDraggingOver(false);
        setIsValidFile(true);
        setDraggedFilesCount(0);
    };
    
    const calculateTextMiddlePosition = (selectedIndex) => {
        if (!titlesContainerRef.current) return 0;

        const containerRect = titlesContainerRef.current.getBoundingClientRect();
        const containerMiddle = containerRect.height / 2;

        const selectedTitle = titlesContainerRef.current.children[selectedIndex];
        if (!selectedTitle) return 0;

        const titleRect = selectedTitle.getBoundingClientRect();
        const titleCurrentPosition = titleRect.top - containerRect.top;

        if (titleCurrentPosition < containerMiddle) {
            return containerMiddle - titleCurrentPosition;
        } else {
            return -(titleCurrentPosition - containerMiddle);
        }
    };

    const handleTitleClick = (i) => {
        setIsExpanded(!isExpanded);
        setSelectedTitle(isExpanded ? null : i);
    };

    const handleNewMagazineClick = () => {
        setIsCreatingMagazine(true);
    };

    const handleAddContentClick = async () => {
        if (newMagazineName.length < 5) {
            return;
        }

        try {
            await magazineService.create(newMagazineName);
        } catch (error) {
            console.error('Failed to create magazine:', error);
        }
        finally {
            setIsExpanded(true);
        }
    };

    return (
        <motion.div
            className="sidebar"
            initial={{x: "100%"}}
            animate={{
                x: isOpen ? 0 : "100%",
                width: isExpanded ? "940px" : "400px"
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                width: {
                    type: "spring",
                    stiffness: 150,
                    damping: 35,
                    mass: 1.2
                }
            }}
        >
            {/* Drag overlay */}
            <AnimatePresence>
                {isDraggingOver && isExpanded && renderDragOverlay()}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        key="sidebar-content"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        style={{
                            height: '100%',
                            position: 'relative',
                            display: 'flex'
                        }}
                    >
                        <div style={{position: 'relative'}}>
                            <motion.div
                                className="sidebar-line"
                                variants={lineVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            />
                            {!isCreatingMagazine ? (
                                <div className="titles-container">
                                    <div className="titles-wrapper" ref={titlesContainerRef} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignSelf: 'flex-start',
                                    }}>
                                        {magazines.map((magazine, i) => (
                                            <motion.div
                                                key={`title-${i}`}
                                                className="title-item"
                                                initial={{opacity: 0}}
                                                animate={{
                                                    opacity: isExpanded ? (i === selectedTitle ? 1 : 0) : 1,
                                                    x: isExpanded ? (i === selectedTitle ? -2 : i < selectedTitle ? -2 : 2) : 0,
                                                    y: isExpanded && i === selectedTitle ? calculateTextMiddlePosition(i) : 0,
                                                    transition: {
                                                        opacity: {duration: 0.3},
                                                        y: {
                                                            type: "spring",
                                                            stiffness: 100,
                                                            damping: 20,
                                                            delay: 0.3
                                                        }
                                                    }
                                                }}
                                                whileHover={{
                                                    x: !isExpanded ? 15 : 0,
                                                    transition: {duration: 0.2}
                                                }}
                                                onHoverStart={() => !isExpanded && setIsHovered(i)}
                                                onHoverEnd={() => !isExpanded && setIsHovered(null)}
                                                onClick={() => handleTitleClick(i)}
                                            >
                                                {magazine.name.split('').map((letter, index) => (
                                                    <motion.span
                                                        key={`${i}-${index}`}
                                                        initial={{
                                                            opacity: 0,
                                                            filter: "blur(10px)",
                                                            x: Math.random() * 50 - 25,
                                                            display: 'inline-block'
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            filter: !isExpanded ? (isHovered === null ? "blur(0px)" :
                                                                isHovered === i ? "blur(0px)" : "blur(2.5px)") : "blur(0px)",
                                                            x: 0,
                                                            transition: {
                                                                delay: (i * 0.2) + (index * 0.03),
                                                                duration: 0.4,
                                                                filter: {
                                                                    duration: (i * 0.1) + (index * 0.05)
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {letter}
                                                    </motion.span>
                                                ))}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="titles-container">
                                    <CustomInput
                                        setIsCreatingMagazine={setIsCreatingMagazine}
                                        isCreating={isCreatingMagazine}
                                        value={newMagazineName}
                                        onChange={setNewMagazineName}
                                        isExpanded={isExpanded}
                                    />
                                </div>
                            )}
                            <AnimatePresence>
                                {!isExpanded && (
                                    <motion.button
                                        initial={{opacity: 0, y: 0}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: 20}}
                                        style={{
                                            position: 'absolute',
                                            bottom: '40px',
                                            left: '60px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            cursor: 'pointer',
                                            fontFamily: 'Montserrat, sans-serif',
                                            fontSize: '16px',
                                            letterSpacing: '2px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: 0,
                                            whiteSpace: 'nowrap'
                                        }}
                                        whileHover={{
                                            color: 'rgba(255, 255, 255, 1)',
                                            transition: {duration: 0.2}
                                        }}
                                        onClick={isCreatingMagazine ? handleAddContentClick : handleNewMagazineClick}
                                    >
                                      <span style={{fontSize: '24px'}}>+</span>
                                        {isCreatingMagazine ? 'ADD CONTENT' : 'NEW MAGAZINE'}
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{opacity: 0, x: 20}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: 20}}
                                    transition={{duration: 0.3}}
                                    style={{
                                        position: 'absolute',
                                        right: '0',
                                        top: '0',
                                        height: '100%',
                                        display: 'flex',
                                        width: '540px',
                                        paddingTop: '70px',
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        width: '100%',
                                        position: 'relative'
                                    }}>
                                        <MagazineGrid 
                                            isExpanded={isExpanded} 
                                            droppedFiles={droppedFiles}
                                            magazineId={selectedTitle !== null ? magazines[selectedTitle].id : null}
                                        />  
                                        <motion.div
                                            className="sidebar-line"
                                            variants={lineVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            style={{
                                                position: 'absolute',
                                                right: '0',
                                                top: '0',
                                                width: '1px',
                                                height: '100%',
                                                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.12) 20%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.12) 80%, rgba(255, 255, 255, 0) 100%)',
                                                transformOrigin: 'top'
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default Sidebar;