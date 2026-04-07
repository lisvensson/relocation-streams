import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from '../ui/combobox'

interface LocationSelectorProps {
  locations: {
    postalAreas: string[]
    municipalities: string[]
    counties: string[]
  }
  value: string
  onChange: (value: string) => void
}

export function LocationSelector({
  locations,
  value,
  onChange,
}: LocationSelectorProps) {
  const groups = [
    { label: 'Postområde', items: locations.postalAreas },
    { label: 'Kommun', items: locations.municipalities },
    { label: 'Län', items: locations.counties },
  ]

  return (
    <>
      <Combobox
        items={groups}
        value={value}
        onValueChange={(val) => onChange(val ?? '')}
      >
        <ComboboxInput placeholder="Välj område..." />
        <ComboboxContent>
          <ComboboxEmpty>Inga resultat hittades.</ComboboxEmpty>
          <ComboboxList>
            {(group, index) => (
              <ComboboxGroup key={group.label} items={group.items}>
                <ComboboxLabel>{group.label}</ComboboxLabel>
                <ComboboxCollection>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
                {index < groups.length - 1 && <ComboboxSeparator />}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <input type="hidden" name="location" value={value} />
    </>
  )
}
