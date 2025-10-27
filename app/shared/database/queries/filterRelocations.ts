import { db } from "../index.ts";

export async function filterRelocations(filters: {
    years?: number[];
    companyTypes?: string[];
    industryClusters?: string[];
    fromLocation?: string[];
    toLocation?: string[];
}) {
    const where = {
        relocationYear: filters.years?.length ? { in: filters.years } : undefined,
        companyType: filters.companyTypes?.length ? { in: filters.companyTypes } : undefined,
        industryCluster: filters.industryClusters?.length ? { in: filters.industryClusters } : undefined,
        fromLocation: filters.fromLocation?.filter(Boolean).length ? { arrayContains: filters.fromLocation.filter(Boolean) } : undefined,
        toLocation: filters.toLocation?.filter(Boolean).length ? { arrayContains: filters.toLocation.filter(Boolean) } : undefined,
    }; 
    const result = await db.query.relocation.findMany({where});
    return result;
}