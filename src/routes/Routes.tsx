
import { Routes, Route } from 'react-router';
import Home from '../pages/Home';
import { Contact } from '../pages/Contact';
import { News } from '../pages/News';
import { Procedures } from '../pages/Procedures';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';


export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/support" element={<Contact/>} />
      <Route path="/news" element={<News/>} />
      <Route path="/procedures" element={<Procedures/>} />
      
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />

    </Routes>
  );
};
