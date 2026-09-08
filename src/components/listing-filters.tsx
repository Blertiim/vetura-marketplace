"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BODY_TYPES, CAR_COLORS, type Country, type City } from "@/lib/types";
import { useI18n } from "@/components/i18n-provider";

export function ListingFilters({
  countries,
  cities,
}: {
  countries: Country[];
  cities: City[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useI18n();
  const t = dict.listing.filters;

  const selectedCountryId = searchParams.get("shteti") ?? "";
  const selectedBodyType = searchParams.get("karoceria") ?? "";
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

  const inputClass =
    "rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <input
        type="text"
        placeholder={t.kerkoPlaceholder}
        defaultValue={searchParams.get("q") ?? ""}
        onBlur={(e) => updateParam("q", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateParam("q", e.currentTarget.value);
        }}
        className={inputClass}
      />

      <div className="flex flex-wrap gap-3">
        <select
          className={inputClass}
          value={selectedCountryId}
          onChange={(e) => updateParam("shteti", e.target.value)}
        >
          <option value="">{t.tegjithaShtetet}</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className={inputClass}
          value={searchParams.get("qyteti") ?? ""}
          onChange={(e) => updateParam("qyteti", e.target.value)}
        >
          <option value="">{t.tegjithaQytetet}</option>
          {filteredCities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={0}
          placeholder={t.cmimiNga}
          defaultValue={searchParams.get("cmimiMin") ?? ""}
          onBlur={(e) => updateParam("cmimiMin", e.target.value)}
          className={`w-36 ${inputClass}`}
        />
        <input
          type="number"
          min={0}
          placeholder={t.cmimiDeri}
          defaultValue={searchParams.get("cmimiMax") ?? ""}
          onBlur={(e) => updateParam("cmimiMax", e.target.value)}
          className={`w-36 ${inputClass}`}
        />

        <input
          type="number"
          min={1970}
          placeholder={t.vitiNga}
          defaultValue={searchParams.get("vitiMin") ?? ""}
          onBlur={(e) => updateParam("vitiMin", e.target.value)}
          className={`w-28 ${inputClass}`}
        />
        <input
          type="number"
          min={1970}
          placeholder={t.vitiDeri}
          defaultValue={searchParams.get("vitiMax") ?? ""}
          onBlur={(e) => updateParam("vitiMax", e.target.value)}
          className={`w-28 ${inputClass}`}
        />

        <input
          type="number"
          min={0}
          placeholder={t.kmMax}
          defaultValue={searchParams.get("kmMax") ?? ""}
          onBlur={(e) => updateParam("kmMax", e.target.value)}
          className={`w-32 ${inputClass}`}
        />

        <select
          className={inputClass}
          value={searchParams.get("transmisioni") ?? ""}
          onChange={(e) => updateParam("transmisioni", e.target.value)}
        >
          <option value="">{t.transmisioni}</option>
          <option value="manuale">{t.manuale}</option>
          <option value="automatike">{t.automatike}</option>
        </select>

        <select
          className={inputClass}
          value={searchParams.get("karburanti") ?? ""}
          onChange={(e) => updateParam("karburanti", e.target.value)}
        >
          <option value="">{t.karburanti}</option>
          {/* Vlerat (value) mbeten n'shqip me qëllim — janë t'ruajtuna n'databazë
              njësoj për krejt gjuhët; përkthehet vetëm çka shifet (label-i). */}
          <option value="benzinë">{t.benzine}</option>
          <option value="dizel">{t.dizel}</option>
          <option value="hibrid">{t.hibrid}</option>
          <option value="elektrike">{t.elektrike}</option>
          <option value="gaz">{t.gaz}</option>
        </select>

        <select
          className={inputClass}
          value={searchParams.get("ngjyra") ?? ""}
          onChange={(e) => updateParam("ngjyra", e.target.value)}
        >
          <option value="">{t.ngjyra}</option>
          {CAR_COLORS.map((c) => (
            <option key={c} value={c}>
              {t.colorLabels[c] ?? c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {BODY_TYPES.map((bt) => (
          <button
            key={bt}
            type="button"
            onClick={() => updateParam("karoceria", selectedBodyType === bt ? "" : bt)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              selectedBodyType === bt
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400"
                : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {t.bodyTypeLabels[bt] ?? bt}
          </button>
        ))}
      </div>
    </div>
  );
}
