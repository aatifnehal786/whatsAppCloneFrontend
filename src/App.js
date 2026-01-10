
import './App.css';
import { useEffect } from 'react';
import {BrowserRouter as Router, Routes,Route} from "react-router-dom"
import Login from './pages/user-login/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProtectedRoute, PublicRoute } from './Protected';
import Homepage from './components/Homepage';
import UserDetails from './components/UserDetails';
import Status from './pages/statusSection/Status';
import Settings from './pages/settingSection/Settings';
import useUserStore from './store/useUserStore';
import { disconnected, disconnectSocket, initializeSocket } from './services/chatServices';


function App() {

  const {user} = useUserStore();

  useEffect(()=>{
    if(user?._id) {
      const socket = initializeSocket();
    }

    return ()=> {
      disconnectSocket();
    }
  })
  return (
  <>
    <ToastContainer position='top-right' autoClose={3000} />
   <Router>
    <Routes>
      <Route element={ <PublicRoute/>}>
        <Route path="/login" element={ <Login/>} />
      </Route>
      <Route element={ <ProtectedRoute/>}>
      <Route path='/' element={<Homepage/>}/>
      <Route path='/user-details' element={<UserDetails/>}/>
      <Route path='/status' element={<Status/>}/>
      <Route path='settings' element={<Settings/>}/>
      </Route>
    </Routes>
   </Router>
  </>
  );
}

export default App;
