'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Transitiondialog from './Code/TransitionDialogCode'
import TransitiondialogCode from './Code/TransitionDialogCode.tsx?raw'

const TranstionDialog = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Transitions Dialog</h4>
            <Transitiondialog />
          </div>
          <CodeDialog>{TransitiondialogCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default TranstionDialog
