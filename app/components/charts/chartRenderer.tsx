import type { ChartModel } from '~/shared/database/models/chartModels'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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
import { Trash2Icon } from 'lucide-react'
import { Form } from 'react-router'

import { Button } from '@base-ui/react'
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

export default function ChartRenderer({
  id,
  type,
  title,
  dimension,
  series,
  data,
}: ChartModel) {
  const config = Object.fromEntries(
    series.map((s, i) => {
      let label = s

      if (s === 'inflow') label = 'Inflytt'
      else if (s === 'outflow') label = 'Utflytt'
      else if (s === 'net') label = 'Nettoflytt'
      else label = s.charAt(0).toUpperCase() + s.slice(1)

      return [
        s,
        {
          label,
          color: `var(--chart-${i + 1})`,
        },
      ]
    })
  )

  return (
    <Card className="w-full relative">
      {id && (
        <div className="absolute top-3 right-3 flex gap-2">
          <ChartEditor chartId={id} />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="text-muted-foreground hover:text-red-500 transition">
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
                  rapporten.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Avbryt</AlertDialogCancel>
                <AlertDialogAction variant="destructive" asChild>
                  <Form method="post">
                    <input type="hidden" name="intent" value="deleteChart" />
                    <input type="hidden" name="id" value={id} />
                    <Button type="submit">Radera</Button>
                  </Form>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer config={config}>
          {type === 'column' ? (
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
              <ChartLegend content={<ChartLegendContent />} />
              {series.map((s, i) => (
                <Bar
                  key={s}
                  dataKey={s}
                  fill={`var(--chart-${i + 1})`}
                  radius={8}
                />
              ))}
            </BarChart>
          ) : type === 'bar' ? (
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
              <ChartLegend content={<ChartLegendContent />} />
              {series.map((s, i) => (
                <Bar
                  key={s}
                  dataKey={s}
                  fill={`var(--chart-${i + 1})`}
                  radius={8}
                />
              ))}
            </BarChart>
          ) : type === 'line' ? (
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
                content={<ChartTooltipContent hideLabel />}
              />
              <ChartLegend content={<ChartLegendContent />} />
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
          ) : type === 'pie' ? (
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={data} dataKey={series[0]} nameKey={dimension} label>
                {data.map((_, i) => (
                  <Cell key={i} fill={`var(--chart-${(i % 11) + 1})`} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <div>Inga diagram tillgängliga</div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
