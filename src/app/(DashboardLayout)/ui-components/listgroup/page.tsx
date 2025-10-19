import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultList from '@/app/components/ui-components/ListGroup/DefaultList'
import LinkList from '@/app/components/ui-components/ListGroup/LinkList'
import ListButton from '@/app/components/ui-components/ListGroup/ListButton'
import ListIcon from '@/app/components/ui-components/ListGroup/ListIcon'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui ListGroup',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'List Group',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'href',
    description: 'The URL to link to for this list group item.',
    type: `'#'`,
    default: '-',
  },
  {
    id: '2',
    prop: 'active',
    description: 'Indicates whether the list group item is active.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '3',
    prop: 'disabled',
    description: 'Indicates whether the list group item is disabled.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '4',
    prop: 'onClick',
    description:
      'Callback function triggered when the list group item is clicked.',
    type: `'() => alert("Profile clicked!")'`,
    default: '-',
  },
  {
    id: '5',
    prop: 'icon',
    description: 'An optional icon to display alongside the list group item.',
    type: `'HiUserCircle' | 'HiInbox'`,
    default: '-',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='List Group' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultList />
        </div>
        {/* LinkList */}
        <div className='col-span-12'>
          <LinkList />
        </div>
        {/* ListButton */}
        <div className='col-span-12'>
          <ListButton />
        </div>
        {/* ListIcon */}
        <div className='col-span-12'>
          <ListIcon />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='List Group' />
        </div>
      </div>
    </>
  )
}

export default page
