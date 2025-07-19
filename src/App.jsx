import { useState } from 'react'
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import Map from './components/Map.jsx';
import  Homepage  from './components/Home.jsx';
import Upahan from './components/Upahan.jsx';
import Room from './components/Room.jsx'
function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/map" element={<Map/>} />
        <Route path="/" element={<Homepage/>} />
        <Route path="/upahan" element={<Upahan/>} />
        <Route path="/upahan/room/:id" element={<Room/>} />
        </Routes>
        </Router>
    </>
  )
}

export default App
