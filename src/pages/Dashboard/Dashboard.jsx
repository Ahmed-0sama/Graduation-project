import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FiShoppingBag, FiEdit, FiTrash2 } from "react-icons/fi";
import UserInfoContext from "../../Context/User/UserInfoContext";
import api from "../../utils/api"; // Import the shared API instance
import { categories } from "../History"; // Import categories from History page

const Dashboard = () => {
  const navigate = useNavigate();

  const { user } = useContext(UserInfoContext);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productNameFilter, setProductNameFilter] = useState("");
  const [shopFilter, setShopFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [searchType, setSearchType] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [totalExpenses, setTotalExpenses] = useState("L.E 0.000");
  const [revenueSalary, setRevenueSalary] = useState("L.E 0.000");
  const [lastMonthBillCategories, setLastMonthBillCategories] = useState([]);
  const [financialGoals, setFinancialGoals] = useState({
    salary: 0,
    financialGoal: 0,
  });
  const [lastFiveBills, setLastFiveBills] = useState([]);
  const [billsAll, setBillsAll] = useState([]);
  const [billsSearch, setBillsSearch] = useState("");
  const [billsSearchResults, setBillsSearchResults] = useState([]);
  const [lastFiveProducts, setLastFiveProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchBy, setProductSearchBy] = useState("productName");
  const [productSearchCategory, setProductSearchCategory] =
    useState("Food & Groceries");
  const [productSearchStartDate, setProductSearchStartDate] = useState("");
  const [productSearchEndDate, setProductSearchEndDate] = useState("");
  const [productSearchActive, setProductSearchActive] = useState(false);
  const [billsSearchActive, setBillsSearchActive] = useState(false);

  const applyFiltersToProducts = (products) => {
    return products.filter((product) => {
      const matchesProductName =
        !productNameFilter ||
        (product?.productName &&
          product.productName
            .toLowerCase()
            .includes(productNameFilter.toLowerCase()));

      const matchesShopName =
        !shopFilter ||
        (product?.shopName &&
          product.shopName.toLowerCase().includes(shopFilter.toLowerCase()));

      const matchesCategory =
        !categoryFilter ||
        product?.category?.toLowerCase() === categoryFilter.toLowerCase();

      const productDate = product?.date ? new Date(product.date) : null;
      const start = startDateFilter ? new Date(startDateFilter) : null;
      const end = endDateFilter ? new Date(endDateFilter) : null;

      const matchesDateRange =
        (!start || (productDate && productDate >= start)) &&
        (!end || (productDate && productDate <= end));

      if (!searchType) {
        return (
          matchesProductName &&
          matchesShopName &&
          matchesCategory &&
          matchesDateRange
        );
      } else if (searchType === "productName") {
        return matchesProductName;
      } else if (searchType === "shopName") {
        return matchesShopName;
      } else if (searchType === "category") {
        return matchesCategory;
      } else if (searchType === "dateRange") {
        return matchesDateRange;
      }
      return true;
    });
  };

  const fetchPurchasedProducts = async (isInitialLoad = false) => {
    if (!user || !user.token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/PurchasedProduct/GetPurchasedProducts");
      let productsToFilter = response.data.map((p) => ({
        ...p,
        quantity: p.quantity === 0 ? 1 : p.quantity,
      }));

      // Sort products by date in descending order (latest first)
      productsToFilter.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Descending order
      });

      setPurchasedProducts(productsToFilter);

      const filteredAndDisplayed = applyFiltersToProducts(productsToFilter);
      setDisplayedProducts(filteredAndDisplayed);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalExpenses = async () => {
    if (!user || !user.token) {
      setTotalExpenses("L.E 0.000");
      return;
    }
    try {
      console.log("Fetching total expenses in Dashboard...");
      console.log("User in fetchTotalExpenses (Dashboard):", user);
      const response = await api.get("/Expenses/GetTotalExpenses");
      console.log("Total Expenses API Response (Dashboard):", response.data);
      if (response.data && typeof response.data.totalExpenses === "number") {
        setTotalExpenses(
          `L.E ${response.data.totalExpenses.toLocaleString("en-US")}`
        );
      } else {
        setTotalExpenses("L.E 0.000");
      }
    } catch (e) {
      console.error("Error fetching total expenses:", e);
      setTotalExpenses("L.E 0.000");
    }
  };

  const fetchRevenueSalary = async () => {
    if (!user || !user.token) {
      setRevenueSalary("L.E 0.000");
      return;
    }
    try {
      const response = await api.get("/FinancialGoal/UserFinancialGoal");
      if (response.data && typeof response.data.salary === "number") {
        setRevenueSalary(`L.E ${response.data.salary.toLocaleString("en-US")}`);
      } else {
        setRevenueSalary("L.E 0.000");
      }
    } catch (e) {
      console.error("Error fetching revenue salary:", e);
      setRevenueSalary("L.E 0.000");
    }
  };

  const fetchFinancialGoals = async () => {
    if (!user || !user.token) {
      setFinancialGoals({ salary: 0, financialGoal: 0 });
      return;
    }
    try {
      const response = await api.get("/FinancialGoal/UserFinancialGoal");
      if (response.data) {
        setFinancialGoals({
          salary: response.data.salary || 0,
          financialGoal: response.data.financialGoal || 0,
        });
      } else {
        setFinancialGoals({ salary: 0, financialGoal: 0 });
      }
    } catch (e) {
      console.error("Error fetching financial goals:", e);
      setFinancialGoals({ salary: 0, financialGoal: 0 });
    }
  };

  useEffect(() => {
    fetchPurchasedProducts(true);
    fetchTotalExpenses();
    fetchRevenueSalary();
    fetchFinancialGoals();
  }, [user]);

  useEffect(() => {
    const fetchBills = async () => {
      if (!user || !user.token) return;
      try {
        const response = await api.get("/MonthlyBill/GetMonthlyBillsForUser");
        if (Array.isArray(response.data)) {
          const sorted = response.data
            .filter((bill) => bill.startDate)
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          setBillsAll(sorted.reverse());
          setLastFiveBills(sorted.slice(0, 5));
          setBillsSearchResults([]); // Reset search results on fetch
        } else {
          setBillsAll([]);
          setLastFiveBills([]);
          setBillsSearchResults([]);
        }
      } catch (error) {
        setBillsAll([]);
        setLastFiveBills([]);
        setBillsSearchResults([]);
      }
    };
    fetchBills();
  }, [user]);

  useEffect(() => {
    setLastFiveProducts(purchasedProducts.slice(0, 5));
  }, [purchasedProducts]);

  const handleSearch = () => {
    setLoading(true);
    setError(null);
    fetchPurchasedProducts(false);
  };

  const handleDelete = async (id) => {
    if (!user || !user.token) {
      setError("User not authenticated.");
      return;
    }
    try {
      await api.delete(`/PurchasedProduct/DeletePurchasedProduct?id=${id}`);
      // Refresh the data immediately after deletion
      await fetchPurchasedProducts(false);
      // Update the last five products
      setLastFiveProducts(purchasedProducts.slice(0, 5));
      // Refresh total expenses
      await fetchTotalExpenses();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setEditFormData({ ...product });
  };

  const handleUpdateProduct = async () => {
    if (!user || !user.token) {
      setError("User not authenticated.");
      return;
    }
    try {
      const dataToUpdate = { ...editFormData };
      if (Number(dataToUpdate.quantity) === 0) {
        dataToUpdate.quantity = 1;
      }
      await api.put(
        `/PurchasedProduct/UpdatePurchasedProduct?id=${editingProductId}`,
        dataToUpdate
      );
      // Refresh the data immediately after update
      await fetchPurchasedProducts(false);
      // Update the last five products
      setLastFiveProducts(purchasedProducts.slice(0, 5));
      // Refresh total expenses
      await fetchTotalExpenses();
      setEditingProductId(null);
      setEditFormData({});
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const formattedSalary = user?.salary
    ? `L.E ${user.salary.toLocaleString("en-US")}`
    : "L.E 0.000";
  const totalPoints = "1500";

  const numericTotalExpenses = parseFloat(
    totalExpenses.replace("L.E ", "").replace(/,/g, "")
  );
  const spendingGoal = financialGoals.salary - financialGoals.financialGoal;
  const overBudget = Math.max(0, numericTotalExpenses - spendingGoal);
  const savingGoal = financialGoals.financialGoal;

  // Calculate the saving goal display percentage
  let savingGoalDisplayPercentage = 0;
  if (overBudget === 0) {
    savingGoalDisplayPercentage = 100;
  } else if (savingGoal > 0) {
    savingGoalDisplayPercentage =
      ((savingGoal - overBudget) / savingGoal) * 100;
  }
  savingGoalDisplayPercentage = Math.max(0, savingGoalDisplayPercentage); // Ensure it doesn't go below 0

  const expensesPercentage =
    spendingGoal > 0 ? (numericTotalExpenses / spendingGoal) * 100 : 0;

  const monthlyBillCategoryColors = useState({
    Rent: "#FF6347", // Tomato
    Utilities: "#4682B4", // SteelBlue
    "Loan Payment": "#DAA520", // Goldenrod
    Insurance: "#6A5ACD", // SlateBlue
    "Other Bills": "#D2691E", // Chocolate
  })[0];

  // New useEffect to fetch last month's bills with categories
  useEffect(() => {
    const fetchLastMonthBills = async () => {
      if (!user || !user.token) return;
      try {
        console.log(
          "Calling /MonthlyBill/GetLastMonthBillsWithCategories API..."
        );
        const response = await api.get(
          "/MonthlyBill/GetLastMonthBillsWithCategories"
        );
        console.log("Bills details API response:", response.data);
        const apiCategories = response.data?.categories || {};
        const allCategoryNames = Object.keys(monthlyBillCategoryColors);

        const transformedData = allCategoryNames.map((category) => ({
          name: category,
          value: apiCategories[category] || 0,
          color: monthlyBillCategoryColors[category] || "#CCCCCC",
        }));

        setLastMonthBillCategories(transformedData);
      } catch (error) {
        console.error("Error fetching last month's bills:", error);
        const allCategoryNames = Object.keys(monthlyBillCategoryColors);
        const transformedData = allCategoryNames.map((category) => ({
          name: category,
          value: 0,
          color: monthlyBillCategoryColors[category] || "#CCCCCC",
        }));
        setLastMonthBillCategories(transformedData);
      }
    };
    fetchLastMonthBills();
  }, [user, monthlyBillCategoryColors]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2A2A2A] p-2 rounded-lg border border-gray-600">
          <div className="text-sm text-white">
            {payload[0].name}: ${payload[0].value}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBillsSearch = () => {
    if (!billsSearch.trim() || /^\d+$/.test(billsSearch.trim())) {
      setBillsSearchResults([]);
      setBillsSearchActive(false);
      return;
    }
    const term = billsSearch.trim().toLowerCase();
    const filtered = billsAll.filter(
      (bill) =>
        (bill.issuer && bill.issuer.toLowerCase().includes(term)) ||
        (bill.category && bill.category.toLowerCase().includes(term))
    );
    setBillsSearchResults(filtered);
    setBillsSearchActive(true);
  };

  const handleProductSearch = () => {
    let filtered = [];
    if (productSearchBy === "productName") {
      if (!productSearch.trim()) {
        setProductSearchResults([]);
        setProductSearchActive(false);
        return;
      }
      const term = productSearch.trim().toLowerCase();
      filtered = purchasedProducts.filter(
        (p) => p.productName && p.productName.toLowerCase().includes(term)
      );
    } else if (productSearchBy === "shopName") {
      if (!productSearch.trim()) {
        setProductSearchResults([]);
        setProductSearchActive(false);
        return;
      }
      const term = productSearch.trim().toLowerCase();
      filtered = purchasedProducts.filter(
        (p) => p.shopName && p.shopName.toLowerCase().includes(term)
      );
    } else if (productSearchBy === "category") {
      filtered = purchasedProducts.filter(
        (p) => p.category === productSearchCategory
      );
    } else if (productSearchBy === "dateRange") {
      if (!productSearchStartDate && !productSearchEndDate) {
        setProductSearchResults([]);
        setProductSearchActive(false);
        return;
      }
      filtered = purchasedProducts.filter((p) => {
        const productDate = p.date ? new Date(p.date) : null;
        const start = productSearchStartDate
          ? new Date(productSearchStartDate)
          : null;
        const end = productSearchEndDate
          ? new Date(productSearchEndDate)
          : null;
        return (
          (!start || (productDate && productDate >= start)) &&
          (!end || (productDate && productDate <= end))
        );
      });
    }
    setProductSearchActive(true);
    setProductSearchResults(filtered);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* To Buy Card */}
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6">
          <h3 className="text-gray-400 text-sm">Revenue</h3>
          <div className="text-2xl font-bold text-white mt-2">
            {revenueSalary}
          </div>
        </div>
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6">
          <h3 className="text-gray-400 text-sm">Expenses</h3>
          <div className="text-2xl font-bold text-white mt-2">
            {totalExpenses}
          </div>
        </div>
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6">
          <h3 className="text-gray-400 text-sm">Budget Insights</h3>
          <div className="flex justify-between gap-4 mt-4">
            {/* Expenses Half */}
            <div className="flex-1 p-2 rounded-md bg-[#2A2A2A] text-center">
              <p className="text-gray-400 text-sm">Spending Limit</p>
              <div
                className={`${
                  expensesPercentage > 100 ? "text-red-500" : "text-blue-400"
                } text-xl font-bold mt-1`}
              >
                {expensesPercentage.toFixed(2)}%
              </div>
            </div>

            {/* Saving Goal Half */}
            <div className="flex-1 p-2 rounded-md bg-[#2A2A2A] text-center">
              <p className="text-gray-400 text-sm">Saving Goal</p>
              <div className="text-blue-400 text-xl font-bold mt-1">
                {savingGoalDisplayPercentage.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Latest Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Donut Chart Section */}
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-white text-xl font-semibold">
                Bills Details
              </h2>
              <div className="text-gray-400 text-sm mt-1">
                (Bills last month)
              </div>
            </div>
          </div>
          <div className="h-[250px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lastMonthBillCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {lastMonthBillCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="24"
                >
                  {lastMonthBillCategories.reduce(
                    (sum, item) => sum + item.value,
                    0
                  )}
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-sm">
              {lastMonthBillCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest Orders Section */}
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6">
          <h2 className="text-white text-xl font-semibold mb-4">
            Monthly Bills
          </h2>
          {/* Card inner container for search and table */}
          <div className="bg-[#232323] rounded-lg p-4">
            {/* Search input above the table */}
            <div className="mb-4">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder="Search by issuer or category..."
                  className="w-full p-2 rounded bg-[#2A2A2A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={billsSearch}
                  onChange={(e) => setBillsSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleBillsSearch();
                  }}
                />
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                  onClick={handleBillsSearch}
                >
                  Search
                </button>
              </div>
            </div>
            {/* Table format for bills */}
            <div className="overflow-x-auto rounded-b-lg">
              <table className="min-w-full bg-[#1E1E1E] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#2A2A2A] text-gray-400 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Issuer</th>
                    <th className="py-3 px-6 text-left">Category</th>
                    <th className="py-3 px-6 text-left">Amount</th>
                    <th className="py-3 px-6 text-left">Start Date</th>
                    <th className="py-3 px-6 text-left">End Date</th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm font-light">
                  {(billsSearchActive ? billsSearchResults : lastFiveBills).map(
                    (bill) => (
                      <tr
                        key={bill.billId}
                        className="border-b border-gray-600 hover:bg-[#2A2A2A]"
                      >
                        <td className="py-3 px-6 text-left">
                          {bill.issuer || "-"}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {bill.category || "-"}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {bill.amount != null ? `L.E ${bill.amount}` : "-"}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {bill.startDate
                            ? new Date(bill.startDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {bill.endDate
                            ? new Date(bill.endDate).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              {billsSearchActive && billsSearchResults.length === 0 && (
                <div className="text-gray-400 text-center py-4">
                  No bills found for your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchased Products Table */}
      <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6 mt-6">
        <h2 className="text-white text-xl font-semibold mb-4">
          Purchased Products
        </h2>
        {/* Product search input above the table */}
        <div className="mb-4 flex flex-wrap items-center gap-2 w-full">
          <select
            className="p-2 rounded bg-[#2A2A2A] text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={productSearchBy}
            onChange={(e) => setProductSearchBy(e.target.value)}
          >
            <option value="productName">Product Name</option>
            <option value="shopName">Shop Name</option>
            <option value="category">Category</option>
            <option value="dateRange">Date Range</option>
          </select>
          {productSearchBy === "productName" && (
            <input
              type="text"
              placeholder="Search by product name..."
              className="p-2 rounded bg-[#2A2A2A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 w-[250px]"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleProductSearch();
              }}
            />
          )}
          {productSearchBy === "shopName" && (
            <input
              type="text"
              placeholder="Search by shop name..."
              className="p-2 rounded bg-[#2A2A2A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 w-[250px]"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleProductSearch();
              }}
            />
          )}
          {productSearchBy === "category" && (
            <select
              className="p-2 rounded bg-[#2A2A2A] text-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-[250px]"
              value={productSearchCategory}
              onChange={(e) => setProductSearchCategory(e.target.value)}
            >
              <option value="Food & Groceries">Food & Groceries</option>
              <option value="Clothes">Clothes</option>
              <option value="Electronics">Electronics</option>
              <option value=" Other">Other</option>
            </select>
          )}
          {productSearchBy === "dateRange" && (
            <>
              <input
                type="date"
                className="p-2 rounded bg-[#2A2A2A] text-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-[130px]"
                value={productSearchStartDate}
                onChange={(e) => setProductSearchStartDate(e.target.value)}
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                className="p-2 rounded bg-[#2A2A2A] text-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-[130px]"
                value={productSearchEndDate}
                onChange={(e) => setProductSearchEndDate(e.target.value)}
              />
            </>
          )}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            onClick={handleProductSearch}
          >
            Search
          </button>
        </div>
        {/* Table */}
        <div className="w-full">
          <table className="w-full bg-[#1E1E1E] rounded-lg">
            <thead>
              <tr className="bg-[#2A2A2A] text-gray-400 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">Product Name</th>
                <th className="py-3 px-2 text-left">Qty</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Shop Name</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white text-sm font-light">
              {(productSearchActive
                ? productSearchResults
                : lastFiveProducts
              ).map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-600 hover:bg-[#2A2A2A]"
                >
                  <td className="py-3 px-4 text-left whitespace-nowrap">
                    {editingProductId === product.id ? (
                      <input
                        name="productName"
                        value={editFormData.productName || ""}
                        onChange={handleFormChange}
                        className="p-1 rounded bg-[#232323] text-white w-28"
                      />
                    ) : (
                      <div className="max-w-[150px] truncate">
                        {product.productName}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-left">
                    {editingProductId === product.id ? (
                      <input
                        name="quantity"
                        type="number"
                        value={editFormData.quantity || 1}
                        onChange={handleFormChange}
                        className="p-1 rounded bg-[#232323] text-white w-16"
                        min="1"
                      />
                    ) : (
                      product.quantity
                    )}
                  </td>
                  <td className="py-3 px-4 text-left whitespace-nowrap">
                    {editingProductId === product.id ? (
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        value={editFormData.price || 0}
                        onChange={handleFormChange}
                        className="p-1 rounded bg-[#232323] text-white w-20"
                      />
                    ) : (
                      `L.E ${product.price.toFixed(2)}`
                    )}
                  </td>
                  <td className="py-3 px-4 text-left">
                    {editingProductId === product.id ? (
                      <input
                        name="shopName"
                        value={editFormData.shopName || ""}
                        onChange={handleFormChange}
                        className="p-1 rounded bg-[#232323] text-white w-24"
                      />
                    ) : (
                      <div className="max-w-[120px] truncate">
                        {product.shopName}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-left whitespace-nowrap">
                    {editingProductId === product.id ? (
                      <input
                        name="date"
                        type="date"
                        value={
                          editFormData.date
                            ? editFormData.date.split("T")[0]
                            : ""
                        }
                        onChange={handleFormChange}
                        className="p-1 rounded bg-[#232323] text-white w-28"
                      />
                    ) : (
                      new Date(product.date).toLocaleDateString()
                    )}
                  </td>
                  <td className="py-3 px-4 text-left">
                    {editingProductId === product.id ? (
                      <select
                        name="category"
                        value={editFormData.category || ""}
                        onChange={handleFormChange}
                        className="p-1 rounded bg-[#232323] text-white w-32"
                      >
                        <option value="Food & Groceries">
                          Food & Groceries
                        </option>
                        <option value="Clothes">Clothes</option>
                        <option value="Electronics">Electronics</option>
                        <option value=" Other">Other</option>
                      </select>
                    ) : (
                      <div className="max-w-[120px] truncate">
                        {product.category}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      {editingProductId === product.id ? (
                        <>
                          <button
                            onClick={handleUpdateProduct}
                            className="text-green-500 hover:text-green-400 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productSearchActive && productSearchResults.length === 0 && (
            <div className="text-gray-400 text-center py-4">
              No products found for your search.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
