import { Button } from '~/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'
import { Form } from 'react-router'
import { useState } from 'react'
import { ChartColumnIcon } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'

export function ChartBuilder() {
  const [type, setType] = useState<string>('')
  const [measure, setMeasure] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [chartType, setChartType] = useState<string>('')
  const [measureCalculation, setMeasureCalculation] = useState<string>('')

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setTimeout(() => {
            setType('')
            setMeasure('')
            setCategory('')
            setChartType('')
            setMeasureCalculation('')
          }, 0)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <ChartColumnIcon className="size-4 mr-2" />
          Skapa nytt diagram
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Skapa nytt diagram</DialogTitle>
        </DialogHeader>

        <Form method="post" className="space-y-6">
          <input type="hidden" name="intent" value="addChart" />
          <input type="hidden" name="chartTitle" value={''} />
          <input type="hidden" name="chartDescription" value={''} />
          <input type="hidden" name="excludeSelectedArea" value="off" />
          <input type="hidden" name="maxNumberOfCategories" value="10" />
          <input type="hidden" name="combineRemainingCategories" value="off" />
          <input type="hidden" name="containerSize" value="50" />
          <input type="hidden" name="legendPlacement" value="hidden" />
          <input type="hidden" name="tablePlacement" value="hidden" />

          {/* type */}
          <div>
            <label className="block mb-1 font-medium">Välj diagram</label>
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
                    <SelectTrigger className="w-full" aria-invalid={!measure}>
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
                    <SelectTrigger className="w-full" aria-invalid={!category}>
                      <SelectValue placeholder="Välj kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {type === 'netflow+category' && (
                        <SelectItem value="relocationYear">Flyttår</SelectItem>
                      )}
                      <SelectItem value="employeeRange">
                        Antal anställda
                      </SelectItem>
                      <SelectItem value="industryCluster">Kluster</SelectItem>
                      <SelectItem value="companyType">Företagsform</SelectItem>
                      <SelectItem value="postalArea">Postområde</SelectItem>
                      <SelectItem value="municipality">Kommun</SelectItem>
                      <SelectItem value="county">Län</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* chartType */}
              {type === 'category' && (
                <div>
                  <label className="block mb-1 font-medium">Diagramtyp</label>
                  <Select
                    name="chartType"
                    value={chartType}
                    onValueChange={setChartType}
                    required
                  >
                    <SelectTrigger className="w-full" aria-invalid={!chartType}>
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
                  <label className="block mb-1 font-medium">Beräkning</label>
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
            </div>
          )}

          <DialogClose asChild>
            <Button
              type="submit"
              className="w-full"
              disabled={
                !type ||
                (['temporal', 'category', 'temporal+category'].includes(type) &&
                  !measure) ||
                (['category', 'temporal+category', 'netflow+category'].includes(
                  type
                ) &&
                  !category) ||
                (type === 'category' && !chartType) ||
                (type === 'temporal+category' && !measureCalculation)
              }
            >
              Lägg till diagram i rapporten
            </Button>
          </DialogClose>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
