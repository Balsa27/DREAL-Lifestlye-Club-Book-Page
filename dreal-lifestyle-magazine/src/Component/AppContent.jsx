import {FaGoogle} from "react-icons/fa";
import DottedBackground from "./DottedBackground";
import logo from "../Assets/logo_final_shape.svg";
import InteractiveCanvas from "./InteractiveCanvas";
import MagazineNavigation from "./MagazineNavigation";
import LoadingTransition from "./LoadingTransition";
import {useAuth} from "../Context/AuthProvider";
import '../App.css';
import {GoogleLogin} from "@react-oauth/google";
import {useCallback, useEffect, useState} from "react";
import Burger from "./BurgerMenueButton";
import Sidebar from "./Sidebar";
import {closeAfterDeleteAtom, closeBottomNavigationAtom} from "./Util";
import {useAtom} from "jotai";  // Add this

export function AppContent() {
    const { user, handleSuccess, handleError } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [closeAfterDelete, setCloseAfterDelete] = useAtom(closeAfterDeleteAtom);
    const [closeBottomNav, setCloseBottomNav] = useAtom(closeBottomNavigationAtom);

    useEffect(() => {
        if (closeAfterDelete) {
            console.log("Closing sidebar after delete");
            setIsOpen(false);
            setCloseAfterDelete(false);
        }
    }, [closeAfterDelete, setCloseAfterDelete]);
    
    useEffect(() =>{
        if (isOpen){
            setCloseBottomNav(true);
        }
        else {
            setCloseBottomNav(false)
        }
    }, [isOpen])

    return (
        <>
            {user ? (
                <div style={{
                    position: 'absolute',
                    top: '2.5rem',
                    right: '2.5rem',
                    zIndex: 51
                }}>
                    <Burger isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}/>
                </div>
            ) : (
                <div style={{
                    position: 'absolute',
                    top: '2.5rem',
                    right: '2.5rem',
                    zIndex: 50
                }}>
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap={false}
                        type="icon"
                        shape="circle"
                        theme="filled_blue"
                    />
                </div>
            )}
            <Sidebar
                isOpen={isOpen}
            />
            <DottedBackground/>
            <div className="app">
                <img src={logo} alt="logo" className="logo"/>
                <div className="main">
                    <InteractiveCanvas />
                </div>
                <MagazineNavigation />
            </div>
            <LoadingTransition logo={logo} />
        </>
    );
}
