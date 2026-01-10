import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../store/chatStore'

const ChatWindow = ({selectedContact,setSelectedContact}) => {

  const isValidDate = (date) => {
    return date instanceof Date && !NaN(date)
  }

  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [filePriview, setFilePriview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const typingTimeoutRef = useRef(null)
  const messageEndRef = useRef(null)
  const emojiPicker = useRef(null)
  const fileInputRef = useRef(null)

  const { messages, loading, sendMessage, conversation, currentConversation, error, onlineUsers, typingUsers, fetchConversation, fetchMessages, receiveMessage, deleteMessage, addReactions, startTyping, stoptTyping, isUserTyping, isUserOnline, getUserLastSeen, cleanUp, setCurrentUser } = useChatStore()

  // get onlne status

  const online = isUserOnline(selectedContact?._id)
  const lastSeen = getUserLastSeen(selectedContact?._id)
  const isTyping = isUserTyping(selectedContact?._id)

 useEffect(() => {
  if (selectedContact?._id && conversation?.data?.length > 0) {
    const selectedConversation = conversation.data.find((conv) =>
      conv.participants.some(
        (participant) => participant._id === selectedContact._id
      )
    );

    if (selectedConversation?._id) {
      fetchMessages(selectedConversation._id);
    }
  }
}, [selectedContact, conversation]);



  const scrollToBottom = ()=> {
    messageEndRef?.current?.scrollIntoView({behavior:"auto"})
  }

  useEffect(()=>{
    scrollToBottom()
  },[messages])

  useEffect(()=>{
    if(message && selectedContact){
      startTyping(selectedContact?._id)
    }

    if(typingTimeoutRef.current){
      clearTimeout(typingTimeoutRef.current)

      typingTimeoutRef.current = setTimeout(()=>{
      stoptTyping(selectedContact?._id)
    },2000)
    }

    return ()=> {
      if(typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
    
  },[message,selectedContact,startTyping,stoptTyping])

  return (
    <div>
      chat window page
    </div>
  )
}

export default ChatWindow
