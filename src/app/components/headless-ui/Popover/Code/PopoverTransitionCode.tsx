import { PopoverButton, PopoverPanel, Popover } from "@headlessui/react";

const PopoverTransitionCode = () => {
  return (
    <div>
      <div className='w-fit'>
        <div className='gap-8 bg-lightgray dark:bg-dark py-2 px-4 rounded-sm flex justify-center'>
          <Popover className='relative '>
            <PopoverButton className='block text-sm font-semibold text-ld focus:outline-none data-[active]:text-primary data-[hover]:text-primary data-[focus]:outline-1 data-[focus]:outline-white'>
              Open Popover
            </PopoverButton>
            <PopoverPanel
              transition
              anchor='bottom'
              className='w-52 z-[60] py-4 rounded-sm bg-white dark:bg-dark text-sm shadow-md dark:shadow-dark-md transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0'>
              <div className='flex flex-col gap-1'>
                <a href='/analytics' className='ui-dropdown-item'>
                  Analytics
                </a>
                <a href='/engagement' className='ui-dropdown-item'>
                  Engagement
                </a>
                <a href='/security' className='ui-dropdown-item'>
                  Security
                </a>
                <a href='/integrations' className='ui-dropdown-item'>
                  Integrations
                </a>
              </div>
            </PopoverPanel>
          </Popover>
        </div>
      </div>
    </div>
  )
}

export default PopoverTransitionCode
