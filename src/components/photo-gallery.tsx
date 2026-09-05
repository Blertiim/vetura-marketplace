"use client";

import { useState } from "react";

export function PhotoGallery({
  photos,
  title,
}: {
  photos: { id: string; url: string }[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        Pa foto
      </div>
    );
  }

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[activeIndex].url}
        alt={title}
        className="aspect-[4/3] w-full rounded-xl object-cover"
      />
      {photos.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setActiveIndex(i)}
              className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                i === activeIndex ? "border-brand-500" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
