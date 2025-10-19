import { Card } from 'flowbite-react'

const CardWithImageCode = () => {
  return (
    <>
      <div>
        <Card
          className='max-w-sm'
          imgAlt='Meaningful alt text for an image that is not purely decorative'
          imgSrc='/images/blog/blog-img2.jpg'>
          <h5 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white pt-3'>
            Noteworthy technology acquisitions
          </h5>
          <p className='font-normal text-gray-700 dark:text-gray-400'>
            Here are the biggest enterprise technology acquisitions of 2024 so
            far, in reverse chronological order.
          </p>
        </Card>
      </div>
    </>
  )
}

export default CardWithImageCode
