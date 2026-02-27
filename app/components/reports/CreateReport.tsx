import { Form, useNavigation } from 'react-router'
import { Spinner } from '../ui/spinner'
import { Button } from '../ui/button'
import { useEffect, useState } from 'react'

export function CreateReport() {
  const navigation = useNavigation()
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (
      navigation.state === 'submitting' &&
      navigation.formData?.get('intent') === 'createReport'
    ) {
      setIsCreating(true)
    }
  }, [navigation.state])

  return (
    <Form method="post">
      <input type="hidden" name="intent" value="createReport" />
      <Button
        type="submit"
        disabled={isCreating}
        className="relative flex items-center gap-2 cursor-pointer"
      >
        {isCreating && <Spinner className="size-4" />}
        {isCreating ? 'Skapar rapport...' : 'Skapa rapport'}
      </Button>
    </Form>
  )
}
