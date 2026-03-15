import React from 'react'
import { useSelector } from 'react-redux'

function Dashboard() {
   const{user}= useSelector(state => state.auth)
   console.log(user);
   
  return (
    <div>
      dashboard
    </div>
  )
}

export default Dashboard
