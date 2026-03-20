import type { ChartModel } from '~/shared/database/models/chartModels'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
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
import { CircleXIcon, SaveIcon, SquarePenIcon, Trash2Icon } from 'lucide-react'
import { Form } from 'react-router'
import { ChartEditor } from './ChartEditor'
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
} from '../ui/alert-dialog'
import { ChartTable } from './ChartTable'
import { Button } from '../ui/button'
import { useState } from 'react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

export default function ChartRenderer({
  id,
  type,
  title,
  description,
  chartType,
  dimension,
  series,
  data,
  uiSettings,
  measureCalculation,
  readOnly,
}: ChartModel & { readOnly?: boolean }) {
  const [isEditingChartTitle, setIsEditingChartTitle] = useState(false)
  const [isEditingChartDescription, setIsEditingChartDescription] =
    useState(false)

  const config = Object.fromEntries(
    series.map((s, i) => {
      let label = s

      if (s === 'inflow') label = 'Inflytt'
      else if (s === 'outflow') label = 'Utflytt'
      else if (s === 'net') label = 'Nettoflytt'
      else label = s.charAt(0).toUpperCase() + s.slice(1)

      if (s === 'net') {
        return [
          s,
          {
            label,
            positiveColor: 'var(--chart-positive)',
            negativeColor: 'var(--chart-negative)',
          },
        ]
      }

      return [
        s,
        {
          label,
          color: `var(--chart-${i + 1})`,
        },
      ]
    })
  )

  data.map((d, i) => {
    const key = d[dimension]
    config[key] = {
      label: key,
      color: `var(--chart-${(i % 11) + 1})`,
    }
  })

  return (
    <div
      className={
        uiSettings?.containerSize === '25'
          ? 'col-span-3'
          : uiSettings?.containerSize === '1/3'
            ? 'col-span-4'
            : uiSettings?.containerSize === '50'
              ? 'col-span-6'
              : uiSettings?.containerSize === '2/3'
                ? 'col-span-8'
                : uiSettings?.containerSize === '75'
                  ? 'col-span-9'
                  : uiSettings?.containerSize === '100'
                    ? 'col-span-12'
                    : 'col-span-9'
      }
    >
      <Card className="relative w-full">
        {!readOnly && id && (
          <div className="absolute top-3 right-3 flex gap-2">
            <ChartEditor chartId={id} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                    <Trash2Icon />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Radera diagram?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Detta går inte att ångra. Diagrammet tas bort permanent från
                    rapporten
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel variant="outline">
                    Avbryt
                  </AlertDialogCancel>
                  <Form method="post">
                    <input type="hidden" name="intent" value="deleteChart" />
                    <input type="hidden" name="id" value={id} />
                    <AlertDialogAction variant="destructive" asChild>
                      <button type="submit" className="w-full">
                        Radera
                      </button>
                    </AlertDialogAction>
                  </Form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        <CardHeader className="space-y-2">
          {/* chartTitle */}
          {isEditingChartTitle ? (
            <Form method="post" onSubmit={() => setIsEditingChartTitle(false)}>
              <Input
                autoFocus
                type="text"
                name="chartTitle"
                defaultValue={title}
                className="w-full font-semibold !text-base border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                onBlur={(e) => {
                  const newValue = e.target.value.trim()
                  if (newValue !== title) {
                    e.target.form?.requestSubmit()
                  }
                  setIsEditingChartTitle(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const newValue = e.currentTarget.value.trim()
                    if (newValue !== title) {
                      e.currentTarget.form?.requestSubmit()
                    }
                    setIsEditingChartTitle(false)
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    setIsEditingChartTitle(false)
                  }
                }}
              />

              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="intent" value="updateChartTitle" />
            </Form>
          ) : (
            <CardTitle
              className="cursor-text"
              onClick={() => !readOnly && setIsEditingChartTitle(true)}
            >
              {title?.trim() !== '' ? title : !readOnly && 'Lägg till titel…'}
            </CardTitle>
          )}
          {/* chartDescription */}
          {isEditingChartDescription ? (
            <Form
              method="post"
              onSubmit={() => setIsEditingChartDescription(false)}
            >
              <Textarea
                autoFocus
                name="chartDescription"
                defaultValue={description ?? ''}
                className="w-full border-none shadow-none focus-visible:ring-0 p-0 resize-none !text-sm text-muted-foreground"
                onBlur={(e) => {
                  const newValue = e.target.value.trim()
                  if (newValue !== (description ?? '')) {
                    e.target.form?.requestSubmit()
                  }
                  setIsEditingChartDescription(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.shiftKey) {
                    return
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const newValue = e.currentTarget.value.trim()
                    if (newValue !== (description ?? '')) {
                      e.currentTarget.form?.requestSubmit()
                    }
                    setIsEditingChartDescription(false)
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    setIsEditingChartDescription(false)
                  }
                }}
              />

              <input type="hidden" name="id" value={id} />
              <input
                type="hidden"
                name="intent"
                value="updateChartDescription"
              />
            </Form>
          ) : (
            <CardDescription
              className="whitespace-pre-wrap cursor-text"
              onClick={() => !readOnly && setIsEditingChartDescription(true)}
            >
              {description?.trim() !== ''
                ? description
                : !readOnly && 'Lägg till beskrivning…'}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {uiSettings?.tablePlacement === 'top' && (
            <ChartTable data={data} dimension={dimension} series={series} />
          )}

          <ChartContainer config={config}>
            {chartType === 'column' ? (
              <BarChart data={data} layout="horizontal">
                <CartesianGrid vertical={false} />
                <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                <XAxis
                  dataKey={dimension}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                {uiSettings?.legendPlacement !== 'hidden' && (
                  <ChartLegend
                    verticalAlign={
                      uiSettings?.legendPlacement === 'top' ? 'top' : 'bottom'
                    }
                    content={<ChartLegendContent />}
                  />
                )}
                {series.map((s, i) => (
                  <Bar
                    key={s}
                    dataKey={s}
                    fill={s === 'net' ? undefined : `var(--chart-${i + 1})`}
                    radius={8}
                  >
                    {s === 'net' &&
                      data.map((d, i) => (
                        <Cell
                          key={i}
                          fill={
                            Number(d.net ?? 0) >= 0
                              ? 'var(--chart-positive)'
                              : 'var(--chart-negative)'
                          }
                        />
                      ))}
                  </Bar>
                ))}
              </BarChart>
            ) : chartType === 'bar' ? (
              <BarChart data={data} layout="vertical">
                <CartesianGrid vertical={false} />
                <YAxis
                  type="category"
                  dataKey={dimension}
                  width={150}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                {uiSettings?.legendPlacement !== 'hidden' && (
                  <ChartLegend
                    verticalAlign={
                      uiSettings?.legendPlacement === 'top' ? 'top' : 'bottom'
                    }
                    content={<ChartLegendContent />}
                  />
                )}
                {series.map((s, i) => (
                  <Bar
                    key={s}
                    dataKey={s}
                    fill={`var(--chart-${i + 1})`}
                    radius={8}
                  />
                ))}
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid vertical={false} />
                <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                <XAxis
                  dataKey={dimension}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={
                        measureCalculation === 'percent'
                          ? (value) => `${value} %`
                          : undefined
                      }
                    />
                  }
                />
                {uiSettings?.legendPlacement !== 'hidden' && (
                  <ChartLegend
                    verticalAlign={
                      uiSettings?.legendPlacement === 'top' ? 'top' : 'bottom'
                    }
                    content={<ChartLegendContent />}
                  />
                )}
                {series.map((s, i) => (
                  <Line
                    key={s}
                    dataKey={s}
                    stroke={`var(--chart-${i + 1})`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            ) : chartType === 'pie' ? (
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={data} dataKey={series[0]} nameKey={dimension} label>
                  {data.map((_, i) => (
                    <Cell key={i} fill={`var(--chart-${(i % 11) + 1})`} />
                  ))}
                </Pie>
                {uiSettings?.legendPlacement !== 'hidden' && (
                  <ChartLegend
                    verticalAlign={
                      uiSettings?.legendPlacement === 'top' ? 'top' : 'bottom'
                    }
                    content={<ChartLegendContent nameKey={dimension} />}
                  />
                )}
              </PieChart>
            ) : (
              <div>Inga diagram tillgängliga</div>
            )}
          </ChartContainer>
          {uiSettings?.tablePlacement === 'bottom' && (
            <ChartTable
              data={data}
              dimension={dimension}
              series={series}
              measureCalculation={measureCalculation}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
