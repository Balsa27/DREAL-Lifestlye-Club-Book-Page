import '../Styles/BottomNavigation.css';
import BookNavigationButton from "./BookNavigationButton";
import {useState} from "react";
import {useAtom} from "jotai";
import {pageAtom} from "./Util";
import { pages } from './Util';

function BottomNavigation () {
    const [page, setPage] = useAtom(pageAtom);
    const [activeButton, setActiveButton] = useState(null);
    const [currentSet, setCurrentSet] = useState(0);

    const handlePageChange = async (index) => {
        setActiveButton(prevActive => prevActive === index ? null : index);
        setPage(index);
    };
    
    return(
        <div className="nav">
            <div className="nav-buttons">
                <BookNavigationButton
                    text="COVER"
                    isActive={activeButton === 0}
                    hasActiveButton={activeButton !== null}
                    onClick={() => handlePageChange(0)}
                />
                {[...Array(pages.length - 2)].map((_, index) => (
                    <BookNavigationButton
                        key={index + 1}
                        text={`PAGE ${index + 1}`}
                        isActive={activeButton === index + 1}
                        hasActiveButton={activeButton !== null}
                        onClick={() => handlePageChange(index + 1)}
                    />
                ))}
                <BookNavigationButton
                    text="BACK"
                    isActive={activeButton === pages.length}
                    hasActiveButton={activeButton !== null}
                    onClick={() => handlePageChange(pages.length)}/>
            </div>
        </div>
    );
}

export default BottomNavigation;