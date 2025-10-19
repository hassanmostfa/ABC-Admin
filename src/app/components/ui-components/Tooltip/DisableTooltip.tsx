import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Disabletooltip from './Code/DisableTooltipCode'
import DisabletooltipCode from './Code/DisableTooltipCode.tsx?raw'

const DisableTooltip = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Disable Arrow Tooltip
            </h4>
            <Disabletooltip />
          </div>
          <CodeDialog>{DisabletooltipCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisableTooltip
