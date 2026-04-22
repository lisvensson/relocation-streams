import { db } from '~/shared/database'
import { buildSharedReportSnapshot } from './buildSharedReportSnapshot'
import { sharedReports } from '~/shared/database/schema'
import { eq } from 'drizzle-orm'

export async function updateSharedSnapshot(reportId: string) {
  const snapshot = await buildSharedReportSnapshot(reportId)

  await db
    .update(sharedReports)
    .set({
      title: snapshot.report.title,
      description: snapshot.report.description,
      charts: snapshot.charts,
    })
    .where(eq(sharedReports.reportId, reportId))
}
