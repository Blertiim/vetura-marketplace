"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { extractStoragePath } from "@/lib/phone";
import {
  BODY_TYPES,
  CAR_COLORS,
  type City,
  type Country,
  type Listing,
  type ListingAvailability,
  type ListingPhoto,
} from "@/lib/types";
import { useI18n } from "@/components/i18n-provider";

const currentYear = new Date().getFullYear();

export function EditListingForm({
  listing,
  countries,
  cities,
  initialPhotos,
  initialAvailability,
}: {
  listing: Listing;
  countries: Country[];
  cities: City[];
  initialPhotos: ListingPhoto[];
  initialAvailability: ListingAvailability[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const { dict } = useI18n();
  const t = dict.listing.editForm;
  const bodyTypeLabels = dict.listing.filters.bodyTypeLabels;
  const colorLabels = dict.listing.filters.colorLabels;

  const initialCity = cities.find((c) => c.id === listing.city_id);

  const [countryId, setCountryId] = useState(
    initialCity ? String(initialCity.country_id) : ""
  );
  const [cityId, setCityId] = useState(String(listing.city_id));
  const [brand, setBrand] = useState(listing.brand);
  const [model, setModel] = useState(listing.model);
  const [year, setYear] = useState(String(listing.year));
  const [priceAmount, setPriceAmount] = useState(String(listing.price_amount));
  const [priceUnit, setPriceUnit] = useState<"day" | "week">(listing.price_unit);
  const [mileage, setMileage] = useState(listing.mileage_km ? String(listing.mileage_km) : "");
  const [condition, setCondition] = useState(listing.condition ?? "");
  const [bodyType, setBodyType] = useState(listing.body_type ?? "");
  const [transmission, setTransmission] = useState(listing.transmission ?? "");
  const [fuelType, setFuelType] = useState(listing.fuel_type ?? "");
  const [color, setColor] = useState(listing.color ?? "");
  const [description, setDescription] = useState(listing.description ?? "");
  const [availFrom, setAvailFrom] = useState("");
  const [availTo, setAvailTo] = useState("");
  const [newPhotos, setNewPhotos] = useState<File[]>([]);

  const [photos, setPhotos] = useState(initialPhotos);
  const [availability, setAvailability] = useState(initialAvailability);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredCities = useMemo(
    () => (countryId ? cities.filter((c) => String(c.country_id) === countryId) : cities),
    [countryId, cities]
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!brand || !model || !cityId || !priceAmount) {
      setError(t.errorRequired);
      return;
    }

    setSubmitting(true);
    try {
      const title = `${brand} ${model} ${year}`;

      const { data: updatedRows, error: updateError } = await supabase
        .from("listings")
        .update({
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
          body_type: bodyType || null,
          transmission: transmission || null,
          fuel_type: fuelType || null,
          color: color || null,
        })
        .eq("id", listing.id)
        .select();

      if (updateError) throw updateError;

      // Nëse RLS e ka refuzu n'heshtje (p.sh. s'je pronari), s'kthehet
      // asnjë rresht — mos e trego "sukses" si me qenë ndryshu diçka.
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error(t.errorNoPermission);
      }

      // Ngarko fotot e reja (nëse ka)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      for (let i = 0; i < newPhotos.length; i++) {
        const file = newPhotos[i];
        const path = `${user?.id}/${listing.id}/${Date.now()}-${i}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-photos")
          .upload(path, file);

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("listing-photos").getPublicUrl(path);

        await supabase.from("listing_photos").insert({
          listing_id: listing.id,
          url: publicUrl,
          sort_order: photos.length + i,
        });
      }

      // Disponueshmëri e re (nëse âsht plotësu)
      if (availFrom && availTo) {
        await supabase.from("listing_availability").insert({
          listing_id: listing.id,
          start_date: availFrom,
          end_date: availTo,
        });
      }

      setNotice(t.successSaved);
      router.refresh();
      setTimeout(() => router.push(`/listimet/${listing.id}`), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePhoto(photo: ListingPhoto) {
    if (!window.confirm(t.confirmDeletePhoto)) return;

    const path = extractStoragePath(photo.url, "listing-photos");
    if (path) {
      await supabase.storage.from("listing-photos").remove([path]);
    }
    await supabase.from("listing_photos").delete().eq("id", photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }

  async function handleDeleteAvailability(id: string) {
    await supabase.from("listing_availability").delete().eq("id", id);
    setAvailability((prev) => prev.filter((a) => a.id !== id));
  }

  const inputClass =
    "rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500";

  return (
    <form onSubmit={handleSave} className="flex max-w-xl flex-col gap-4">
      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
          {notice}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t.existingPhotosLabel}
        </label>
        {photos.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.noPhotosYet}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative h-20 w-24 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="mt-2 mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t.addNewPhotosLabel}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setNewPhotos(Array.from(e.target.files ?? []).slice(0, 8))}
          className="block w-full text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          required
          placeholder={t.brandPlaceholder}
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className={inputClass}
        />
        <input
          required
          placeholder={t.modelPlaceholder}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <input
          required
          type="number"
          min={1970}
          max={currentYear + 1}
          placeholder={t.yearPlaceholder}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={inputClass}
        />
        <input
          type="number"
          min={0}
          placeholder={t.mileagePlaceholder}
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          className={inputClass}
        />
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className={inputClass}
        >
          <option value="">{t.conditionDefault}</option>
          <option value="e shkëlqyer">{t.conditionExcellent}</option>
          <option value="e mirë">{t.conditionGood}</option>
          <option value="mesatare">{t.conditionAverage}</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t.bodyTypeLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          {BODY_TYPES.map((bt) => (
            <button
              key={bt}
              type="button"
              onClick={() => setBodyType(bodyType === bt ? "" : bt)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                bodyType === bt
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {bodyTypeLabels[bt] ?? bt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <select
          value={transmission}
          onChange={(e) => setTransmission(e.target.value)}
          className={inputClass}
        >
          <option value="">{t.transmissionDefault}</option>
          <option value="manuale">{t.manuale}</option>
          <option value="automatike">{t.automatike}</option>
        </select>
        <select
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
          className={inputClass}
        >
          <option value="">{t.fuelTypeDefault}</option>
          <option value="benzinë">{t.benzine}</option>
          <option value="dizel">{t.dizel}</option>
          <option value="hibrid">{t.hibrid}</option>
          <option value="elektrike">{t.elektrike}</option>
          <option value="gaz">{t.gaz}</option>
        </select>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className={inputClass}
        >
          <option value="">{t.colorDefault}</option>
          {CAR_COLORS.map((c) => (
            <option key={c} value={c}>
              {colorLabels[c] ?? c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select
          value={countryId}
          onChange={(e) => {
            setCountryId(e.target.value);
            setCityId("");
          }}
          className={inputClass}
        >
          <option value="">{t.countryDefault}</option>
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
          className={inputClass}
        >
          <option value="">{t.cityDefault}</option>
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
          placeholder={t.pricePlaceholder}
          value={priceAmount}
          onChange={(e) => setPriceAmount(e.target.value)}
          className={inputClass}
        />
        <select
          value={priceUnit}
          onChange={(e) => setPriceUnit(e.target.value as "day" | "week")}
          className={inputClass}
        >
          <option value="day">{t.priceUnitDay}</option>
          <option value="week">{t.priceUnitWeek}</option>
        </select>
      </div>

      <textarea
        placeholder={t.descriptionPlaceholder}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className={inputClass}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t.existingAvailabilityLabel}
        </label>
        {availability.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.noAvailabilityYet}</p>
        ) : (
          <ul className="mb-2 flex flex-col gap-1">
            {availability.map((period) => (
              <li
                key={period.id}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-700"
              >
                <span>
                  {period.start_date} – {period.end_date}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteAvailability(period.id)}
                  className="text-red-600 hover:underline dark:text-red-400"
                >
                  {t.deletePeriod}
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t.addNewPeriodLabel}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={availFrom}
            onChange={(e) => setAvailFrom(e.target.value)}
            className={inputClass}
          />
          <input
            type="date"
            value={availTo}
            onChange={(e) => setAvailTo(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-brand-500 px-4 py-2 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
