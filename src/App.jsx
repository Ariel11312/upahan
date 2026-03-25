import { useState } from 'react'
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import Map from './components/Map.jsx';
import  Homepage  from './components/Home.jsx';
import Upahan from './components/Upahan.jsx';
import Room from './components/Room.jsx'
import Rent from './components/Rent.jsx';
import RentalStatus from './components/RentalStatus.jsx';
function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/map" element={<Map/>} />
        <Route path="/" element={<Homepage/>} />
        <Route path="/upahan" element={<Upahan/>} />
        <Route path="/upahan/room/:id" element={<Room/>} />
        <Route path="/upahan/rent/:id" element={<Rent/>} />
        <Route path="/upahan/rent/status" element={<RentalStatus/>} />
        </Routes>
        </Router>
    </>
  )
}

export default App
