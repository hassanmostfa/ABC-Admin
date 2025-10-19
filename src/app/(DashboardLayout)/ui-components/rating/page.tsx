import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultRatting from '@/app/components/ui-components/Ratting/DefaultRatting'
import WithTextRattings from '@/app/components/ui-components/Ratting/WithTextRattings'
import RattingCount from '@/app/components/ui-components/Ratting/RattingCount'
import StarRatting from '@/app/components/ui-components/Ratting/StarRatting'
import AdvanceRatting from '@/app/components/ui-components/Ratting/AdvanceRatting'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Ratting',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Rating',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'size',
    description: 'Sets the size of the stars.',
    type: '"sm" | "md" | "lg"',
    default: '"sm"',
  },
  {
    id: '2',
    prop: 'filled',
    description: 'If true, the star is filled otherwise, it is empty.',
    type: 'boolean',
    default: 'true',
  },
  {
    id: '3',
    prop: 'percentFilled',
    description: 'The percentage of the rating bar that is filled.',
    type: '1 to 100',
    default: '0',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Rating' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultRatting />
        </div>
        {/* With Text Rattings */}
        <div className='col-span-12'>
          <WithTextRattings />
        </div>
        {/* Ratting Count*/}
        <div className='col-span-12'>
          <RattingCount />
        </div>
        {/* Star Ratting*/}
        <div className='col-span-12'>
          <StarRatting />
        </div>
        {/* Advance Ratting*/}
        <div className='col-span-12'>
          <AdvanceRatting />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Rating' />
        </div>
      </div>
    </>
  )
}

export default page
