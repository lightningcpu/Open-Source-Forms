import React from 'react'
import { Spinner } from 'react-bootstrap'

const Loader = () => {
  return (
    <Spinner 
    animation='border'
    role='status'
    className='w-[100px] h-[100px] m-auto block'
    />
  )
}

export default Loader