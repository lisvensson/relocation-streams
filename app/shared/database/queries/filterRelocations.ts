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
        fromLocation: filters.fromLocation?.[0] ? { arrayContains: filters.fromLocation } : undefined,
        toLocation: filters.toLocation?.[0] ? { arrayContains: filters.toLocation } : undefined,
    }; 
    const result = await db.query.relocation.findMany({where});
    return result;
}