
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
import {  disconnectSocket, initializeSocket } from './services/chatServices';
import { useChatStore } from './store/chatStore';



function App() {

  const {user} = useUserStore();
  const {initializeSocketListeners,setCurrentUser,cleanUp} = useChatStore()
 

 useEffect(()=>{
  if(user?._id) {
    const socket = initializeSocket();


    if(socket) {
      setCurrentUser(user)
      initializeSocketListeners()
    }

  }

  return ()=> {
    cleanUp();
    disconnectSocket();
  }
 },[user,setCurrentUser,initializeSocketListeners,cleanUp])


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
