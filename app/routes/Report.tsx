import { Form, redirect, useSearchParams } from 'react-router'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { db } from '~/shared/database'
import { charts, relocation, reports } from '~/shared/database/schema'
import { union } from 'drizzle-orm/pg-core'
import { useState } from 'react'
import { LocationSelector } from '~/components/charts/LocationSelector'
import { FilterSelector } from '~/components/charts/FilterSelector'
import type { ChartModel, Filter } from '~/shared/database/models/chartModels'
import { ChartBuilder } from '~/components/charts/ChartBuilder'
import { buildTemporalChart } from '~/shared/database/buildCharts/buildTemporalChart'
import { buildCategoryChart } from '~/shared/database/buildCharts/buildCategoryChart'
import { buildTemporalCategoryChart } from '~/shared/database/buildCharts/buildTemporalCategoryChart'
import ChartRenderer from '~/components/charts/ChartRenderer'
import { eq } from 'drizzle-orm'
import type { Route } from './+types/Report'
import { Input } from '~/components/ui/input'
import { CircleXIcon, SaveIcon, SquarePenIcon, Trash2Icon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'

export async function loader({ params, request }: Route.LoaderArgs) {
  const start = performance.now()

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, params.reportId))

  if (!report) throw new Response('Not found', { status: 404 })

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

  const type = searchParams.get('type')
  const measure = searchParams.get('measure')
  const category = searchParams.get('category')
  const maxNumberOfCategories = searchParams.get('maxNumberOfCategories')
  const combineRemainingCategories = searchParams.get(
    'combineRemainingCategories'
  )
  const chartType = searchParams.get('chartType')
  const measureCalculation = searchParams.get('measureCalculation')
  const containerSize = searchParams.get('containerSize')
  const legendPlacement = searchParams.get('legendPlacement')
  const tablePlacement = searchParams.get('tablePlacement')

  const chartConfig = {
    type,
    measure,
    uiSettings: { containerSize, legendPlacement, tablePlacement },
    category,
    maxNumberOfCategories: maxNumberOfCategories
      ? Number(maxNumberOfCategories)
      : null,
    combineRemainingCategories: combineRemainingCategories === 'on',
    chartType,
    measureCalculation,
  }

  let preview: ChartModel | null = null

  if (type === 'temporal' && measure) {
    preview = await buildTemporalChart(location, filters, chartConfig)
  }

  if (type === 'category' && measure && category && chartType) {
    preview = await buildCategoryChart(location, filters, chartConfig)
  }

  if (
    type === 'temporal+category' &&
    measure &&
    category &&
    maxNumberOfCategories &&
    measureCalculation
  ) {
    preview = await buildTemporalCategoryChart(location, filters, chartConfig)
  }

  const buildCharts = await Promise.all(
    savedCharts.map(async (chart) => {
      const config = chart.config

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
    preview,
    charts: buildCharts,
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData()
  const reportId = params.reportId
  const intent = formData.get('intent')
  const chartSettingParams = [
    'type',
    'measure',
    'category',
    'maxNumberOfCategories',
    'combineRemainingCategories',
    'chartType',
    'measureCalculation',
  ]
  let url = new URL(request.url)

  if (intent === 'addChart') {
    const config = {
      type: formData.get('type'),
      measure: formData.get('measure'),
      category: formData.get('category'),
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

    chartSettingParams.forEach((p) => url.searchParams.delete(p))
    return redirect(url.toString())
  }

  if (intent === 'updateChart') {
    const chartId = formData.get('id') as string

    const config = {
      type: formData.get('type'),
      measure: formData.get('measure'),
      category: formData.get('category'),
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

    chartSettingParams.forEach((p) => url.searchParams.delete(p))
    return redirect(url.toString())
  }

  if (intent === 'deleteChart') {
    const chartId = formData.get('id') as string

    return await db.delete(charts).where(eq(charts.id, chartId))
  }

  if (intent === 'updateTitle') {
    const title = formData.get('title') as string

    await db.update(reports).set({ title }).where(eq(reports.id, reportId))

    return redirect(url.toString())
  }

  if (intent === 'deleteReport') {
    await db.delete(reports).where(eq(reports.id, reportId))
    return redirect(`/rapporter`)
  }

  if (intent === 'saveReport') {
    const location = formData.get('location') as string | null
    const filters = formData.get('filters') as string | null

    const parsedFilters = filters ? JSON.parse(filters) : []

    await db
      .update(reports)
      .set({ location, filters: parsedFilters })
      .where(eq(reports.id, reportId))

    return redirect(`/rapporter`)
  }

  return null
}

export default function CreateReport({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams()
  const { report, filterOptions, filters, preview, charts } = loaderData
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  return (
    <div className="flex">
      <aside className="w-75 border-r p-4">
        <Form method="get" className="flex flex-col">
          <Accordion type="multiple" className="space-y-4">
            <AccordionItem value="location">
              <AccordionTrigger className="pr-4">Område</AccordionTrigger>
              <AccordionContent>
                <LocationSelector
                  locations={filterOptions.locations}
                  value={location}
                  onChange={setLocation}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="years">
              <AccordionTrigger className="pr-4">Flyttår</AccordionTrigger>
              <AccordionContent>
                <FilterSelector
                  name="years"
                  items={filterOptions.years}
                  searchParams={searchParams}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="employeeRanges">
              <AccordionTrigger className="pr-4">
                Antal anställda
              </AccordionTrigger>
              <AccordionContent>
                <FilterSelector
                  name="employeeRanges"
                  items={filterOptions.employeeRanges}
                  searchParams={searchParams}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="companyTypes">
              <AccordionTrigger className="pr-4">Företagsform</AccordionTrigger>
              <AccordionContent>
                <FilterSelector
                  name="companyTypes"
                  items={filterOptions.companyTypes}
                  searchParams={searchParams}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="industryClusters">
              <AccordionTrigger className="pr-4">Kluster</AccordionTrigger>
              <AccordionContent>
                <FilterSelector
                  name="industryClusters"
                  items={filterOptions.industryClusters}
                  searchParams={searchParams}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Button type="submit" className="mt-4 w-full">
            Filtrera
          </Button>
        </Form>
      </aside>

      <div className="flex-1 p-6 space-y-6">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <Form
                method="post"
                className="flex items-center gap-2"
                onSubmit={() => setIsEditingTitle(false)}
              >
                <Input
                  type="text"
                  name="title"
                  defaultValue={report.title}
                  className="w-full"
                />
                <Button
                  type="submit"
                  name="intent"
                  value="updateTitle"
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  <SaveIcon className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-red-500 transition"
                  onClick={() => setIsEditingTitle(false)}
                >
                  <CircleXIcon className="size-5" />
                </Button>
              </Form>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{report.title}</h1>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary transition"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <SquarePenIcon className="size-5" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center">
              <ChartBuilder chart={preview} />
            </div>

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
                variant="ghost"
                className="text-muted-foreground hover:text-green-700 transition"
              >
                <SaveIcon className="size-5" />
              </Button>
            </Form>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2Icon className="size-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                    <Trash2Icon />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Radera rapport?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Detta går inte att ångra. Hela rapporten och alla dess
                    diagram tas bort permanent.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel variant="outline">
                    Avbryt
                  </AlertDialogCancel>
                  <AlertDialogAction variant="destructive" asChild>
                    <Form method="post">
                      <input type="hidden" name="intent" value="deleteReport" />
                      <button type="submit">Radera</button>
                    </Form>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {charts.map((chart) => (
            <ChartRenderer key={chart.id} {...chart} />
          ))}
        </div>
      </div>
    </div>
  )
}
