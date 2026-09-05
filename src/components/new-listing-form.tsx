"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { City, Country } from "@/lib/types";

const currentYear = new Date().getFullYear();

export function NewListingForm({
  countries,
  cities,
}: {
  countries: Country[];
  cities: City[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [countryId, setCountryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [priceAmount, setPriceAmount] = useState("");
  const [priceUnit, setPriceUnit] = useState<"day" | "week">("day");
  const [mileage, setMileage] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [availFrom, setAvailFrom] = useState("");
  const [availTo, setAvailTo] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCities = useMemo(
    () => (countryId ? cities.filter((c) => String(c.country_id) === countryId) : cities),
    [countryId, cities]
  );

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotos(files.slice(0, 8)); // max 8 foto për fillim
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!brand || !model || !cityId || !priceAmount) {
      setError("Plotëso marka, modeli, qyteti dhe çmimi — janë të domosdoshme.");
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Duhesh me qenë i loguem.");
        setSubmitting(false);
        return;
      }

      const title = `${brand} ${model} ${year}`;

      const { data: listing, error: insertError } = await supabase
        .from("listings")
        .insert({
          owner_id: user.id,
          title,
          brand,
          model,
          year: Number(year),
          price_amount: Number(priceAmount),
          price_unit: priceUnit,
          city_id: Number(cityId),
          description: description || null,
          mileage_km: mileage ? Number(mileage) : null,
          condition: condition || null,
        })
        .select()
        .single();

      if (insertError || !listing) {
        throw insertError ?? new Error("S'u krijua listimi.");
      }

      // Ngarko fotot (nëse ka) te Supabase Storage
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const path = `${user.id}/${listing.id}/${i}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(path, file);

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          continue; // vazhdo me fotot tjera edhe nëse njëra dështon
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("listing-photos").getPublicUrl(path);

        await supabase.from("listing_photos").insert({
          listing_id: listing.id,
          url: publicUrl,
          sort_order: i,
        });
      }

      // Disponueshmëria (opsionale)
      if (availFrom && availTo) {
        await supabase.from("listing_availability").insert({
          listing_id: listing.id,
          start_date: availFrom,
          end_date: availTo,
        });
      }

      router.push(`/listimet/${listing.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Diçka shkoi keq.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder="Marka (p.sh. Volkswagen)"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Modeli (p.sh. Golf 7)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <input
          required
          type="number"
          min={1970}
          max={currentYear + 1}
          placeholder="Viti"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          placeholder="Km (opsionale)"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Gjendja</option>
          <option value="e shkëlqyer">E shkëlqyer</option>
          <option value="e mirë">E mirë</option>
          <option value="mesatare">Mesatare</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select
          value={countryId}
          onChange={(e) => {
            setCountryId(e.target.value);
            setCityId("");
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Shteti</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          required
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Qyteti</option>
          {filteredCities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          required
          type="number"
          min={0}
          step="0.01"
          placeholder="Çmimi (€)"
          value={priceAmount}
          onChange={(e) => setPriceAmount(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={priceUnit}
          onChange={(e) => setPriceUnit(e.target.value as "day" | "week")}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="day">Për ditë</option>
          <option value="week">Për javë</option>
        </select>
      </div>

      <textarea
        placeholder="Përshkrimi (opsionale) — p.sh. detaje shtesë, kushte, etj."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Kur âsht e lirë (opsionale)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={availFrom}
            onChange={(e) => setAvailFrom(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={availTo}
            onChange={(e) => setAvailTo(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Foto (deri 8 copë)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="block w-full text-sm"
        />
        {photos.length > 0 && (
          <p className="mt-1 text-xs text-slate-500">
            {photos.length} foto të zgjedhuna.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {submitting ? "Duke postu..." : "Posto veturën"}
      </button>
    </form>
  );
}
