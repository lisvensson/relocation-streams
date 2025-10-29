import { Form, useSearchParams } from "react-router";
import type { Route } from "./+types/Relocations";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { countRelocationsBy } from "~/shared/database/queries/countRelocationsBy";
import { relocation } from "~/shared/database/schema";

function createChartConfig(diagram: {
    axis: { y: { label: string; dataKey: string } };
}): Record<string, { label: string; color: string }> {
    return {
        [diagram.axis.y.dataKey]: {
            label: diagram.axis.y.label,
            color: "var(--chart-1)",
        },
    }
}

export async function loader({ request }: Route.LoaderArgs) {
    const filterOptions = {
        years: [2021, 2022, 2023, 2024],
        companyTypes: ["AB", "EF", "HB"],
        industryClusters: ["AI", "Design", "Healthcare", "IT", "Tech"],
        locations: ["Eskilstuna", "Stockholm", "Göteborg", "Örebro", "Gävle"],
        //locations: ["Kalmar län", "Örebro län", "Skåne län", "Stockholms län", "Uppsala län", "Västra Götalands län"]
    };

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const years = searchParams.getAll("years").map(Number);
    const companyTypes = searchParams.getAll("companyTypes").map(String);
    const industryClusters = searchParams.getAll("industryClusters").map(String);
    const location = searchParams.getAll("location").map(String);

    const filters = {
        years: years,
        companyTypes: companyTypes,
        industryClusters: industryClusters,
        toLocation: location    
    };

    console.log(filters)

    const result = await countRelocationsBy(relocation.relocationYear, filters);
    console.log("Result: ", result)

    const chartData = result.map((r) => {
        return {
            year: r.key, 
            relocations: r.value
        }   
    })

    const diagram = {
        title: `Flyttar per år till ${location}`,
        type: "bar",
        axis: {
            x: { label: "År", dataKey: "year" },
            y: { label: "Antal flyttar", dataKey: "relocations" },
        },
       chartData,
    };

    const chartConfig = createChartConfig(diagram);
    console.log("diagram: ", diagram);
    console.log("chartConfig: ", chartConfig);
    console.log("chartData", diagram.chartData);

    return { filterOptions, success: true, result, diagram, chartConfig};
}

export default function Relocations({ loaderData }: Route.ComponentProps) {
    const [searchParams] = useSearchParams();
    const { filterOptions, success, result, diagram, chartConfig } = loaderData;

    return (
        <div className="max-w-xl mx-auto px-4 py-8 font-sans">
            <h1 className="text-2xl font-bold mb-6">Filtrera relocationer</h1>
            <Form method="get" className="flex flex-col gap-6">
                <fieldset className="border border-gray-300 rounded-md p-4">
                    <legend className="font-semibold mb-2">Flyttår</legend>
                    {filterOptions.years.map((year) => (
                        <label key={year} className="block mb-2">
                        <input
                            type="checkbox"
                            name="years"
                            value={year}
                            defaultChecked={searchParams.has("years", String(year))}
                            className="mr-2"
                        />
                        {year}
                        </label>
                    ))}
                </fieldset>
                <fieldset className="border border-gray-300 rounded-md p-4">
                    <legend className="font-semibold mb-2">Företagsform</legend>
                    {filterOptions.companyTypes.map((type) => (
                        <label key={type} className="block mb-2">
                        <input
                            type="checkbox"
                            name="companyTypes"
                            value={type}
                            defaultChecked={searchParams.has("companyTypes", type)}
                            className="mr-2"
                        />
                        {type}
                        </label>
                    ))}
                </fieldset>
                <fieldset className="border border-gray-300 rounded-md p-4">
                    <legend className="font-semibold mb-2">Kluster</legend>
                    {filterOptions.industryClusters.map((cluster) => (
                        <label key={cluster} className="block mb-2">
                        <input
                            type="checkbox"
                            name="industryClusters"
                            value={cluster}
                            defaultChecked={searchParams.has("industryClusters", cluster)}
                            className="mr-2"
                        />
                        {cluster}
                        </label>
                    ))}
                </fieldset>
                <fieldset className="border border-gray-300 rounded-md p-4">
                    <legend className="font-semibold mb-2">Område</legend>
                    <select
                        name="location"
                        defaultValue={searchParams.get("location") ?? ""}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Välj område</option>
                        {filterOptions.locations.map((location) => (
                        <option key={location} value={location}>
                            {location}
                        </option>
                        ))}
                    </select>
                </fieldset>
                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                >
                    Filtrera
                </button>
            </Form>
            {success && result.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Resultat</h2>
                    <ul className="space-y-2">
                        {result.map((r, i) => (
                        <li key={i} className="bg-gray-100 p-3 rounded-md text-sm">
                            {JSON.stringify(r)}
                        </li>
                        ))}
                    </ul>
                </div>
            )}
            {success && result.length === 0 && (
                <p className="mt-6 text-gray-500">Inga resultat hittades.</p>
            )}
            {success && diagram?.chartData?.length > 0 && (
                <Card className="mt-10">
                    <CardHeader className="mb-10">
                        <CardTitle>{diagram.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <BarChart data={diagram.chartData}>
                                <CartesianGrid vertical={false} />
                                <YAxis
                                    dataKey={diagram.axis.y.dataKey}
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <XAxis
                                    dataKey={diagram.axis.x.dataKey}
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent/>}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey={diagram.axis.y.dataKey}
                                    fill={chartConfig.relocations.color}
                                    radius={8}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>            
                </Card>
            )}
        </div>
    );
}