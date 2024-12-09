import {AuthProvider} from "./Context/AuthProvider";
import {AppContent} from "./Component/AppContent";


function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;