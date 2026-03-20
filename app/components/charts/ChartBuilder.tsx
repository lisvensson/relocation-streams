import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
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
import type { ChartModel } from '~/shared/database/models/chartModels'
import { useState } from 'react'
import { PlusIcon } from 'lucide-react'

interface ChartBuilderProps {
  chart: ChartModel | null
}

export function ChartBuilder({ chart }: ChartBuilderProps) {
  const submit = useSubmit()
  const [type, setType] = useState<string>('')
  const [measure, setMeasure] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [excludeSelectedArea, setExcludeSelectedArea] = useState(false)
  const [maxNumberOfCategories, setMaxNumberOfCategories] = useState<
    number | undefined
  >()
  const [combineRemainingCategories, setCombineRemainingCategories] =
    useState(false)
  const [chartType, setChartType] = useState<string>('')
  const [measureCalculation, setMeasureCalculation] = useState<string>('')
  const [containerSize, setContainerSize] = useState<string>('')
  const [legendPlacement, setLegendPlacement] = useState<string>('')
  const [tablePlacement, setTablePlacement] = useState<string>('')
  const [searchParams] = useSearchParams()
  const chartSettingParams = [
    'type',
    'measure',
    'category',
    'excludeSelectedArea',
    'maxNumberOfCategories',
    'combineRemainingCategories',
    'chartType',
    'measureCalculation',
    'containerSize',
    'legendPlacement',
    'tablePlacement',
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
        <Button>
          <PlusIcon className="size-4 mr-2" />
          Lägg till diagram
        </Button>
      </SheetTrigger>

      <SheetContent className="!max-w-none w-full max-w-full overflow-y-auto">
        <div className="mt-10 flex gap-8">
          <div className="w-1/6 border-r p-4">
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
                <Select
                  name="type"
                  value={type}
                  onValueChange={setType}
                  required
                >
                  <SelectTrigger className="w-full" aria-invalid={!type}>
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
                    <SelectItem value="netflow+category">
                      Nettoflytt per kategori
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
                        required
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={!measure}
                        >
                          <SelectValue placeholder="Välj mått" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inflow">Inflytt</SelectItem>
                          <SelectItem value="outflow">Utflytt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {type === 'netflow+category' && (
                    <input type="hidden" name="measure" value="inflow" />
                  )}

                  {/* category */}
                  {(type === 'category' ||
                    type === 'temporal+category' ||
                    type === 'netflow+category') && (
                    <div>
                      <label className="block mb-1 font-medium">Kategori</label>
                      <Select
                        name="category"
                        value={category}
                        onValueChange={setCategory}
                        required
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={!category}
                        >
                          <SelectValue placeholder="Välj kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {type === 'netflow+category' && (
                            <SelectItem value="relocationYear">
                              Flyttår
                            </SelectItem>
                          )}
                          <SelectItem value="employeeRange">
                            Antal anställda
                          </SelectItem>
                          <SelectItem value="industryCluster">
                            Kluster
                          </SelectItem>
                          <SelectItem value="companyType">
                            Företagsform
                          </SelectItem>
                          <SelectItem value="postalArea">Postområde</SelectItem>
                          <SelectItem value="municipality">Kommun</SelectItem>
                          <SelectItem value="county">Län</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* excludeSelectedArea */}
                  {(type === 'category' ||
                    type === 'temporal+category' ||
                    type === 'netflow+category') &&
                    (category === 'postalArea' ||
                      category === 'municipality' ||
                      category === 'county') && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="excludeSelectedArea"
                          name="excludeSelectedArea"
                          checked={excludeSelectedArea}
                          onCheckedChange={(v) =>
                            setExcludeSelectedArea(Boolean(v))
                          }
                        />
                        <label
                          htmlFor="excludeSelectedArea"
                          className="text-sm font-medium"
                        >
                          Exkludera valt område
                        </label>
                      </div>
                    )}

                  {/* maxNumberOfCategories */}
                  {(type === 'category' ||
                    type === 'temporal+category' ||
                    type === 'netflow+category') &&
                    category !== 'relocationYear' && (
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
                          aria-invalid={
                            (type === 'temporal+category' ||
                              type === 'netflow+category') &&
                            !maxNumberOfCategories
                          }
                          required={
                            type === 'temporal+category' ||
                            type === 'netflow+category'
                          }
                        />
                      </div>
                    )}
                  {category === 'relocationYear' && (
                    <input
                      type="hidden"
                      name="maxNumberOfCategories"
                      value={0}
                    />
                  )}

                  {/* combineRemainingCategories */}
                  {(type === 'category' ||
                    type === 'temporal+category' ||
                    type === 'netflow+category') &&
                    category !== 'relocationYear' && (
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
                        required
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={!chartType}
                        >
                          <SelectValue placeholder="Välj diagramtyp" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">
                            Liggande stapeldiagram
                          </SelectItem>
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
                        required
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={!measureCalculation}
                        >
                          <SelectValue placeholder="Välj beräkning" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volume">Volym</SelectItem>
                          <SelectItem value="percent">Procent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* containerSize */}
                  {(type === 'temporal' ||
                    type === 'category' ||
                    type === 'temporal+category' ||
                    type === 'netflow+category') && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Containerstorlek
                      </label>
                      <Select
                        name="containerSize"
                        value={containerSize}
                        onValueChange={setContainerSize}
                        required
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={!containerSize}
                        >
                          <SelectValue placeholder="Välj storlek" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25 %</SelectItem>
                          <SelectItem value="1/3">1/3</SelectItem>
                          <SelectItem value="50">50 %</SelectItem>
                          <SelectItem value="2/3">2/3</SelectItem>
                          <SelectItem value="75">75 %</SelectItem>
                          <SelectItem value="100">100 %</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* legendPlacement */}
                  {(type === 'temporal' ||
                    type === 'category' ||
                    type === 'temporal+category' ||
                    type === 'netflow+category') && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Legendplacering
                      </label>
                      <Select
                        name="legendPlacement"
                        value={legendPlacement}
                        onValueChange={setLegendPlacement}
                        required
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={!legendPlacement}
                        >
                          <SelectValue placeholder="Välj placering" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hidden">Dölj</SelectItem>
                          <SelectItem value="top">Ovanför</SelectItem>
                          <SelectItem value="bottom">Under</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* tablePlacement */}
                  {(type === 'temporal' ||
                    type === 'category' ||
                    type === 'temporal+category' ||
                    type === 'netflow+category') && (
                    <div>
                      <label className="block mb-1 font-medium">
                        Tabellplacering
                      </label>
                      <Select
                        name="tablePlacement"
                        value={tablePlacement}
                        onValueChange={setTablePlacement}
                        required
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={!tablePlacement}
                        >
                          <SelectValue placeholder="Välj placering" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hidden">Dölj</SelectItem>
                          <SelectItem value="top">Ovanför</SelectItem>
                          <SelectItem value="bottom">Under</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </Form>
            <Form method="post" className="mt-6">
              <input type="hidden" name="intent" value="addChart" />
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="chartTitle" value={''} />
              <input type="hidden" name="chartDescription" value={''} />
              <input type="hidden" name="measure" value={measure} />
              <input type="hidden" name="category" value={category} />
              <input
                type="hidden"
                name="excludeSelectedArea"
                value={excludeSelectedArea ? 'on' : 'off'}
              />
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
              <input type="hidden" name="containerSize" value={containerSize} />
              <input
                type="hidden"
                name="legendPlacement"
                value={legendPlacement}
              />
              <input
                type="hidden"
                name="tablePlacement"
                value={tablePlacement}
              />
              <SheetClose asChild>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !type ||
                    !containerSize ||
                    !legendPlacement ||
                    !tablePlacement ||
                    (['temporal', 'category', 'temporal+category'].includes(
                      type
                    ) &&
                      !measure) ||
                    ([
                      'category',
                      'temporal+category',
                      'netflow+category',
                    ].includes(type) &&
                      !category) ||
                    (type === 'category' && !chartType) ||
                    (type === 'temporal+category' &&
                      (!measureCalculation || !maxNumberOfCategories)) ||
                    (type === 'netflow+category' &&
                      category !== 'relocationYear' &&
                      !maxNumberOfCategories)
                  }
                >
                  Lägg till diagram i rapporten
                </Button>
              </SheetClose>
            </Form>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-12">
              {chart && <ChartRenderer {...chart} readOnly={true} />}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
