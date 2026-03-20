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
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <label
          key={item}
          className="flex items-center gap-2 text-sm cursor-pointer"
        >
          <input
            type="checkbox"
            name={name}
            value={item}
            defaultChecked={searchParams.has(name, String(item))}
            className="h-4 w-4"
          />
          <span>{item}</span>
        </label>
      ))}
    </div>
  )
}
