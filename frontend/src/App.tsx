/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Analyze } from './pages/Analyze';
import { AttentionBudget } from './pages/AttentionBudget';
import { Compare } from './pages/Compare';
import { Analytics } from './pages/Analytics';
import { CreatorProfile } from './pages/CreatorProfile';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/attention-budget" element={<Navigate replace to="/analyze" />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<CreatorProfile />} />
      </Routes>
    </Router>
  );
}
