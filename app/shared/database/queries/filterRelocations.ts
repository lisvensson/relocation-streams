import { sql } from "drizzle-orm";
import { db } from "../index.ts";

export async function filterRelocations(filters: {
    years?: number[];
    companyTypes?: string[];
    industryClusters?: string[];
    fromLocation?: string[];
    toLocation?: string[];
}) {
    const where = {
        AND: [
            ...(filters.years?.length ? [{ relocationYear: { in: filters.years } }] : []),
            ...(filters.companyTypes?.length ? [{ companyType: { in: filters.companyTypes } }] : []),
            ...(filters.industryClusters?.length ? [{ industryCluster: { in: filters.industryClusters } }] : []),
            ...(filters.fromLocation?.length ? filters.fromLocation.map((value) => ({ 
                RAW: (table: { fromLocation: any; }) => sql`${value} = ANY(${table.fromLocation})`
            })) : []),
            ...(filters.toLocation?.length ? filters.toLocation.map((value) => ({ 
                RAW: (table: { toLocation: any; }) => sql`${value} = ANY(${table.toLocation})`
            })) : [])
        ]
        
    } 
    const result = await db.query.relocation.findMany({where});
    return result;
}