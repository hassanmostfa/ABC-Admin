import { List, ListItem } from 'flowbite-react'
import React from 'react'
import CardBox from '../../shared/CardBox'

const UnstyledTypo = () => {
  return (
    <div>
      <CardBox>
        <h4 className='text-lg font-semibold mb-2'>Unstyled</h4>
        <List unstyled>
          <ListItem>At least 10 characters (and up to 100 characters)</ListItem>
          <ListItem>At least one lowercase character</ListItem>
          <ListItem>
            Inclusion of at least one special character, e.g., ! @ # ?
          </ListItem>
        </List>
      </CardBox>
    </div>
  )
}

export default UnstyledTypo
