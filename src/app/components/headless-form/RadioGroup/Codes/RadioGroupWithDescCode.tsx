import { useState } from 'react'
import { Description, Field, Label, Radio, RadioGroup } from '@headlessui/react'

const plans = [
  { name: 'Startup', description: '12GB, 6 CPUs, 256GB SSD disk' },
  { name: 'Business', description: '16GB, 8 CPUs, 512GB SSD disk' },
  { name: 'Enterprise', description: '32GB, 12 CPUs, 1TB SSD disk' },
]

const RadioGroupWithDescCode = () => {
  const [selected, setSelected] = useState(plans[0])

  return (
    <div>
      <RadioGroup
        value={selected}
        onChange={setSelected}
        aria-label='Server size'
        className='flex flex-col gap-3'>
        {plans.map((plan) => (
          <Field
            key={plan.name}
            className='flex items-center gap-3 bg-lightgray dark:bg-dark py-2 px-4 rounded-full '>
            <Radio
              value={plan}
              className='group cursor-pointer flex size-5 items-center justify-center rounded-full border border-ld bg-white dark:bg-transparent data-[checked]:bg-primary dark:data-[checked]:bg-primary outline-0'>
              <span className='invisible size-2 rounded-full bg-white group-data-[checked]:visible ' />
            </Radio>
            <div>
              <Label className='text-ld cursor-pointer'>{plan.name}</Label>
              <Description className='text-darklink dark:text-gray-500 text-xs'>
                {plan.description}
              </Description>
            </div>
          </Field>
        ))}
      </RadioGroup>
    </div>
  )
}

export default RadioGroupWithDescCode
