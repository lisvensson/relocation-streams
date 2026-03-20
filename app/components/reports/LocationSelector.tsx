import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../ui/combobox'

interface LocationSelectorProps {
  locations: string[]
  value: string
  onChange: (value: string) => void
}

export function LocationSelector({
  locations,
  value,
  onChange,
}: LocationSelectorProps) {
  return (
    <>
      <Combobox
        items={locations}
        value={value}
        onValueChange={(val) => onChange(val ?? '')}
      >
        <ComboboxInput placeholder="Välj område" />
        <ComboboxContent>
          <ComboboxEmpty>Inga träffar</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <input type="hidden" name="location" value={value} />
    </>
  )
}
