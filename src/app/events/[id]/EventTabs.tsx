'use client'

import { useState } from 'react'
import { Box, Tabs, Tab } from '@mui/material'
import LogicWorkspace from './LogicWorkspace'
import SubEventWorkspace from './SubEventWorkspace'
import { Event, Logic } from '@prisma/client'

type EventTabsProps = {
  eventId: string
  logics: Logic[]
  subEvents: Event[]
}

export default function EventTabs({ eventId, logics, subEvents }: EventTabsProps) {
  const [tab, setTab] = useState(0)

  const handleChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue)

  const a11yProps = (index: number) => ({
    id: `event-tab-${index}`,
    'aria-controls': `event-tabpanel-${index}`,
  })

  const TabPanel = ({
    children,
    value,
    index,
  }: {
    children?: React.ReactNode
    value: number
    index: number
  }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`event-tabpanel-${index}`}
        aria-labelledby={`event-tab-${index}`}
      >
        {value === index && <Box sx={{ py: 1 }}>{children}</Box>}
      </div>
    )
  }

  return (
    <Box>
      <Tabs value={tab} onChange={handleChange} aria-label="Event tabs" sx={{ mb: 2 }}>
        <Tab label="Sub Events" {...a11yProps(0)} />
        <Tab label="Analyses" {...a11yProps(1)} />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <SubEventWorkspace eventId={eventId} subEvents={subEvents} />
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <LogicWorkspace eventId={eventId} logics={logics} />
      </TabPanel>
    </Box>
  )
}
