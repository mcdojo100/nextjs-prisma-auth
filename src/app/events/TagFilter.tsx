'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Event as PrismaEvent } from '@prisma/client'
import {
  Box,
  Button,
  Menu,
  Chip,
  Typography,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'

type TagFilterProps = {
  events: PrismaEvent[]
  selectedTags?: string[]
  onChange?: (tags: string[]) => void
  buttonLabel?: string
}

export default function TagFilter({
  events,
  selectedTags,
  onChange,
  buttonLabel = 'Filter',
}: TagFilterProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedTags ?? [])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (selectedTags !== undefined) setInternalSelected(selectedTags)
  }, [selectedTags])

  const uniqueTags = useMemo(() => {
    const s = new Set<string>()
    for (const e of events) {
      const tags = (e as any).tags
      if (Array.isArray(tags)) tags.forEach((t) => s.add(String(t)))
    }
    return Array.from(s)
      .map((t) => t.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
  }, [events])

  const filteredTags = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return uniqueTags
    return uniqueTags.filter((t) => t.toLowerCase().includes(q))
  }, [uniqueTags, query])

  const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const closeMenu = () => {
    setAnchorEl(null)
    setQuery('')
  }

  function updateSelected(next: string[]) {
    // normalize + dedupe
    const normalized = Array.from(
      new Set(next.map((t) => String(t).trim().toLowerCase()).filter(Boolean)),
    )
    setInternalSelected(normalized)
    onChange?.(normalized)
  }

  const selectedSet = useMemo(() => new Set(internalSelected), [internalSelected])

  return (
    <>
      <Button size="small" startIcon={<FilterListIcon />} onClick={openMenu}>
        {buttonLabel}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1.5,
            width: 340,
            maxWidth: '92vw',
          },
        }}
      >
        {/* Header row: label + clear */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>
            Filter by tag
          </Typography>

          <Button
            size="small"
            onClick={() => updateSelected([])}
            disabled={internalSelected.length === 0}
            startIcon={<ClearIcon fontSize="small" />}
            sx={{ textTransform: 'none' }}
          >
            Clear
          </Button>
        </Stack>

        {/* Search */}
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          placeholder="Search tags…"
          fullWidth
          sx={{ mb: 1.25 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Chips */}
        {uniqueTags.length === 0 ? (
          <Typography variant="body2" sx={{ opacity: 0.7, px: 0.5, py: 1 }}>
            No tags yet.
          </Typography>
        ) : filteredTags.length === 0 ? (
          <Typography variant="body2" sx={{ opacity: 0.7, px: 0.5, py: 1 }}>
            No matches.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filteredTags.map((t) => {
              const sel = selectedSet.has(t.toLowerCase())
              return (
                <Chip
                  key={t}
                  label={t}
                  size="small"
                  clickable
                  variant={sel ? 'filled' : 'outlined'}
                  color={sel ? 'primary' : 'default'}
                  onClick={() => {
                    const normalized = t.toLowerCase()
                    const next = sel
                      ? internalSelected.filter((x) => x !== normalized)
                      : [...internalSelected, normalized]
                    updateSelected(next)
                  }}
                  sx={{
                    borderRadius: 999,
                    fontWeight: 600,
                    opacity: sel ? 1 : 0.9,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                />
              )
            })}
          </Box>
        )}
      </Menu>
    </>
  )
}
