import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Add to basket your favorite products and get them delivered
              </h1>
              <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
                Browse curated feed and supplies. Sign in to see personalized
                recommendations and manage your cart.
              </p>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  Get Started
                </Link>
                <Link
                  to="/signin"
                  className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-indigo-700 bg-white/70 hover:bg-white shadow-sm ring-1 ring-inset ring-indigo-200"
                >
                  Sign In
                </Link>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                No account yet? Create one in seconds.
              </p>
            </div>

            <HeroSlider />
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              to="#"
              className="text-sm font-medium text-indigo-700 hover:text-indigo-800"
            >
              View all
            </Link>
          </div>

          {/* Placeholder grid */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {["Product A", "Product B", "Product C", "Product D", "Product E", "Product F"].map(
              (title, i) => (
                <li
                  key={i}
                  className="group rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-gray-200 p-5 hover:shadow-md transition"
                >
                  <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 grid place-items-center mb-4">
                    <span className="text-gray-400 text-sm">Image</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Short description goes here.
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">
                      € ——
                    </span>
                    <button className="text-sm rounded-full px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700">
                      Details
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-600">
          © {new Date().getFullYear()} FishFood. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
