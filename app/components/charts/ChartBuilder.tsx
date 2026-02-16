import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetFooter,
  SheetClose,
} from '~/components/ui/sheet'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { Checkbox } from '~/components/ui/checkbox'
import { Form, useSearchParams, useSubmit } from 'react-router'
import ChartRenderer from '~/components/charts/ChartRenderer'
import type { ChartModel, Filter } from '~/shared/database/models/chartModels'
import { useState } from 'react'

interface ChartBuilderProps {
  chart: ChartModel | null
}

export function ChartBuilder({ chart }: ChartBuilderProps) {
  const submit = useSubmit()
  const [type, setType] = useState<string>('')
  const [measure, setMeasure] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [maxNumberOfCategories, setMaxNumberOfCategories] = useState<
    number | undefined
  >()
  const [combineRemainingCategories, setCombineRemainingCategories] =
    useState(false)
  const [chartType, setChartType] = useState<string>('')
  const [measureCalculation, setMeasureCalculation] = useState<string>('')
  const [searchParams] = useSearchParams()
  const chartSettingParams = [
    'type',
    'measure',
    'category',
    'maxNumberOfCategories',
    'combineRemainingCategories',
    'chartType',
    'measureCalculation',
  ]

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          const url = new URL(window.location.href)
          chartSettingParams.forEach((p) => url.searchParams.delete(p))
          window.history.replaceState({}, '', url.toString())
          window.location.reload()
        }
      }}
    >
      <SheetTrigger asChild>
        <Button variant="default">Lägg till diagram</Button>
      </SheetTrigger>

      <SheetContent className="!max-w-none w-full max-w-full overflow-y-auto">
        <div className="mt-6 flex gap-8">
          <div className="w-75 border-r p-4">
            <Form
              method="get"
              className="space-y-6 mt-6"
              onChange={(e) =>
                submit(e.currentTarget, { preventScrollReset: true })
              }
            >
              {Array.from(searchParams.entries())
                .filter(([key]) => !chartSettingParams.includes(key))
                .map(([key, value]) => (
                  <input
                    key={`${key}-${value}`}
                    type="hidden"
                    name={key}
                    value={value}
                  />
                ))}

              {/* type */}
              <div>
                <label className="block mb-1 font-medium">Välj diagram</label>
                <Select name="type" value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Välj diagramtyp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporal">
                      Utveckling totalt över tid
                    </SelectItem>
                    <SelectItem value="category">
                      Utveckling per kategori
                    </SelectItem>
                    <SelectItem value="temporal+category">
                      Utveckling per kategori över tid
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* chartSettings */}
              {type && (
                <div className="space-y-6">
                  {/* measure */}
                  {(type === 'temporal' ||
                    type === 'category' ||
                    type === 'temporal+category') && (
                    <div>
                      <label className="block mb-1 font-medium">Mått</label>
                      <Select
                        name="measure"
                        value={measure}
                        onValueChange={setMeasure}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Välj mått" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inflow">Inflytt</SelectItem>
                          <SelectItem value="outflow">Utflytt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* category */}
                  {(type === 'category' || type === 'temporal+category') && (
                    <div>
                      <label className="block mb-1 font-medium">Kategori</label>
                      <Select
                        name="category"
                        value={category}
                        onValueChange={setCategory}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Välj kategori" />
                        </SelectTrigger>
                        <SelectContent>
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
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* maxNumberOfCategories */}
                  {(type === 'category' || type === 'temporal+category') && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Max antal kategorier
                      </label>
                      <Input
                        type="number"
                        name="maxNumberOfCategories"
                        value={maxNumberOfCategories ?? ''}
                        onChange={(e) =>
                          setMaxNumberOfCategories(Number(e.target.value))
                        }
                      />
                    </div>
                  )}

                  {/* combineRemainingCategories */}
                  {(type === 'category' || type === 'temporal+category') && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="combineRemainingCategories"
                        name="combineRemainingCategories"
                        checked={combineRemainingCategories}
                        onCheckedChange={(v) =>
                          setCombineRemainingCategories(Boolean(v))
                        }
                      />
                      <label
                        htmlFor="combineRemainingCategories"
                        className="text-sm font-medium"
                      >
                        Visa resterande kategorier som övrigt
                      </label>
                    </div>
                  )}

                  {/* chartType */}
                  {type === 'category' && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Diagramtyp
                      </label>
                      <Select
                        name="chartType"
                        value={chartType}
                        onValueChange={setChartType}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Välj diagramtyp" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Stapeldiagram</SelectItem>
                          <SelectItem value="pie">Cirkeldiagram</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* measureCalculation */}
                  {type === 'temporal+category' && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Beräkning
                      </label>
                      <Select
                        name="measureCalculation"
                        value={measureCalculation}
                        onValueChange={setMeasureCalculation}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Välj beräkning" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volume">Volym</SelectItem>
                          <SelectItem value="percent">Procent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
              <SheetFooter className="mt-6">
                <Button type="submit">Visa diagram</Button>
              </SheetFooter>
            </Form>
          </div>
          <div className="flex-1 p-6">
            {chart && (
              <>
                <ChartRenderer {...chart} />
                <Form method="post" className="mt-6">
                  <input type="hidden" name="intent" value="addChart" />
                  <input type="hidden" name="type" value={type} />
                  <input type="hidden" name="measure" value={measure} />
                  <input type="hidden" name="category" value={category} />
                  <input
                    type="hidden"
                    name="maxNumberOfCategories"
                    value={maxNumberOfCategories}
                  />
                  <input
                    type="hidden"
                    name="combineRemainingCategories"
                    value={combineRemainingCategories ? 'on' : 'off'}
                  />
                  <input type="hidden" name="chartType" value={chartType} />
                  <input
                    type="hidden"
                    name="measureCalculation"
                    value={measureCalculation}
                  />
                  <SheetClose asChild>
                    <Button type="submit">Lägg till diagram i rapporten</Button>
                  </SheetClose>
                </Form>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
