'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react'
import React from 'react'
import CardBox from '../../shared/CardBox'

const TableHover = () => {
  return (
    <div>
      <CardBox>
        <h4 className='text-lg font-semibold mb-2'>Table hover state</h4>
        <div className='overflow-x-auto'>
          <Table hoverable>
            <TableHead>
              <TableRow className='hover:bg-white dark:hover:bg-dark'>
                <TableHeadCell>Product name</TableHeadCell>
                <TableHeadCell>Color</TableHeadCell>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell>Price</TableHeadCell>
                <TableHeadCell>
                  <span className='sr-only'>Edit</span>
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className='divide-y divide-border dark:divide-darkborder'>
              <TableRow className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                <TableCell className='whitespace-nowrap font-medium text-gray-900 dark:text-white'>
                  {'Apple MacBook Pro 17"'}
                </TableCell>
                <TableCell>Sliver</TableCell>
                <TableCell>Laptop</TableCell>
                <TableCell>$2999</TableCell>
                <TableCell>
                  <a
                    href='#'
                    className='font-medium text-primary hover:underline dark:text-primary'>
                    Edit
                  </a>
                </TableCell>
              </TableRow>
              <TableRow className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                <TableCell className='whitespace-nowrap font-medium text-gray-900 dark:text-white'>
                  Microsoft Surface Pro
                </TableCell>
                <TableCell>White</TableCell>
                <TableCell>Laptop PC</TableCell>
                <TableCell>$1999</TableCell>
                <TableCell>
                  <a
                    href='#'
                    className='font-medium text-primary hover:underline dark:text-primary'>
                    Edit
                  </a>
                </TableCell>
              </TableRow>
              <TableRow className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                <TableCell className='whitespace-nowrap font-medium text-gray-900 dark:text-white'>
                  Magic Mouse 2
                </TableCell>
                <TableCell>Black</TableCell>
                <TableCell>Accessories</TableCell>
                <TableCell>$99</TableCell>
                <TableCell>
                  <a
                    href='#'
                    className='font-medium text-primary hover:underline dark:text-primary'>
                    Edit
                  </a>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardBox>
    </div>
  )
}

export default TableHover
