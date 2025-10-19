import { Alert } from 'flowbite-react'
import { HiInformationCircle } from 'react-icons/hi'

const LightAlertIconCode = () => {
  return (
    <div>
      <div className='flex flex-col gap-2'>
        <Alert
          color='lightprimary'
          icon={HiInformationCircle}
          className='rounded-md'>
          <span className='font-medium'>Primary</span> - A simple Primary alert
        </Alert>

        <Alert
          color='lightsecondary'
          icon={HiInformationCircle}
          className='rounded-md'>
          <span className='font-medium'>Secondary</span> - A simple Secondary
          alert
        </Alert>

        <Alert
          color='lightsuccess'
          icon={HiInformationCircle}
          className='rounded-md'>
          <span className='font-medium'>Success</span> - A simple Success alert
        </Alert>

        <Alert
          color='lightinfo'
          icon={HiInformationCircle}
          className='rounded-md'>
          <span className='font-medium'>Info</span> - A simple Info alert
        </Alert>

        <Alert
          color='lightwarning'
          icon={HiInformationCircle}
          className='rounded-md'>
          <span className='font-medium'>Warning</span> - A simple Warning alert
        </Alert>

        <Alert
          color='lighterror'
          icon={HiInformationCircle}
          className='rounded-md'>
          <span className='font-medium'>Error</span> - A simple Error alert
        </Alert>

        <Alert
          color='lightgray'
          icon={HiInformationCircle}
          className='rounded-md'>
          <span className='font-medium'>Light</span> A simple Light alert
        </Alert>
      </div>
    </div>
  )
}

export default LightAlertIconCode
