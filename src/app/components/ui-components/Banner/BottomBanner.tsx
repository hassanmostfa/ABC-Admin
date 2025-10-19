import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Bottombanner from './Code/BottomBannerCode'
import BottombannerCode from './Code/BottomBannerCode.tsx?raw'

const BottomBanner = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Bottom Position</h4>
            <Bottombanner />
          </div>
          <CodeDialog>{BottombannerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BottomBanner
