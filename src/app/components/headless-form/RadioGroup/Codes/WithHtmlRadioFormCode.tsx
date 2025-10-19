import { useState } from 'react'
import { Field, Label, Radio, RadioGroup } from '@headlessui/react'

const plans = [
  'Developing',
  'Designing',
  'Coding',
  'Graphics Design',
  'Accounting',
  'Frontend',
  'Seo',
]

const WithHtmlRadioFormCode = () => {
  const [selected, setSelected] = useState(plans[0])

  return (
    <div>
      <form action='/plans' method='post'>
        <RadioGroup
          value={selected}
          onChange={setSelected}
          aria-label='Server size'
          className='flex flex-col gap-3'>
          {plans.map((plan) => (
            <Field key={plan} className='flex items-center gap-3'>
              <Radio
                value={plan}
                className='group cursor-pointer flex size-5 items-center justify-center rounded-full border border-ld bg-white dark:bg-transparent data-[checked]:bg-primary dark:data-[checked]:bg-primary outline-0'>
                <span className='invisible size-2 rounded-full bg-white group-data-[checked]:visible' />
              </Radio>
              <Label className='text-sm text-ld cursor-pointer'>{plan}</Label>
            </Field>
          ))}
        </RadioGroup>
        <div className='flex gap-3 mt-4'>
          <button className='ui-button bg-primary'>Submit</button>
          <button className='ui-button bg-error'>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default WithHtmlRadioFormCode
