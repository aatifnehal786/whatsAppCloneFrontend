
import { useLocation } from "react-router-dom"
import useUserStore from "./store/useUserStore";
import { Navigate, Outlet } from "react-router-dom";
import React, { useEffect } from "react";
import { checkUserAuth } from "./services/user.services";
import Loader from "./utils/Loader";


export const ProtectedRoute = () => {
    const location = useLocation();
    const [isChecking, setIsChecking] = React.useState(true);
    const {isAuthenticated,setUser,clearUser} = useUserStore();

    useEffect(()=> {
        const verifyAuth = async () => {
            try {
                const authStatus = await checkUserAuth();
                if(authStatus.isAuthenticated){
                    setUser(authStatus.user);
                }else{
                    clearUser();
                    
                }
            } catch (error) {
                console.log(error);
                clearUser();
            } finally {
                setIsChecking(false);
            }
        };
        verifyAuth();
    }, [setUser,clearUser]);
    if(isChecking){
        return <Loader/>;
    }

    if(!isAuthenticated){
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Outlet />;

    
}

export const PublicRoute = () => {
    
    const {isAuthenticated} = useUserStore();
    if(isAuthenticated){
       
        return <Navigate to='/' replace />;
    }

    return <Outlet />
}


