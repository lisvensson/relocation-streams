import { useState } from 'react'
import { MultiSelect } from '../ui/multi-select'

interface FilterSelectorProps<T extends string | number> {
  name: string
  items: T[]
  searchParams: URLSearchParams
}

export function FilterSelector<T extends string | number>({
  name,
  items,
  searchParams,
}: FilterSelectorProps<T>) {
  const defaultValues = items
    .filter((item) => searchParams.has(name, String(item)))
    .map((item) => String(item))

  const [selected, setSelected] = useState<string[]>(defaultValues)

  const options = items.map((item) => ({
    label: String(item),
    value: String(item),
  }))

  return (
    <>
      <MultiSelect
        name={name}
        options={options}
        value={selected}
        defaultValue={defaultValues}
        onValueChange={setSelected}
        placeholder="Välj..."
        variant="default"
        maxCount={3}
      />

      {[...selected]
        .sort(
          (a, b) =>
            items.findIndex((i) => String(i) === a) -
            items.findIndex((i) => String(i) === b)
        )
        .map((value) => (
          <input key={value} type="hidden" name={name} value={value} />
        ))}
    </>
  )
}
