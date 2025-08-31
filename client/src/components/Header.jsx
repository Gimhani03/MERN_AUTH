import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
  return (
    <div className='text-black pt-60 justify-center items-center flex font-bold text-center flex-col'>
        <img src={assets.header_img} alt="Header" className='w-36 h-36 rounded-full' />
        <p className='text-black mt-5 text-6xl'>Welcome to MERN Auth!</p>
        <button className='bg-gray-500 text-white px-4 py-2 mt-7 rounded-full hover:bg-black'>Get Started</button>
    </div>
  )
}

export default Header
