import { useEffect } from "react";
import { useKeenSlider } from "keen-slider/react.es"; // use the ESM React entry
import "keen-slider/keen-slider.min.css";

// IMPORTANT: match the exact filename case (Linux is case-sensitive)
import shoe from "../assets/heroBanner/shoe.jpg";
import camera from "../assets/heroBanner/camera.jpg";
import bag from "../assets/heroBanner/bag.jpg";
import glass from "../assets/heroBanner/glass.jpg";
import perfume from "../assets/heroBanner/perfume.jpg";

const slides = [
  { src: shoe, alt: "New Arrivals", href: "#" },
  { src: camera, alt: "Limited Offer", href: "#" },
  { src: bag, alt: "Best Sellers", href: "#" },
  { src: glass, alt: "Limited Offer", href: "#" },
  { src: perfume, alt: "Best Sellers", href: "#" },
];

export default function HeroSlider() {
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    renderMode: "performance",
    slides: { perView: 1 },
  });

  useEffect(() => {
    const i = instanceRef.current;
    if (!i) return;
    const id = setInterval(() => i.next(), 4000);
    return () => clearInterval(id);
  }, [instanceRef]);

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="keen-slider aspect-[4/3] w-full rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-sm"
      >
        {slides.map((s, idx) => (
          <a key={idx} href={s.href} className="keen-slider__slide block" aria-label={s.alt}>
            <img
              src={s.src}
              alt={s.alt}
              className="h-full w-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
              onError={() => console.warn("Image failed to load:", s.src)}
            />
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => instanceRef.current?.prev()}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur px-3 py-2 ring-1 ring-gray-300 shadow hover:bg-white"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => instanceRef.current?.next()}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur px-3 py-2 ring-1 ring-gray-300 shadow hover:bg-white"
      >
        ›
      </button>
    </div>
  );
}
