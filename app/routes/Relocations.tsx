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
  netMovesByYearBarChart,
  netMovesTotalBarChart,
  relocationsEmployeeRangeBarChart,
  relocationsFromByYearBarChart,
  relocationsFromToLocationTotalVolumeBarChart,
  relocationsIndustryClusterBarChart,
  relocationsToByYearBarChart,
  relocationsToFromLocationTotalVolumeBarChart,
} from '~/components/charts/barCharts'
import {
  relocationsFromByYearByEmployeeRangePercentLineChart,
  relocationsFromByYearByEmployeeRangeVolumeLineChart,
  relocationsFromByYearLineChart,
  relocationsFromByYearToLocationPercentLineChart,
  relocationsFromByYearToLocationVolumeLineChart,
  relocationsToAndFromLineChart,
  relocationsToByYearByEmployeeRangePercentLineChart,
  relocationsToByYearByEmployeeRangeVolumeLineChart,
  relocationsToByYearFromLocationPercentLineChart,
  relocationsToByYearFromLocationVolumeLineChart,
  relocationsToByYearVolumeLineChart,
} from '~/components/charts/lineCharts'
import {
  relocationsFromToLocationTotalPercentPieChart,
  relocationsFromToLocationTotalVolumePieChart,
  relocationsIndustryClusterPieChart,
  relocationsToFromLocationTotalPercentPieChart,
  relocationsToFromLocationTotalVolumePieChart,
} from '~/components/charts/pieCharts'

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

  const diagrams = await Promise.all([
    relocationsToByYearBarChart(filters),
    relocationsToByYearVolumeLineChart(filters),
    relocationsFromByYearBarChart(filters),
    relocationsFromByYearLineChart(filters),
    relocationsToAndFromLineChart(filters),
    netMovesByYearBarChart(filters),
    netMovesTotalBarChart(filters),
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
    relocationsEmployeeRangeBarChart(filters),
    relocationsToByYearByEmployeeRangeVolumeLineChart(filters),
    relocationsToByYearByEmployeeRangePercentLineChart(filters),
    relocationsFromByYearByEmployeeRangeVolumeLineChart(filters),
    relocationsFromByYearByEmployeeRangePercentLineChart(filters),
    relocationsIndustryClusterBarChart(filters),
    relocationsIndustryClusterPieChart(filters),
  ])

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

  return (
    <div className="max-w-xl mx-auto px-4 py-8 font-sans">
      <h1 className="text-2xl font-bold mb-6">Filtrera relocationer</h1>
      <Form
        method="get"
        className="flex flex-col gap-6"
        onChange={(e) => submit(e.currentTarget, { preventScrollReset: true })}
      >
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
