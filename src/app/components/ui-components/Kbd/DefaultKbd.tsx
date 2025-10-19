import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Defaultkbd from './Code/DefaultKbdCode'
import DefaultkbdCode from './Code/DefaultKbdCode.tsx?raw'

const DefaultKbd = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default KDB</h4>
            <Defaultkbd />
          </div>
          <CodeDialog>{DefaultkbdCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultKbd
