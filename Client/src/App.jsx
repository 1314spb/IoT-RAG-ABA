import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout'

import Home from './pages/Home/Home'
import Analysis from './pages/Analysis/Analysis'
import Therapy from './pages/Therapy/Therapy'
import History from './pages/History/History'
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

          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
