'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import CustomDropdownicon from './Code/CustomDropdownIconCode'
import CustomDropdowniconCode from './Code/CustomDropdownIconCode.tsx?raw'

const CustomDropdownIcon = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Custom Dropdown Icon</h4>
            <CustomDropdownicon />
          </div>
          <CodeDialog>{CustomDropdowniconCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default CustomDropdownIcon
