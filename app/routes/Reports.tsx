import { desc } from 'drizzle-orm'
import { db } from '~/shared/database'
import { reports } from '~/shared/database/schema'
import type { Route } from './+types/Reports'
import { Link } from 'react-router'

export async function loader({}: Route.LoaderArgs) {
  const report = await db
    .select({
      id: reports.id,
      title: reports.title,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .orderBy(desc(reports.createdAt))

  return { report }
}

export default function Reports({ loaderData }: Route.ComponentProps) {
  const { report } = loaderData

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Rapporter</h1>
      <div className="flex flex-col gap-2">
        {report.map((r) => (
          <Link key={r.id} to={`/rapport/${r.id}`} className="hover:underline">
            {r.title}
          </Link>
        ))}
      </div>
    </div>
  )
}
