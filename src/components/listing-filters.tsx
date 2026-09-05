"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Country, City } from "@/lib/types";

export function ListingFilters({
  countries,
  cities,
}: {
  countries: Country[];
  cities: City[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCountryId = searchParams.get("shteti") ?? "";
  const filteredCities = selectedCountryId
    ? cities.filter((c) => String(c.country_id) === selectedCountryId)
    : cities;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key === "shteti") {
      params.delete("qyteti");
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <select
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={selectedCountryId}
        onChange={(e) => updateParam("shteti", e.target.value)}
      >
        <option value="">Të gjitha shtetet</option>
        {countries.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={searchParams.get("qyteti") ?? ""}
        onChange={(e) => updateParam("qyteti", e.target.value)}
      >
        <option value="">Të gjitha qytetet</option>
        {filteredCities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={0}
        placeholder="Çmimi max (€/ditë)"
        defaultValue={searchParams.get("cmimiMax") ?? ""}
        onBlur={(e) => updateParam("cmimiMax", e.target.value)}
        className="w-44 rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
