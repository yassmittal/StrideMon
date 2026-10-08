'use client'

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  passFindContent,
  passGalleryContent,
  passGallerySortOptions,
  passScheduleContent,
  passSectionIds,
} from '@/content/founding-pass'
import { passDesignTables } from '@/content/founding-pass-designs'
import { findRecentPassMint, readPassAvailability } from '@/lib/founding-pass/pass-collection'
import { PASS_RARITIES, type PassRarity, passRarityLabels } from '@/lib/founding-pass/pass-design'
import {
  countActiveFilters,
  emptyPassGalleryFilters,
  listGalleryDesigns,
  type PassGalleryFilters,
  type PassGallerySort,
  readSingleChosenTemplateIndex,
} from '@/lib/founding-pass/pass-gallery-view'
import { useFavouritePasses } from '@/lib/founding-pass/use-favourite-passes'
import { retryPassCollection, usePassCollection } from '@/lib/founding-pass/use-pass-collection'
import { MetaLabel } from '../ui/meta-label'
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { PassCard } from './pass-card'
import { PassDetailSheet } from './pass-detail-sheet'
import { PassFinder } from './pass-finder'

/** Cards drawn at a time: enough to fill two screens, few enough to keep the page light (D-044). */
const GALLERY_PAGE_SIZE = 48
/** The first row's art loads at once; the rest as it scrolls into view. */
const EAGER_CARD_COUNT = 6
const PASS_HASH_PATTERN = /^#(\d{4})$/

/** The finder, the filters, the grid and the detail sheet, which all open the same sheet. */
export function PassGallery() {
  const [filters, setFilters] = useState<PassGalleryFilters>(emptyPassGalleryFilters)
  const [sort, setSort] = useState<PassGallerySort>('number')
  const [areFiltersShown, setAreFiltersShown] = useState(false)
  const [shownCount, setShownCount] = useState(GALLERY_PAGE_SIZE)
  const [openDesignNumber, setOpenDesignNumber] = useState<number | null>(null)
  const hasPushedSheetEntryRef = useRef(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { collection, requestStatus } = usePassCollection()
  const favouriteDesignNumbers = useFavouritePasses()

  const designs = useMemo(
    () => listGalleryDesigns({ filters, sort, collection, favouriteDesignNumbers }),
    [filters, sort, collection, favouriteDesignNumbers],
  )
  const shownDesigns = designs.slice(0, shownCount)
  const activeFilterCount = countActiveFilters(filters)
  const singleTemplateIndex = readSingleChosenTemplateIndex(filters)
  const singleTemplate =
    singleTemplateIndex === null ? undefined : passDesignTables.templates[singleTemplateIndex]

  // The sheet keeps a history entry (`/pass#0137`), so the phone's back gesture closes it, and a
  // link to `/pass#0137` opens it.
  useEffect(() => {
    const openFromHash = () => {
      hasPushedSheetEntryRef.current = false
      const hashMatch = window.location.hash.match(PASS_HASH_PATTERN)
      setOpenDesignNumber(hashMatch?.[1] === undefined ? null : Number(hashMatch[1]))
    }
    openFromHash()
    window.addEventListener('popstate', openFromHash)
    return () => window.removeEventListener('popstate', openFromHash)
  }, [])

  // Draws the next cards as the end of the grid comes near. "Show more" does the same by hand.
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current
    if (loadMoreElement === null) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShownCount((count) => count + GALLERY_PAGE_SIZE)
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(loadMoreElement)
    return () => observer.disconnect()
  }, [])

  function openDesign(designNumber: number) {
    const hash = `#${String(designNumber).padStart(4, '0')}`
    if (hasPushedSheetEntryRef.current) {
      window.history.replaceState({ passSheet: designNumber }, '', hash)
    } else {
      window.history.pushState({ passSheet: designNumber }, '', hash)
      hasPushedSheetEntryRef.current = true
    }
    setOpenDesignNumber(designNumber)
  }

  function closeSheet() {
    if (openDesignNumber === null) return
    setOpenDesignNumber(null)
    if (hasPushedSheetEntryRef.current) {
      hasPushedSheetEntryRef.current = false
      window.history.back()
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  function updateFilters(nextFilters: PassGalleryFilters) {
    // Details belong to one template: choosing another drops them.
    const isSameSingleTemplate = readSingleChosenTemplateIndex(nextFilters) === singleTemplateIndex
    setFilters(
      isSameSingleTemplate ? nextFilters : { ...nextFilters, optionValueIndexesBySlot: {} },
    )
    setShownCount(GALLERY_PAGE_SIZE)
  }

  return (
    <>
      <section
        id={passSectionIds.find}
        aria-labelledby="pass-find-heading"
        className="page-gutter page-container flex flex-col gap-8 py-12 md:py-16"
      >
        <div className="flex flex-col gap-5">
          <MetaLabel items={passFindContent.metaLabels} />
          <h2 id="pass-find-heading" className="-ml-[0.04em] text-heading text-balance">
            {passFindContent.heading}
          </h2>
        </div>
        <PassFinder onOpenDesign={openDesign} />
      </section>

      <section
        id={passSectionIds.gallery}
        aria-labelledby="pass-gallery-heading"
        className="page-gutter page-container flex flex-col gap-6 pt-4 pb-16 md:pb-24"
      >
        <div className="flex flex-col gap-5">
          <MetaLabel items={passGalleryContent.metaLabels} />
          <h2 id="pass-gallery-heading" className="-ml-[0.04em] text-heading text-balance">
            {passGalleryContent.heading}
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ToggleChip
              isPressed={areFiltersShown}
              onToggle={() => setAreFiltersShown(!areFiltersShown)}
              ariaExpanded={areFiltersShown}
              ariaControls="pass-filters"
            >
              <FilterIcon />
              {passGalleryContent.filtersLabel}
              {activeFilterCount > 0 ? (
                <span className="font-mono">({activeFilterCount})</span>
              ) : null}
            </ToggleChip>
            <ToggleChip
              isPressed={filters.isAvailableOnly}
              onToggle={() =>
                updateFilters({ ...filters, isAvailableOnly: !filters.isAvailableOnly })
              }
            >
              {passGalleryContent.availableOnlyLabel}
            </ToggleChip>
            <ToggleChip
              isPressed={filters.isFavouritesOnly}
              onToggle={() =>
                updateFilters({ ...filters, isFavouritesOnly: !filters.isFavouritesOnly })
              }
            >
              {passGalleryContent.favouritesOnlyLabel}
              {favouriteDesignNumbers.length > 0 ? (
                <span className="font-mono">({favouriteDesignNumbers.length})</span>
              ) : null}
            </ToggleChip>
            <label className="ml-auto flex h-10 items-center gap-2 text-xs leading-[1.15] font-medium uppercase">
              <span className="text-ink-secondary-small">{passGalleryContent.sortLabel}</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as PassGallerySort)
                  setShownCount(GALLERY_PAGE_SIZE)
                }}
                className="h-10 cursor-pointer rounded-full bg-surface-muted pr-3 pl-4 text-xs font-medium uppercase"
              >
                {passGallerySortOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.value === 'recentlyMinted' && collection === null}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {areFiltersShown ? (
            <div
              id="pass-filters"
              className="flex flex-col gap-6 rounded-panel bg-surface p-5 md:p-6"
            >
              <FilterGroup label={passGalleryContent.templateLabel}>
                {passDesignTables.templates.map((template, templateIndex) => (
                  <ToggleChip
                    key={template.key}
                    isPressed={filters.templateIndexes.includes(templateIndex)}
                    onToggle={() =>
                      updateFilters({
                        ...filters,
                        templateIndexes: toggleEntry(filters.templateIndexes, templateIndex),
                      })
                    }
                  >
                    {template.label}
                  </ToggleChip>
                ))}
              </FilterGroup>
              <FilterGroup label={passGalleryContent.colorFamilyLabel}>
                {passDesignTables.colorFamilies.map((colorFamily, colorFamilyIndex) => (
                  <ToggleChip
                    key={colorFamily.key}
                    isPressed={filters.colorFamilyIndexes.includes(colorFamilyIndex)}
                    onToggle={() =>
                      updateFilters({
                        ...filters,
                        colorFamilyIndexes: toggleEntry(
                          filters.colorFamilyIndexes,
                          colorFamilyIndex,
                        ),
                      })
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-full"
                      style={{ backgroundColor: colorFamily.swatchColor }}
                    />
                    {colorFamily.label}
                  </ToggleChip>
                ))}
              </FilterGroup>
              <FilterGroup label={passGalleryContent.rarityLabel}>
                {PASS_RARITIES.map((rarity: PassRarity) => (
                  <ToggleChip
                    key={rarity}
                    isPressed={filters.rarities.includes(rarity)}
                    onToggle={() =>
                      updateFilters({ ...filters, rarities: toggleEntry(filters.rarities, rarity) })
                    }
                  >
                    {passRarityLabels[rarity]}
                  </ToggleChip>
                ))}
              </FilterGroup>
              <FilterGroup label={passGalleryContent.detailsLabel}>
                {singleTemplate === undefined ? (
                  <p className="text-sm leading-[1.4] text-ink-secondary-small">
                    {passGalleryContent.detailsHint}
                  </p>
                ) : (
                  <div className="flex w-full flex-col gap-3">
                    {singleTemplate.optionSlots.map((optionSlot, slotIndex) => (
                      <div key={optionSlot.key} className="flex flex-col gap-2">
                        <span className="text-sm text-ink-secondary-small">{optionSlot.label}</span>
                        <div className="flex flex-wrap gap-2">
                          {optionSlot.values.map((optionValue, valueIndex) => (
                            <ToggleChip
                              key={optionValue.key}
                              isPressed={(
                                filters.optionValueIndexesBySlot[slotIndex] ?? []
                              ).includes(valueIndex)}
                              onToggle={() =>
                                updateFilters({
                                  ...filters,
                                  optionValueIndexesBySlot: {
                                    ...filters.optionValueIndexesBySlot,
                                    [slotIndex]: toggleEntry(
                                      filters.optionValueIndexesBySlot[slotIndex] ?? [],
                                      valueIndex,
                                    ),
                                  },
                                })
                              }
                            >
                              {optionValue.label}
                            </ToggleChip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </FilterGroup>
              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={() => updateFilters(emptyPassGalleryFilters)}
                  className="min-h-11 self-start text-label font-medium tracking-[0.08em] uppercase underline decoration-hairline underline-offset-4"
                >
                  {passGalleryContent.clearFiltersLabel}
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm leading-[1.4]">
            <p aria-live="polite" className="font-mono">
              {designs.length.toLocaleString('en-US')} {designs.length === 1 ? 'pass' : 'passes'}
            </p>
            {collection === null && requestStatus === 'failed' ? (
              <p className="flex flex-wrap items-center gap-x-2 text-ink-secondary-small">
                {filters.isAvailableOnly
                  ? passGalleryContent.availableOnlyUnknown
                  : passScheduleContent.unavailableLine}
                <button
                  type="button"
                  onClick={retryPassCollection}
                  className="min-h-11 text-ink underline decoration-hairline underline-offset-4"
                >
                  {passScheduleContent.retryLabel}
                </button>
              </p>
            ) : null}
          </div>
        </div>

        {designs.length === 0 ? (
          <EmptyGallery
            isFavouritesOnly={filters.isFavouritesOnly && favouriteDesignNumbers.length === 0}
            onClear={() => updateFilters(emptyPassGalleryFilters)}
          />
        ) : (
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {shownDesigns.map((design, designIndex) => (
              <li key={design.designNumber}>
                <PassCard
                  design={design}
                  availability={readPassAvailability(collection, design.designNumber)}
                  recentMint={findRecentPassMint(collection, design.designNumber)}
                  onOpen={openDesign}
                  isArtEager={designIndex < EAGER_CARD_COUNT}
                />
              </li>
            ))}
          </ul>
        )}

        <div ref={loadMoreRef} className="flex justify-center">
          {shownCount < designs.length ? (
            <button
              type="button"
              onClick={() => setShownCount(shownCount + GALLERY_PAGE_SIZE)}
              className={buildPillClassName('secondary', 'regular')}
            >
              <PillContent label={passGalleryContent.showMoreLabel} />
            </button>
          ) : null}
        </div>
      </section>

      <PassDetailSheet
        designNumber={openDesignNumber}
        onClose={closeSheet}
        onSelectDesign={openDesign}
      />
    </>
  )
}

function toggleEntry<Entry>(entries: readonly Entry[], entry: Entry): Entry[] {
  return entries.includes(entry)
    ? entries.filter((existingEntry) => existingEntry !== entry)
    : [...entries, entry]
}

function ToggleChip({
  isPressed,
  onToggle,
  ariaExpanded,
  ariaControls,
  children,
}: {
  isPressed: boolean
  onToggle: () => void
  ariaExpanded?: boolean
  ariaControls?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={ariaExpanded === undefined ? isPressed : undefined}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      onClick={onToggle}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard ${
        isPressed ? 'bg-ink text-on-dark' : 'bg-surface-muted text-ink active:bg-surface'
      }`}
    >
      {children}
    </button>
  )
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

function EmptyGallery({
  isFavouritesOnly,
  onClear,
}: {
  isFavouritesOnly: boolean
  onClear: () => void
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-panel bg-surface p-6 md:p-[30px]">
      <p className="text-2xl leading-[1.15] tracking-[-0.01em]">
        {isFavouritesOnly
          ? passGalleryContent.emptyFavouritesHeading
          : passGalleryContent.emptyHeading}
      </p>
      {isFavouritesOnly ? (
        <p className="max-w-[30em] text-base leading-[1.4] text-ink-secondary-small">
          {passGalleryContent.emptyFavouritesText}
        </p>
      ) : null}
      <button type="button" onClick={onClear} className={buildPillClassName('primary', 'regular')}>
        <PillContent
          label={
            isFavouritesOnly
              ? passGalleryContent.showAllLabel
              : passGalleryContent.clearFiltersLabel
          }
        />
      </button>
    </div>
  )
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M3 5h12M5 9h8M7.5 13h3" />
    </svg>
  )
}
