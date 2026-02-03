import { Form, useSearchParams } from 'react-router'
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
import type { Route } from './+types/BuildChart'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import type { Filter } from '~/shared/database/models/chartModels'
import { buildTemporalChart } from '~/shared/database/buildCharts/buildTemporalChart'
import { buildCategoryChart } from '~/shared/database/buildCharts/buildCategoryChart'
import { buildTemporalCategoryChart } from '~/shared/database/buildCharts/buildTemporalCategoryChart'
import { buildNetFlowChart } from '~/shared/database/buildCharts/buildNetFlowChart'
import ChartRenderer from '~/components/charts/chartRenderer'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '~/components/ui/combobox'

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
  const employeeRange = searchParams.getAll('employeeRange').map(String)
  const companyTypes = searchParams.getAll('companyTypes').map(String)
  const industryClusters = searchParams.getAll('industryClusters').map(String)

  const filters: Filter[] = []

  if (years.length > 0) {
    filters.push({
      key: 'relocationYear',
      operator: 'in',
      value: years,
    })
  }

  if (employeeRange.length > 0) {
    filters.push({
      key: 'employeeRange',
      operator: 'in',
      value: employeeRange,
    })
  }

  if (companyTypes.length > 0) {
    filters.push({
      key: 'companyType',
      operator: 'in',
      value: companyTypes,
    })
  }

  if (industryClusters.length > 0) {
    filters.push({
      key: 'industryCluster',
      operator: 'in',
      value: industryClusters,
    })
  }

  //console.log(filters)

  const type = searchParams.get('type')
  const measure = searchParams.get('measure')
  const category = searchParams.get('category')
  const maxNumberOfCategories = searchParams.get('maxNumberOfCategories')
  const combineRemainingCategories =
    searchParams.get('combineRemainingCategories') === 'on'
  const chartType = searchParams.get('chartType')
  const measureCalculation = searchParams.get('measureCalculation')

  let chartConfig: any = null

  if (type === 'temporal') {
    chartConfig = {
      title: 'Temporal chart',
      type: type,
      measure,
      uiSettings: {
        containerSize: 'medium',
        legendPlacement: 'bottom',
        tablePlacement: 'hidden',
      },
    }
  }

  if (type === 'category') {
    chartConfig = {
      title: 'Category chart',
      type: type,
      measure,
      category,
      maxNumberOfCategories,
      combineRemainingCategories,
      chartType: chartType,
      uiSettings: {
        containerSize: 'medium',
        legendPlacement: 'bottom',
        tablePlacement: 'hidden',
      },
    }
  }

  if (type === 'temporal+category') {
    chartConfig = {
      title: 'Temporal + Category chart',
      type: type,
      measure,
      category,
      maxNumberOfCategories,
      combineRemainingCategories,
      measureCalculation,
      uiSettings: {
        containerSize: 'medium',
        legendPlacement: 'bottom',
        tablePlacement: 'hidden',
      },
    }
  }

  if (type === 'netflow') {
    chartConfig = {
      title: 'Netflow chart',
      type: type,
    }
  }

  //console.log(chartConfig)

  let result = null

  if (type && location) {
    if (type === 'temporal') {
      result = await buildTemporalChart(location, filters, chartConfig)
    }

    if (type === 'category') {
      result = await buildCategoryChart(location, filters, chartConfig)
    }

    if (type === 'temporal+category') {
      result = await buildTemporalCategoryChart(location, filters, chartConfig)
    }

    if (type === 'netflow') {
      result = await buildNetFlowChart(location, filters, chartConfig)
    }
  }

  //console.log(result)

  const end = performance.now()
  console.log(`Loader time: ${(end - start).toFixed(2)} ms`)

  return {
    filterOptions,
    result,
    success: true,
  }
}

export default function Relocations({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams()
  const { filterOptions, result } = loaderData
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [type, setType] = useState(searchParams.get('type') ?? '')

  return (
    <div className="flex">
      <aside className="w-75 border-r p-4">
        <Form method="get" className="flex flex-col">
          <Accordion type="multiple" className="space-y-4">
            <AccordionItem value="location">
              <AccordionTrigger className="pr-4">Område</AccordionTrigger>
              <AccordionContent>
                <Combobox
                  items={filterOptions.locations}
                  value={location}
                  onValueChange={(value) => setLocation(value ?? '')}
                >
                  <ComboboxInput placeholder="Välj område" />
                  <ComboboxContent>
                    <ComboboxEmpty>Inga träffar</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <input
                  type="hidden"
                  name="location"
                  value={location}
                  required
                />
              </AccordionContent>
            </AccordionItem>

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

            <AccordionItem value="type">
              <AccordionTrigger className="pr-4">Välj diagram</AccordionTrigger>
              <AccordionContent>
                <Select
                  name="type"
                  value={type}
                  onValueChange={(value) => setType(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Välj diagram" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Diagram</SelectLabel>
                      <SelectItem value="temporal">
                        Utveckling totalt över tid
                      </SelectItem>
                      <SelectItem value="category">
                        Utveckling fördelat per kategori
                      </SelectItem>
                      <SelectItem value="temporal+category">
                        Utveckling per kategori över tid
                      </SelectItem>
                      <SelectItem value="netflow">
                        Nettoflytt över tid
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>

            {/* chartSettings */}
            {type && (
              <AccordionItem value="chartSettings">
                <AccordionTrigger className="pr-4">
                  Inställningar för valt diagram
                </AccordionTrigger>

                {/* measure */}
                <AccordionContent>
                  <div className="space-y-6 mt-4">
                    {(type === 'temporal' ||
                      type === 'category' ||
                      type === 'temporal+category') && (
                      <div>
                        <label className="block mb-1">Mått</label>
                        <Select name="measure">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Välj mått" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Mått</SelectLabel>
                              <SelectItem value="inflow">Inflytt</SelectItem>
                              <SelectItem value="outflow">Utflytt</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* category */}
                    {(type === 'category' || type === 'temporal+category') && (
                      <div>
                        <label className="block mb-1">Kategori</label>
                        <Select name="category">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Välj kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Kategori</SelectLabel>
                              <SelectItem value="employeeRange">
                                Antal anställda
                              </SelectItem>
                              <SelectItem value="industryCluster">
                                Kluster
                              </SelectItem>
                              <SelectItem value="companyType">
                                Företagsform
                              </SelectItem>
                              {type === 'temporal+category' && (
                                <>
                                  <SelectItem value="postalArea">
                                    Postområde
                                  </SelectItem>
                                  <SelectItem value="municipality">
                                    Kommun
                                  </SelectItem>
                                  <SelectItem value="county">Län</SelectItem>
                                </>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* maxNumberOfCategories */}
                    {(type === 'category' || type === 'temporal+category') && (
                      <div>
                        <label className="block mb-1">
                          Max antal kategorier
                        </label>
                        <Input type="number" name="maxNumberOfCategories" />
                      </div>
                    )}

                    {/* combineRemainingCategories */}
                    {(type === 'category' || type === 'temporal+category') && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="combineRemainingCategories"
                          name="combineRemainingCategories"
                        />
                        <label
                          htmlFor="combineRemainingCategories"
                          className="text-sm font-medium leading-none"
                        >
                          Visa resterande kategorier som övrigt
                        </label>
                      </div>
                    )}

                    {/* chartType */}
                    {type === 'category' && (
                      <div>
                        <label className="block mb-1">Diagramtyp</label>
                        <Select name="chartType">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Välj diagramtyp" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Diagramtyp</SelectLabel>
                              <SelectItem value="bar">Stapeldiagram</SelectItem>
                              <SelectItem value="pie">Cirkeldiagram</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* measureCalculation */}
                    {type === 'temporal+category' && (
                      <div>
                        <label className="block mb-1">Beräkning</label>
                        <Select name="measureCalculation">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Välj beräkning" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Beräkning</SelectLabel>
                              <SelectItem value="volume">Volym</SelectItem>
                              <SelectItem value="percent">Procent</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* no settings */}
                    {type === 'netflow' && <p>Inga inställningar behövs.</p>}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          <Button type="submit" className="mt-4 w-full">
            Skapa diagram
          </Button>
        </Form>
      </aside>
      <div className="flex-1 p-6">
        {result ? (
          <ChartRenderer {...result} />
        ) : (
          <p className="text-muted-foreground">
            Välj filter och skapa ett diagram
          </p>
        )}
      </div>
    </div>
  )
}
