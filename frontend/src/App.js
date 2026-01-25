import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './auth/components/Register';
import Login from './auth/components/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <Router>
            <Routes>
                {/* ✅ Accueil */}
                <Route path="/" element={<Home />} />

                {/* ✅ Auth */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* ✅ Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
