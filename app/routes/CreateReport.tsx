import { Form, redirect, useSearchParams } from 'react-router'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { db } from '~/shared/database'
import { relocation, savedCharts } from '~/shared/database/schema'
import { union } from 'drizzle-orm/pg-core'
import { useState } from 'react'
import type { Route } from './+types/CreateReport'
import { LocationSelector } from '~/components/charts/LocationSelector'
import { FilterSelector } from '~/components/charts/FilterSelector'
import type {
  ChartModel,
  Filter,
  NetFlowChartConfig,
} from '~/shared/database/models/chartModels'
import { buildNetFlowChart } from '~/shared/database/buildCharts/buildNetFlowChart'
import { NetFlowChart } from '~/components/charts/NetFlowChart'
import { ChartBuilder } from '~/components/charts/ChartBuilder'
import { buildTemporalChart } from '~/shared/database/buildCharts/buildTemporalChart'
import { buildCategoryChart } from '~/shared/database/buildCharts/buildCategoryChart'
import { buildTemporalCategoryChart } from '~/shared/database/buildCharts/buildTemporalCategoryChart'
import ChartRenderer from '~/components/charts/ChartRenderer'
import { eq } from 'drizzle-orm'

export async function loader({ request }: Route.LoaderArgs) {
  const start = performance.now()

  const locations = await union(
    db
      .selectDistinct({
        location: relocation.toLocation,
      })
      .from(relocation),
    db
      .selectDistinct({
        location: relocation.fromLocation,
      })
      .from(relocation)
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

  const netflowConfig: NetFlowChartConfig = {
    type: 'netflow',
    title: 'Netflow chart',
  }

  const result = await buildNetFlowChart(location, filters, netflowConfig)

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
    uiSettings: {
      containerSize,
      legendPlacement,
      tablePlacement,
    },
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

  const savedChart = await db.select().from(savedCharts).orderBy(savedCharts.id)

  const charts = await Promise.all(
    savedChart.map(async (chart) => {
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
    filterOptions,
    filters,
    result,
    preview,
    charts,
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
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

    await db.insert(savedCharts).values({ config })

    chartSettingParams.forEach((p) => url.searchParams.delete(p))
    return redirect(url.toString())
  }

  if (intent === 'updateChart') {
    const chartId = formData.get('id')
    if (typeof chartId !== 'string') {
      throw new Error('Invalid chart id')
    }

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

    await db
      .update(savedCharts)
      .set({ config })
      .where(eq(savedCharts.id, chartId))

    chartSettingParams.forEach((p) => url.searchParams.delete(p))
    return redirect(url.toString())
  }

  if (intent === 'deleteChart') {
    const chartId = formData.get('id')

    if (typeof chartId === 'string') {
      return await db.delete(savedCharts).where(eq(savedCharts.id, chartId))
    }
  }

  return null
}

export default function CreateReport({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams()
  const { filterOptions, result, preview, charts } = loaderData
  const [location, setLocation] = useState(searchParams.get('location') ?? '')

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
      <div className="flex-1 p-6">
        <ChartBuilder chart={preview} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <NetFlowChart data={result} />
          {charts.map((chart) => (
            <ChartRenderer key={chart?.id} {...chart} />
          ))}
        </div>
      </div>
    </div>
  )
}
