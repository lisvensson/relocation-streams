import { filterRelocations } from "../queries/filterRelocations.ts";

async function testFilters() {
  const result = await filterRelocations({
  //years: [2024],
  //companyTypes: ["AB"],
  //industryClusters: ["AI"],
  //fromLocation: ["Uppsala län", "Uppsala kommun"],
  toLocation: ["örebro"]
});

  console.log(result);
}

testFilters();