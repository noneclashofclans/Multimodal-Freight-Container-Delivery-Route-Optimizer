import React from 'react'
import { Router, Routes, Route } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import ForecastQuery from './pages/ForecastQuery'
import ForecastResults from './pages/ForecastResults'
import AIChat from './pages/AIChat'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Landing />}></Route>
      <Route path='/about' element={<About></About>}></Route>
      <Route path='/login' element={<Login />}></Route>
      <Route path='/register' element={<Register></Register>}></Route>
      <Route path='/forecast_query' element={<ForecastQuery />}></Route>
      <Route path='/forecast_results' element={<ForecastResults />}></Route>\
      <Route path='/ai-chat' element={<AIChat />}></Route>
    </Routes>
  )
}

export default App