import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

export default function HeroSlider({ products = [] }) {
  const [sliderKey, setSliderKey] = useState(0);

  const slides = useMemo(() => {
    return (products || [])
      .filter((p) => p?.images?.[0]?.url)
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        title: p.title,
        price: p.discountPrice ?? p.price,
        currency: p.currency || "EUR",
        imageUrl: p.images[0].url,
      }));
  }, [products]);

  // Remount slider when product count changes
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
        "(min-width: 640px)": { slides: { perView: 1 } },
        "(min-width: 1024px)": { slides: { perView: 1 } },
      },
      drag: true,
      rubberband: true,
    },
    [
      // SAFE AUTOPLAY PLUGIN
      (slider) => {
        let timeout;
        let mouseOver = false;

        function clear() {
          clearTimeout(timeout);
        }

        function run() {
          clear();
          if (!mouseOver && slider) {
            timeout = setTimeout(() => {
              if (slider?.next) slider.next();
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
            run();
          });
          run();
        });

        slider.on("destroyed", () => {
          clear();
        });

        slider.on("dragStarted", clear);
        slider.on("animationEnded", run);
        slider.on("updated", run);
      },
    ]
  );

  return (
    <div key={sliderKey} className="relative w-full mx-auto max-w-xl md:max-w-full">
      <div
        ref={sliderRef}
        className="keen-slider aspect-[4/5] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow ring-1 ring-gray-200"
      >
        {slides.map((s, idx) => (
          <div key={idx} className="keen-slider__slide !min-w-full relative">
            <img src={s.imageUrl} className="w-full h-full object-cover" />

            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
              <span className="inline-block text-xs font-semibold px-3 py-1 bg-white/20 border border-white/30 text-white rounded-full">
                Latest Arrivals
              </span>

              <h3 className="mt-2 text-white font-semibold text-lg">{s.title}</h3>
              <p className="text-indigo-100 font-bold">
                {formatCurrency(s.price, s.currency)}
              </p>

              <Link
                to={`/product/${s.id}`}
                className="mt-3 inline-flex bg-white/90 hover:bg-white px-4 py-2 rounded-full text-sm font-semibold shadow"
              >
                View product
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => instanceRef.current?.prev()}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow ring-1 ring-gray-300"
      >
        ‹
      </button>

      <button
        onClick={() => instanceRef.current?.next()}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow ring-1 ring-gray-300"
      >
        ›
      </button>
    </div>
  );
}

function formatCurrency(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}
