import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-28 px-4 pb-16 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          Thank you for your order!
        </h1>
        <p className="text-gray-700 mb-2">
          Your order has been placed successfully.
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-6">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        )}

        <Link
          to="/"
          className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700"
        >
          Continue shopping
        </Link>
      </div>
    </>
  );
}
