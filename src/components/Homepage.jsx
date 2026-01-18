import React from 'react'
import Layout from './Layout'
import { motion } from 'framer-motion'
import ChatList from '../pages/chatSection/ChatList' 

import { getAllUsers } from '../services/user.services'

const Homepage = () => {
  
  const [allUsers, setAllUsers] = React.useState([]);

  const fetchAllUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response.status === 'success') {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  React.useEffect(() => {
    fetchAllUsers();
  }, []);



  return (
    <Layout>
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{duration: 0.5}}
      className='h-full'>
        <ChatList contacts={allUsers} />

      </motion.div>
    </Layout>
  )
}

export default Homepage
