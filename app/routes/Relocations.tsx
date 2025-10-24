import { Form, useSearchParams } from "react-router";
import type { Route } from "./+types/Relocations";
import { filterRelocations } from "~/shared/database/queries/filterRelocations";

export async function loader({ request }: Route.LoaderArgs) {
    const filterOptions = {
        years: [2021, 2022, 2023, 2024],
        companyTypes: ["AB", "EF", "HB"],
        industryClusters: ["AI", "Design", "Healthcare", "IT", "Tech"],
        locations: ["Eskilstuna", "Stockholm", "Göteborg", "Örebro", "Gävle"],
    };

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const years = searchParams.getAll("years").map(Number);
    const companyTypes = searchParams.getAll("companyTypes").map(String);
    const industryClusters = searchParams.getAll("industryClusters").map(String);
    const fromLocation = searchParams.getAll("fromLocation").map(String);
    const toLocation = searchParams.getAll("toLocation").map(String);

    const filters = {
        years: years,
        companyTypes: companyTypes,
        industryClusters: industryClusters,
        fromLocation: fromLocation,
        toLocation: toLocation,
    };

    console.log(filters)

    const result = await filterRelocations(filters);
    return { filterOptions, success: true, result };
}

export default function Relocations({ loaderData }: Route.ComponentProps) {
    const [searchParams] = useSearchParams();
    const { filterOptions, success, result } = loaderData;

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
                            defaultChecked={searchParams.getAll("years").includes(String(year))}
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
                            defaultChecked={searchParams.getAll("companyTypes").includes(String(type))}
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
                            defaultChecked={searchParams.getAll("industryClusters").includes(String(cluster))}
                            className="mr-2"
                        />
                        {cluster}
                        </label>
                    ))}
                </fieldset>
                <fieldset className="border border-gray-300 rounded-md p-4">
                    <legend className="font-semibold mb-2">Från område</legend>
                    <select
                        name="fromLocation"
                        defaultValue={searchParams.get("fromLocation") ?? ""}
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
                <fieldset className="border border-gray-300 rounded-md p-4">
                    <legend className="font-semibold mb-2">Till område</legend>
                    <select
                        name="toLocation"
                        defaultValue={searchParams.get("toLocation") ?? ""}
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
        </div>
    );
}