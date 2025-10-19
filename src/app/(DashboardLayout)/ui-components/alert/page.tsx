import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultAlert from '@/app/components/ui-components/Alert/DefaultAlert'
import LightAlert from '@/app/components/ui-components/Alert/LightAlert'
import AlertWithIcon from '@/app/components/ui-components/Alert/AlertWithIcon'
import LightAlertWithIcon from '@/app/components/ui-components/Alert/LightAlertWithIcon'
import DismissibleAlert from '@/app/components/ui-components/Alert/DismissibleAlert'
import LightDismissibleAlert from '@/app/components/ui-components/Alert/LightDismissibleAlert'
import RoundedAlert from '@/app/components/ui-components/Alert/RoundedAlert'
import LightRoundeAlert from '@/app/components/ui-components/Alert/LightRoundeAlert'
import LightBorderAccent from '@/app/components/ui-components/Alert/LightBorderAccent'
import Additional from '@/app/components/ui-components/Alert/Additional'
import AllOptions from '@/app/components/ui-components/Alert/AllOptions'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Alert',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Alert',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'color',
    description: 'Sets the color scheme of the alert box.',
    type: `'primary' | 'success' | 'warning' | 'green'`,
    default: `'info'`,
  },
  {
    id: '2',
    prop: 'icon',
    description: 'Adds a custom icon to the alert box.',
    type: `'HiInformationCircle'`,
    default: '-',
  },
  {
    id: '3',
    prop: 'onDismiss',
    description:
      'Callback function triggered when the dismiss button is clicked.',
    type: `onDismiss={() => alert('Alert dismissed!')}`,
    default: '-',
  },
  {
    id: '4',
    prop: 'rounded',
    description: 'Applies rounded corners to the alert box.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '5',
    prop: 'withBorderAccent',
    description: 'Adds a border accent to the alert box.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '6',
    prop: 'additionalContent',
    description: 'Allows additional content to be added inside the alert box.',
    type: 'React.ReactNode',
    default: 'null',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Alert' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default Alert */}
        <div className='col-span-12'>
          <DefaultAlert />
        </div>
        {/* Light Alert */}
        <div className='col-span-12'>
          <LightAlert />
        </div>
        {/* Alert With Icon */}
        <div className='col-span-12'>
          <AlertWithIcon />
        </div>
        {/* Light Alert With Icon */}
        <div className='col-span-12'>
          <LightAlertWithIcon />
        </div>
        {/* Dismissible Alert */}
        <div className='col-span-12'>
          <DismissibleAlert />
        </div>
        {/* Light Dismissible Alert */}
        <div className='col-span-12'>
          <LightDismissibleAlert />
        </div>
        {/* Rounded Alert */}
        <div className='col-span-12'>
          <RoundedAlert />
        </div>
        {/* Light Rounded Alert */}
        <div className='col-span-12'>
          <LightRoundeAlert />
        </div>
        {/* Light Border Accent */}
        <div className='col-span-12'>
          <LightBorderAccent />
        </div>
        {/* Additional Alert */}
        <div className='col-span-12'>
          <Additional />
        </div>
        {/* AllOptions Alert */}
        <div className='col-span-12'>
          <AllOptions />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Alert' />
        </div>
      </div>
    </>
  )
}

export default page
