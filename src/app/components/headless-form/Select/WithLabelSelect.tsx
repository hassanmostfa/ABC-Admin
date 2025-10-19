import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import WithLabelselect from './Code/WithLabelSelectCode'
import WithLabelselectCode from './Code/WithLabelSelectCode.tsx?raw'

const WithLabelSelect = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>With Label Select</h4>
            <WithLabelselect />
          </div>
          <CodeDialog>{WithLabelselectCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default WithLabelSelect
