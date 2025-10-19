'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import LabelWithList from './Codes/LabelWithListcode'
import LabelWithListCode from './Codes/LabelWithListcode.tsx?raw'

const LabelListbox = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Label With Listbox</h4>
            <LabelWithList />
          </div>
          <CodeDialog>{LabelWithListCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default LabelListbox
