import { Form, useLoaderData, useSubmit } from 'react-router'
import { useState } from 'react'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import type { loader } from '~/routes/Report'
import { generateChartTitle } from '~/lib/generateChartTitle'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '../ui/popover'
import { Button } from '../ui/button'
import { SquarePenIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Label } from '../ui/label'

interface ChartEditorProps {
  chartId: string
}

export function ChartEditor({ chartId }: ChartEditorProps) {
  const submit = useSubmit()
  const { charts } = useLoaderData<typeof loader>()
  const savedChart = charts.find((c) => c?.id === chartId)
  const chartConfig = savedChart?.config
  const [type, setType] = useState(chartConfig.type)
  const [measure, setMeasure] = useState(chartConfig.measure)
  const [category, setCategory] = useState(chartConfig.category)
  const [excludeSelectedArea, setExcludeSelectedArea] = useState(
    chartConfig.excludeSelectedArea
  )
  const [maxNumberOfCategories, setMaxNumberOfCategories] = useState(
    chartConfig.maxNumberOfCategories
  )
  const [combineRemainingCategories, setCombineRemainingCategories] = useState(
    chartConfig.combineRemainingCategories
  )
  const [chartType, setChartType] = useState(chartConfig.chartType)
  const [measureCalculation, setMeasureCalculation] = useState(
    chartConfig.measureCalculation
  )
  const [containerSize, setContainerSize] = useState(
    chartConfig.uiSettings.containerSize
  )
  const [legendPlacement, setLegendPlacement] = useState(
    chartConfig.uiSettings.legendPlacement
  )
  const [tablePlacement, setTablePlacement] = useState(
    chartConfig.uiSettings.tablePlacement
  )

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <SquarePenIcon className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Redigera</TooltipContent>
      </Tooltip>

      <PopoverContent
        className="w-full max-w-[420px] p-4"
        side="right"
        align="start"
        sideOffset={10}
      >
        <PopoverHeader className="mb-4">
          <PopoverTitle>Redigera diagram</PopoverTitle>
          <PopoverDescription>
            Justera inställningar och layout.
          </PopoverDescription>
        </PopoverHeader>

        <Form
          method="post"
          onChange={(e) =>
            submit(e.currentTarget, { preventScrollReset: true })
          }
        >
          <input type="hidden" name="intent" value="updateChart" />
          <input type="hidden" name="id" value={chartId} />
          <input type="hidden" name="type" value={type} />
          <input
            type="hidden"
            name="chartTitle"
            value={generateChartTitle({
              type,
              measure,
              measureCalculation,
              category,
            })}
          />
          <input
            type="hidden"
            name="chartDescription"
            value={chartConfig.description}
          />
          <input type="hidden" name="measure" value={measure} />
          <input type="hidden" name="category" value={category} />
          <input
            type="hidden"
            name="excludeSelectedArea"
            value={excludeSelectedArea ? 'on' : 'off'}
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
          <input type="hidden" name="legendPlacement" value={legendPlacement} />
          <input type="hidden" name="tablePlacement" value={tablePlacement} />

          {/* type */}
          <div className="space-y-6">
            <Label className="mb-2">Välj diagram</Label>
            <Select name="type" value={type} onValueChange={setType} required>
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
              {(type === 'temporal' ||
                type === 'category' ||
                type === 'temporal+category' ||
                type === 'netflow+category') && (
                <div
                  className={
                    type === 'category' ||
                    type === 'temporal+category' ||
                    type === 'netflow+category'
                      ? 'grid grid-cols-5 gap-4'
                      : 'block'
                  }
                >
                  {/* measure */}
                  {(type === 'temporal' ||
                    type === 'category' ||
                    type === 'temporal+category') && (
                    <div className="col-span-2">
                      <Label className="mb-2">Mätvärde</Label>
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
                          <SelectValue placeholder="Välj mätvärde" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inflow">Inflytt</SelectItem>
                          <SelectItem value="outflow">Utflytt</SelectItem>
                          {type === 'temporal+category' && (
                            <SelectItem value="netflow">Nettoflytt</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* measureCalculation */}
                  {type === 'temporal+category' && (
                    <div className="col-span-3">
                      <Label className="mb-2">Beräkning</Label>
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

                  {/* chartType */}
                  {(type === 'category' || type === 'netflow+category') && (
                    <div
                      className={
                        type === 'netflow+category'
                          ? 'col-span-5'
                          : 'col-span-3'
                      }
                    >
                      <Label className="mb-2">Diagramtyp</Label>
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
                          {type === 'category' && (
                            <>
                              <SelectItem value="bar">
                                Liggande stapeldiagram
                              </SelectItem>
                              <SelectItem value="pie">Cirkeldiagram</SelectItem>
                            </>
                          )}
                          {type === 'netflow+category' && (
                            <>
                              <SelectItem value="column">
                                Stående stapeldiagram
                              </SelectItem>
                              <SelectItem value="bar">
                                Liggande stapeldiagram
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* category */}
              {(type === 'category' ||
                type === 'temporal+category' ||
                type === 'netflow+category') && (
                <div
                  className={
                    category === 'postalArea' ||
                    category === 'municipality' ||
                    category === 'county'
                      ? 'grid grid-cols-2 gap-4'
                      : 'block'
                  }
                >
                  <div>
                    <Label className="mb-2">Kategori</Label>
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
                        <SelectItem value="industryCluster">Kluster</SelectItem>
                        <SelectItem value="companyType">
                          Företagsform
                        </SelectItem>
                        <SelectItem value="postalArea">Postområde</SelectItem>
                        <SelectItem value="municipality">Kommun</SelectItem>
                        <SelectItem value="county">Län</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* excludeSelectedArea */}
                  {(type === 'category' ||
                    type === 'temporal+category' ||
                    type === 'netflow+category') &&
                    (category === 'postalArea' ||
                      category === 'municipality' ||
                      category === 'county') && (
                      <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                          id="excludeSelectedArea"
                          name="excludeSelectedArea"
                          checked={excludeSelectedArea}
                          onCheckedChange={(v) =>
                            setExcludeSelectedArea(Boolean(v))
                          }
                        />
                        <Label htmlFor="excludeSelectedArea">
                          Exkludera valt område
                        </Label>
                      </div>
                    )}
                </div>
              )}

              {(type === 'category' ||
                type === 'temporal+category' ||
                type === 'netflow+category') &&
                category !== 'relocationYear' && (
                  <div
                    className={
                      combineRemainingCategories !== undefined
                        ? 'grid grid-cols-5 gap-4'
                        : 'block'
                    }
                  >
                    {/* maxNumberOfCategories */}
                    <div className="col-span-2">
                      <Label className="mb-2">Max antal kategorier</Label>
                      <Input
                        type="number"
                        name="maxNumberOfCategories"
                        value={maxNumberOfCategories ?? ''}
                        onChange={(e) => {
                          setMaxNumberOfCategories(Number(e.target.value))
                          submit(e.currentTarget.form, {
                            preventScrollReset: true,
                          })
                        }}
                        aria-invalid={
                          type === 'temporal+category' && !maxNumberOfCategories
                        }
                        required={type === 'temporal+category'}
                      />
                    </div>
                    {category === 'relocationYear' && (
                      <input
                        type="hidden"
                        name="maxNumberOfCategories"
                        value={0}
                      />
                    )}

                    {/* combineRemainingCategories */}
                    <div className="col-span-3 flex items-center gap-2 pt-6">
                      <Checkbox
                        id="combineRemainingCategories"
                        name="combineRemainingCategories"
                        checked={combineRemainingCategories}
                        onCheckedChange={(v) =>
                          setCombineRemainingCategories(Boolean(v))
                        }
                      />
                      <Label htmlFor="combineRemainingCategories">
                        Visa resterande som övrigt
                      </Label>
                    </div>
                  </div>
                )}

              {/* containerSize */}
              <div className="grid grid-cols-3 gap-4">
                {(type === 'temporal' ||
                  type === 'category' ||
                  type === 'temporal+category' ||
                  type === 'netflow+category') && (
                  <div>
                    <Label className="mb-2">Containerstorlek</Label>
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
                    <Label className="mb-2">Legendplacering</Label>
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
                    <Label className="mb-2">Tabellplacering</Label>
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
            </div>
          )}
        </Form>
      </PopoverContent>
    </Popover>
  )
}
