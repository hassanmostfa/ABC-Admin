
"use client"
import React from 'react'
import CardBox from '../../shared/CardBox'
import Ghostbutton from './code/GhostButtonCode'
import GhostButtonCode from './code/GhostButtonCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'



const GhostButton = () => {
    return (
        <CardBox className='p-0'>
            <div>
            <div className="p-6">
                <h4 className="text-lg font-semibold">Ghost Button</h4>
                  <Ghostbutton/>
            </div>
            <CodeDialog>{GhostButtonCode}</CodeDialog>
            </div>
        </CardBox>
    )
}

export default GhostButton