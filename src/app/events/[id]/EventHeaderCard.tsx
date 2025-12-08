'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material'
import type { Event } from '@prisma/client'
import EventForm from '../EventForm'
import EditEventDialog from './EditEventDialog'
import { useRouter } from 'next/navigation'

type Props = { event: Event }

export default function EventHeaderCard({ event }: Props) {
  const [openEdit, setOpenEdit] = useState(false)
  const router = useRouter()

  return (
    <Card sx={{ width: '100%', position: 'relative', borderColor: 'divider', mb: 3 }}>
      <CardActionArea
        component="div"
        onClick={() => setOpenEdit(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpenEdit(true)
        }}
        sx={{ cursor: 'pointer' }}
      >
        <CardContent sx={{ pr: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 0.5,
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" noWrap>
              {event.title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {event.verificationStatus && (
                <Chip
                  label={event.verificationStatus}
                  size="small"
                  color={
                    event.verificationStatus === 'Verified True'
                      ? 'success'
                      : event.verificationStatus === 'Verified False'
                        ? 'warning'
                        : event.verificationStatus === 'Pending'
                          ? 'info'
                          : event.verificationStatus === 'True without Verification'
                            ? 'info'
                            : event.verificationStatus === 'Question Mark'
                              ? 'warning'
                              : 'default'
                  }
                />
              )}

              <EditEventDialog event={event} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}
            </Typography>
          </Box>

          {event.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mt: 0.5,
              }}
            >
              {event.description}
            </Typography>
          )}

          {/* Images: show first image as a cover thumbnail */}
          {(event as any).images && (event as any).images.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <img
                src={(event as any).images[0]}
                alt="event image"
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 6 }}
              />
            </Box>
          )}

          {(event as any).tags && (event as any).tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
              {(event as any).tags.slice(0, 4).map((t: string) => (
                <Chip key={t} label={t} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
              {(event as any).tags.length > 4 && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`+${(event as any).tags.length - 4}`}
                />
              )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent dividers>
          <EventForm
            event={event}
            onSuccess={() => {
              setOpenEdit(false)
              router.refresh()
            }}
            onCancel={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
