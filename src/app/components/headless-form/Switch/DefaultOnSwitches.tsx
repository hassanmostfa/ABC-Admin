'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import DefaultOn from './Codes/DefaultOnSwitchCode'
import DefaultOnCode from './Codes/DefaultOnSwitchCode.tsx?raw'

const DEfaultOnSwitches = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default On Switches</h4>
            <DefaultOn />
          </div>
          <CodeDialog>{DefaultOnCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DEfaultOnSwitches
