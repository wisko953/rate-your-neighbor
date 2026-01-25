import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './auth/components/Register';
import Login from './auth/components/Login';
import Home from './pages/Home';

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
                <Route path="/dashboard" element={<div><h1>Dashboard</h1></div>} />
            </Routes>
        </Router>
    );
}

export default App;
