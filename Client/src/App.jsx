import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout'

import Home from './pages/Home/Home'
import Analysis from './pages/Analysis/Analysis'
import Therapy from './pages/Therapy/Therapy'
import History from './pages/History/History'
import Generate from './pages/Generate/Generate'
import Settings from './pages/Settings/Settings'
import './App.css'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="services/analysis" element={<Analysis />} />
            <Route path="services/history" element={<History />} />
            <Route path="services/therapy" element={<Therapy />} />
            <Route path="services/ai_generate" element={<Generate />} />
            <Route path='settings' element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
