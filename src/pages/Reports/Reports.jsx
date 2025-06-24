import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import api from "../../utils/api"; // Import the shared API instance

const Reports = () => {
  const [activeChart, setActiveChart] = useState("donut");
  const [financialGoals, setFinancialGoals] = useState({
    salary: 0,
    financialGoal: 0,
  });
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [goalsError, setGoalsError] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0); // New state for total expenses
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const [revenueData, setRevenueData] = useState([]); // New state for revenue data
  const [monthlyCategoriesData, setMonthlyCategoriesData] = useState([]); // New state for weekly expense categories
  const [pieChartData, setPieChartData] = useState([]); // New state for PieChart data
  const [dailyProductCategoriesData, setDailyProductCategoriesData] = useState(
    []
  ); // New state for daily product categories
  const [categoryColorsMap] = useState({
    Bills: "#8884d8", // Distinct color for all bills
    "Food & Groceries": "#4ADE80",

    " Other": "#FF7F50", // Added color for ' Other' (with space)
    Clothes: "#8A2BE2", // Added color for Clothes
    Electronics: "#00CED1", // Added color for Electronics

    // Add more colors for other potential categories if needed
  });

  const navigate = useNavigate();

  // Weekly expense data (now handled by monthlyCategoriesData)
  // Daily expense data
  // Fetch financial goals
  useEffect(() => {
    const fetchFinancialGoals = async () => {
      try {
        setLoadingGoals(true);
        const response = await api.get("/FinancialGoal/UserFinancialGoal");
        if (response.data) {
          setFinancialGoals({
            salary: response.data.salary || 0,
            financialGoal: response.data.financialGoal || 0,
          });
          console.log("Financial Goals fetched successfully:", response.data);
        } else {
          setFinancialGoals({ salary: 0, financialGoal: 0 });
          console.log("No financial goals data received.");
        }
      } catch (error) {
        console.error("Error fetching financial goals:", error);
        setGoalsError("Failed to load financial goals.");
      } finally {
        setLoadingGoals(false);
      }
    };

    fetchFinancialGoals();
  }, []); // Empty dependency array means this runs once on mount

  // New useEffect to fetch total expenses
  useEffect(() => {
    const fetchTotalExpenses = async () => {
      try {
        console.log("Fetching total expenses...");
        const response = await api.get("/Expenses/GetTotalExpenses");
        console.log("Total Expenses API Response:", response.data);
        if (response.data && typeof response.data.totalExpenses === "number") {
          setTotalExpenses(response.data.totalExpenses); // Access totalExpenses property
          console.log("Total expenses set to:", response.data.totalExpenses);
        } else {
          setTotalExpenses(0); // Fallback
          console.log("Total expenses set to 0 due to invalid data.");
        }
      } catch (error) {
        console.error("Error fetching total expenses:", error);
        setTotalExpenses(0); // Set to default on error
        console.log("Total expenses set to 0 due to API error.");
      }
    };
    fetchTotalExpenses();
  }, []); // Revert to empty dependency array

  // New useEffect to fetch and process revenue data
  useEffect(() => {
    const fetchMonthlyExpenses = async () => {
      try {
        const response = await api.get("/Expenses/lastSevenMonthes");
        if (response.data && Array.isArray(response.data)) {
          const processedData = response.data.map((item) => {
            const monthDate = new Date(item.month + "-01"); // Add -01 for valid date parsing
            const monthLabel = monthDate.toLocaleString("en-US", {
              month: "short",
            });
            const expenseValue = item.total || 0;
            const incomeValue = financialGoals.salary - expenseValue;

            return {
              day: monthLabel, // Using 'day' to match existing XAxis dataKey
              expense: expenseValue,
              income: Math.max(0, incomeValue), // Ensure income is not negative
            };
          });
          // Reverse the order to display from oldest to newest month on the chart
          console.log("Processed Revenue Data (last 7 months):", processedData);
          setRevenueData(processedData);
        } else {
          setRevenueData([]);
        }
      } catch (error) {
        console.error("Error fetching monthly expenses:", error);
        setRevenueData([]);
      }
    };

    // Only fetch if financialGoals.salary is available, as income depends on it
    if (financialGoals.salary !== 0) {
      fetchMonthlyExpenses();
    }
  }, [financialGoals.salary]); // Dependency on financialGoals.salary

  // New useEffect to fetch and process monthly expenses with categories
  useEffect(() => {
    const fetchMonthlyExpensesWithCategories = async () => {
      try {
        const response = await api.get(
          "/Expenses/lastSevenMonthsWithCategories"
        );
        if (response.data && Array.isArray(response.data)) {
          const processedData = response.data.map((item) => {
            const monthDate = new Date(item.month + "-01");
            const monthLabel = monthDate.toLocaleString("en-US", {
              month: "short",
            });

            const monthlyData = { day: monthLabel };

            // Group all bills under 'Bills'
            const totalBills = item.billSum || 0;
            monthlyData.Bills = totalBills;

            // Process productsCategory
            for (const category in item.productsCategory) {
              if (category === "Bills") continue; // Prevent overwrite
              monthlyData[category] = item.productsCategory[category];
            }

            return monthlyData;
          });
          setMonthlyCategoriesData(processedData);
        } else {
          setMonthlyCategoriesData([]);
        }
      } catch (error) {
        console.error(
          "Error fetching monthly expenses with categories:",
          error
        );
        setMonthlyCategoriesData([]);
      }
    };
    fetchMonthlyExpensesWithCategories();
  }, []); // Empty dependency array as it fetches data independently

  // New useEffect to fetch and process daily expenses with product categories for donut chart
  useEffect(() => {
    const fetchDailyProductCategories = async () => {
      try {
        const response = await api.get("/Expenses/lastSevenDaysWithCategories");
        if (response.data && Array.isArray(response.data)) {
          const aggregatedProductCategories = {};
          response.data.forEach((dayData) => {
            for (const category in dayData.productsCategory) {
              aggregatedProductCategories[category] =
                (aggregatedProductCategories[category] || 0) +
                dayData.productsCategory[category];
            }
          });

          const transformedData = Object.keys(aggregatedProductCategories).map(
            (category) => ({
              category: category,
              value: aggregatedProductCategories[category],
              color: categoryColorsMap[category] || "#CCCCCC",
            })
          );
          setDailyProductCategoriesData(transformedData);
        } else {
          setDailyProductCategoriesData([]);
        }
      } catch (error) {
        console.error("Error fetching daily product categories:", error);
        setDailyProductCategoriesData([]);
      }
    };
    fetchDailyProductCategories();
  }, []); // Empty dependency array to run once on mount

  // Calculate data for PieChart
  useEffect(() => {
    if (dailyProductCategoriesData.length > 0) {
      // Use dailyProductCategoriesData directly for the PieChart
      setPieChartData(dailyProductCategoriesData);
    } else {
      setPieChartData([]);
    }
  }, [dailyProductCategoriesData, categoryColorsMap]); // Dependency on dailyProductCategoriesData

  const spendingGoal = financialGoals.salary - financialGoals.financialGoal;
  const overBudget = Math.max(0, totalExpenses - spendingGoal); // Calculate overBudget

  const total = pieChartData.reduce((sum, item) => sum + item.value, 0); // Recalculate total for PieChart

  // Compute all unique product category keys across all months (including 'Bills')
  const allProductCategoryKeys = Array.from(
    new Set(
      monthlyCategoriesData
        .flatMap((month) => Object.keys(month))
        .filter((key) => key !== "day")
    )
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Filter out Bills if its value is 0
      const filteredPayload = payload.filter(
        (entry) => entry.name !== "Bills" || entry.value > 0
      );
      return (
        <div className="bg-[#2A2A2A] p-2 rounded-lg border border-gray-600">
          {label && <p className="text-gray-300 mb-1">{label}</p>}
          {filteredPayload.map((entry, index) => (
            <div key={index} className="text-sm text-white">
              <span style={{ color: entry.color }}>
                {entry.name || entry.category}
              </span>
              : L.E {entry.value.toFixed(2)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        {/* Revenue Section */}
        <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6">
          <div>
            <h2 className="text-white text-xl font-semibold">Revenue</h2>
            <p className="text-gray-400 text-sm">Data from last 7 months</p>
          </div>
          <div className="h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barGap={0}>
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="expense" fill="#FB7185" radius={[4, 4, 0, 0]} />
                <Bar dataKey="income" fill="#4ADE80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#4ADE80]" />
              <span className="text-gray-400">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FB7185]" />
              <span className="text-gray-400">Expense</span>
            </div>
          </div>
        </div>

        {/* Weekly Expense and Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Expense Section */}
          <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div>
                <h2 className="text-white text-xl font-semibold">
                  {activeChart === "bar" ? "Monthly Expense" : "Weekly Expense"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {activeChart === "donut"
                    ? "Data from last 7 days"
                    : "Data from last 7 months"}
                </p>
              </div>
              <div className="bg-[#2A2A2A] rounded-full p-1 flex space-x-1">
                <button
                  onClick={() => setActiveChart("donut")}
                  className={`px-4 py-1 rounded-full transition-colors ${
                    activeChart === "donut"
                      ? "bg-[#3A3A3A] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Donut
                </button>
                <button
                  onClick={() => setActiveChart("bar")}
                  className={`px-4 py-1 rounded-full transition-colors ${
                    activeChart === "bar"
                      ? "bg-[#3A3A3A] text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Bar
                </button>
              </div>
            </div>

            <div className="h-[200px]">
              {activeChart === "donut" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
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
                      {total.toFixed(0)}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCategoriesData}>
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip content={<CustomTooltip />} />
                    {allProductCategoryKeys.map((key) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={categoryColorsMap[key] || "#CCCCCC"}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Move legend below the chart and show all categories with their colors */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(categoryColorsMap)
                .filter(
                  (category) => activeChart === "bar" || category !== "Bills"
                )
                .map((category, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          categoryColorsMap[category] || "#CCCCCC",
                      }}
                    />
                    <span className="text-gray-400">{category}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            {/* Spending Limit Section */}
            <div className="bg-[#1E1E1E] rounded-xl p-4 md:p-6">
              <h2 className="text-white text-xl font-semibold mb-2">
                Spending Limit
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Your current salary is L.E{" "}
                {financialGoals.salary.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold text-white">
                  {"L.E "}
                  {totalExpenses.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-gray-400">
                  of L.E{" "}
                  {(
                    financialGoals.salary - financialGoals.financialGoal
                  ).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className={`${
                    totalExpenses >
                    financialGoals.salary - financialGoals.financialGoal
                      ? "bg-red-500"
                      : "bg-green-500"
                  } h-2.5 rounded-full`}
                  style={{
                    width: `${Math.min(
                      100,
                      (totalExpenses /
                        (financialGoals.salary -
                          financialGoals.financialGoal)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Saving Goal Section */}
            <div
              className="bg-[#1E1E1E] rounded-xl p-4 md:p-6 relative"
              onMouseEnter={() => {
                const spendingLimitActual =
                  financialGoals.salary - financialGoals.financialGoal;
                const amountExceeded = totalExpenses - spendingLimitActual;
                let content = `Current Saving Goal: L.E ${financialGoals.financialGoal.toFixed(
                  2
                )}`;
                if (amountExceeded > 0) {
                  content += `<br/>Over Budget By: L.E ${amountExceeded.toFixed(
                    2
                  )}`;
                }
                setTooltipContent(content);
                setIsTooltipVisible(true);
              }}
              onMouseLeave={() => setIsTooltipVisible(false)}
            >
              <h2 className="text-white text-xl font-semibold">Saving Goal</h2>
              {loadingGoals ? (
                <p className="text-gray-400 text-sm">Loading...</p>
              ) : goalsError ? (
                <p className="text-red-500 text-sm">{goalsError}</p>
              ) : (
                <>
                  <p className="text-gray-400 text-sm">
                    Your current saving goal is L.E{" "}
                    {financialGoals.financialGoal.toFixed(2)}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {/* Saving Goal Note */}
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-3 h-3 rounded-full bg-[#4ADE80]" />
                      <span>Saving Goal</span>
                    </div>

                    {/* Over Budget Note (Conditional) */}
                    {totalExpenses >
                      financialGoals.salary - financialGoals.financialGoal && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-3 h-3 rounded-full bg-[#FB7185]" />
                        <span>Over Budget</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center mt-4">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#2A2A2A" // Grey background track
                          strokeWidth="3"
                        />

                        {(() => {
                          const spendingLimitActual =
                            financialGoals.salary -
                            financialGoals.financialGoal;
                          const amountExceeded =
                            totalExpenses - spendingLimitActual; // Amount over spending limit

                          const totalSavingGoal = financialGoals.financialGoal;
                          let greenPercentage = 0;
                          let redPercentage = 0;

                          if (totalSavingGoal > 0) {
                            // Only calculate if there's a goal
                            if (amountExceeded <= 0) {
                              // Within spending limit, saving goal is fully green
                              greenPercentage = 100;
                              redPercentage = 0;
                            } else {
                              // Over spending limit, saving goal is eroded
                              const remainingGoal = Math.max(
                                0,
                                totalSavingGoal - amountExceeded
                              );
                              const erodedPart = Math.min(
                                totalSavingGoal,
                                amountExceeded
                              ); // Red part, capped by total goal

                              greenPercentage =
                                (remainingGoal / totalSavingGoal) * 100;
                              redPercentage =
                                (erodedPart / totalSavingGoal) * 100;

                              // Ensure percentages sum up to 100 if overspend exceeds goal
                              if (greenPercentage + redPercentage > 100.01) {
                                // Floating point tolerance
                                greenPercentage = 0; // If goal is entirely eroded
                                redPercentage = 100; // Full red circle
                              }
                            }
                          }

                          // Render green path
                          const greenPath =
                            greenPercentage > 0 ? (
                              <path
                                key="green-segment"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#4ADE80" // Green color
                                strokeWidth="3"
                                strokeDasharray={`${greenPercentage}, 100`}
                              />
                            ) : null;

                          // Render red path
                          const redPath =
                            redPercentage > 0 ? (
                              <path
                                key="red-segment"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#FB7185" // Red color
                                strokeWidth="3"
                                strokeDasharray={`${redPercentage}, 100`}
                                strokeDashoffset={-greenPercentage} // Start red after green
                              />
                            ) : null;

                          return (
                            <>
                              {greenPath}
                              {redPath}
                            </>
                          );
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {"L.E "}
                            {(overBudget > 0
                              ? financialGoals.financialGoal - overBudget
                              : financialGoals.financialGoal
                            ).toFixed(2)}
                          </div>
                          {overBudget > 0 && (
                            <div className="text-red-500 text-sm mt-1">
                              -L.E {overBudget.toFixed(2)} ▼
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {isTooltipVisible && tooltipContent && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg z-10"
                  dangerouslySetInnerHTML={{ __html: tooltipContent }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
