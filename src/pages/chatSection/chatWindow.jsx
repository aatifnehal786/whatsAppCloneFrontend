import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../store/chatStore'
import { formToJSON } from 'axios'
import {isToday,isYesterday,format,isValid} from 'date-fns'
import useUserStore from '../../store/useUserStore';
import useThemeStore from "../../store/themeStore";
import whatsappImages from '../../images/whatsapp_image.png'
import { FaArrowLeft,FaEllipsisV,FaLock, FaVideo } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
const ChatWindow = ({selectedContact,setSelectedContact}) => {

 


  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [filePriview, setFilePriview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const typingTimeoutRef = useRef(null)
  const messageEndRef = useRef(null)
  const emojiPicker = useRef(null)
  const fileInputRef = useRef(null)
  const {user} = useUserStore();
  const {theme} = useThemeStore()

  const { messages, loading, sendMessage, conversation,currentConversation, error,marKMessageAsRead, onlineUsers, typingUsers, fetchConversation, fetchMessages, receiveMessage, deleteMessage, addReactions, startTyping, stoptTyping, isUserTyping, isUserOnline, getUserLastSeen, cleanUp, setCurrentUser } = useChatStore()

  const isValidate = (date)=> {
    return date instanceof Date && !isNaN(date)
  }

  console.log(messages)

  // get onlne status and last seen

  const online = isUserOnline(selectedContact?._id)
  const lastSeen = getUserLastSeen(selectedContact?._id)
  const isTyping = isUserTyping(selectedContact?._id)

useEffect(() => {
  if (!selectedContact?._id || !conversation?.data?.length) return;

  const selectedConversation = conversation.data.find((conv) =>
    conv.participants.some(
      (participant) => participant._id === selectedContact._id
    )
  );

  if (selectedConversation?._id) {
    fetchMessages(selectedConversation._id);
    
  }
 
}, [selectedContact?._id, conversation?.data?.length]);


console.log(conversation)

useEffect(()=>{
  fetchConversation()
},[])




  const scrollToBottom = ()=> {
    messageEndRef?.current?.scrollIntoView({behavior:"auto"})
  }

  useEffect(()=>{
    scrollToBottom()
  },[messages])

  useEffect(()=>{
    if(message && selectedContact){
      startTyping(selectedContact?._id)

       if(typingTimeoutRef.current){
      clearTimeout(typingTimeoutRef.current)

      typingTimeoutRef.current = setTimeout(()=>{
      stoptTyping(selectedContact?._id)
    },2000)}
    }

   

    return ()=> {
      if(typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
    
  },[message,selectedContact,startTyping,stoptTyping])


  const handleFileChange = (e)=> {
          const file = e.target.files[0]
          if(file) {
            setSelectedFile(file)
            setShowFileMenu(false)

            if(file.type.startswith('image/')) {
              setFilePriview(URL.createObjectURL(file))
            }
          }
  }

  const handleSendMessage = async() => {
    if(!selectedContact) return

    setFilePriview(null)
    try {
      const formdata = new FormData();
      formdata.append("senderId",user?._id)
      formdata.append("receiverId",selectedContact?._id)
      const status = online ? "delivered" : "send";
      formdata.append("messageStatus",status);
      if(message.trim()) {
        formdata.append("content",message.trim())
      }
      // if there is a file inclue that too
      if(selectedFile) {
        formdata.append("media",selectedFile,selectedFile.name)

      }
      if(!message.trim() && !selectedFile) return;
      await sendMessage(formdata)

      // clear states
      setMessage("")
      setFilePriview(null)
      setSelectedFile(null)
      setShowFileMenu(false)
    } catch (error) {
      console.log("failed to send message",error)
    }
  }

   const renderDateSeparator = (date)=> {
            if(!isValidate(date)){
                return null;
            }
            let dateString;
            if(isToday(date)) {
                dateString = "Today"
            }else if(isYesterday(date)) {
                dateString = "Yesterday"
            }else {
                dateString = format(date, "EEEE, MMMM d")
            }

            return (
                <div className="flex justify-center my-4">
                    <span className={`py-2 px-4 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    {dateString}
                    </span>
                </div>
            )

         }

          // Group message
         
const groupedMessages = Array.isArray(messages)
  ? messages.reduce((acc, message) => {
      if (!message?.createdAt) return acc;

      const date = new Date(message.createdAt);

      if (isValidate(date)) {
        const dateString = format(date, "yyyy-MM-dd");

        if (!acc[dateString]) {
          acc[dateString] = [];
        }

        acc[dateString].push(message);
      } else {
        console.error("Invalid date for message:", message);
      }

      return acc;
    }, {})
  : {};


          const handleReaction = (messageId,emoji)=> {
            addReactions(messageId,emoji)
          }

          if(!selectedContact) {
            return (
              <div className='flex-1 flex flex-col items-center justify-center mx-auto h-screen text-center '>
                <div className='max-w-md'>
                  <img src={whatsappImages} alt="chat-app"
                  className='w-full h-auto'/>
                  <h2 className={`text-3xl font-semibold mb-4 ${theme === "dark" ? "text-white" : 'text-black'} `}>
                    Select a chat to start chatting
                  </h2>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    choose a contact from list on the left side to begin messaging 

                  </p>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mt-8 flex items-center justify-center gap-2`}>
                    <FaLock className="h-4 w-4"/>Your Personal messages are end-to-end encrypted

                  </p>
                </div>
              </div>
            )
          }

  return (
    <div className="flex-1 h-screen w-full flex flex-col">
  <div
    className={`p-4  ${
      theme === "dark"
        ? "bg-[#303430] text-white"
        : "bg-[rgb(239,242,245)] text-gray-600"
    } flex items-center gap-2`}
  >
    <button
      className="mr-2 focus:outline-none"
      onClick={() => setSelectedContact(null)}
    >
      <FaArrowLeft className="h-6 w-6" />
    </button>

    <img
      className="w-10 h-10 rounded-full"
      alt={selectedContact?.userName}
      src={selectedContact?.profilePicture}
    />

    <div className="ml-3 flex-grow">
      <h2 className="font-semibold">
        {selectedContact?.userName}
      </h2>
      {isTyping ? (
        <div>
          Typing...
        </div>
      ):(<p className={`text-sm ${theme === "dark" ? 'text-gray-400' : 'text-gray-500'} `}>
        {online ? "online" : lastSeen ? `Last seen ${format(new Date(lastSeen,"HH:MM"))}`:'offline'}
      </p>)}
    </div>
    <div className='flex items-center space-x-4'>
      <button className='focus:outline-none'>
        <FaVideo className='h-4 w-4'/>
      </button>
      <button className='focus:outline-none'>
          <FaEllipsisV className='h-5 w-5'/>
        </button>
    </div>
  </div>
  <div
  className={`flex-1 p-4 overflow-y-auto ${
    theme === "dark" ? "bg-[#191a1a]" : "bg-[rgb(241,226,229)]"
  }`}
>
  

 {Object.entries(groupedMessages).map(([date,msgs])=> (
  <React.Fragment key={date}>
    {renderDateSeparator(new Date(date))}
    {msgs.filter((msg)=> msg.conversation === selectedContact?.conversation?._id)
    .map((msg)=> (
      <MessageBubble
      key={msg._id || msg.tempId}
      message = {msg}
      theme={theme}
      currentUser={user}
      onReact={handleReaction}
      deleteMessage={deleteMessage}
      />
    ))}
  </React.Fragment>
 ))}
 <div ref={messageEndRef}/>
</div>

  
</div>

  )
}

export default ChatWindow
