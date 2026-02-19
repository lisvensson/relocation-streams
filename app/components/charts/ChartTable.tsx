import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

export function ChartTable({
  data,
  dimension,
  series,
}: {
  data: any[]
  dimension: string
  series: string[]
}) {
  const dimensionValues = data.map((row) => row[dimension])

  return (
    <Table className="my-4 text-sm">
      <TableHeader>
        <TableRow>
          <TableHead className="font-normal"></TableHead>
          {dimensionValues.map((value) => (
            <TableHead key={value} className="text-right ">
              {value}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {series.map((serie) => (
          <TableRow key={serie}>
            <TableCell className="font-medium">
              {serie === 'inflow'
                ? 'Inflytt'
                : serie === 'outflow'
                  ? 'Utflytt'
                  : serie === 'net'
                    ? 'Nettoflytt'
                    : serie.charAt(0).toUpperCase() + serie.slice(1)}
            </TableCell>

            {data.map((row) => (
              <TableCell key={row[dimension]} className="text-right">
                {row[serie]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      <TableRow></TableRow>
    </Table>
  )
}
