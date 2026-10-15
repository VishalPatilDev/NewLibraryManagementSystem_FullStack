import React from 'react'

const Card = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200">
        {children}
      </div>
    </div>
    )
}

export default Card
