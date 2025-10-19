
"use client"
import React from 'react'
import CardBox from '../../shared/CardBox'
import Lightalert from './code/LightAlertCode'
import LightAlertCode from './code/LightAlertCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'

const LightAlert = () => {
    return (
        <CardBox className='p-0'>
            <div>
            <div className="p-6">
                <h4 className="text-lg font-semibold">Light Alert</h4> 
               <Lightalert/>
            </div>
            <CodeDialog>{LightAlertCode}</CodeDialog>
            </div>
        </CardBox>
    )
}

export default LightAlert