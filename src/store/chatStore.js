import { create } from "zustand";
import {getSocket} from '../services/chatServices'
import apiInstance from "../services/url.services";


export const useChatStore = create((set,get)=> ({
    conversation: [],
    currentConversation: null,
    messages : [],
    loading: false,
    error: null,
    onlineUsers: new Map(),
    typingUsers: new Map(),


    // socket event listeners setup

    initializeSocketListeners: ()=> {
            const socket = getSocket();
            if(!socket) return;

            

            // listen for incomming messages
            socket.on("receive_message",(message)=> {

            });

            // confirm message delivery

        socket.on("message_send", (message) => {
            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg._id === message._id ? { ...msg} : msg
                ),
            }));
        });

        
        socket.on("reaction_update",({messageId,reactions})=> {
            set((state)=> ({
                messages: state.messages.map((msg)=>
                msg._id === messageId ? {...msg,reactions} : msg)
            }))
        });


        // handle delete message from localstate
         socket.on("message_deleted",({deletedMessageId})=> {
            set((state)=>({
                messages: state.message.filter((msg)=>msg._id!==deletedMessageId)
            }))
        });


        socket.on("message_error",(error)=>{
            console.error("message error",error)
        })


        socket.on("message_status_update", ({ messageId, messageStatus }) => {
            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, messageStatus }
                        : msg
                ),
            }));
        });

        // typing users
        socket.on("user_typing",({userId,conversationId,isTyping})=> {
            set((state)=>{
                const newTypingUsers = new Map();
                if(!newTypingUsers.has(conversationId)) {
                    newTypingUsers.set(conversationId,new Set())
                }
                const typingSet = newTypingUsers.get(conversationId)
                if(isTyping) {
                    typingSet.add(userId)
                }else {
                    typingSet.delete(userId)
                }

                return {typingUsers:newTypingUsers}
            })

        });


        // track user online status

        socket.on("user_status",({userId},isOnline,lastSeen)=>{
            set((state)=>{
                const newOnlineUsers = new Map(state.onlineUsers)
                newOnlineUsers.set(userId,{isOnline,lastSeen})

                return {onlineUsers:newOnlineUsers}

            })
        });

   


        const { conversation } = get();

if (conversation?.data?.length > 0) {
    conversation.data.forEach((conv) => {
        const otherUser = conv.participants.find(
            (p) => p._id !== get().currentUser._id
        );

        if (otherUser?._id) {
            socket.emit(
                "get_user_status",
                otherUser._id,
                (status) => {
                    set((state) => {
                        const newOnlineUsers = new Map(state.onlineUsers);

                        newOnlineUsers.set(state.userId, {
                            isOnline: status.isOnline,
                            lastSeen: status.lastSeen,
                        });

                        return { onlineUsers: newOnlineUsers };
                    });
                }
            );
        }
    });
}


    },


    setCurrentUser : (user)=> set({currentUser:user}),


    fetchConversation : async() => {
        set({loading: true,error:null});
        try {
            const {data} = await apiInstance.get("/auth/chats/conversations");
            set({conversation: data,loading:false});
            get().initializeSocketListeners();
            return data;

        } catch (error) {
            set({
                error: error?.response?.data?.message || error?.message,
                loading: false
            });
            return null;
        }
    },


    



   fetchMessages: async (conversationId) => {
  if (!conversationId) return;

  set({ loading: true, error: null });

  try {
    const { data } = await apiInstance.get(
      `/auth/chats/conversations/${conversationId}/messages`
    );

    const messageArray = data?.data || data || [];

    set({
      messages: messageArray,
      currentConversation: conversationId,
      loading: false,
    });

  // mark unread messages as read
 const {marKMessageAsRead} = get()
 marKMessageAsRead()
    

    return messageArray;
  } catch (error) {
    set({
      loading: false,
      error: error?.response?.data?.message || error?.message,
    });
    return [];
  }
},

    // send message in real time
    sendMessage: async(formData)=> {
         const senderId = formData.get("senderId")
         const receiverId = formData.get("receiverId")   
         const media = formData.get("content")
         const content = formData.get("content")
         const messageStatus = formData.get("messageStatus")


         const socket = getSocket();

         const {conversation} = get();
         let conversationId = null;
         if(conversation?.data?.length>0) {
            const conversations = conversation.data.find((conv)=>
            conv.participants.some((p)=>p._id===senderId) && conv.participants.some((p)=>p._id===receiverId))
         
         if(conversations) {
            conversationId = conversation._id;
            set({currentConversation:conversationId})
         }
        }

         // temporary message before actual response
         const tempId = `temp-${Date.now()}`
         const optimisticMessage = {
            _id: tempId,
            sender: {_id:senderId},
            receiver: {_id:receiverId},
            conversation: conversationId,
            imageOrVideoUrl: media && typeof media !== 'string' ? URL.createObjectURL(media) : null,
            content: content,
            contentType: media ? media.type.startswith("image") ? "image" :"video" : "text",
            createdAt: new Date().toISOString(),
            messageStatus
         }
         set((state)=> ({
            messages: [...state.messages,optimisticMessage]
         }))

         try {
            const {data} = await apiInstance.post("/auth/chats/send-message",formData,
                {headers:{"Content-Type":"multipart/form-data"}}
            )
            const messageData = await data.data || data;
            set((state)=> ({
                messages: state.messages.map((msg)=>
                msg._id === tempId ? messageData : msg)
            }))
            return messageData
         } catch (error) {
            console.log("Error sending message",error)
            set((state)=> ({
                messages: state.messages.map((msg)=>
                msg._id === tempId ? {...msg,messageStatus:"failed"} : msg),
                 error: error?.response?.data?.message || error?.message
 }))
         }

        

    },

   
    

    receiveMessage: (message)=> {
        if(!message) return

        const {currentUser,currentConversation,messages} = get();
        const messageExists = message.some((msg)=>msg._id === message._id)
        if(messageExists) return
        
        if(message.conversation===currentConversation) {
            set((state)=> ({
                messages:[...state.message,message]
            }))


           if(message.receiver?._id === currentUser?._id){
            get().marKMessageAsRead()
           }

            }
            // update conversation preview and current count
            set((state)=> {
                const updateConversations = state.conversation?.data?.map((con) => {
                    if(con._id === message.conversation) {
                        return {
                            ...con,
                            lastMessage: message,
                            unreadCounts: message?.receiver?._id === currentUser?._id 
                            ? (con.unreadCounts || 0) + 1 
                            : con.unreadCounts || 0
                        }
                    }
                    return con;
                    
                });
                return {
                    conversation: {
                        ...state.conversation,
                        data: updateConversations
                    }
                }

            })
        

  
        
    },


   // mark message as read

marKMessageAsRead: async ()=> {
        const {messages,currentUser} = get()

        if(!messages.length || !currentUser) return
        const unreadIds = messages.filter((msg)=> msg.messageStatus !== 'read' && msg.receiver?._id === currentUser?._id).map((msg)=> msg._id).filter(Boolean)
        
        if(unreadIds.length === 0) return

        try {
            const {data} = await apiInstance.put("/auth/markasread",{
                messageIds:unreadIds
            })

            console.log("message mark as read",data)

            set((state)=> ({
                messages: state.messages.map((msg)=>
                unreadIds.includes(msg._id)? {...msg,messageStatus:"read"}: msg)

            }))

            const socket = getSocket()

            if(socket){
                socket.emit("message_read",{
                    messageIds:unreadIds,
                    senderId:messages[0]?.sender?._id
                })
            }
        } catch (error) {
            console.error("failed to mark message as read",error)
        }


        
},



    deleteMessage: async (messageId)=> {
        try {
            await apiInstance.delete(`/auth/delete-messages/${messageId}`);
            set((state)=> ({
                messages: state.messages?.filter((msg)=> msg?._id !== messageId)
            }))
            return true;
        } catch (error) {
            console.log("Error deleting message",error)
            set({error:error.response?.data?.message || error.message})
            return false;

        }
    },


    // change reactionds
    addReactions: async(messageId,emoji) => {
        const socket = getSocket()
        const {currentUser} = get()
        if(socket && currentUser) {
            socket.emit("add_reaction",{
                messageId,
                emoji,
                userId: currentUser?._id
            })
        }
    },

    startTyping: (receiverId) => {
        const {currentConversation} = get()
        const socket = getSocket()
        if(socket && currentConversation && receiverId) {
            socket.emit("start_typing", {
                conversationId: currentConversation,
                receiverId
            })
        }
    },
   
    stoptTyping: (receiverId) => {
        const {currentConversation} = get()
        const socket = getSocket()
        if(socket && currentConversation && receiverId) {
            socket.emit("stop_typing", {
                conversationId: currentConversation,
                receiverId
            })
        }
    },


    isUserTyping: (userId)=> {
        const {typingUsers,currentConversation} = get()
        if(!currentConversation || !typingUsers.has(currentConversation) || userId ) {
            return false;
        }

        return typingUsers.get(currentConversation).has(userId)
    },

    isUserOnline: (userId)=> {
        if(!userId) return null;

        const {onlineUsers} = get();
        return onlineUsers.get(userId)?.isOnline || false
    },
    getUserLastSeen: (userId)=> {
        if(!userId) return null;

        const {onlineUsers} = get();
        return onlineUsers.get(userId)?.lastSeen || null
    },

    cleanUp: ()=> {
        set({
            currentConversation: null,
            conversation: [],
            messages: [],
            onlineUsers: new Map(),
            typingUsers: new Map()
        })
    }
   
    

}))