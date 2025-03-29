import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Header from './pages/Header';
import ListingsPage from './pages/ListingsPage';

function App() {
  return (
    <Router>
      <Header/> {/*static banner for all pages*/}
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* ✅ Landing route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="listings" element={<ListingsPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
