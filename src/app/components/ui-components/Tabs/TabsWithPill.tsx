'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import TabsPill from './Code/TabsPillcode'
import TabsPillcode from './Code/TabsPillcode.tsx?raw'

const TabsWithPill = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Tabs With Pills</h4>
            <TabsPill />
          </div>
          <CodeDialog>{TabsPillcode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default TabsWithPill
