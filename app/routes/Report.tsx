import { Form, redirect, useSearchParams } from 'react-router'
import { Button } from '~/components/ui/button'
import { db } from '~/shared/database'
import {
  charts,
  relocation,
  reports,
  sharedReports,
} from '~/shared/database/schema'
import { union } from 'drizzle-orm/pg-core'
import { useState } from 'react'
import { LocationSelector } from '~/components/reports/LocationSelector'
import { FilterSelector } from '~/components/reports/FilterSelector'
import type { Filter } from '~/shared/database/models/chartModels'
import { ChartBuilder } from '~/components/charts/ChartBuilder'
import { buildNetFlowCategoryChart } from '~/shared/database/buildCharts/buildNetFlowCategoryChart'
import { buildTemporalChart } from '~/shared/database/buildCharts/buildTemporalChart'
import { buildCategoryChart } from '~/shared/database/buildCharts/buildCategoryChart'
import { buildTemporalCategoryChart } from '~/shared/database/buildCharts/buildTemporalCategoryChart'
import ChartRenderer from '~/components/charts/ChartRenderer'
import { eq, and } from 'drizzle-orm'
import type { Route } from './+types/Report'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { userSessionContext } from '~/context/userSessionContext'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  ArrowLeftIcon,
  CopyIcon,
  EyeIcon,
  LinkIcon,
  ShareIcon,
  SlidersHorizontalIcon,
} from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { buildSharedReportSnapshot } from '~/lib/buildSharedReportSnapshot'
import { toast } from 'sonner'

export async function loader({ params, request, context }: Route.LoaderArgs) {
  const start = performance.now()

  const userSession = context.get(userSessionContext)
  if (!userSession) throw new Error('Användare saknas')

  const [report] = await db
    .select({
      id: reports.id,
      title: reports.title,
      description: reports.description,
      createdAt: reports.createdAt,
      location: reports.location,
      filters: reports.filters,
      sharedId: sharedReports.id,
    })
    .from(reports)
    .leftJoin(sharedReports, eq(sharedReports.reportId, reports.id))
    .where(
      and(
        eq(reports.id, params.reportId),
        eq(reports.userId, userSession.user.id)
      )
    )
  if (!report) {
    throw new Response('Rapporten hittades inte', { status: 404 })
  }

  const savedCharts = await db
    .select()
    .from(charts)
    .where(eq(charts.reportId, params.reportId))
    .orderBy(charts.id)

  const locations = await union(
    db.selectDistinct({ location: relocation.toLocation }).from(relocation),
    db.selectDistinct({ location: relocation.fromLocation }).from(relocation)
  )

  const allLocations = Array.from(
    new Set(
      locations
        .map((r) => r.location)
        .flatMap((loc) => (Array.isArray(loc) ? loc : [loc]))
        .map((loc) =>
          loc
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        )
    )
  ).sort((a, b) => a.localeCompare(b))

  const filterOptions = {
    locations: allLocations,
    years: [
      2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
    ],
    employeeRanges: [
      '0',
      '1-4',
      '5-9',
      '10-19',
      '20-49',
      '50-99',
      '100-199',
      '200-499',
      '500-999',
      '1000-1499',
      '1500-1999',
      '2000-2999',
      '3000-3999',
    ],
    companyTypes: ['Offentlig sektor', 'Privat sektor', 'Övrigt'],
    industryClusters: [
      'Bank/Finans',
      'Bil/Motor',
      'Bygg',
      'Dagligvaruhandel',
      'Data/IT',
      'Djur/Natur',
      'Energi/Återvinning',
      'Fastighet',
      'HR',
      'Hushållsnära tjänster',
      'Huvudkontorsverksamhet',
      'Infrastruktur',
      'Internationellt',
      'Juridik',
      'Konsult/Kontorstjänster',
      'Kultur/Nöje',
      'Life science',
      'Logistik/Gods',
      'Mat/Dryck/Logi',
      'Media/Reklam/Design',
      'Offentlig sektor',
      'Partihandel',
      'Säkerhet',
      'Sällanköpshandel',
      'Tillverkning',
      'Träning/Sport',
      'Utbildning',
      'Vård',
    ],
  }

  const url = new URL(request.url)
  const searchParams = url.searchParams

  const hasFilters =
    searchParams.has('location') ||
    searchParams.has('years') ||
    searchParams.has('employeeRanges') ||
    searchParams.has('companyTypes') ||
    searchParams.has('industryClusters')

  if (
    !hasFilters &&
    Array.isArray(report.filters) &&
    report.filters.length > 0
  ) {
    if (report.location) {
      searchParams.set('location', report.location)
    }

    for (const filter of report.filters) {
      const values = Array.isArray(filter.value) ? filter.value : [filter.value]

      if (filter.key === 'relocationYear') {
        for (const value of values) {
          searchParams.append('years', value)
        }
      }

      if (filter.key === 'employeeRange') {
        for (const value of values) {
          searchParams.append('employeeRanges', value)
        }
      }

      if (filter.key === 'companyType') {
        for (const value of values) {
          searchParams.append('companyTypes', value)
        }
      }

      if (filter.key === 'industryCluster') {
        for (const value of values) {
          searchParams.append('industryClusters', value)
        }
      }
    }

    return redirect(url.toString())
  }

  const location = searchParams.get('location')?.toLowerCase()
  const years = searchParams.getAll('years').map(Number)
  const employeeRanges = searchParams.getAll('employeeRanges')
  const companyTypes = searchParams.getAll('companyTypes')
  const industryClusters = searchParams.getAll('industryClusters')

  const filters: Filter[] = []
  if (years.length)
    filters.push({ key: 'relocationYear', operator: 'in', value: years })
  if (employeeRanges.length)
    filters.push({
      key: 'employeeRange',
      operator: 'in',
      value: employeeRanges,
    })
  if (companyTypes.length)
    filters.push({ key: 'companyType', operator: 'in', value: companyTypes })
  if (industryClusters.length)
    filters.push({
      key: 'industryCluster',
      operator: 'in',
      value: industryClusters,
    })

  const buildCharts = await Promise.all(
    savedCharts.map(async (chart) => {
      const config = chart.config
      if (config.type === 'netflow+category') {
        const buildChart = await buildNetFlowCategoryChart(
          location,
          filters,
          config
        )
        return { id: chart.id, ...buildChart, config }
      }

      if (config.type === 'temporal') {
        const buildChart = await buildTemporalChart(location, filters, config)
        return { id: chart.id, ...buildChart, config }
      }

      if (config.type === 'category') {
        const buildChart = await buildCategoryChart(location, filters, config)
        return { id: chart.id, ...buildChart, config }
      }

      if (config.type === 'temporal+category') {
        const buildChart = await buildTemporalCategoryChart(
          location,
          filters,
          config
        )
        return { id: chart.id, ...buildChart, config }
      }

      return null
    })
  )

  const end = performance.now()
  console.log(`Loader time: ${(end - start).toFixed(2)} ms`)

  return {
    report,
    filterOptions,
    filters,
    charts: buildCharts,
  }
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const userSession = context.get(userSessionContext)
  if (!userSession) throw new Error('Användare saknas')

  const formData = await request.formData()
  const reportId = params.reportId
  const [report] = await db
    .select()
    .from(reports)
    .where(
      and(eq(reports.id, reportId), eq(reports.userId, userSession.user.id))
    )

  if (!report) {
    throw new Response('Du har inte behörighet att ändra denna rapport', {
      status: 403,
    })
  }
  const intent = formData.get('intent')

  if (intent === 'addChart') {
    const config = {
      type: formData.get('type'),
      title: formData.get('chartTitle'),
      description: formData.get('chartDescription'),
      measure: formData.get('measure'),
      category: formData.get('category'),
      excludeSelectedArea: formData.get('excludeSelectedArea') === 'on',
      maxNumberOfCategories: Number(formData.get('maxNumberOfCategories')),
      combineRemainingCategories:
        formData.get('combineRemainingCategories') === 'on',
      chartType: formData.get('chartType'),
      measureCalculation: formData.get('measureCalculation'),
      uiSettings: {
        containerSize: formData.get('containerSize'),
        legendPlacement: formData.get('legendPlacement'),
        tablePlacement: formData.get('tablePlacement'),
      },
    }

    await db.insert(charts).values({
      reportId,
      config,
    })

    return null
  }

  if (intent === 'updateChart') {
    const chartId = formData.get('id') as string

    const config = {
      type: formData.get('type'),
      title: formData.get('chartTitle'),
      description: formData.get('chartDescription'),
      measure: formData.get('measure'),
      category: formData.get('category'),
      excludeSelectedArea: formData.get('excludeSelectedArea') === 'on',
      maxNumberOfCategories: Number(formData.get('maxNumberOfCategories')),
      combineRemainingCategories:
        formData.get('combineRemainingCategories') === 'on',
      chartType: formData.get('chartType'),
      measureCalculation: formData.get('measureCalculation'),
      uiSettings: {
        containerSize: formData.get('containerSize'),
        legendPlacement: formData.get('legendPlacement'),
        tablePlacement: formData.get('tablePlacement'),
      },
    }

    await db.update(charts).set({ config }).where(eq(charts.id, chartId))

    return null
  }

  if (intent === 'duplicateChart') {
    const chartId = formData.get('id') as string

    const [chart] = await db.select().from(charts).where(eq(charts.id, chartId))

    if (!chart) {
      throw new Response('Diagrammet finns inte', { status: 404 })
    }

    await db.insert(charts).values({
      reportId,
      config: {
        ...(chart.config as any),
      },
    })

    return null
  }

  if (intent === 'deleteChart') {
    const chartId = formData.get('id') as string

    await db.delete(charts).where(eq(charts.id, chartId))

    return null
  }

  if (intent === 'updateChartTitle') {
    const chartId = formData.get('id') as string
    const title = formData.get('chartTitle') as string

    const [chart] = await db.select().from(charts).where(eq(charts.id, chartId))

    const updatedConfig = {
      ...chart.config,
      title,
    }

    await db
      .update(charts)
      .set({ config: updatedConfig })
      .where(eq(charts.id, chartId))

    return null
  }

  if (intent === 'updateChartDescription') {
    const chartId = formData.get('id') as string
    const description = formData.get('chartDescription') as string

    const [chart] = await db.select().from(charts).where(eq(charts.id, chartId))

    const updatedConfig = {
      ...chart.config,
      description,
    }

    await db
      .update(charts)
      .set({ config: updatedConfig })
      .where(eq(charts.id, chartId))

    return null
  }

  if (intent === 'updateReportTitle') {
    const title = formData.get('reportTitle') as string

    await db.update(reports).set({ title }).where(eq(reports.id, reportId))

    return null
  }

  if (intent === 'updateReportDescription') {
    const description = formData.get('reportDescription') as string

    await db
      .update(reports)
      .set({ description })
      .where(eq(reports.id, reportId))

    return null
  }

  if (intent === 'saveReport') {
    const location = formData.get('location') as string | null
    const filters = formData.get('filters') as string | null

    const parsedFilters = filters ? JSON.parse(filters) : []

    await db
      .update(reports)
      .set({ location, filters: parsedFilters })
      .where(eq(reports.id, reportId))

    const existing = await db
      .select()
      .from(sharedReports)
      .where(eq(sharedReports.reportId, reportId))

    if (existing.length === 0) {
      return redirect(`/rapporter`)
    }

    const snapshot = await buildSharedReportSnapshot(reportId)

    await db
      .update(sharedReports)
      .set({
        title: snapshot.report.title,
        description: snapshot.report.description,
        charts: snapshot.charts,
      })
      .where(eq(sharedReports.reportId, reportId))

    return redirect(`/rapporter`)
  }

  if (intent === 'saveAndViewReport') {
    const location = formData.get('location') as string | null
    const filters = formData.get('filters') as string | null

    const parsedFilters = filters ? JSON.parse(filters) : []

    await db
      .update(reports)
      .set({ location, filters: parsedFilters })
      .where(eq(reports.id, reportId))

    const existing = await db
      .select()
      .from(sharedReports)
      .where(eq(sharedReports.reportId, reportId))

    if (existing.length === 0) {
      return redirect(`/visa-rapport/${reportId}`)
    }

    const snapshot = await buildSharedReportSnapshot(reportId)

    await db
      .update(sharedReports)
      .set({
        title: snapshot.report.title,
        description: snapshot.report.description,
        charts: snapshot.charts,
      })
      .where(eq(sharedReports.reportId, reportId))

    return redirect(`/visa-rapport/${reportId}`)
  }

  if (intent === 'saveAndShareReport') {
    const location = formData.get('location') as string | null
    const filters = formData.get('filters') as string | null

    const parsedFilters = filters ? JSON.parse(filters) : []

    await db
      .update(reports)
      .set({ location, filters: parsedFilters })
      .where(eq(reports.id, reportId))

    const snapshot = await buildSharedReportSnapshot(reportId)

    const existing = await db
      .select()
      .from(sharedReports)
      .where(eq(sharedReports.reportId, reportId))

    if (existing.length > 0) {
      const [updated] = await db
        .update(sharedReports)
        .set({
          title: snapshot.report.title,
          description: snapshot.report.description,
          charts: snapshot.charts,
        })
        .where(eq(sharedReports.reportId, reportId))
        .returning()

      return { sharedReportId: updated.id }
    }

    const [sharedReport] = await db
      .insert(sharedReports)
      .values({
        title: snapshot.report.title,
        description: snapshot.report.description,
        reportId,
        charts: snapshot.charts,
      })
      .returning()

    return { sharedReportId: sharedReport.id }
  }

  return null
}

export default function Report({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams()
  const { report, filterOptions, filters, charts } = loaderData
  const sharedReportId =
    actionData?.sharedReportId ?? loaderData.report.sharedId ?? ''
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [isEditingReportTitle, setIsEditingReportTitle] = useState(false)
  const [isEditingReportDescription, setIsEditingReportDescription] =
    useState(false)
  const [open, setOpen] = useState(false)

  const sharedReportUrl =
    typeof window !== 'undefined' && sharedReportId
      ? `${window.location.origin}/delad-rapport/${sharedReportId}`
      : ''

  return (
    <div className="flex flex-col w-full cursor-default">
      <header className="border-b p-6 space-y-6">
        <div className="pb-4 border-b flex items-start justify-between gap-4">
          <div className="flex items-center gap-6">
            <Form method="post">
              <input type="hidden" name="location" value={location ?? ''} />
              <input
                type="hidden"
                name="filters"
                value={JSON.stringify(filters)}
              />
              <Button
                type="submit"
                name="intent"
                value="saveReport"
                variant="outline"
                className="transition"
              >
                <ArrowLeftIcon className="size-4 mr-2" />
                Tillbaka
              </Button>
            </Form>

            {isEditingReportTitle ? (
              <Form
                method="post"
                onSubmit={() => setIsEditingReportTitle(false)}
              >
                <Input
                  autoFocus
                  type="text"
                  name="reportTitle"
                  defaultValue={report.title}
                  className="w-full font-semibold !text-xl border-none shadow-none rounded-sm bg-primary/5 px-2 py-0.5 focus-visible:ring-0"
                  onBlur={(e) => {
                    const newValue = e.target.value.trim()
                    if (newValue !== report.title) {
                      e.target.form?.requestSubmit()
                    }
                    setIsEditingReportTitle(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const newValue = e.currentTarget.value.trim()
                      if (newValue !== report.title) {
                        e.currentTarget.form?.requestSubmit()
                      }
                      setIsEditingReportTitle(false)
                    }
                    if (e.key === 'Escape') {
                      setIsEditingReportTitle(false)
                    }
                  }}
                />
                <input type="hidden" name="intent" value="updateReportTitle" />
              </Form>
            ) : (
              <h1
                className="text-xl font-semibold cursor-text rounded-sm transition hover:bg-primary/5"
                onClick={() => setIsEditingReportTitle(true)}
              >
                {report.title?.trim().length > 0
                  ? report.title
                  : 'Lägg till titel...'}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              {sharedReportId ? (
                <DialogTrigger>
                  <Form method="post">
                    <input
                      type="hidden"
                      name="location"
                      value={location ?? ''}
                    />
                    <input
                      type="hidden"
                      name="filters"
                      value={JSON.stringify(filters)}
                    />
                    <Button
                      type="submit"
                      name="intent"
                      value="saveAndShareReport"
                      className="transition"
                    >
                      <LinkIcon className="size-4 mr-2" />
                      Visa delad länk
                    </Button>
                  </Form>
                </DialogTrigger>
              ) : (
                <DialogTrigger>
                  <Form method="post">
                    <input
                      type="hidden"
                      name="location"
                      value={location ?? ''}
                    />
                    <input
                      type="hidden"
                      name="filters"
                      value={JSON.stringify(filters)}
                    />
                    <Button
                      type="submit"
                      name="intent"
                      value="saveAndShareReport"
                      className="transition"
                    >
                      <ShareIcon className="size-4 mr-2" />
                      Dela rapport
                    </Button>
                  </Form>
                </DialogTrigger>
              )}
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Delad länk</DialogTitle>
                  <DialogDescription>
                    Alla med denna länk kan se rapporten.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2">
                  <Input readOnly value={sharedReportUrl} className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(sharedReportUrl)
                      toast.success('Länk kopierad!', {
                        description: 'Länken har kopierats till urklipp.',
                        position: 'top-right',
                      })
                    }}
                  >
                    <CopyIcon className="size-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Form method="post">
              <input type="hidden" name="location" value={location ?? ''} />
              <input
                type="hidden"
                name="filters"
                value={JSON.stringify(filters)}
              />
              <Button
                type="submit"
                name="intent"
                value="saveAndViewReport"
                variant="outline"
                className="transition"
              >
                <EyeIcon className="size-4 mr-2" />
                Förhandsgranska rapport
              </Button>
            </Form>
          </div>
        </div>

        <div className="flex items-start gap-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="font-medium">Filter</h2>
              <Dialog>
                <DialogTrigger>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <SlidersHorizontalIcon className="size-4" />
                    Filter
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Filter</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Välj filter för rapporten.
                    </DialogDescription>
                  </DialogHeader>

                  <Form method="get" className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Område</h3>
                      <LocationSelector
                        locations={filterOptions.locations}
                        value={location}
                        onChange={setLocation}
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Flyttår</h3>
                      <FilterSelector
                        name="years"
                        items={filterOptions.years}
                        searchParams={searchParams}
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Antal anställda</h3>
                      <FilterSelector
                        name="employeeRanges"
                        items={filterOptions.employeeRanges}
                        searchParams={searchParams}
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Företagsform</h3>
                      <FilterSelector
                        name="companyTypes"
                        items={filterOptions.companyTypes}
                        searchParams={searchParams}
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Kluster</h3>
                      <FilterSelector
                        name="industryClusters"
                        items={filterOptions.industryClusters}
                        searchParams={searchParams}
                      />
                    </div>
                    <DialogClose className="w-full block">
                      <Button type="submit" className="w-full">
                        Filtrera
                      </Button>
                    </DialogClose>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Område:</span>
                <Badge variant="secondary">{location || 'Alla'}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Flyttår:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.find((f) => f.key === 'relocationYear')?.value
                    ?.length ? (
                    filters
                      .find((f) => f.key === 'relocationYear')!
                      .value.map((v) => (
                        <Badge key={`year-${v}`} variant="secondary">
                          {v}
                        </Badge>
                      ))
                  ) : (
                    <Badge variant="secondary">Alla</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Antal anställda:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.find((f) => f.key === 'employeeRange')?.value
                    ?.length ? (
                    filters
                      .find((f) => f.key === 'employeeRange')!
                      .value.map((v) => (
                        <Badge key={`emp-${v}`} variant="secondary">
                          {v}
                        </Badge>
                      ))
                  ) : (
                    <Badge variant="secondary">Alla</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Företagsform:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.find((f) => f.key === 'companyType')?.value
                    ?.length ? (
                    filters
                      .find((f) => f.key === 'companyType')!
                      .value.map((v) => (
                        <Badge key={`type-${v}`} variant="secondary">
                          {v}
                        </Badge>
                      ))
                  ) : (
                    <Badge variant="secondary">Alla</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Kluster:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.find((f) => f.key === 'industryCluster')?.value
                    ?.length ? (
                    filters
                      .find((f) => f.key === 'industryCluster')!
                      .value.map((v) => (
                        <Badge key={`cluster-${v}`} variant="secondary">
                          {v}
                        </Badge>
                      ))
                  ) : (
                    <Badge variant="secondary">Alla</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="font-medium">Beskrivning</h2>
          {isEditingReportDescription ? (
            <Form
              method="post"
              onSubmit={() => setIsEditingReportDescription(false)}
            >
              <Textarea
                autoFocus
                name="reportDescription"
                defaultValue={report.description}
                className="w-full border-none shadow-none bg-primary/5 rounded-sm px-2 py-1 focus-visible:ring-0 resize-none !text-base text-muted-foreground"
                onBlur={(e) => {
                  const newValue = e.target.value.trim()
                  if (newValue !== report.description) {
                    e.target.form?.requestSubmit()
                  }
                  setIsEditingReportDescription(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.shiftKey) {
                    return
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const newValue = e.currentTarget.value.trim()
                    if (newValue !== report.description) {
                      e.currentTarget.form?.requestSubmit()
                    }
                    setIsEditingReportDescription(false)
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    setIsEditingReportDescription(false)
                  }
                }}
              />
              <input
                type="hidden"
                name="intent"
                value="updateReportDescription"
              />
            </Form>
          ) : (
            <p
              className="text-muted-foreground whitespace-pre-wrap cursor-text rounded-sm transition hover:bg-primary/5"
              onClick={() => setIsEditingReportDescription(true)}
            >
              {report.description || 'Lägg till beskrivning...'}
            </p>
          )}
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="flex justify-start">
          <ChartBuilder />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {charts.map((chart) => (
            <ChartRenderer key={chart.id} {...chart} readOnly={false} />
          ))}
        </div>
      </main>
    </div>
  )
}
