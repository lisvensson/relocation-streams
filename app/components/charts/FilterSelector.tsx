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
    <>
      {items.map((item) => (
        <label key={item} className="block mb-2">
          <input
            type="checkbox"
            name={name}
            value={item}
            defaultChecked={searchParams.has(name, String(item))}
            className="mr-2"
          />
          {item}
        </label>
      ))}
    </>
  )
}
