import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import StatPage from './Pages/StatPage';
import AddPage from './Pages/AddPage';
import ProfilePage from './Pages/ProfilePage';
import AiPage from './Pages/AiPage';
import AuthPage from './Pages/Auth';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div>
        <Outlet />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/stats" element={<StatPage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ai" element={<AiPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
