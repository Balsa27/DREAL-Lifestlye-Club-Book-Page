import './App.css';
import BottomNavigation from "./Component/BottomNavigation";
import logo from "./Assets/logo_final_shape.svg";
import InteractiveCanvas from "./Component/InteractiveCanvas";
import DottedBackground from "./Component/DottedBackground";

function App() {
    return (
        <div className="app">
            <DottedBackground />
            <img src={logo} alt="logo" className="logo"/>
            <div className="main">
                <InteractiveCanvas />
            </div>
            <BottomNavigation />
        </div>
    );
}

export default App;


