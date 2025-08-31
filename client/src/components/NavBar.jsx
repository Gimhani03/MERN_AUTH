import React from 'react'
import {assets} from '../assets/assets'

const NavBar = () => {
  return (
    <div className='w-full flex justify-between items-center px-3  bg-gray-700 absolute'>
      <img src={assets.logo} alt="Logo" className='w-25 h-25 shrink-0' />
      <button className='bg-gray-500 text-white px-4 py-2 items-center rounded-full hover:bg-black'>Login<img src={assets.arrow_icon} alt="Arrow" className='w-4 h-4 inline-block ml-2' /></button>
    </div>
  )
}

export default NavBar
