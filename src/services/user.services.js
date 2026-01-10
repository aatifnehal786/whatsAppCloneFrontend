import apiInstance from "./url.services"


export const sendOtp = async (phoneNumber,phoneSuffix,email) => {
    // Implement the logic to send OTP to the user's phone number or email

    try {
        const response = await apiInstance.post('/auth/send-otp', {phoneNumber,phoneSuffix,email});
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
    
}


export const verifyOtp = async (phoneNumber,phoneSuffix,email,otp) => {
    // Implement the logic to verify OTP to the user's phone number or email

    try {
        const response = await apiInstance.post('/auth/verify-otp', {phoneNumber,phoneSuffix,email,otp});
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
    
}


export const updateProfile = async (updatedData) => {
    // Implement the logic to update the user's profile

    try {
        const response = await apiInstance.put('/auth/update-profile', updatedData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
    
}


export const checkUserAuth = async () => {
    // Implement the logic to check user authentication

    try {
        const response = await apiInstance.get('/auth/check-auth');
        if(response.data.status === 'success'){
            return {isAuthenticated: true, user: response?.data?.data};
        }else if(response.data.status === 'error'){
            return {isAuthenticated: false};
        }
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
    
}


export const logoutUser = async () => {
    // Implement the logic to log out the user
    try {
        const response = await apiInstance.get('/auth/logout');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
}

export const getAllUsers = async () => {
    // Implement the logic to get all users
    try {
        const response = await apiInstance.get('/auth/users');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }

}