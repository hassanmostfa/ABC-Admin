import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Popovertransition from './Code/PopoverTransitionCode'
import PopovertransitionCode from './Code/PopoverTransitionCode.tsx?raw'

const PopoverTransition = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Popover Transitions</h4>
            <Popovertransition />
          </div>
          <CodeDialog>{PopovertransitionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default PopoverTransition
