import React from 'react'
import { Input } from "@/app/components/shadcn-ui/Default-Ui/input";


const SimpleInputcode = () => {
  return (
    <>
      <div className="max-w-sm flex flex-col gap-5 mt-4">
        <Input type="text" placeholder="Name" />
        <Input type="text" placeholder="Comapny" />
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
      </div>
    </>
  )
}

export default SimpleInputcode