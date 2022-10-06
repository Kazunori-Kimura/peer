import { Route, Routes } from 'react-router-dom';
import ClientPage from '../pages/Client';
import ServerPage from '../pages/Server';

const App: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<ServerPage />} />
            <Route path="/c/:code" element={<ClientPage />} />
        </Routes>
    );
};

export default App;
