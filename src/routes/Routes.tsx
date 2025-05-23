
import { Routes, Route } from 'react-router';
import Home from '../pages/Home';
import { Contact } from '../pages/Contact';
import { News } from '../pages/News';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { TeachingSecretary } from '../pages/TeachingSecretary';
import { Porfile } from '../pages/Porfile';
import { Procedures } from '../pages/Procedures';
import { Admin } from '../pages/Admin';


export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/support" element={<Contact/>} />
      <Route path="/news" element={<News/>} />
      <Route path="/secretary/:id" element={<TeachingSecretary/>} />
      
      <Route path="/porfile" element={<Porfile/>} />
      <Route path="/procedures" element={<Procedures/>} />

      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      
      <Route path="/admin" element={<Admin/>} />

    </Routes>
  );
};
