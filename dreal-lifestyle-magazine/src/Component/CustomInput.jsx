import React from 'react';
import { motion } from 'framer-motion';

const CustomInput = ({
                         setIsCreatingMagazine,
                         isCreating,
                         setIsExpanded,
                         value,
                         onChange,
                         isExpanded
                     }) => {
    const handleKeyDown = (e) => {
        if (!isExpanded) {  
            if (e.key === 'Enter' && value.trim()) {
                setIsCreatingMagazine(!isCreating);
                setIsExpanded(true);
            } else if (e.key === 'Escape') {
                setIsCreatingMagazine(!isCreating);
                onChange('');
            }
        }
    };

    return (
        <div className="titles-container" style={{ paddingLeft: '20px' }}>
            <motion.input
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    color: isExpanded ? 'rgba(255, 255, 255, 0.6)' : 'white'  
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                type="text"
                placeholder="SET NAME..."
                value={value}
                onChange={(e) => !isExpanded && onChange(e.target.value)}   
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    fontFamily: 'Montserrat, sans-serif',
                    padding: '10px',
                    width: '280px',
                    outline: 'none',
                    position: 'relative',
                    cursor: isExpanded ? 'default' : 'text',  
                    pointerEvents: isExpanded ? 'none' : 'auto'  
                }}
                autoFocus
                onKeyDown={handleKeyDown}
                readOnly={isExpanded}  
            />
            <motion.div
                className="underline"
                initial="initial"
                animate={{
                    opacity: isExpanded ? 0.3 : 1  
                }}
                exit="exit"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transformOrigin: 'left',
                }}
            />
        </div>
    );
};

export default CustomInput;