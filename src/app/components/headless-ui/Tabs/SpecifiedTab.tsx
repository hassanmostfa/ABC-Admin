import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import SpecifiedDefault from './Code/SpecifiedDefaultCode'
import SpecifiedDefaultCode from './Code/SpecifiedDefaultCode.tsx?raw'

const SpecifiedTab = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Specifying The Default Tab
            </h4>
            <SpecifiedDefault />
          </div>
          <CodeDialog>{SpecifiedDefaultCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default SpecifiedTab
