'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Defaulttabs from './Code/DefaultTabsCode'
import DefaulttabsCode from './Code/DefaultTabsCode.tsx?raw'

const DefaultTabs = () => {
  return (
    <>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default Tabs</h4>
            <Defaulttabs />
          </div>
          <CodeDialog>{DefaulttabsCode}</CodeDialog>
        </div>
      </CardBox>
    </>
  )
}

export default DefaultTabs
