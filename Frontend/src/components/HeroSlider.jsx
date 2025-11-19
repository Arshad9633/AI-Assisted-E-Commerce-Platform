import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

export default function HeroSlider({ products = [] }) {
  // We use a "key" to force the slider to remount when product data updates
  const [sliderKey, setSliderKey] = useState(0);

  // Convert products → slides
  const slides = useMemo(() => {
    const mapped = (products || [])
      .filter((p) => p?.images?.[0]?.url)
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        title: p.title,
        price: p.discountPrice ?? p.price,
        currency: p.currency || "EUR",
        imageUrl: p.images[0].url,
      }));

    return mapped;
  }, [products]);

  // Force slider to re-initialize when product list changes
  useEffect(() => {
    setSliderKey((k) => k + 1);
  }, [slides.length]);

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      mode: "snap",
      slides: {
        perView: 1,
        spacing: 0,
      },
      breakpoints: {
        "(min-width: 640px)": {
          slides: { perView: 1, spacing: 0 },
        },
        "(min-width: 1024px)": {
          slides: { perView: 1, spacing: 0 },
        },
      },
      drag: true,
      rubberband: true,
    },
    [
      // Autoplay plugin
      (slider) => {
        let timeout;
        let mouseOver = false;

        function clear() {
          clearTimeout(timeout);
        }

        function next() {
          clear();
          if (!mouseOver) {
            timeout = setTimeout(() => {
              slider.next();
            }, 3000);
          }
        }

        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clear();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            next();
          });
          next();
        });

        slider.on("dragStarted", clear);
        slider.on("animationEnded", next);
        slider.on("updated", next);
      },
    ]
  );

  return (
    <div key={sliderKey} className="relative w-full mx-auto max-w-xl md:max-w-full">
      <div
        ref={sliderRef}
        className="keen-slider aspect-[4/5] sm:aspect-[16/9] rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow"
      >
        {slides.map((s, idx) => (
          <div key={idx} className="keen-slider__slide w-full !min-w-full relative">
            <img
              src={s.imageUrl}
              alt={s.title}
              className="w-full h-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />

            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white uppercase tracking-wide">
                Latest Arrivals
              </span>

              <h3 className="mt-2 text-white font-semibold text-lg drop-shadow">{s.title}</h3>

              <p className="text-indigo-100 font-bold">
                {formatCurrency(s.price, s.currency)}
              </p>

              <Link
                to={`/product/${s.id}`}
                className="mt-3 inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full bg-white/90 hover:bg-white shadow"
              >
                View product
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Left arrow */}
      <button
        onClick={() => instanceRef.current?.prev()}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow rounded-full p-2 ring-1 ring-gray-300"
      >
        ‹
      </button>

      {/* Right arrow */}
      <button
        onClick={() => instanceRef.current?.next()}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow rounded-full p-2 ring-1 ring-gray-300"
      >
        ›
      </button>
    </div>
  );
}

function formatCurrency(value, currency = "EUR") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}
