import { Form, useSearchParams } from 'react-router'
import type { Route } from './+types/Relocations'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { Bar, CartesianGrid, Cell, ComposedChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { relocation } from '~/shared/database/schema'
import { and, arrayContains, asc, count, inArray, sql } from 'drizzle-orm'
import { db } from '~/shared/database'
import type { Diagram, DiagramGenerator } from '~/models/diagramModels'

function addChartConfig(diagram: Diagram) {
  const chartConfig = {
    ...diagram.axis,
  }
  for (const part of diagram.parts) {
    // @ts-ignore-line
    chartConfig[part.dataKey] = part
  }
  return { ...diagram, chartConfig }
}

export async function loader({ request }: Route.LoaderArgs) {
  const filterOptions = {
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
    companyTypes: ['Offentlig sektor', 'Övrigt', 'Privat sektor'],
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
    locations: ['Eskilstuna', 'Stockholm', 'Göteborg', 'Örebro', 'Gävle'],
  }

  const url = new URL(request.url)
  const searchParams = url.searchParams

  const years = searchParams.getAll('years').map(Number)
  const employeeRange = searchParams.getAll('employeeRange').map(String)
  const companyTypes = searchParams.getAll('companyTypes').map(String)
  const industryClusters = searchParams.getAll('industryClusters').map(String)
  const location = searchParams.get('location')?.toLowerCase()
  //if (!location) throw Error('No location specified')

  const filters = {
    years,
    employeeRange,
    companyTypes,
    industryClusters,
    location,
  }

  const diagramGenerators: DiagramGenerator[] = [
    //Flyttar per år till location
    async (filters) => {
      const where = and(
        filters.years?.length
          ? inArray(relocation.relocationYear, filters.years)
          : undefined,
        filters.employeeRange?.length
          ? inArray(relocation.employeeRange, filters.employeeRange)
          : undefined,
        filters.companyTypes?.length
          ? inArray(relocation.companyType, filters.companyTypes)
          : undefined,
        filters.industryClusters?.length
          ? inArray(relocation.industryCluster, filters.industryClusters)
          : undefined,
        filters.location?.length
          ? arrayContains(relocation.toLocation, [filters.location])
          : undefined
      )

      const result = await db
        .select({ key: relocation.relocationYear, value: count() })
        .from(relocation)
        .where(where)
        .groupBy(relocation.relocationYear)
        .orderBy(asc(relocation.relocationYear))

      console.log('Result diagram till location:', result)

      const chartData = result.map((r) => {
        return {
          year: r.key as number,
          relocations: r.value,
        }
      })

      const diagram: Diagram = {
        title: `Flyttar per år till ${location}`,
        type: 'composed',
        axis: {
          x: { label: 'År', dataKey: 'year' },
          y: { label: 'Antal flyttar' },
        },
        parts: [
          {
            type: 'bar',
            label: `Till ${location}`,
            dataKey: 'relocations',
            color: 'var(--chart-1)',
          },
        ],
        chartData,
      }

      console.log('Diagram till: ', diagram)
      return diagram
    },
    //Flyttar per år från location
    async (filters) => {
      const where = and(
        filters.years?.length
          ? inArray(relocation.relocationYear, filters.years)
          : undefined,
        filters.employeeRange?.length
          ? inArray(relocation.employeeRange, filters.employeeRange)
          : undefined,
        filters.companyTypes?.length
          ? inArray(relocation.companyType, filters.companyTypes)
          : undefined,
        filters.industryClusters?.length
          ? inArray(relocation.industryCluster, filters.industryClusters)
          : undefined,
        filters.location?.length
          ? arrayContains(relocation.fromLocation, [filters.location])
          : undefined
      )

      const result = await db
        .select({ key: relocation.relocationYear, value: count() })
        .from(relocation)
        .where(where)
        .groupBy(relocation.relocationYear)
        .orderBy(asc(relocation.relocationYear))

      console.log('Result diagram från location:', result)

      const chartData = result.map((r) => {
        return {
          year: r.key as number,
          relocations: r.value,
        }
      })

      const diagram: Diagram = {
        title: `Flyttar per år från ${location}`,
        type: 'composed',
        axis: {
          x: { label: 'År', dataKey: 'year' },
          y: { label: 'Antal flyttar' },
        },
        parts: [
          {
            type: 'bar',
            label: `Från ${location}`,
            dataKey: 'relocations',
            color: 'var(--chart-1)',
          },
        ],
        chartData,
      }

      console.log('Diagram från: ', diagram)
      return diagram
    },
    //Nettoflyttar per år
    async (filters) => {
      const whereTo = and(
        filters.years?.length
          ? inArray(relocation.relocationYear, filters.years)
          : undefined,
        filters.employeeRange?.length
          ? inArray(relocation.employeeRange, filters.employeeRange)
          : undefined,
        filters.companyTypes?.length
          ? inArray(relocation.companyType, filters.companyTypes)
          : undefined,
        filters.industryClusters?.length
          ? inArray(relocation.industryCluster, filters.industryClusters)
          : undefined,
        filters.location?.length
          ? arrayContains(relocation.toLocation, [filters.location])
          : undefined
      )

      const whereFrom = and(
        filters.years?.length
          ? inArray(relocation.relocationYear, filters.years)
          : undefined,
        filters.employeeRange?.length
          ? inArray(relocation.employeeRange, filters.employeeRange)
          : undefined,
        filters.companyTypes?.length
          ? inArray(relocation.companyType, filters.companyTypes)
          : undefined,
        filters.industryClusters?.length
          ? inArray(relocation.industryCluster, filters.industryClusters)
          : undefined,
        filters.location?.length
          ? arrayContains(relocation.fromLocation, [filters.location])
          : undefined
      )

      const resultTo = await db
        .select({ keyTo: relocation.relocationYear, valueTo: count() })
        .from(relocation)
        .where(whereTo)
        .groupBy(relocation.relocationYear)
        .orderBy(asc(relocation.relocationYear))

      const resultFrom = await db
        .select({ keyFrom: relocation.relocationYear, valueFrom: count() })
        .from(relocation)
        .where(whereFrom)
        .groupBy(relocation.relocationYear)
        .orderBy(asc(relocation.relocationYear))

      console.log('Result diagram nettoflyttar per år:', resultTo, resultFrom)

      const chartData = resultTo.map((r) => {
        const year = r.keyTo as number
        const toCount = r.valueTo
        const fromCount =
          resultFrom.find((f) => f.keyFrom === r.keyTo)?.valueFrom ?? 0
        return {
          year,
          toCount,
          fromCount,
          diffCount: toCount - fromCount,
        }
      })

      const diagram: Diagram = {
        title: `Nettoflyttar per år ${filters.location}`,
        type: 'composed',
        axis: {
          x: { label: 'År', dataKey: 'year' },
          y: { label: 'Antal flyttar' },
        },
        parts: [
          {
            type: 'bar',
            dataKey: 'toCount',
            label: `Till ${filters.location}`,
            color: 'var(--chart-2)',
          },
          {
            type: 'bar',
            dataKey: 'fromCount',
            label: `Från ${filters.location}`,
            color: 'var(--chart-1)',
          },
          {
            type: 'diffbar',
            dataKey: 'diffCount',
            label: `Diff ${filters.location}`,
            positiveColor: 'green',
            negativeColor: 'red',
          },
        ],
        chartData,
      }

      console.log('Diagram nettoflyttar per år: ', diagram)

      return diagram
    },
    //Nettoflyttar totalt
    async (filters) => {
      const whereTo = and(
        filters.years?.length
          ? inArray(relocation.relocationYear, filters.years)
          : undefined,
        filters.employeeRange?.length
          ? inArray(relocation.employeeRange, filters.employeeRange)
          : undefined,
        filters.companyTypes?.length
          ? inArray(relocation.companyType, filters.companyTypes)
          : undefined,
        filters.industryClusters?.length
          ? inArray(relocation.industryCluster, filters.industryClusters)
          : undefined,
        filters.location?.length
          ? arrayContains(relocation.toLocation, [filters.location])
          : undefined
      )

      const whereFrom = and(
        filters.years?.length
          ? inArray(relocation.relocationYear, filters.years)
          : undefined,
        filters.employeeRange?.length
          ? inArray(relocation.employeeRange, filters.employeeRange)
          : undefined,
        filters.companyTypes?.length
          ? inArray(relocation.companyType, filters.companyTypes)
          : undefined,
        filters.industryClusters?.length
          ? inArray(relocation.industryCluster, filters.industryClusters)
          : undefined,
        filters.location?.length
          ? arrayContains(relocation.fromLocation, [filters.location])
          : undefined
      )

      const resultTo = await db
        .select({ valueTo: count() })
        .from(relocation)
        .where(whereTo)

      const resultFrom = await db
        .select({ valueFrom: count() })
        .from(relocation)
        .where(whereFrom)

      console.log('Result diagram nettoflyttar totalt:', resultTo, resultFrom)

      const toCount = resultTo[0]?.valueTo ?? 0
      const fromCount = resultFrom[0]?.valueFrom ?? 0
      const diffCount = toCount - fromCount

      const chartData = [
        {
          location: filters.location,
          toCount,
          fromCount,
          diffCount,
        },
      ]

      const diagram: Diagram = {
        title: `Nettoflyttar totalt ${filters.location}`,
        type: 'composed',
        axis: {
          x: { label: 'Plats', dataKey: 'location' },
          y: { label: 'Antal flyttar' },
        },
        parts: [
          {
            type: 'bar',
            dataKey: 'toCount',
            label: `Till ${filters.location}`,
            color: 'var(--chart-2)',
          },
          {
            type: 'bar',
            dataKey: 'fromCount',
            label: `Från ${filters.location}`,
            color: 'var(--chart-1)',
          },
          {
            type: 'diffbar',
            dataKey: 'diffCount',
            label: `Diff ${filters.location}`,
            positiveColor: 'green',
            negativeColor: 'red',
          },
        ],
        chartData,
      }

      console.log('Diagram nettoflyttar totalt: ', diagram)

      return diagram
    },
    //Storlek på inflyttade bolag
    async (filters) => {
      const where = and(
        filters.years?.length
          ? inArray(relocation.relocationYear, filters.years)
          : undefined,
        filters.employeeRange?.length
          ? inArray(relocation.employeeRange, filters.employeeRange)
          : undefined,
        filters.companyTypes?.length
          ? inArray(relocation.companyType, filters.companyTypes)
          : undefined,
        filters.industryClusters?.length
          ? inArray(relocation.industryCluster, filters.industryClusters)
          : undefined,
        filters.location?.length
          ? arrayContains(relocation.toLocation, [filters.location])
          : undefined
      )

      const result = await db
        .select({ key: relocation.employeeRange, value: count() })
        .from(relocation)
        .where(where)
        .groupBy(relocation.employeeRange)
        .orderBy(
          asc(
            sql`CAST(SPLIT_PART(${relocation.employeeRange}, '-', 1) AS INTEGER)`
          )
        )

      console.log('Result diagram storlek på inflyttade bolag:', result)

      const chartData = result.map((r) => {
        return {
          employeeRange: r.key as string,
          relocations: r.value,
        }
      })

      const diagram: Diagram = {
        title: `Storlek på inflyttade företag till ${location}`,
        type: 'composed',
        axis: {
          x: { label: 'Antal anställda', dataKey: 'employeeRange' },
          y: { label: 'Antal flyttar' },
        },
        parts: [
          {
            type: 'bar',
            label: `Till ${location}`,
            dataKey: 'relocations',
            color: 'var(--chart-1)',
          },
        ],
        chartData,
      }

      console.log('Diagram storlek antal anställda till location: ', diagram)
      return diagram
    },
    //Inflyttande kluster
    async (filters) => {
      const where = and(
        filters.years?.length
          ? inArray(relocation.relocationYear, filters.years)
          : undefined,
        filters.employeeRange?.length
          ? inArray(relocation.employeeRange, filters.employeeRange)
          : undefined,
        filters.companyTypes?.length
          ? inArray(relocation.companyType, filters.companyTypes)
          : undefined,
        filters.industryClusters?.length
          ? inArray(relocation.industryCluster, filters.industryClusters)
          : undefined,
        filters.location?.length
          ? arrayContains(relocation.toLocation, [filters.location])
          : undefined
      )

      const result = await db
        .select({ key: relocation.industryCluster, value: count() })
        .from(relocation)
        .where(where)
        .groupBy(relocation.industryCluster)
        .orderBy(asc(relocation.industryCluster))

      console.log('Result diagram inflyttande kluster:', result)

      const chartData = result.map((r) => {
        return {
          industryCluster: r.key as string,
          relocations: r.value,
        }
      })

      const diagram: Diagram = {
        title: `Inflyttande kluster till ${location}`,
        type: 'composed',
        axis: {
          x: { label: 'Industrikluster', dataKey: 'industryCluster' },
          y: { label: 'Antal flyttar' },
        },
        parts: [
          {
            type: 'bar',
            label: `Till ${location}`,
            dataKey: 'relocations',
            color: 'var(--chart-1)',
          },
        ],
        chartData,
      }

      console.log('Diagram inflyttande kluster till location: ', diagram)
      return diagram
    },
  ]

  const diagrams = await Promise.all(
    diagramGenerators.map((generator) => generator(filters))
  )

  return {
    filterOptions,
    success: true,
    diagrams: diagrams.map((diagram) => addChartConfig(diagram)),
  }
}

export default function Relocations({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams()
  const { filterOptions, diagrams } = loaderData

  return (
    <div className="max-w-xl mx-auto px-4 py-8 font-sans">
      <h1 className="text-2xl font-bold mb-6">Filtrera relocationer</h1>
      <Form method="get" className="flex flex-col gap-6">
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold mb-2">Flyttår</legend>
          {filterOptions.years.map((year) => (
            <label key={year} className="block mb-2">
              <input
                type="checkbox"
                name="years"
                value={year}
                defaultChecked={searchParams.has('years', String(year))}
                className="mr-2"
              />
              {year}
            </label>
          ))}
        </fieldset>
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold mb-2">Antal anställda</legend>
          {filterOptions.employeeRanges.map((range) => (
            <label key={range} className="block mb-2">
              <input
                type="checkbox"
                name="employeeRange"
                value={range}
                defaultChecked={searchParams.has('employeeRange', range)}
                className="mr-2"
              />
              {range}
            </label>
          ))}
        </fieldset>
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold mb-2">Företagsform</legend>
          {filterOptions.companyTypes.map((type) => (
            <label key={type} className="block mb-2">
              <input
                type="checkbox"
                name="companyTypes"
                value={type}
                defaultChecked={searchParams.has('companyTypes', type)}
                className="mr-2"
              />
              {type}
            </label>
          ))}
        </fieldset>
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold mb-2">Kluster</legend>
          {filterOptions.industryClusters.map((cluster) => (
            <label key={cluster} className="block mb-2">
              <input
                type="checkbox"
                name="industryClusters"
                value={cluster}
                defaultChecked={searchParams.has('industryClusters', cluster)}
                className="mr-2"
              />
              {cluster}
            </label>
          ))}
        </fieldset>
        <fieldset className="border border-gray-300 rounded-md p-4">
          <legend className="font-semibold mb-2">Område</legend>
          <select
            name="location"
            defaultValue={searchParams.get('location') ?? ''}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Välj område</option>
            {filterOptions.locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </fieldset>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Filtrera
        </button>
      </Form>

      {diagrams.map((diagram, index) => (
        <Card key={`${diagram.title}-${index}`} className="mt-10">
          <CardHeader className="mb-10">
            <CardTitle>{diagram.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {' '}
            {diagram?.chartData?.length > 0 ? (
              <ChartContainer config={diagram.chartConfig}>
                <ComposedChart data={diagram.chartData}>
                  <CartesianGrid vertical={false} />
                  <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                  <XAxis
                    dataKey={diagram.axis.x.dataKey}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent labelKey="y" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  {diagram.parts.map((part) =>
                    partByType[part.type]({ data: diagram.chartData, ...part })
                  )}
                </ComposedChart>
              </ChartContainer>
            ) : (
              <p>Nope sorry</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
const partByType = {
  bar: ({ dataKey, color }) => (
    <Bar key={dataKey} dataKey={dataKey} fill={color} radius={8} />
  ),

  diffbar: ({ data, dataKey, positiveColor, negativeColor }) => (
    <Bar dataKey={dataKey} radius={8}>
      {data.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={entry[dataKey] > 0 ? positiveColor : negativeColor}
        />
      ))}
    </Bar>
  ),
}
