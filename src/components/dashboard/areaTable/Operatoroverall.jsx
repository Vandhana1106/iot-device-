


import React, { useEffect, useState } from "react";
import { FaFilter, FaRedo, FaCalendarAlt, FaDownload, FaSearch, FaChartBar, FaArrowLeft, FaTable } from "react-icons/fa";
import "./AreaTable.scss";
import OperatorReport from "../../Operator_Report/OperatorReport"; // Import the OperatorReport component

const TABLE_HEADS = [
  { label: "S.No", key: "serial_number" },
  { label: "Machine ID", key: "MACHINE_ID" },
  { label: "Line Number", key: "LINE_NUMB" },
  { label: "Operator ID", key: "OPERATOR_ID" },
  { label: "Operator Name", key: "operator_name" },
  { label: "Date", key: "DATE" },
  { label: "Start Time", key: "START_TIME" },
  { label: "End Time", key: "END_TIME" },
  { label: "Mode", key: "MODE" },
  { label: "Mode Description", key: "mode_description" },
  { label: "Stitch Count", key: "STITCH_COUNT" },
  { label: "Needle Runtime", key: "NEEDLE_RUNTIME" },
  { label: "Needle Stop Time", key: "NEEDLE_STOPTIME" },
  
  { label: "Duration", key: "DEVICE_ID" },
  { label: "SPM", key: "RESERVE" },
  { label: "TX Log ID", key: "Tx_LOGID" },
  { label: "STR Log ID", key: "Str_LOGID" },
  { label: "Created At", key: "created_at" },
];

const formatDateTime = (dateTimeString) => {
  const dateTime = new Date(dateTimeString);
  const formattedDate = dateTime.toISOString().split("T")[0];
  const formattedTime = dateTime.toTimeString().split(" ")[0]; // Removes timezone
  return `${formattedDate} ${formattedTime}.${dateTime.getMilliseconds()}`;
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return ""; 
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const Operatoroverall = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedOperatorName, setSelectedOperatorName] = useState("");
  const [operatorNames, setOperatorNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [filterSummary, setFilterSummary] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showTableView, setShowTableView] = useState(false); // Changed from showSummaryView
  const [dataGenerated, setDataGenerated] = useState(false);
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [operatorReportData, setOperatorReportData] = useState([]); // New state for OperatorReport table data

  // Fetch initial data
  useEffect(() => {
    setIsLoading(true);
    fetch("http://127.0.0.1:8000/api/logs/")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setTableData(sortedData);
          setFilteredData([]);
          
          const uniqueOperatorNames = [...new Set(sortedData.map(item => item.operator_name))].filter(Boolean);
          uniqueOperatorNames.sort((a, b) => String(a).localeCompare(String(b)));
          setOperatorNames(uniqueOperatorNames);
          
          console.log("Data loaded:", sortedData.length, "records");
          console.log("Unique operator names (sorted):", uniqueOperatorNames);
        } else {
          console.error("Fetched data is not an array:", data);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  // Filter function
  const applyFilters = () => {
    let filtered = [...tableData];
    let filterDescription = [];
    
    if (selectedOperatorName) {
      filtered = filtered.filter(item => {
        const itemOperatorName = String(item.operator_name || "").trim();
        const selectedName = String(selectedOperatorName).trim();
        return itemOperatorName === selectedName;
      });
      
      filterDescription.push(`Operator Name: ${selectedOperatorName}`);
      console.log(`After operator name filter: ${filtered.length} records match '${selectedOperatorName}'`);
    }
    
    if (fromDate || toDate) {
      setDateFilterActive(true);
      filtered = filtered.filter((item) => {
        if (!item.DATE) return false;
        
        try {
          const itemDate = new Date(item.DATE);
          if (isNaN(itemDate.getTime())) return false;
          
          const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          
          if (fromDate) {
            const fromDateTime = new Date(fromDate);
            const fromDateOnly = new Date(fromDateTime.getFullYear(), fromDateTime.getMonth(), fromDateTime.getDate());
            if (itemDateOnly < fromDateOnly) return false;
          }
          
          if (toDate) {
            const toDateTime = new Date(toDate);
            const toDateOnly = new Date(toDateTime.getFullYear(), toDateTime.getMonth(), toDateTime.getDate());
            if (itemDateOnly > toDateOnly) return false;
          }
          
          return true;
        } catch (e) {
          console.error("Date filtering error:", e);
          return false;
        }
      });
      
      if (fromDate && toDate) {
        filterDescription.push(`Date: ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}`);
      } else if (fromDate) {
        filterDescription.push(`Date: From ${formatDateForDisplay(fromDate)}`);
      } else if (toDate) {
        filterDescription.push(`Date: Until ${formatDateForDisplay(toDate)}`);
      }
      
      console.log("After date filters:", filtered.length, "records");
    } else {
      setDateFilterActive(false);
    }

    if (Object.keys(filters).length > 0) {
      const activeFilters = Object.keys(filters).filter(key => filters[key] && key !== 'dummy');
      
      if (activeFilters.length > 0) {
        filtered = filtered.filter((item) =>
          activeFilters.every((filterKey) => {
            const itemValue = String(item[filterKey] || "").toLowerCase();
            const filterValue = filters[filterKey].toLowerCase();
            return itemValue.includes(filterValue);
          })
        );
        
        activeFilters.forEach(key => {
          const columnName = TABLE_HEADS.find(h => h.key === key)?.label || key;
          filterDescription.push(`${columnName}: ${filters[key]}`);
        });
        
        console.log("After text filters:", filtered.length, "records");
      }
    }
    
    setFilterSummary(filterDescription.join(", "));
    setFilteredData(filtered);
    setFiltersApplied(true);
    setDataGenerated(true);
    setShowTableView(false); // Show chart by default after generating data
  };
  
  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
  };
  
  const handleOperatorNameChange = (e) => {
    const newOperatorName = e.target.value;
    console.log("Selected operator name changed to:", newOperatorName);
    setSelectedOperatorName(newOperatorName);
  };
  
  const handleFromDateChange = (e) => {
    const newDate = e.target.value;
    setFromDate(newDate);
    console.log("From date changed to:", newDate);
  };
  
  const handleToDateChange = (e) => {
    const newDate = e.target.value;
    setToDate(newDate);
    console.log("To date changed to:", newDate);
  };

  const formatConsistentDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    
    try {
      const dateTime = new Date(dateTimeString);
      
      const year = dateTime.getFullYear();
      const month = String(dateTime.getMonth() + 1).padStart(2, '0');
      const day = String(dateTime.getDate()).padStart(2, '0');
      const hours = String(dateTime.getHours()).padStart(2, '0');
      const minutes = String(dateTime.getMinutes()).padStart(2, '0');
      const seconds = String(dateTime.getSeconds()).padStart(2, '0');
      const ms = String(dateTime.getMilliseconds()).padStart(3, '0').slice(0, 2);
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateTimeString;
    }
  };

  const toggleView = () => {
    setShowTableView(!showTableView);
  };

  const handleReset = () => {
    setFilters({});
    setFromDate("");
    setToDate("");
    setSelectedOperatorName("");
    setFilteredData([]);
    setShowFilters(false);
    setDateFilterActive(false);
    setFilterSummary("");
    setFiltersApplied(false);
    setShowTableView(false);
    setDataGenerated(false);
    console.log("Filters reset");
  };

  // Callback function to receive data from OperatorReport
  const handleOperatorReportData = (data) => {
    setOperatorReportData(data);
  };

  const downloadCSV = () => {
    const csvContent = [
      TABLE_HEADS.map(head => head.label).join(","),
      ...filteredData.map(row => 
        TABLE_HEADS.map(head => 
          head.key === "created_at" && row[head.key] 
            ? formatConsistentDateTime(row[head.key]) 
            : row[head.key] || ""
        ).join(",")
      )
    ].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "operator_data.csv";
    link.click();
  };
  
  const downloadHTML = () => {
    const htmlContent = `
      <html>
      <head>
        <title>Operator Data</title>
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>${TABLE_HEADS.map(head => `<th>${head.label}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${filteredData.map(row => `
              <tr>${TABLE_HEADS.map(head => `
                <td>${
                  head.key === "created_at" && row[head.key] 
                    ? formatConsistentDateTime(row[head.key]) 
                    : row[head.key] || ""
                }</td>
              `).join("")}</tr>
            `).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;
  
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "operator_data.html";
    link.click();
  };

  return (
    <section className="content-area-table">
      {/* Filter section - always visible at the top */}
      <div className="filter-section">
        <div className="main-filters">
          <div className="machine-selector">
            <label>Select Operator Name:</label>
            <div className="select-wrapper">
              <select 
                value={selectedOperatorName}
                onChange={handleOperatorNameChange}
                className="machine-dropdown"
              >
                <option value="">Select an Operator</option>
                {operatorNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="date-filter">
            <div className="date-input-group">
              <div className="date-field">
                <FaCalendarAlt className="calendar-icon" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={handleFromDateChange}
                  className="date-input"
                />
                <span className="date-label">From</span>
              </div>
              <div className="date-separator">to</div>
              <div className="date-field">
                <FaCalendarAlt className="calendar-icon" />
                <input
                  type="date"
                  value={toDate}
                  onChange={handleToDateChange}
                  className="date-input"
                />
                <span className="date-label">To</span>
              </div>
            </div>
          </div>
          
          <div className="apply-filter-container">
          
          <button
  className={`toggle-view-button generate-button green-button ${!selectedOperatorName ? 'disabled' : ''}`}
  onClick={applyFilters}
  disabled={!selectedOperatorName}
  title="Apply Filters"
  style={{ marginRight: '22px' }}
>
  <FaChartBar /> Generate
</button>

{dataGenerated && (
  <button
    className={`toggle-view-button view-toggle-button green-button ${!dataGenerated ? 'disabled' : ''}`}
    onClick={toggleView}
    disabled={!dataGenerated}
    title={showTableView ? "View Chart" : "View Raw Data"}
    style={{ marginRight: '18px' }}
  >
    {showTableView ? <FaChartBar /> : <FaTable />}
    {showTableView ? " View Chart" : " View Raw Data"}
  </button>
)}

            
          </div>
          <div className="action-buttons-container">
          <div className="action-buttons">
            <button 
              className="action-button reset-button"
              onClick={handleReset}
              title="Reset All Filters"
              style={{marginBottom: '-5px' }}
            >
              <FaRedo /> Reset
            </button>
          </div>
        </div>
        </div>

        {/* Action buttons section - moved to the right */}
        
      </div>

      {/* Content section - changes based on view */}
      <div className="content-section">
        {isLoading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading operator logs data...</p>
          </div>
        ) : !filtersApplied ? (
          <div className="no-selection-state">
            <FaSearch className="search-icon" />
            <p>Select an Operator Name and click Generate to view data</p>
          </div>
        ) : showTableView ? (
          <div className="table-container">
            <div className="table-header">
              <h3>Raw Data Report</h3>
              <div className="table-controls">
                <div className="download-buttons button">
                  <button onClick={downloadCSV} >
                    <FaDownload /> CSV
                  </button>
                  <button onClick={downloadHTML} >
                    <FaDownload /> HTML
                  </button>
                </div>
              </div>
            </div>
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
                  {filteredData.map((dataItem, index) => (
                    <tr key={index}>
                      {TABLE_HEADS.map((th, thIndex) => (
                        <td key={thIndex}>
                          {th.key === "serial_number"
                            ? index + 1
                            : th.key === "created_at" && dataItem[th.key]
                            ? formatConsistentDateTime(dataItem[th.key])
                            : dataItem[th.key] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="no-data-state">
            <p>No data available for the current filters</p>
            <div className="filter-summary">
              {selectedOperatorName && <div>Operator Name: {selectedOperatorName}</div>}
              {fromDate && <div>From date: {formatDateForDisplay(fromDate)}</div>}
              {toDate && <div>To date: {formatDateForDisplay(toDate)}</div>}
            </div>
          </div>
        ) : (
          <div className="operator-report-section">
            <OperatorReport 
              operator_name={selectedOperatorName} 
              fromDate={fromDate} 
              toDate={toDate}
              onDataLoaded={handleOperatorReportData}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Operatoroverall;
