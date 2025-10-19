import React from 'react'
import { Badge } from '@/app/components/shadcn-ui/Default-Ui/badge'

const DefaultBadgeCode = () => {
  return (
    <>
    <div className="flex items-center gap-3 mt-4">
             <Badge>Primary</Badge>
             <Badge variant="secondary" >Secondary</Badge>
             <Badge variant="success" >Success</Badge>
             <Badge variant="warning" >Warning</Badge>
             <Badge variant="info" >Info</Badge>
             <Badge variant="error" >Error</Badge>
            </div>
    </>
  )
}

export default DefaultBadgeCode