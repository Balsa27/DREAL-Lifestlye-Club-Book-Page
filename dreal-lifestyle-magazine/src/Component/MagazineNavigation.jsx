import '../Styles/BottomNavigation.css';
import BookNavigationButton from "./BookNavigationButton";
import {useEffect, useState} from "react";
import {useAtom} from "jotai";
import {isAnimationCompleteAtom, pageAtom} from "./Util";
import {pages} from './Util';
import {motion} from "framer-motion";

function MagazineNavigation() {
    const [page, setPage] = useAtom(pageAtom);
    const [isAnimationComplete] = useAtom(isAnimationCompleteAtom);
    const [activeButton, setActiveButton] = useState(null);
    const [currentNumber, setCurrentNumber] = useState(1);

    const totalPages = pages.length - 2;
    const lastPage = pages.length -1;

    useEffect(() => {
        if (isAnimationComplete) {
            setPage(1);
            setCurrentNumber(1);
        }
    }, [isAnimationComplete, setPage]);

    const handlePageChange = (index) => {
        if (!isAnimationComplete) return;
        
        setActiveButton(prevActive => prevActive === index ? null : index);
        setPage(index);
        
        if (index === 0){
            setCurrentNumber(0);
        }
        
        if (index === lastPage){
            setCurrentNumber(lastPage)
        }
    };
    
    const handleNext = () => {
        if (currentNumber < totalPages) {
            setCurrentNumber(prev => {
                const newNumber = prev + 1;
                setPage(newNumber); 
                return newNumber;
            });
        }
    };

    const handlePrev = () => {
        if (currentNumber > 1) {
            setCurrentNumber(prev => {
                const newNumber = prev - 1;
                setPage(newNumber);  
                return newNumber;
            });
        }
    };

    const toRoman = (num) => {
        const romanNumerals = {
            0: `-`, 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
            6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
            11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV',
            16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX',
            21: 'XXI', 22: 'XXII', 23: 'XXIII', 24: 'XXIV', 25: 'XXV'
        };
        return romanNumerals[num] || num.toString();
    };

    return (
        <div className="nav">
            <div className="nav-buttons">
                <BookNavigationButton
                    text="FRONT"
                    isActive={currentNumber === 0}
                    hasActiveButton={activeButton !== null}
                    onClick={() => handlePageChange(0)}
                />

                <BookNavigationButton
                    text="<"
                    isActive={false}
                    hasActiveButton={activeButton !== null}
                    onClick={handlePrev}  
                />

                <motion.div
                    className="flex space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <BookNavigationButton
                        text={toRoman(currentNumber)}
                        isActive={activeButton}
                        hasActiveButton={activeButton}
                    />
                </motion.div>

                <BookNavigationButton
                    text=">"
                    isActive={false}
                    hasActiveButton={activeButton !== null}
                    onClick={handleNext} 
                />

                <BookNavigationButton
                    text="BACK"
                    isActive={currentNumber === pages.length - 1}
                    hasActiveButton={activeButton !== null}
                    onClick={() => handlePageChange(lastPage)}
                />
            </div>
        </div>
    );
}

export default MagazineNavigation;