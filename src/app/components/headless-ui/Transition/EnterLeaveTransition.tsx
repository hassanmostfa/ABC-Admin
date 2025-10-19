'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import EnterLeavetransition from './Codes/EnterLeaveTransitionCode'
import EnterLeavetransitionCode from './Codes/EnterLeaveTransitionCode.tsx?raw'

const EnterLeaveTransition = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Different Transition</h4>
            <EnterLeavetransition />
          </div>
          <CodeDialog>{EnterLeavetransitionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default EnterLeaveTransition
