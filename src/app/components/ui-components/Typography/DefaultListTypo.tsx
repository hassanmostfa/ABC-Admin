import { List, ListItem } from 'flowbite-react'
import React from 'react'
import CardBox from '../../shared/CardBox'

const DefaultListTypo = () => {
  return (
    <div>
      <CardBox>
        <h4 className='text-lg font-semibold mb-2'>Default list</h4>
        <List>
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

export default DefaultListTypo
