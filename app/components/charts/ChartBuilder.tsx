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
import { generateChartTitle } from '~/lib/generateChartTitle'
import { Label } from '../ui/label'

export function ChartBuilder() {
  const [type, setType] = useState<string>('')
  const [measure, setMeasure] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [chartType, setChartType] = useState<string>('')
  const [measureCalculation, setMeasureCalculation] = useState<string>('')
  const [validation, setValidation] = useState({
    type: false,
    measure: false,
    category: false,
    chartType: false,
    measureCalculation: false,
  })

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
            setValidation({
              type: false,
              measure: false,
              category: false,
              chartType: false,
              measureCalculation: false,
            })
          }, 0)
        }
      }}
    >
      <DialogTrigger>
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
          <input type="hidden" name="chartDescription" value={''} />
          <input type="hidden" name="excludeSelectedArea" value="off" />
          <input
            type="hidden"
            name="maxNumberOfCategories"
            value={
              type === 'netflow+category' && category === 'relocationYear'
                ? 0
                : 10
            }
          />
          <input type="hidden" name="combineRemainingCategories" value="off" />
          <input type="hidden" name="containerSize" value="50" />
          <input type="hidden" name="legendPlacement" value="hidden" />
          <input type="hidden" name="tablePlacement" value="hidden" />

          {/* type */}
          <div>
            <Label className="mb-2">Välj diagram</Label>
            <Select
              name="type"
              value={type}
              onValueChange={(value) => {
                setType(value)
                setValidation((prev) => ({ ...prev, type: true }))
              }}
              required
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={validation.type && !type}
              >
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
                  <Label className="mb-2">Mätvärde</Label>
                  <Select
                    name="measure"
                    value={measure}
                    onValueChange={(value) => {
                      setMeasure(value)
                      setValidation((prev) => ({ ...prev, measure: true }))
                    }}
                    required
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={validation.measure && !measure}
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
              {type === 'netflow+category' && (
                <input type="hidden" name="measure" value="netflow" />
              )}

              {/* category */}
              {(type === 'category' ||
                type === 'temporal+category' ||
                type === 'netflow+category') && (
                <div>
                  <Label className="mb-2">Kategori</Label>
                  <Select
                    name="category"
                    value={category}
                    onValueChange={(value) => {
                      setCategory(value)
                      setValidation((prev) => ({ ...prev, category: true }))
                    }}
                    required
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={validation.category && !category}
                    >
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
              {(type === 'category' || type === 'netflow+category') && (
                <div>
                  <Label className="mb-2">Diagramtyp</Label>
                  <Select
                    name="chartType"
                    value={chartType}
                    onValueChange={(value) => {
                      setChartType(value)
                      setValidation((prev) => ({ ...prev, chartType: true }))
                    }}
                    required
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={validation.chartType && !chartType}
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

              {/* measureCalculation */}
              {type === 'temporal+category' && (
                <div>
                  <Label className="mb-2">Beräkning</Label>
                  <Select
                    name="measureCalculation"
                    value={measureCalculation}
                    onValueChange={(value) => {
                      setMeasureCalculation(value)
                      setValidation((prev) => ({
                        ...prev,
                        measureCalculation: true,
                      }))
                    }}
                    required
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={
                        validation.measureCalculation && !measureCalculation
                      }
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

          <DialogClose className="w-full block">
            <Button
              type="submit"
              className="w-full"
              onClick={() => {
                setTimeout(() => {
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth',
                  })
                }, 500)
              }}
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
