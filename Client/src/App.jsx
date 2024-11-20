import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout'
import MainFooter from './layouts/MainFooter'

import Home from './pages/Home/Home'
import History from './pages/History/History'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="services/history" element={<History />} />
            {/* 其他路由可以在這裡添加，例如：
          
          <Route path="contact" element={<Contact />} />
          */}
          </Route>
        </Routes>
      </Router>
      <MainFooter />
    </>
  )
}

export default App
