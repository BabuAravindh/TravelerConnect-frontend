"use client"

import { useState } from 'react'

const useChatState = () => {
    const [selectedUser,setSelectedUser] = useState(null)

    return {selectedUser,setSelectedUser}
}

export default useChatState
