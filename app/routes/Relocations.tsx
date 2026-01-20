import { Form, useSearchParams, useSubmit } from 'react-router'
import type { Route } from './+types/Relocations'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { Diagram } from '~/models/diagramModels'
import {
  netMovesByYearVolumeBarChart,
  netMovesTotalVolumeBarChart,
  relocationsToEmployeeRangeVolumeBarChart,
  relocationsFromByYearVolumeBarChart,
  relocationsFromToLocationTotalVolumeBarChart,
  relocationsIndustryClusterVolumeBarChart,
  relocationsToByYearVolumeBarChart,
  relocationsToFromLocationTotalVolumeBarChart,
  relocationsFromEmployeeRangeVolumeBarChart,
} from '~/components/charts/barCharts'
import {
  relocationsFromByYearByEmployeeRangePercentLineChart,
  relocationsFromByYearByEmployeeRangeVolumeLineChart,
  relocationsFromByYearVolumeLineChart,
  relocationsFromByYearToLocationPercentLineChart,
  relocationsFromByYearToLocationVolumeLineChart,
  relocationsToAndFromVolumeLineChart,
  relocationsToByYearByEmployeeRangePercentLineChart,
  relocationsToByYearByEmployeeRangeVolumeLineChart,
  relocationsToByYearFromLocationPercentLineChart,
  relocationsToByYearFromLocationVolumeLineChart,
  relocationsToByYearVolumeLineChart,
} from '~/components/charts/lineCharts'
import {
  relocationsFromToLocationTotalPercentPieChart,
  relocationsFromToLocationTotalVolumePieChart,
  relocationsIndustryClusterVolumePieChart,
  relocationsToFromLocationTotalPercentPieChart,
  relocationsToFromLocationTotalVolumePieChart,
} from '~/components/charts/pieCharts'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { db } from '~/shared/database'
import { relocation } from '~/shared/database/schema'
import { union } from 'drizzle-orm/pg-core'
import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { cn } from '~/lib/utils'

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
  const start = performance.now()

  const locations = await union(
    db
      .selectDistinct({
        postalArea: relocation.toPostalArea,
        municipality: relocation.toMunicipality,
        county: relocation.toCounty,
      })
      .from(relocation),
    db
      .selectDistinct({
        postalArea: relocation.fromPostalArea,
        municipality: relocation.fromMunicipality,
        county: relocation.fromCounty,
      })
      .from(relocation)
  )

  const allLocations = Array.from(
    new Set(
      [
        ...locations.map((r) => r.postalArea ?? ''),
        ...locations.map((r) => r.municipality ?? ''),
        ...locations.map((r) => r.county ?? ''),
      ].map((locations) =>
        locations
          .split(' ')
          .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
          .join(' ')
      )
    )
  ).sort((a, b) => a.localeCompare(b))

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
    locations: allLocations,
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

  const diagrams = await Promise.all([
    relocationsToByYearVolumeBarChart(filters),
    relocationsToByYearVolumeLineChart(filters),
    relocationsFromByYearVolumeBarChart(filters),
    relocationsFromByYearVolumeLineChart(filters),
    relocationsToAndFromVolumeLineChart(filters),
    netMovesByYearVolumeBarChart(filters),
    netMovesTotalVolumeBarChart(filters),
    relocationsToByYearFromLocationVolumeLineChart(filters),
    relocationsToByYearFromLocationPercentLineChart(filters),
    relocationsToFromLocationTotalVolumeBarChart(filters),
    relocationsToFromLocationTotalVolumePieChart(filters),
    relocationsToFromLocationTotalPercentPieChart(filters),
    relocationsFromByYearToLocationVolumeLineChart(filters),
    relocationsFromByYearToLocationPercentLineChart(filters),
    relocationsFromToLocationTotalVolumeBarChart(filters),
    relocationsFromToLocationTotalVolumePieChart(filters),
    relocationsFromToLocationTotalPercentPieChart(filters),
    relocationsToEmployeeRangeVolumeBarChart(filters),
    relocationsToByYearByEmployeeRangeVolumeLineChart(filters),
    relocationsToByYearByEmployeeRangePercentLineChart(filters),
    relocationsFromEmployeeRangeVolumeBarChart(filters),
    relocationsFromByYearByEmployeeRangeVolumeLineChart(filters),
    relocationsFromByYearByEmployeeRangePercentLineChart(filters),
    relocationsIndustryClusterVolumeBarChart(filters),
    relocationsIndustryClusterVolumePieChart(filters),
  ])

  const end = performance.now()
  const duration = end - start

  console.log(`Loader time: ${duration.toFixed(2)} ms`)

  return {
    filterOptions,
    success: true,
    diagrams: diagrams.map((diagram) => addChartConfig(diagram)),
  }
}

export default function Relocations({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams()
  const { filterOptions, diagrams } = loaderData
  const submit = useSubmit()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(searchParams.get('location') ?? '')

  return (
    <div className="flex">
      <aside className="w-75 border-r p-4">
        <Form
          method="get"
          className="flex flex-col"
          onChange={(e) =>
            submit(e.currentTarget, { preventScrollReset: true })
          }
        >
          <Accordion type="multiple" className="space-y-4">
            <AccordionItem value="years">
              <AccordionTrigger className="pr-4">Flyttår</AccordionTrigger>
              <AccordionContent>
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="employeeRange">
              <AccordionTrigger className="pr-4">
                Antal anställda
              </AccordionTrigger>
              <AccordionContent>
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="companyTypes">
              <AccordionTrigger className="pr-4">Företagsform</AccordionTrigger>
              <AccordionContent>
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="industryClusters">
              <AccordionTrigger className="pr-4">Kluster</AccordionTrigger>
              <AccordionContent>
                {filterOptions.industryClusters.map((cluster) => (
                  <label key={cluster} className="block mb-2">
                    <input
                      type="checkbox"
                      name="industryClusters"
                      value={cluster}
                      defaultChecked={searchParams.has(
                        'industryClusters',
                        cluster
                      )}
                      className="mr-2"
                    />
                    {cluster}
                  </label>
                ))}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="location">
              <AccordionTrigger className="pr-4">Område</AccordionTrigger>
              <AccordionContent>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {value || 'Välj område'}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-2">
                    <Command>
                      <CommandInput placeholder="Sök område..." />
                      <CommandList>
                        <CommandEmpty>Inga träffar</CommandEmpty>
                        <CommandGroup>
                          {filterOptions.locations.map((loc) => (
                            <CommandItem
                              key={loc}
                              value={loc}
                              onSelect={(currentValue) => {
                                setValue(
                                  currentValue === value ? '' : currentValue
                                )
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  value === loc ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {loc}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <input type="hidden" name="location" value={value} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button type="submit" className="mt-4 w-full">
            Filtrera
          </Button>
        </Form>
      </aside>

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {diagrams.map((diagram, index) => (
            <Card key={`${diagram.title}-${index}`}>
              <CardHeader className="mb-10">
                <CardTitle>{diagram.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {diagram?.chartData?.length > 0 ? (
                  <ChartContainer config={diagram.chartConfig}>
                    {chartByType[diagram.type]({
                      data: diagram.chartData,
                      axis: diagram.axis,
                      parts: diagram.parts,
                    })}
                  </ChartContainer>
                ) : (
                  <p>Nope sorry</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

const chartByType = {
  bar: ({ data, axis, parts }) => (
    <BarChart data={data}>
      <CartesianGrid vertical={false} />
      <YAxis tickLine={false} tickMargin={10} axisLine={false} />
      <XAxis
        dataKey={axis.x.dataKey}
        tickLine={false}
        tickMargin={10}
        axisLine={false}
      />
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent labelKey="y" />}
      />
      <ChartLegend content={<ChartLegendContent />} />
      {parts.map((part) => partByType[part.type]({ data, ...part }))}
    </BarChart>
  ),
  barBig: ({ data, axis, parts }) => (
    <BarChart data={data}>
      <CartesianGrid vertical={false} />
      <YAxis tickLine={false} tickMargin={10} axisLine={false} />
      <XAxis
        hide
        dataKey={axis.x.dataKey}
        tickLine={false}
        tickMargin={10}
        axisLine={false}
      />
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent labelKey={axis.y.dataKey} />}
      />
      <ChartLegend content={<ChartLegendContent />} />
      {parts.map((part) => partByType[part.type]({ data, ...part }))}
    </BarChart>
  ),

  line: ({ data, axis, parts }) => (
    <LineChart data={data}>
      <CartesianGrid vertical={false} />
      <YAxis tickLine={false} tickMargin={10} axisLine={false} />
      <XAxis
        dataKey={axis.x.dataKey}
        tickLine={false}
        tickMargin={10}
        axisLine={false}
      />
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent labelKey="y" />}
      />
      <ChartLegend content={<ChartLegendContent />} />
      {parts.map((part) => partByType[part.type]({ data, ...part }))}
    </LineChart>
  ),
  pie: ({ data, parts }) => (
    <PieChart>
      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
      {parts.map((part) => partByType[part.type]({ data, ...part }))}
    </PieChart>
  ),
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

  line: ({ dataKey, color }) => (
    <Line
      dataKey={dataKey}
      type="linear"
      stroke={color}
      strokeWidth={2}
      dot={false}
    />
  ),
  pie: ({ data, dataKey, nameKey, color }) => (
    <Pie data={data} dataKey={dataKey} nameKey={nameKey} label>
      {data.map((_, index) => (
        <Cell key={`cell-${index}`} fill={color[index % color.length]} />
      ))}
    </Pie>
  ),
}
