import React from 'react';
import "./App.scss"

import './App.css';
import Dashboard from './screens/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FallBackScreen from './screens/FallBackScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Dashboard />} />
        <Route path="/fallback" element={<FallBackScreen/>} />
      </Routes>
    </Router>
  );
}

export default App;
