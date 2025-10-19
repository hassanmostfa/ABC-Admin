import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import SquareOutlinebtn from './Codes/SquareOutlineBtnCode'
import SquareOutlinebtnCode from './Codes/SquareOutlineBtnCode.tsx?raw'

const SquareOutlineBtn = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Square Outlined Buttons
            </h4>
            <SquareOutlinebtn />
          </div>
          <CodeDialog>{SquareOutlinebtnCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default SquareOutlineBtn
