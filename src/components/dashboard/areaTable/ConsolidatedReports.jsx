import React, { useState } from "react";
import { FaFilter, FaRedo, FaTimes, FaSearch, FaDownload, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import "./AreaTable.scss";

const TABLE_HEADS = [
  { label: "S.No", key: "serial_number" },
  { label: "Machine ID", key: "MACHINE_ID" },
  { label: "Line Number", key: "LINE_NUMB" },
  { label: "Operator Name", key: "operator_name" },
  { label: "Operator ID", key: "OPERATOR_ID" },
  { label: "Date", key: "DATE" },
  { label: "Start Time", key: "START_TIME" },
  { label: "End Time", key: "END_TIME" },
  { label: "Mode", key: "MODE" },
  { label: "Mode Description", key: "mode_description" },
  { label: "Stitch Count", key: "STITCH_COUNT" },
  { label: "Needle Runtime", key: "NEEDLE_RUNTIME" },
  { label: "Needle Stop Time", key: "NEEDLE_STOPTIME" },
  { label: "TX Log ID", key: "Tx_LOGID" },
  { label: "STR Log ID", key: "Str_LOGID" },
  { label: "Device ID", key: "DEVICE_ID" },
  { label: "Reserve", key: "RESERVE" },
  { label: "Created At", key: "created_at" },
];

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  try {
    const dateTime = new Date(dateTimeString);
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.`;
  } catch (e) {
    return dateTimeString;
  }
};

const API_URL = "https://oceanatlantic.pinesphere.co.in/api/get_consolidated_logs/";  // Django API endpoint

const ConsolidatedReports = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dependentFilteredData, setDependentFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    MACHINE_ID: [],
    LINE_NUMB: [],
    operator_name: [] // Replace OPERATOR_ID with operator_name
  });
  const [showFilterPopup, setShowFilterPopup] = useState({
    show: false,
    type: null,
    options: [],
    selectedValues: []
  });
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = async () => {
    if (!fromDate && !toDate) {
      setError("Please select at least one date");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      
      const response = await fetch(`${API_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Convert null operator_name to "Unknown" for better display
        const processedData = data.map(item => ({
          ...item,
          operator_name: item.operator_name || "Unknown"
        }));
        
        const sortedData = processedData.sort((a, b) => 
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        
        setTableData(sortedData);
        setFilteredData(sortedData);
        setDependentFilteredData(sortedData);
        // Reset filters when fetching new data
        setFilters({
          MACHINE_ID: [],
          LINE_NUMB: [],
          operator_name: []
        });
      } else {
        throw new Error("Fetched data is not an array");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(totalPages);
  const goToNextPage = () => currentPage < totalPages && paginate(currentPage + 1);
  const goToPreviousPage = () => currentPage > 1 && paginate(currentPage - 1);

  const getFilterOptions = (type) => {
    try {
      // Get options based on the current dependent filtered data
      const options = [...new Set(
        dependentFilteredData
          .map(item => item[type])
          .filter(val => val !== undefined && val !== null)
      )].sort();
      
      // Add "All" option at the beginning
      return ["All", ...options];
    } catch (error) {
      console.error("Error getting filter options:", error);
      return ["All"];
    }
  };

  const openFilterPopup = (type) => {
    // First, update the dependent filtered data based on other active filters
    updateDependentFilteredData(type);
    
    // Then get options for this filter type based on the updated dependent data
    const options = getFilterOptions(type);
    
    setShowFilterPopup({
      show: true,
      type,
      options,
      selectedValues: filters[type] && filters[type].length > 0 ? [...filters[type]] : []
    });
    setSearchTerm("");
  };
  
  const updateDependentFilteredData = (currentFilterType) => {
    // Start with the full dataset
    let dataToFilter = [...tableData];
    
    // Apply date filtering
    if (fromDate || toDate) {
      dataToFilter = dataToFilter.filter((item) => {
        try {
          const itemDate = item.DATE ? new Date(item.DATE) : null;
          if (!itemDate) return false;
          
          const itemDateOnly = new Date(
            itemDate.getFullYear(), 
            itemDate.getMonth(), 
            itemDate.getDate()
          );
    
          let isAfterFromDate = true;
          let isBeforeToDate = true;
    
          if (fromDate) {
            const fromDateTime = new Date(fromDate);
            const fromDateOnly = new Date(
              fromDateTime.getFullYear(), 
              fromDateTime.getMonth(), 
              fromDateTime.getDate()
            );
            isAfterFromDate = itemDateOnly >= fromDateOnly;
          }
    
          if (toDate) {
            const toDateTime = new Date(toDate);
            const toDateOnly = new Date(
              toDateTime.getFullYear(), 
              toDateTime.getMonth(), 
              toDateTime.getDate()
            );
            isBeforeToDate = itemDateOnly <= toDateOnly;
          }
    
          return isAfterFromDate && isBeforeToDate;
        } catch (e) {
          console.error("Error processing date filter:", e);
          return false;
        }
      });
    }
    
    // Apply all other active filters except the current one being selected
    Object.keys(filters).forEach(filterKey => {
      // Skip the current filter type being selected
      if (filterKey === currentFilterType) return;
      
      const selectedValues = filters[filterKey];
      
      // Skip filtering if no values are selected or "All" is selected
      if (
        !selectedValues || 
        selectedValues.length === 0 || 
        (selectedValues.includes("All") && selectedValues.length === getFilterOptions(filterKey).length)
      ) {
        return;
      }
      
      // Filter by selected values (excluding "All")
      const filterValuesList = selectedValues.filter(val => val !== "All");
      if (filterValuesList.length > 0) {
        dataToFilter = dataToFilter.filter(item => 
          filterValuesList.includes(item[filterKey])
        );
      }
    });
    
    // Update the dependent filtered data
    setDependentFilteredData(dataToFilter);
  };

  const toggleOptionSelection = (option) => {
    const currentSelections = [...showFilterPopup.selectedValues];
    
    // Special handling for "All" option
    if (option === "All") {
      // If "All" is already selected, unselect everything
      if (currentSelections.includes("All")) {
        setShowFilterPopup(prev => ({
          ...prev,
          selectedValues: []
        }));
      } else {
        // Select all options
        const allOptions = [...showFilterPopup.options];
        setShowFilterPopup(prev => ({
          ...prev,
          selectedValues: allOptions
        }));
      }
    } else {
      // Remove "All" if it was selected and we're selecting individual options
      let updatedSelections = currentSelections.includes("All") 
        ? currentSelections.filter(item => item !== "All")
        : [...currentSelections];
      
      if (updatedSelections.includes(option)) {
        // Deselect the option
        updatedSelections = updatedSelections.filter(item => item !== option);
      } else {
        // Select the option
        updatedSelections.push(option);
      }
      
      // If all individual options are selected, also select "All"
      if (updatedSelections.length === showFilterPopup.options.length - 1) {
        updatedSelections.push("All");
      }
      
      setShowFilterPopup(prev => ({
        ...prev,
        selectedValues: updatedSelections
      }));
    }
  };

  const applyFilterChanges = () => {
    const newFilters = {
      ...filters,
      [showFilterPopup.type]: showFilterPopup.selectedValues
    };
    setFilters(newFilters);
    setShowFilterPopup({ show: false, type: null, options: [], selectedValues: [] });
    applyFilters(newFilters);
    setCurrentPage(1);
  };

  const clearFilterChanges = () => {
    setShowFilterPopup(prev => ({
      ...prev,
      selectedValues: []
    }));
  };

  const applyFilters = (filterValues) => {
    try {
      let filtered = [...tableData];
      
      // Apply filters for each filter type
      Object.keys(filterValues).forEach((filterKey) => {
        const selectedValues = filterValues[filterKey];
        
        // Skip filtering if no values are selected or "All" is selected
        if (
          !selectedValues || 
          selectedValues.length === 0 || 
          (selectedValues.includes("All") && selectedValues.length === getFilterOptions(filterKey).length)
        ) {
          return;
        }
        
        // Filter by selected values (excluding "All")
        const filterValuesList = selectedValues.filter(val => val !== "All");
        if (filterValuesList.length > 0) {
          filtered = filtered.filter(item => 
            filterValuesList.includes(item[filterKey])
          );
        }
      });
      
      // Apply date filtering
      if (fromDate || toDate) {
        filtered = filtered.filter((item) => {
          try {
            const itemDate = item.DATE ? new Date(item.DATE) : null;
            if (!itemDate) return false;
            
            const itemDateOnly = new Date(
              itemDate.getFullYear(), 
              itemDate.getMonth(), 
              itemDate.getDate()
            );
      
            let isAfterFromDate = true;
            let isBeforeToDate = true;
      
            if (fromDate) {
              const fromDateTime = new Date(fromDate);
              const fromDateOnly = new Date(
                fromDateTime.getFullYear(), 
                fromDateTime.getMonth(), 
                fromDateTime.getDate()
              );
              isAfterFromDate = itemDateOnly >= fromDateOnly;
            }
      
            if (toDate) {
              const toDateTime = new Date(toDate);
              const toDateOnly = new Date(
                toDateTime.getFullYear(), 
                toDateTime.getMonth(), 
                toDateTime.getDate()
              );
              isBeforeToDate = itemDateOnly <= toDateOnly;
            }
      
            return isAfterFromDate && isBeforeToDate;
          } catch (e) {
            console.error("Error processing date filter:", e);
            return false;
          }
        });
      }
      
      setFilteredData(filtered);
      // Also update dependent filtered data to match
      setDependentFilteredData(filtered);
    } catch (error) {
      console.error("Error applying filters:", error);
      setFilteredData([]);
      setDependentFilteredData([]);
    }
  };

  const handleReset = () => {
    setFilters({
      MACHINE_ID: [],
      LINE_NUMB: [],
      operator_name: []
    });
    setFromDate("");
    setToDate("");
    setTableData([]);
    setFilteredData([]);
    setDependentFilteredData([]);
    setError(null);
    setCurrentPage(1);
  };

  const downloadCSV = () => {
    try {
      const headers = TABLE_HEADS.map((th) => th.label).join(",");
      const rows = filteredData
        .map((item, index) =>
          TABLE_HEADS.map((th) => {
            if (th.key === "serial_number") {
              return index + 1;
            } else if (th.key === "created_at") {
              return `"${formatDateTime(item[th.key])}"`;
            } else {
              return item[th.key] ? `"${String(item[th.key]).replace(/"/g, '""')}"` : "";
            }
          }).join(",")
        )
        .join("\n");
      const csvContent = `${headers}\n${rows}`;
  
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "consolidated_report.csv";
      link.click();
    } catch (error) {
      console.error("Error generating CSV:", error);
      alert("Failed to generate CSV file");
    }
  };

  const removeFilter = (filterType, value) => {
    // If it's the only value or "All" is being removed, clear the entire filter
    let updatedFilterValues;
    if (value === "All" || filters[filterType].length === 1) {
      updatedFilterValues = [];
    } else {
      updatedFilterValues = filters[filterType].filter(val => val !== value);
    }
    
    const newFilters = {
      ...filters,
      [filterType]: updatedFilterValues
    };
    
    setFilters(newFilters);
    applyFilters(newFilters);
    setCurrentPage(1);
  };

  const getFilterDisplayText = (filterType) => {
    const filterValues = filters[filterType];
    if (!filterValues || filterValues.length === 0) {
      return `Select ${filterType.replace(/_/g, ' ')}`;
    }
    
    if (filterValues.includes("All")) {
      return "All Selected";
    }
    
    if (filterValues.length === 1) {
      return filterValues[0];
    }
    
    return `${filterValues.length} selected`;
  };

  const filteredOptions = showFilterPopup.options.filter(option =>
    String(option || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="content-area-table">
      <div className="data-table-info">
        <h4 className="data-table-title">Consolidated Report</h4>
        <div className="filter-wrapper">
          <div className="primary-filters">
            <div className="filter-group">
              <label>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <button 
              className="download-button" 
              onClick={fetchData}
              disabled={!fromDate && !toDate}
              style={{ marginTop: "25px",backgroundColor: "green" }}
            >
              Generate
            </button>

            {tableData.length > 0 && (
              <>
                <div className="filter-group">
                  <label>Machine ID</label>
                  <div 
                    className={`filter-value-display clickable ${filters.MACHINE_ID && filters.MACHINE_ID.length > 0 ? 'has-value' : ''}`}
                    onClick={() => openFilterPopup("MACHINE_ID")}
                  >
                    {getFilterDisplayText("MACHINE_ID")}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Line Number</label>
                  <div 
                    className={`filter-value-display clickable ${filters.LINE_NUMB && filters.LINE_NUMB.length > 0 ? 'has-value' : ''}`}
                    onClick={() => openFilterPopup("LINE_NUMB")}
                  >
                    {getFilterDisplayText("LINE_NUMB")}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Operator Name</label>
                  <div 
                    className={`filter-value-display clickable ${filters.operator_name && filters.operator_name.length > 0 ? 'has-value' : ''}`}
                    onClick={() => openFilterPopup("operator_name")}
                  >
                    {getFilterDisplayText("operator_name")}
                  </div>
                </div>

                <button
                  className="reset-button"
                  style={{ marginTop: "4px", marginLeft: "30px" }}
                  onClick={handleReset}
                >
                  <FaRedo /> Reset All
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showFilterPopup.show && (
        <div className="filter-popup">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Select {showFilterPopup.type.replace(/_/g, ' ')}</h3>
              <button className="close-button" onClick={() => setShowFilterPopup({ show: false, type: null, options: [], selectedValues: [] })}>
                ×
              </button>
            </div>
            
            <div className="search-box">
              <input
                type="text"
                placeholder={`Search ${showFilterPopup.type.replace(/_/g, ' ')}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="options-list">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className={`option-item clickable ${showFilterPopup.selectedValues.includes(option) ? 'selected' : ''}`}
                    onClick={() => toggleOptionSelection(option)}
                  >
                    <input 
                      type="checkbox" 
                      checked={showFilterPopup.selectedValues.includes(option)} 
                      onChange={() => {}} // Handled by div click
                    />
                    <span>{option === "All" ? "Select All" : String(option)}</span>
                  </div>
                ))
              ) : (
                <div className="no-results">No matching options found</div>
              )}
            </div>

            <div className="popup-footer">
              <button 
                className="clear-button"
                onClick={clearFilterChanges}
                disabled={!showFilterPopup.selectedValues.length}
              >
                Clear
              </button>
              <button 
                className="apply-button"
                onClick={applyFilterChanges}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="results-section">
        <div className="results-header">
          <h4>
            Results ({filteredData.length} records)
            {loading && <span className="loading-indicator">Loading...</span>}
          </h4>
          <div className="results-controls">
            <div className="rows-per-page">
              <label>Rows per page:</label>
              <select 
                value={rowsPerPage} 
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <button 
              onClick={downloadCSV} 
              disabled={!filteredData.length}
              className="download-button" style={{ marginTop: "25px" }}
            >
              <FaDownload /> Download CSV
            </button>
          </div>
        </div>

        <div className="active-filters">
          {filters.MACHINE_ID && filters.MACHINE_ID.length > 0 && (
            <div className="active-filter">
              Machine ID: 
              {filters.MACHINE_ID.includes("All") ? (
                <span className="filter-value">All
                  <button onClick={() => removeFilter("MACHINE_ID", "All")}>×</button>
                </span>
              ) : (
                filters.MACHINE_ID.map((value, idx) => (
                  <span key={idx} className="filter-value">{value}
                    <button onClick={() => removeFilter("MACHINE_ID", value)}>×</button>
                  </span>
                ))
              )}
            </div>
          )}
          
          {filters.LINE_NUMB && filters.LINE_NUMB.length > 0 && (
            <div className="active-filter">
              Line Number: 
              {filters.LINE_NUMB.includes("All") ? (
                <span className="filter-value">All
                  <button onClick={() => removeFilter("LINE_NUMB", "All")}>×</button>
                </span>
              ) : (
                filters.LINE_NUMB.map((value, idx) => (
                  <span key={idx} className="filter-value">{value}
                    <button onClick={() => removeFilter("LINE_NUMB", value)}>×</button>
                  </span>
                ))
              )}
            </div>
          )}
          
          {filters.operator_name && filters.operator_name.length > 0 && (
            <div className="active-filter">
              Operator Name: 
              {filters.operator_name.includes("All") ? (
                <span className="filter-value">All
                  <button onClick={() => removeFilter("operator_name", "All")}>×</button>
                </span>
              ) : (
                filters.operator_name.map((value, idx) => (
                  <span key={idx} className="filter-value">{value}
                    <button onClick={() => removeFilter("operator_name", value)}>×</button>
                  </span>
                ))
              )}
            </div>
          )}
          
          {(fromDate || toDate) && (
            <div className="active-filter">
              Date Range: {fromDate || "Start"} to {toDate || "End"}
              <button onClick={() => {
                setFromDate("");
                setToDate("");
                applyFilters(filters);
                setCurrentPage(1);
              }}>×</button>
            </div>
          )}
        </div>

        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {TABLE_HEADS.map((th, index) => (
                    <th key={index}>{th.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={TABLE_HEADS.length} className="loading-row">
                      Loading data...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  currentRows.map((dataItem, index) => (
                    <tr key={indexOfFirstRow + index}>
                      {TABLE_HEADS.map((th, thIndex) => (
                        <td key={thIndex}>
                          {th.key === "serial_number"
                            ? indexOfFirstRow + index + 1
                            : th.key === "created_at"
                            ? formatDateTime(dataItem[th.key])
                            : dataItem[th.key] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={TABLE_HEADS.length} className="no-data">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredData.length > 0 && !loading && (
          <div className="pagination-controls">
            <div className="page-info">
              Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, totalRows)} of {totalRows} entries
            </div>
            <div className="page-navigation">
              <button 
                onClick={goToFirstPage} 
                disabled={currentPage === 1}
                className="page-button"
              >
                <FaAngleDoubleLeft />
              </button>
              <button 
                onClick={goToPreviousPage} 
                disabled={currentPage === 1}
                className="page-button"
              >
                <FaAngleLeft />
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className="page-button"
              >
                <FaAngleRight />
              </button>
              <button 
                onClick={goToLastPage} 
                disabled={currentPage === totalPages}
                className="page-button"
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ConsolidatedReports;
