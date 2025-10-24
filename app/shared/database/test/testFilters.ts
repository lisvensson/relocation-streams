import { filterRelocations } from "../queries/filterRelocations.ts";

async function testFilters() {
  const result = await filterRelocations({
  //years: [2023],
  companyTypes: [],
  //industryClusters: ["AI", "Tech"],
  //fromLocation: ["Uppsala län"],
  toLocation: ["Stockholms län"]
});

  console.log(result);
}

testFilters();