import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../utils/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceHistoryData, setPriceHistoryData] = useState([]);
  const [viewProductMessage, setViewProductMessage] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseFormData, setPurchaseFormData] = useState({
    itemName: "",
    category: "",
    quantity: 1,
    price: "",
    date: "",
    shopName: "",
  });
  const [purchaseFormError, setPurchaseFormError] = useState("");
  const [purchaseFormSuccess, setPurchaseFormSuccess] = useState("");

  const categories = ["Clothes", "Electronics", "Food & Groceries", " Other"];

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(
          `/BestPriceProduct/GetBestPriceProductsDetails/${id}`
        );
        console.log("Product Details API Response:", response.data);
        setProductDetails(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching product details:", err);
        let errorMessage = "Failed to fetch product details. ";
        if (err.code === "ECONNABORTED") {
          errorMessage += "Request timed out.";
        } else if (err.code === "ERR_NETWORK") {
          errorMessage += "Network error.";
        } else {
          errorMessage += err.response?.data?.message || err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const fetchPriceHistory = async () => {
      if (!id) return;
      try {
        const response = await api.get(
          `/BestPriceProduct/GetProductPriceHistory${id}`
        );
        console.log("Price History API Response:", response.data);
        setPriceHistoryData(response.data);
      } catch (err) {
        console.error("Error fetching price history:", err);
        // Handle error, e.g., set an error state for price history
      }
    };

    fetchProductDetails();
    fetchPriceHistory();
  }, [id]);

  const handleViewProduct = async (productId, productUrl) => {
    try {
      await api.put(`/BestPriceProduct/MarkPurchased/${id}`);
      setViewProductMessage("Product marked as purchased successfully!");
    } catch (error) {
      setViewProductMessage("Failed to mark product as purchased.");
      console.error("Failed to mark as purchased:", error);
    }
  };

  const handleMarkAsPurchased = (product) => {
    // Pre-fill the form with product data and today's date
    const today = new Date().toISOString().split("T")[0];

    // Ensure category is one of the valid options
    const productCategory = categories.includes(product.category)
      ? product.category
      : " Other";

    setPurchaseFormData({
      itemName: product.productName || "",
      category: productCategory,
      quantity: 1,
      price: product.price?.toString() || "",
      date: today,
      shopName: product.shopName || "",
    });
    setShowPurchaseForm(true);
    setShowProductModal(false);
    setPurchaseFormError("");
    setPurchaseFormSuccess("");
  };

  const handlePurchaseFormChange = (e) => {
    const { name, value } = e.target;
    setPurchaseFormData({ ...purchaseFormData, [name]: value });
  };

  const handlePurchaseFormSubmit = async (e) => {
    e.preventDefault();
    setPurchaseFormError("");
    setPurchaseFormSuccess("");

    try {
      const purchaseData = {
        id: 0,
        productName: purchaseFormData.itemName,
        category: purchaseFormData.category,
        date: purchaseFormData.date,
        price: parseFloat(purchaseFormData.price) || 0,
        quantity: parseInt(purchaseFormData.quantity) || 1,
        shopName: purchaseFormData.shopName,
      };

      console.log("Sending purchase data:", purchaseData);

      const response = await api.post(
        "/PurchasedProduct/AddPurchasedProduct",
        purchaseData
      );

      console.log("Purchase response:", response.data);

      if (response.status === 200) {
        setPurchaseFormSuccess("Product added to purchased list successfully!");
        setShowPurchaseForm(false);
        // Reset form
        setPurchaseFormData({
          itemName: "",
          category: "",
          quantity: 1,
          price: "",
          date: "",
          shopName: "",
        });
      } else {
        throw new Error(
          response.data.message ||
            `Failed to add purchase with status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error adding purchase:", error);
      setPurchaseFormError(
        error.response?.data?.message ||
          error.message ||
          "Failed to add purchase"
      );
    }
  };

  if (loading) {
    return <div className="text-white">Loading product details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#121212] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4">Product Details</h1>
      {viewProductMessage && (
        <div
          className={`mb-4 p-2 rounded ${
            viewProductMessage.includes("success")
              ? "bg-green-600"
              : "bg-red-600"
          } text-white`}
        >
          {viewProductMessage}
        </div>
      )}
      {productDetails ? (
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6 shadow-md flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            {productDetails.image && (
              <img
                src={productDetails.image}
                alt={productDetails.productName}
                className="w-full max-w-xs h-auto object-contain rounded-lg mb-4 bg-[#1E1E1E] p-2 shadow-md"
              />
            )}
          </div>
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl font-semibold mb-2">
              {productDetails.productName || "Product Name N/A"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400">Category:</p>
                <p className="text-lg font-bold">
                  {productDetails.category || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Price:</p>
                <p className="text-lg font-bold text-blue-400">
                  L.E. {productDetails.price?.toFixed(2) || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Store:</p>
                <p className="text-lg font-bold">
                  {productDetails.shopName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Date Recorded:</p>
                <p className="text-lg font-bold">
                  {productDetails.date
                    ? new Date(productDetails.date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              {console.log("ProductDetails object:", productDetails)}
              {productDetails.url && (
                <div className="sm:col-span-2 lg:col-span-1">
                  <p className="text-gray-400">Product URL:</p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowProductModal(true);
                    }}
                    className="text-blue-500 hover:underline text-lg font-bold truncate block"
                    style={{ cursor: "pointer" }}
                  >
                    View Product
                  </a>
                </div>
              )}
              {productDetails.priceHistory &&
                productDetails.priceHistory.length > 0 && (
                  <div>
                    <p className="text-gray-400">Price History:</p>
                    <p className="text-lg font-bold">
                      Available ({productDetails.priceHistory.length} entries)
                    </p>
                  </div>
                )}
            </div>

            {/* Price History Graph Section */}
            {priceHistoryData && priceHistoryData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Price History</h3>
                <div className="bg-[#2A2A2A] p-4 rounded-lg">
                  <Line
                    data={{
                      labels: priceHistoryData.map((item) =>
                        new Date(item.dateRecorded).toLocaleDateString()
                      ),
                      datasets: [
                        {
                          label: "Price",
                          data: priceHistoryData.map((item) => item.price),
                          fill: false,
                          borderColor: "rgb(75, 192, 192)",
                          tension: 0.1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: { color: "#E0E0E0" },
                        },
                        title: {
                          display: true,
                          text: "Product Price History",
                          color: "#E0E0E0",
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              let label = context.dataset.label || "";
                              if (label) {
                                label += ": ";
                              }
                              if (
                                context.dataset.label &&
                                context.parsed.y !== null
                              ) {
                                label +=
                                  "L.E " +
                                  context.parsed.y.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  });
                              }
                              return label;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          ticks: { color: "#E0E0E0" },
                          grid: { color: "#444" },
                        },
                        y: {
                          ticks: { color: "#E0E0E0" },
                          grid: { color: "#444" },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>No product details found.</p>
      )}
      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-all">
          <div className="bg-gradient-to-br from-[#232526] to-[#414345] rounded-2xl shadow-2xl p-8 w-full max-w-xs sm:max-w-sm border border-gray-700 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
              onClick={() => setShowProductModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-extrabold mb-6 text-white tracking-wide">
              Product Actions
            </h2>
            <div className="flex flex-col gap-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition-all duration-150"
                onClick={() => window.open(productDetails.url, "_blank")}
              >
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14 3h7v7m0 0L10 21l-7-7L21 10z" />
                  </svg>
                  Open Product URL
                </span>
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow transition-all duration-150"
                onClick={() => handleMarkAsPurchased(productDetails)}
              >
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Purchased
                </span>
              </button>
              <button
                className="text-gray-400 hover:text-white font-medium py-2 transition"
                onClick={() => setShowProductModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showPurchaseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-all">
          <div className="bg-gradient-to-br from-[#232526] to-[#414345] rounded-2xl shadow-2xl p-8 w-full max-w-xs sm:max-w-sm border border-gray-700 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
              onClick={() => setShowPurchaseForm(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-extrabold mb-6 text-white tracking-wide">
              Add to Purchased List
            </h2>
            <form
              onSubmit={handlePurchaseFormSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-400"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={purchaseFormData.quantity}
                  onChange={handlePurchaseFormChange}
                  className="mt-1 block w-full bg-[#2A2A2A] text-white border-gray-700 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="1"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add to Purchased List
              </button>
            </form>
            {purchaseFormError && (
              <div className="text-red-500 mt-2">
                Error: {purchaseFormError}
              </div>
            )}
            {purchaseFormSuccess && (
              <div className="text-green-500 mt-2">
                Success: {purchaseFormSuccess}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
