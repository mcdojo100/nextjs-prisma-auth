'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Event as PrismaEvent } from '@prisma/client'
import { Box, Button, Menu, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'

type TagFilterProps = {
  events: PrismaEvent[]
  selectedTags?: string[]
  onChange?: (tags: string[]) => void
  // optional quick filter (all/parents/subs)
  filter?: 'all' | 'parents' | 'subs'
  onFilterChange?: (f: 'all' | 'parents' | 'subs') => void
}

export default function TagFilter({
  events,
  selectedTags,
  onChange,
  filter,
  onFilterChange,
}: TagFilterProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedTags ?? [])

  useEffect(() => {
    if (selectedTags !== undefined) setInternalSelected(selectedTags)
  }, [selectedTags])

  const uniqueTags = useMemo(() => {
    const s = new Set<string>()
    for (const e of events) {
      const tags = (e as any).tags
      if (Array.isArray(tags)) tags.forEach((t) => s.add(t))
    }
    return Array.from(s).sort()
  }, [events])

  const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const closeMenu = () => setAnchorEl(null)

  function updateSelected(next: string[]) {
    setInternalSelected(next)
    onChange?.(next)
  }

  return (
    <>
      <Button size="small" startIcon={<FilterListIcon />} onClick={openMenu}>
        Filter
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 1, minWidth: 240 } }}
      >
        {/* Optional quick filter selector */}
        {onFilterChange && (
          <Box sx={{ mb: 1 }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={filter}
              onChange={(_, v) => v && onFilterChange(v)}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="parents">Parents</ToggleButton>
              <ToggleButton value="subs">Sub-Events</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {uniqueTags.length === 0 ? (
            <Box sx={{ px: 1 }}>No tags</Box>
          ) : (
            uniqueTags.map((t) => {
              const sel = internalSelected.includes(t)
              return (
                <Chip
                  key={t}
                  label={t}
                  size="small"
                  color={sel ? 'primary' : 'default'}
                  variant={sel ? 'filled' : 'outlined'}
                  onClick={() => {
                    const next = internalSelected.includes(t)
                      ? internalSelected.filter((x) => x !== t)
                      : [...internalSelected, t]
                    updateSelected(next)
                  }}
                  sx={{ cursor: 'pointer' }}
                />
              )
            })
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, px: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={() => {
              updateSelected([])
              closeMenu()
            }}
            disabled={internalSelected.length === 0}
          >
            Clear filters
          </Button>
        </Box>
      </Menu>
    </>
  )
}
