'use client'

import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import dayjs from 'dayjs'

export type LiteEvent = {
  id: string
  title: string
  description: string
  occurredAt: Date | string
  intensity: number
  parentEventId: string | null
}

type Props = {
  groupedByDay: [string, LiteEvent[]][]
  onAddForDay: (dayKey: string) => void
  onOpenEdit: (e: LiteEvent) => void
}

export default function TimelineView({ groupedByDay, onAddForDay, onOpenEdit }: Props) {
  return (
    <Stack spacing={2}>
      {groupedByDay.map(([dayKey, items]) => (
        <Box key={dayKey}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mb: 1,
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 1,
              py: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              {dayjs(dayKey).format('dddd, MMM D')}
            </Typography>

            <Button size="small" startIcon={<AddIcon />} onClick={() => onAddForDay(dayKey)}>
              Add
            </Button>
          </Stack>

          <Stack spacing={1}>
            {items.map((e) => (
              <Card key={e.id} sx={{ width: '100%', position: 'relative', borderColor: 'divider' }}>
                <CardActionArea component="div" onClick={() => onOpenEdit(e)}>
                  <CardContent sx={{ pr: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={600}>{e.title}</Typography>
                      <Chip size="small" label={dayjs(e.occurredAt).format('h:mm A')} />
                    </Stack>

                    {e.description ? (
                      <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                        {e.description}
                      </Typography>
                    ) : null}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}
