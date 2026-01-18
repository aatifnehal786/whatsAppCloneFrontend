import React from "react";
import useLoginStore from "../../store/useLoginStore";
import useUserStore from "../../store/useUserStore";
import useThemeStore from "../../store/themeStore";
import { set, useForm } from "react-hook-form";
import countries from "../../utils/Countries";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaChevronDown, FaUser, FaWhatsapp, FaPlus } from "react-icons/fa";
import Spinner from "../../utils/Spinner";
import { toast } from "react-toastify";
import { sendOtp } from "./../../services/user.services";
import 'react-toastify/dist/ReactToastify.css';
import { verifyOtp } from "../../services/user.services";
import { updateProfile } from "../../services/user.services";
import { logoutUser } from "../../services/user.services";
import { FaU } from "react-icons/fa6";




// validation schema
const loginValidationSchema = yup.object().shape({
    phoneNumber: yup
        .string().nullable().matches(/^[0-9]+$/, "Phone number must be numeric").transform((value, originalValue) =>
            originalValue.trim() === "" ? null : value
        ),
    email: yup
        .string().nullable().email("Invalid email format").transform((value, originalValue) =>
            originalValue.trim() === "" ? null : value
        )
}).test(
    "atLeastOne",
    "Either phone number or email is required",
    function (value) {
        return !!(value.phoneNumber || value.email)
    }
);

const otpValidationSchema = yup.object().shape({
    otp: yup.string().required("OTP is required").length(6, "OTP must be 6 digits"),
});

const profileUpdateValidationSchema = yup.object().shape({
    userName: yup.string().required("User name is required"),
    agreed: yup.boolean().oneOf([true], "You must agree to the terms and conditions"),
});


const avatars = [
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
]

const Login = () => {

    const { step, userPhoneData, setStep, setUserPhoneData, resetLoginState } = useLoginStore();
    const [phoneNumber, setPhoneNumber] = React.useState("");
    const [selectedCountry, setSelectedCountry] = React.useState(countries[0]);
    const [email, setEmail] = React.useState("");
    const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
    const [profilePicture, setProfilePicture] = React.useState(null);
    const [userName, setUserName] = React.useState("");
    const [agreed, setAgreed] = React.useState(false);
    const [selectedAvtar, setSelectedAvatar] = React.useState(avatars[0]);
    const [profilePictureFile, setProfilePictureFile] = React.useState(null);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [error, setError] = React.useState(null);
    const navigate = useNavigate();
    const { setUser } = useUserStore();
    const { theme, setTheme } = useThemeStore();
    const [loading, setLoading] = React.useState(false);
    const otpRefs = React.useRef([]);



 

    const filteredCountries = countries.filter((country) =>
       { return  country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dialCode.includes(searchTerm)}
    );

    const onLoginSubmit = async () => {
        try {
            setLoading(true);
            // Simulate API call
            if(email) {
                // login with email
                const response = await sendOtp(null,null,email);
                if(response.status === 'success') {
                    toast.info("OTP sent to your email successfully");
                    setUserPhoneData({email});
                    setStep(2); 
                }
            }else {
                // login with phone number
                const response = await sendOtp(phoneNumber,selectedCountry.dialCode,null);
                if(response.status === 'success') {
                    toast.info("OTP sent to your phone number successfully");
                    setUserPhoneData({phoneNumber,phoneSuffix: selectedCountry.dialCode});
                    setStep(2); 
                }
            }
        } catch (error) {
            console.log("Login error:", error);
            setError(error.message || "Failed to send OTP. Please try again.");
        }finally {
            setLoading(false);  
        }
    }

    const onOtpSubmit = async (data) => {
        // Handle OTP submission
        try {
            setLoading(true);
            if(!userPhoneData) {
                throw new Error("User phone data is missing");
            }

            const fullOtp = otp.join('');
            // Simulate API call to verify OTP
            let response;
            if(userPhoneData.email) {
                response = await verifyOtp(null,null,userPhoneData.email,fullOtp);
            } else {
                response = await verifyOtp(userPhoneData.phoneNumber,userPhoneData.phoneSuffix,null,fullOtp);
            }

            if(response.status === 'success') {
                toast.success("OTP verified successfully");
                const user = response.data?.user;
                if(user?.userName && user?.profilePicture) {
                    // User profile is complete
                    setUser(user);
                    toast.success("Login successful, Welcome to whatsApp!");
                    resetLoginState();
                    navigate("/");
                }else {
                    // User profile is incomplete   

                setStep(3); 
            }
        }

        } catch (error) {
            console.log("Login error:", error);
            setError(error.message || "Failed to verify OTP. Please try again.");
        }finally {
            setLoading(false);  
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            setProfilePictureFile(file);
            setProfilePicture(URL.createObjectURL(file));
        }
    }
    const onProfileSubmit = async (data) => {
  try {
    setLoading(true);

    const formdata = new FormData();
    formdata.append("userName", data.userName);
    formdata.append("agreed", data.agreed);

    if (profilePictureFile) {
      formdata.append("media", profilePictureFile);
    } else {
      formdata.append("profilePicture", selectedAvtar);
    }

    const response = await updateProfile(formdata);

    setUser(response.data.user); // ✅ VERY IMPORTANT
    toast.success("Profile updated successfully");
    resetLoginState();
    navigate("/");

  } catch (error) {
    console.error(error);
    setError(error.message || "Failed to update profile");
  } finally {
    setLoading(false);
  }
};


    const handleLogout = async () => {
        const response = await logoutUser();
        resetLoginState();
        setUser(null);
        navigate("/login");
    }

    React.useEffect(() => {
    if (step === 2) {
        otpRefs.current[0]?.focus();
    }
}, [step]);


    const handleOtpChange = (index, value) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setOtpValue("otp", newOtp.join(''))
        if(value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if(nextInput) {
                nextInput.focus();
            }
        }
    };

    const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
        e.preventDefault();

        const newOtp = [...otp];

        if (newOtp[index]) {
            // Case 1: Clear current box
            newOtp[index] = "";
            setOtp(newOtp);
            setOtpValue("otp", newOtp.join(""));
        } else if (index > 0) {
            // Case 2: Move backward & clear previous
            const prevIndex = index - 1;
            newOtp[prevIndex] = "";
            setOtp(newOtp);
            setOtpValue("otp", newOtp.join(""));

            const prevInput = document.getElementById(`otp-${prevIndex}`);
            prevInput?.focus();
        }
    }
};


    const handleBack = () => {
        setStep(1);
        setOtp(["", "", "", "", "", ""]);
        setError(null);
    }
    const {
        handleSubmit: handleOtpSubmit,
        formState: { errors: otpErrors },
        setValue: setOtpValue,
    } = useForm({
        resolver: yupResolver(otpValidationSchema),
    });

    const {
        register: loginRegister,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors },
    } = useForm({
        resolver: yupResolver(loginValidationSchema),
    });
    const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    watch, // ✅ MUST be here
} = useForm({
    resolver: yupResolver(profileUpdateValidationSchema),
});


    const ProgressBar = () => (
        <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5 mb-6`}>
            <div
                className="bg-green-500 h-2.5 rounded-full transition-all ease-in-out"
                style={{ width: `${(step / 3) * 100}%` }}
            />
        </div>
    );

    


    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-green-400 to-blue-500'} flex items-center justify-center p-4 overflow-hidden`}>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} p-4 md:p-4 rounded-lg shadow-2xl w-full max-w-md relative z-10`}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <FaWhatsapp className="w-16 h-16 text-white" />
                </motion.div>

                <h1 className={`text-3xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>WhatsApp Login</h1>
                <ProgressBar />
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                {step === 1 && (
                    <form className="space-y-4" onSubmit={handleLoginSubmit(onLoginSubmit)}>
                        <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'} mb-4`}>
                            Enter your Phone Number to receive an OTP</p>
                        <div className="relative">
                            <div className="flex">
                                <div className="relative w-1/3">
                                    <button onClick={()=>setShowDropdown(!showDropdown)} type="button" className={`flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'} border rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100`}>
                                        <span>{selectedCountry.flag} {selectedCountry.dialCode}</span>
                                        <FaChevronDown className="ml-2"/>
                                    </button>

                                   {showDropdown && (
                                    <div className={`absolute z-10 w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-md shadow-lg max-h-60 overflow-auto`}>
                                        <div className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} p-2`}>
                                            <input
                                                type="text"
                                                className={`w-full px-3 py-2 border ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-gray-100 text-gray-900 border-gray-300'} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500`}
                                                placeholder="Search country..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                          {filteredCountries.map((country) => (
                                       <button key={country.code} className={`w-full text-left px-4 py-2 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} focus:outline-none`}
                                       onClick={()=>{setSelectedCountry(country)
                                        setShowDropdown(false)
                                       }}>
                                         {country.flag} ({country.dialCode}) {country.name}
                                       </button>
                                       ))}
                                    </div>
                                   )}
                                </div>
                                <input
                                    type="text"
                                    className={`w-2/3 px-4 py-2 border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-500' : 'bg-gray-100 text-gray-900 border-gray-300'} rounded-e-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${loginErrors.phoneNumber ? 'border-red-500' : ''}`}     
                                    placeholder="Phone Number"
                                    {...loginRegister("phoneNumber")}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            {loginErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{loginErrors.phoneNumber.message}</p>}
                        </div>

                        {/* divider with or  */}
                        <div className="flex items-center my-4">
                            <div className="flex-grow h-px bg-gray-300"/>
                            <span className="mx-3 text-gray-500 text-sm font-medium">OR</span>
                            <div className="flex-grow h-px bg-gray-300"/>
                        </div>
                        {/* email input box  */}
                        <div className={`flex items-center ${theme === 'dark' ? 'bg-gray-700 border-gray-500' : 'bg-gray-100 border-gray-300'}`}>
                            <FaUser className={`ml-3 mr-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}/>
                            <input
                                type="email"
                                className={`w-full bg-transparent  px-4 py-2 border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-500' : 'bg-gray-100 text-gray-900 border-gray-300'} rounded-md ${loginErrors.email ? 'border-red-500' : ''}`}
                                placeholder="Email (optional)"
                                {...loginRegister("email")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email.message}</p>}
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-2 px-4 ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} rounded-md font-semibold transition-colors duration-300`}
                        >
                            {loading ? <Spinner/> : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form className="space-y-4" onSubmit={handleOtpSubmit(onOtpSubmit)}>
                        <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'} mb-4`}>
                            Enter the 6-digit code sent to your {userPhoneData?.phoneNumber ? ` ${userPhoneData.phoneNumber}` : userPhoneData?.email}
                        </p>
                        <div className="flex justify-center space-x-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (otpRefs.current[index] = el)}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength={1}
                                    className={`w-12 h-12 text-center border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-500' : 'bg-gray-100 text-gray-900 border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${otpErrors.otp ? 'border-red-500' : ''}`}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                />
                            ))}
                        </div>
                        {otpErrors.otp && <p className="text-red-500 text-sm mt-1">{otpErrors.otp.message}</p>}
                        <button
                            type="submit"
                            className={`w-full py-2 px-4 ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} rounded-md font-semibold transition-colors duration-300`}
                        >
                            {loading ? <Spinner/> : 'Verify OTP'}
                        </button>
                        <button type="button" onClick={handleBack}
                        className={`w-full py-2 px-4 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-900'} rounded-md font-semibold transition-colors duration-300`}>
                            <FaArrowLeft className=" inline mr-2"/>
                            Wrong number ? Go Back
                        </button>
                    </form>
                )}
                {step === 3 && (
                    <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="relative w-24 h-24 mb-2">
                                <img src={profilePicture || selectedAvtar}
                                className="w-full h-full rounded-full object-cover"/>
                                <label
                                htmlFor="profilepicture"
                                className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition duration-300">
                                    <FaPlus className="w-4 h-4"/>
                                </label>
                                <input
                                type="file"
                                id="profilepicture"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"/>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mb-2`}>Choose an avatar</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {avatars.map((avatar) => (
                                    <img
                                    key={avatar}
                                    src={avatar}
                                    className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition duration-300 ease-in-out transform hover:scale-110 ${selectedAvtar === avatar ? 'ring-2 border-green-500' : 'border-transparent'}`}
                                    onClick={() => {
                                        setSelectedAvatar(avatar);      
                                    }}/>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}/>
                            <input
                                type="text"
                                className={`w-full pl-10 pr-4 py-2 border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-500' : 'bg-gray-100 text-gray-900 border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${profileErrors.userName ? 'border-red-500' : ''}`}  
                                placeholder="User Name"
                                {...profileRegister("userName")}
                            />
                            {profileErrors.userName && <p className="text-red-500 text-sm mt-1">{profileErrors.userName.message}</p>}
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                className={`mr-2 ${theme === 'dark' ? 'text-green-500 bg-gray-500' : 'text-green-600'} focus:ring-green-500`}
                                {...profileRegister("agreed")}
                            />
                            <label htmlFor="terms" className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                                I agree to the <a href="#" className="text-red-500 hover:underline">terms and conditions</a>
                            </label>
                        </div>
                        {profileErrors.agreed && <p className="text-red-500 text-sm mt-1">{profileErrors.agreed.message}</p>}
                        <div>
                        <button
                            type="submit"
                            disabled={!watch("agreed")}
                            className={`w-full py-2 px-4 ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} rounded-md transition duration-300 ease-in-out hover:scale-105 flex items-center justify-center text-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'font-semibold'}`}
                        >
                            {loading ? <Spinner/> : 'Update Profile'}
                        </button>
                        <button type="button" onClick={handleLogout}
                        className={`w-full mt-2 py-2 px-4 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-900'} rounded-md font-semibold transition-colors duration-300`}>
                            Logout
                        </button>
                        </div>
                    </form>
                )}
            </motion.div>

        </div>

    )
}


export default Login;