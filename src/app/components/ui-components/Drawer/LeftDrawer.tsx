'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import DefaultDrawer from './Code/DefaultDrawerCode'
import DefaultDrawerCode from './Code/DefaultDrawerCode.tsx?raw'

const LeftDrawer = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Left Drawer</h4>
            <DefaultDrawer />
          </div>
          <CodeDialog>{DefaultDrawerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default LeftDrawer
