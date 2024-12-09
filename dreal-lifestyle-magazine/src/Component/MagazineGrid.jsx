import React, {useState, useRef, useEffect} from 'react';
import {motion, useInView, AnimatePresence} from 'framer-motion';
import '../Styles/MagazineGrid.css';
import BookNavigationButton from "./BookNavigationButton";
import {MagazineService} from "../Service/MagazineService.ts";
import {useAtom} from "jotai";
import {closeAfterDeleteAtom} from "./Util";

const PageCard = React.memo(({page, index, draggedItem, handleDragStart, handleDrag, handleDragEnd, onRemove}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, {once: false, margin: "-100px"});

    return (
        <motion.div
            id={`page-${page.id}`}
            ref={ref}
            layout
            drag={!page.isUploading}
            dragSnapToOrigin
            onDragStart={() => !page.isUploading && handleDragStart(index)}
            onDrag={(e, info) => !page.isUploading && handleDrag(e, info, index)}
            onDragEnd={handleDragEnd}
            initial={{opacity: 0, y: 50}}
            animate={{
                opacity: isInView ? (page.isUploading ? 0.6 : 1) : 0,
                y: isInView ? 0 : 50,
                scale: page.isUploading ? 0.95 : 1,
                transition: {
                    duration: 0.5,
                    delay: index * 0.1
                }
            }}
            style={{
                position: 'relative',
                aspectRatio: '3/4',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: page.isUploading ? 'wait' : 'move',
                zIndex: draggedItem === index ? 2 : 1,
                pointerEvents: page.isUploading ? 'none' : 'auto'
            }}
            whileHover={{
                scale: page.isUploading ? 1 : 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.15)'
            }}
            whileDrag={{
                scale: 1.05,
                zIndex: 2,
                cursor: 'grabbing'
            }}
        >
            {page.isUploading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '8px',
                        zIndex: 2
                    }}
                >
                    <motion.div
                        animate={{
                            rotate: 360
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            width: '30px',
                            height: '30px',
                            border: '3px solid rgba(255, 255, 255, 0.2)',
                            borderTop: '3px solid white',
                            borderRadius: '50%'
                        }}
                    />
                </motion.div>
            )}

            <img
                src={page.imageUrl}
                alt={`Magazine page ${index + 1}`}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    opacity: page.isUploading ? 0.5 : 1
                }}
            />

            {!page.isUploading && (
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                    }}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '24px',
                        height: '14px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '20px',
                        background: 'none',
                        padding: 0,
                        zIndex: 3,
                        pointerEvents: 'auto',
                        fontFamily: 'Arial',
                    }}
                    whileHover={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        scale: 1.1,
                    }}
                    whileTap={{scale: 0.95}}
                >
                    x
                </motion.button>
            )}

            <motion.div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    pointerEvents: 'none'
                }}
            >
                <p style={{
                    color: 'white',
                    fontSize: '14px',
                    textAlign: 'center',
                    margin: 0,
                    fontFamily: 'Montserrat, sans-serif',
                    letterSpacing: '2px',
                    textShadow: '0px 1px 2px rgba(0,0,0,0.8)'
                }}>Page {index + 1}</p>
            </motion.div>
        </motion.div>
    );
});

const MagazineGrid = React.memo(({magazineId, droppedFiles, isExpanded}) => {
    const [pages, setPages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [draggedItem, setDraggedItem] = useState(null);
    const containerRef = useRef(null);
    const positions = useRef({}).current;
    const [closeAfterDelete, setCloseAfterDelete] = useAtom(closeAfterDeleteAtom);
    const magazineService = new MagazineService();

    useEffect(() => {
        console.log("IsExpanded", isExpanded);
        if (isExpanded){
            console.log("Fetching", isExpanded);
            fetchPages();
        }
    }, [isExpanded]);


    useEffect(() => {
        const handleUpload = async () => {
            if (!droppedFiles) return;

            const newPages = droppedFiles.map((file, index) => ({
                id: Date.now() + index,
                file: file,
                imageUrl: URL.createObjectURL(file),
                isUploading: true
            }));
            setPages(prevPages => [...(prevPages || []), ...newPages]);

            for (let i = 0; i < newPages.length; i++) {
                const page = newPages[i];
                try {
                    if (i > 0) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }

                    await magazineService.uploadPage(page.file, magazineId);

                    setPages(prevPages =>
                        prevPages.map(p =>
                            p.id === page.id ? { ...p, isUploading: false } : p
                        )
                    );
                } catch (error) {
                    console.error('Upload error:', error);
                    setPages(prevPages => prevPages.filter(p => p.id !== page.id));
                }
            }
        };

        handleUpload();
    }, [droppedFiles]);
    
    const updatePositions = () => {
        pages.forEach((page, index) => {
            positions[page.id] = {
                position: index,
                element: document.getElementById(`page-${page.id}`)?.getBoundingClientRect()
            };
        });
    };

    const fetchPages = async () => {
        console.log('fetchiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');
        
        setIsLoading(true);
        try {
            if (magazineId) {
                console.log('fetchiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii', magazineId);
                
                console.log(magazineId)
                const fetchedPages = await magazineService.getMagazinePages(magazineId);
                setPages(fetchedPages);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        console.log("Attempting to delete magazine with ID:", magazineId);
        console.log("Delete URL:", `/magazine/${magazineId}`);
        try {
            const response =  magazineService.delete(magazineId);
            console.log("Set closeAfterDelete complete");
            setPages([]);
            setCloseAfterDelete(true);
        } catch (error) {
            console.error('Full delete error:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
            }
        }
    };

    const Loader = () => (
        <motion.div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '20px'
            }}
        >
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        rotateX: [0, 180],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                    }}
                    style={{
                        width: '40px',
                        height: '3px',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '2px',
                    }}
                />
            ))}
        </motion.div>
    );

    const EmptyState = () => (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '18px',
                letterSpacing: '2px',
                textAlign: 'center',
                padding: '40px'
            }}
        >
            DROP PAGES HERE
        </motion.div>
    );

    const handleRemove = (index) => {
        const newPages = [...pages];
        newPages.splice(index, 1);
        setPages(newPages);
    };

    const handleDragStart = (index) => {
        setDraggedItem(index);
        updatePositions();
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        updatePositions();
    };

    const findClosestItem = (dragX, dragY) => {
        let closest = null;
        let closestDistance = Infinity;

        Object.entries(positions).forEach(([id, pos]) => {
            if (pos.element) {
                const rect = pos.element;
                const centerX = rect.x + rect.width / 2;
                const centerY = rect.y + rect.height / 2;

                const distance = Math.sqrt(
                    Math.pow(dragX - centerX, 2) + Math.pow(dragY - centerY, 2)
                );

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closest = parseInt(id);
                }
            }
        });

        return closest ? pages.findIndex(page => page.id === closest) : null;
    };

    const handleDrag = (_, info, index) => {
        const element = document.getElementById(`page-${pages[index].id}`);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const closestIndex = findClosestItem(rect.x + rect.width / 2, rect.y + rect.height / 2);

        if (closestIndex !== null && closestIndex !== index) {
            const newPages = [...pages];
            const [removed] = newPages.splice(index, 1);
            newPages.splice(closestIndex, 0, removed);
            setPages(newPages);
            updatePositions();
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                height: '80vh',
                overflowY: 'auto',
                padding: '16px',
                marginTop: '5px',
                paddingRight: '40px',
                marginLeft: "20px",
                width: '420px',
            }}
            className="custom-scrollbar"
        >
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <Loader/>
                        
                ) : pages.length === 0 ? (
                    <EmptyState/>
                ) : (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '20px',
                            width: '100%',
                        }}
                        layout
                    >
                        <AnimatePresence mode="popLayout">
                            {pages.map((page, index) => (
                                <PageCard
                                    key={page.id}
                                    page={page}
                                    index={index}
                                    draggedItem={draggedItem}
                                    handleDragStart={handleDragStart}
                                    handleDrag={handleDrag}
                                    handleDragEnd={handleDragEnd}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                style={{
                    position: 'absolute',
                    top: -47,
                    right: 80,
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    padding: '0 20px',
                    zIndex: 10,
                    background: 'transparent'
                }}
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.3}}
            >
                <BookNavigationButton
                    text="PREVIEW"
                    isActive={true}
                    hasActiveButton={true}
                    onClick={() => console.log('Preview clicked')}
                />
                <BookNavigationButton
                    text="DELETE"
                    isActive={true}
                    hasActiveButton={true}
                    onClick={handleDelete}
                />
            </motion.div>
        </div>
    );
});

export default MagazineGrid;