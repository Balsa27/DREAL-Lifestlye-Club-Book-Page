import './App.css';
import { useState, useEffect } from 'react';
import MagazineNavigation from "./Component/MagazineNavigation";
import logo from "./Assets/logo_final_shape.svg";
import InteractiveCanvas from "./Component/InteractiveCanvas";
import DottedBackground from "./Component/DottedBackground";
import LoadingTransition from "./Component/LoadingTransition";

function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTimer = setTimeout(() => {
            setIsLoading(false);
        }, 2000); 

        return () => clearTimeout(loadTimer);
    }, []);

    return (
        <LoadingTransition isLoading={isLoading} logo={logo}>
            <div className="app">
                <DottedBackground />
                <img src={logo} alt="logo" className="logo"/>
                <div className="main">
                    <InteractiveCanvas />
                </div>
                <MagazineNavigation />
            </div>
        </LoadingTransition>
    );
}

export default App;