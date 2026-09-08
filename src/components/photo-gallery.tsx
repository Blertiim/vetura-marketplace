"use client";

import { useState } from "react";
import Image from "next/image";
import { useI18n } from "@/components/i18n-provider";

export function PhotoGallery({
  photos,
  title,
}: {
  photos: { id: string; url: string }[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { dict } = useI18n();

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        {dict.listing.paFoto}
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
        <Image
          src={photos[activeIndex].url}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover"
        />
      </div>
      {photos.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                i === activeIndex ? "border-brand-500" : "border-transparent"
              }`}
            >
              <Image src={photo.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
