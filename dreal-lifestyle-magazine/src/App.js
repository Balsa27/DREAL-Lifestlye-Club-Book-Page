import './App.css';
import { useState, useEffect } from 'react';
import MagazineNavigation from "./Component/MagazineNavigation";
import logo from "./Assets/logo_final_shape.svg";
import InteractiveCanvas from "./Component/InteractiveCanvas";
import DottedBackground from "./Component/DottedBackground";
import LoadingTransition from "./Component/LoadingTransition";

function App() {
    return (
        <>
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

export default App;