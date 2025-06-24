import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiPlus,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import api from "../../utils/api"; // Import the shared API instance

const ToBuy = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shoppingList, setShoppingList] = useState([]);
  const [showList, setShowList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [shoppingListLoading, setShoppingListLoading] = useState(false);
  const productsPerPage = 5;

  const [allProducts, setAllProducts] = useState([]); // Stores all products fetched from API
  const [displayedProducts, setDisplayedProducts] = useState([]); // Products currently displayed after search/filter

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching all products from API.");
      const response = await api.get("/ToBuyList/GetToBuyList");

      console.log("API Response data:", response.data);

      let fetchedProducts = [];
      // Check if response.data is an array
      if (!Array.isArray(response.data)) {
        console.log(
          "Response data is not an array, attempting to process as single/empty item."
        );
        // If it's a single item, wrap it in an array
        fetchedProducts = response.data ? [response.data] : [];
      } else {
        console.log("Response data is an array.");
        // If it's already an array, use it directly
        fetchedProducts = response.data;
      }

      const formattedProducts = fetchedProducts.map((item) => ({
        id: item.id,
        title: item.productName,
        price: 0,
        thumbnail:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v8H8V8z'/%3E%3C/svg%3E",
        category: "Shopping List",
        brand: "Personal",
        rating: 5,
        discountPercentage: 0,
      }));

      setAllProducts(formattedProducts); // Store all products
      setProducts(formattedProducts); // Initial products for display
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      let errorMessage = "Failed to fetch products. ";
      if (err.code === "ECONNABORTED") {
        errorMessage += "Request timed out. Please try again.";
      } else if (err.code === "ERR_NETWORK") {
        errorMessage += "Network error. Please check your connection.";
      } else {
        errorMessage += err.response?.data?.message || err.message;
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset page to 1 on search query change
    const filtered = allProducts.filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setDisplayedProducts(filtered);
  }, [searchQuery, allProducts]);

  const fetchShoppingList = async () => {
    try {
      setShoppingListLoading(true);
      const response = await api.get("/ToBuyList/GetToBuyList");
      setShoppingList(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching shopping list:", error);
      let errorMessage = "Failed to fetch shopping list. ";
      if (error.code === "ERR_NETWORK") {
        errorMessage += "Please check your internet connection.";
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }
      setError(errorMessage);
    } finally {
      setShoppingListLoading(false);
    }
  };

  const addToShoppingList = async (product) => {
    try {
      setLoading(true);
      console.log("Adding product to shopping list:", product);

      await api.post("/ToBuyList/AddToBuyList", {
        productName: product.productName,
      });

      setLoading(false);
      fetchProducts(); // Refetch all products to update the list
      setError(null);
    } catch (err) {
      console.error("Error adding to shopping list:", err);
      let errorMessage = "Failed to add product to shopping list. ";
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

  const removeProduct = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/ToBuyList/DeleteFromToBuyList`, { params: { id } });
      fetchProducts(); // Refetch all products to update the list
      fetchShoppingList(); // Also refetch shopping list to update
      setError(null);
    } catch (err) {
      console.error("Error removing product:", err);
      let errorMessage = "Failed to remove product. ";
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

  const clearShoppingList = async () => {
    try {
      setLoading(true);
      await api.delete("/ToBuyList/ClearToBuyList");
      fetchProducts(); // Refetch all products to update the list
      fetchShoppingList(); // Also refetch shopping list to update
      setError(null);
    } catch (err) {
      console.error("Error clearing shopping list:", err);
      let errorMessage = "Failed to clear shopping list. ";
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

  const buySelectedProducts = async () => {
    try {
      setLoading(true);
      await api.post("/ToBuyList/BuySelectedProducts", shoppingList);
      setShoppingList([]); // Clear local shopping list after buying
      fetchProducts(); // Refetch all products to update the list
      fetchShoppingList(); // Also refetch shopping list to update
      setError(null);
    } catch (err) {
      console.error("Error buying selected products:", err);
      let errorMessage = "Failed to buy selected products. ";
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

  const totalPages = Math.ceil(displayedProducts.length / productsPerPage);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = displayedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[1000]">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-white text-xl">Loading products...</p>
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Search and Add Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-white text-3xl font-bold">To Buy List</h1>
          <div className="flex space-x-4">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#1E1E1E] text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    // handleSearch();
                  }
                }}
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  fetchProducts();
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={() => setShowList(!showList)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus /> Add Item
            </button>
          </div>
        </div>

        {/* Add Item Form / Shopping List */}
        {showList && (
          <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6">
            <h2 className="text-white text-xl font-semibold mb-4">
              Add New Item to Shopping List
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Pass only the product name to the addToShoppingList function
                // Assuming backend generates the ID upon addition
                addToShoppingList({
                  productName: searchQuery || "",
                });
                setSearchQuery(""); // Clear the search query after adding
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="productName"
                  className="text-gray-400 block mb-2"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  className="bg-[#2A2A2A] text-white rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to List
              </button>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6">
          <h2 className="text-white text-xl font-semibold mb-4">
            Your Products
          </h2>
          {loading ? (
            <p className="text-gray-400">Loading products...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : products.length === 0 ? (
            <p className="text-gray-400">No products in your list.</p>
          ) : (
            <div className="space-y-4">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-white font-medium">
                        {product.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {product.category}
                      </p>
                      {product.price > 0 && (
                        <p className="text-gray-400 text-sm">
                          L.E {product.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => navigate(`/best-price/${product.id}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      View Best Price
                    </button>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A] disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 rounded-lg ${
                    pageNumber === currentPage
                      ? "bg-blue-600 text-white"
                      : "bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A] disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ToBuy;
