import { db } from "../index.ts";

export async function filterRelocations(filters: {
    years?: number[];
    companyTypes?: string[];
    industryClusters?: string[];
    fromLocation?: string[];
    toLocation?: string[];
}) {
    const where = {
        relocationYear: { in: filters.years },
        companyType: { in: filters.companyTypes },
        industryCluster: { in: filters.industryClusters },
        fromLocation: { arrayContains: filters.fromLocation },
        toLocation: { arrayContains: filters.toLocation },
    } 
    const result = await db.query.relocation.findMany({where});
    return result;
}