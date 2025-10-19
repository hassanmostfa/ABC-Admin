import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Indicator from './Code/IndicatorsCode'
import IndicatorCode from './Code/IndicatorsCode.tsx?raw'

const Indicators = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Indicators</h4>
            <Indicator />
          </div>
          <CodeDialog>{IndicatorCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default Indicators
