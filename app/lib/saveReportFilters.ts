import { eq } from 'drizzle-orm'
import { db } from '~/shared/database'
import { reports } from '~/shared/database/schema'

export async function saveReportFilters(reportId: string, formData: FormData) {
  try {
    const location = formData.get('location') as string | null
    const filters = formData.get('filters') as string | null
    const parsedFilters = filters ? JSON.parse(filters) : []

    await db
      .update(reports)
      .set({ location, filters: parsedFilters })
      .where(eq(reports.id, reportId))

    return parsedFilters
  } catch (error) {
    console.error('Failed to save report filters:', error)
    throw new Response('Kunde inte spara filter.', { status: 500 })
  }
}
