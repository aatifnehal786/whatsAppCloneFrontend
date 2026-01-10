import React, { useState } from 'react'
import useLayoutStore from '../../store/layoutStore';
import useThemeStore from '../../store/themeStore';
import useUserStore from '../../store/useUserStore';
import { FaPlus, FaSearch } from 'react-icons/fa';
import {motion} from 'framer-motion'
import formatTime from '../../utils/formatTime'

const ChatList = ({contacts}) => {

  const setSelectedContact = useLayoutStore((state) => state.setSelectedContact);
  const selectedContact = useLayoutStore((state) => state.selectedContact);
  const {theme} = useThemeStore();
  const {user} = useUserStore();
  const [searchTerm,setSearchTerm] = useState("");

  const filteredContacts = contacts.filter((contact)=>contact?.userName?.toLowerCase().includes(searchTerm.toLowerCase()))
  console.log(filteredContacts)
  return (
    <div className={`w-full border-r h-screen ${theme === 'dark' ? 'bg-[rgb(17,27,33)] border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={ `p-4 flex justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        <h2 className='text-xl font-semibold'>
          Chats
        </h2>
        <button className='p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors'>
          <FaPlus/>
        </button>

      </div>
      <div className='p-2'>
        <div className='relative'>
          <FaSearch
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-800'}`}/>
          <input
          type='text'
          placeholder='search or start new chat'
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? 'bg-gray-500 text-white border-gray-700 placeholder-gray-500' : 'bg-gray-100 text-black border-gray-200 placeholder-gray-400'}`}
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}/>
        </div>

      </div>
      <div className='overflow-y-auto h-[calc(100vh-120px)]'>
        {filteredContacts.map((contact)=>{
           return (
             <motion.div
            key={contact?._id}
            onClick={()=>setSelectedContact(contact)}
            className={`p-3 flex items-center cursor-pointer ${theme === 'dark' ? selectedContact?._id === contact?._id ? 'bg-gray-700' : 'hover:bg-gray-800' : selectedContact?._id===contact?._id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
              <img
              src={contact?.profilePicture}
              alt={contact.userName}
              className='w-12 h-12 rounded-full'/>
              <div className='ml-3 flex-1'>
                <div className='flex justify-between items-baseline'>
                  <h2 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{contact.userName}</h2>
                  {contact?.conversation && (
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTime(contact?.conversation?.createdAt)}
                    </span>
                  )}
                </div>
                <div className='flex justify-between items-baseline'>
                  <p className={`text-sm ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'} truncate`}>{contact?.conversation?.lastMessage?.content}</p>
                  {contact?.conversation && contact?.conversation?.unreadCounts > 0 && contact?.conversation?.lastMessage?.receiver === user?._id &&  
                   (
                     <p className={`text-sm ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'} flex items-center w-6 h-6 font-semibold bg-yellow-500`}>
                      {contact?.conversation?.unreadCounts}
                    </p>
                   )
                  }
                </div>

              </div>

            </motion.div>
           )
        })}
      </div>
    </div>
  )
}

export default ChatList
