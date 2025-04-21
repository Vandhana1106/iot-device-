import React, { useEffect, useState } from "react";
import { FaFilter, FaRedo, FaCalendarAlt, FaDownload, FaSearch, FaChartBar, FaArrowLeft, FaTable } from "react-icons/fa";
import "./AreaTable.scss";
import LineReport from "../../Line_Report/LineReport";
import AllLinesReport from "../../Line_Report/AllLinesReport";

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
  { label: "Calculation", key: "calculation" },
  { label: "Created At", key: "created_at" },
];

const formatDateTime = (dateTimeString) => {
  const dateTime = new Date(dateTimeString);
  const formattedDate = dateTime.toISOString().split("T")[0];
  const formattedTime = dateTime.toTimeString().split(" ")[0];
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

const calculateValue = (item) => {
  // If operator id is 0 and mode is 2, set to 0
  if (item.OPERATOR_ID === 0 && item.MODE === 2) {
    return 0;
  }

  // Parse start and end times
  const startTime = item.START_TIME ? new Date(`1970-01-01T${item.START_TIME}`) : null;
  const endTime = item.END_TIME ? new Date(`1970-01-01T${item.END_TIME}`) : null;

  if (!startTime || !endTime) return 1;

  // Check time conditions
  const isBreakTime1 = 
    (startTime >= new Date(`1970-01-01T10:30:00`) && 
     endTime <= new Date(`1970-01-01T10:40:00`));

  const isBreakTime2 = 
    (startTime >= new Date(`1970-01-01T13:20:00`) && 
     endTime <= new Date(`1970-01-01T14:00:00`));

  const isBreakTime3 = 
    (startTime >= new Date(`1970-01-01T16:20:00`) && 
     endTime <= new Date(`1970-01-01T16:30:00`));

  // If any break time condition is met, return 0, otherwise 1
  return (isBreakTime1 || isBreakTime2 || isBreakTime3) ? 0 : 1;
};

const Lineoverall = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedLineNumber, setSelectedLineNumber] = useState("");
  const [lineNumbers, setLineNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [filterSummary, setFilterSummary] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showTableView, setShowTableView] = useState(false);
  const [dataGenerated, setDataGenerated] = useState(false);
  const [lineReportData, setLineReportData] = useState([]);
  const [showAllLines, setShowAllLines] = useState(false);
  const [allLinesReportData, setAllLinesReportData] = useState([]);

  // Fetch initial data
  useEffect(() => {
    setIsLoading(true);
    fetch("https://2nbcjqrb-8000.inc1.devtunnels.ms/api/logs/")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setTableData(sortedData);
          setFilteredData([]);
          
          const uniqueLineNumbers = [...new Set(sortedData.map(item => item.LINE_NUMB))].filter(Boolean);
          uniqueLineNumbers.sort((a, b) => {
            const numA = Number(a);
            const numB = Number(b);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return String(a).localeCompare(String(b));
          });
          setLineNumbers(uniqueLineNumbers);
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
    if (selectedLineNumber === "all") {
      // For "All Lines", filter by date range first
      let allLinesFiltered = [...tableData];
      
      if (fromDate || toDate) {
        allLinesFiltered = allLinesFiltered.filter((item) => {
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
      }
      
      setFilteredData(allLinesFiltered);
      fetchAllLinesReport();
      return;
    }

    let filtered = [...tableData];
    let filterDescription = [];
    
    if (selectedLineNumber) {
      filtered = filtered.filter(item => {
        const itemLineNumber = String(item.LINE_NUMB || "").trim();
        const selectedLine = String(selectedLineNumber).trim();
        return itemLineNumber === selectedLine;
      });
      
      filterDescription.push(`Line Number: ${selectedLineNumber}`);
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
      }
    }
    
    setFilterSummary(filterDescription.join(", "));
    setFilteredData(filtered);
    setFiltersApplied(true);
    setDataGenerated(true);
    setShowTableView(false);
    setShowAllLines(false);
  };
  
  const fetchAllLinesReport = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);

    fetch(`http://localhost:8000/api/line-reports/all/?${params}`)
      .then(response => response.json())
      .then(data => {
        setAllLinesReportData(data.allLinesReport);
        setIsLoading(false);
        setDataGenerated(true);
        setShowTableView(false);
        setShowAllLines(true);
        setFiltersApplied(true);
      })
      .catch(error => {
        console.error("Error fetching all lines report:", error);
        setIsLoading(false);
      });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };
  
  const handleLineNumberChange = (e) => {
    setSelectedLineNumber(e.target.value);
  };
  
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };
  
  const handleToDateChange = (e) => {
    setToDate(e.target.value);
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
    setSelectedLineNumber("");
    setFilteredData([]);
    setShowFilters(false);
    setDateFilterActive(false);
    setFilterSummary("");
    setFiltersApplied(false);
    setShowTableView(false);
    setDataGenerated(false);
    setShowAllLines(false);
  };

  const downloadCSV = () => {
    const csvContent = [
      TABLE_HEADS.map(head => head.label).join(","),
      ...filteredData.map(row => {
        const rowWithCalculation = {
          ...row,
          calculation: calculateValue(row)
        };
        return TABLE_HEADS.map(head => rowWithCalculation[head.key] || "").join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "line_data.csv";
    link.click();
  };

  const downloadHTML = () => {
    const htmlContent = `
      <html>
      <head>
        <title>Line Data</title>
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>${TABLE_HEADS.map(head => `<th>${head.label}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${filteredData.map(row => {
              const rowWithCalculation = {
                ...row,
                calculation: calculateValue(row)
              };
              return `
                <tr>${TABLE_HEADS.map(head => `<td>${rowWithCalculation[head.key] || ""}</td>`).join("")}</tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "line_data.html";
    link.click();
  };

  return (
    <section className="content-area-table">
      <div className="filter-section">
        <div className="main-filters">
          <div className="machine-selector">
            <label>Select Line Number:</label>
            <div className="select-wrapper">
              <select 
                value={selectedLineNumber}
                onChange={handleLineNumberChange}
                className="machine-dropdown"
              >
                <option value="">Select a Line</option>
                <option value="all">All Lines</option>
                {lineNumbers.map((lineNum) => (
                  <option key={lineNum} value={lineNum}>{lineNum}</option>
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
              className={`toggle-view-button generate-button green-button ${!selectedLineNumber ? 'disabled' : ''}`}
              onClick={applyFilters}
              disabled={!selectedLineNumber}
              title="Apply Filters"
              style={{ marginRight: '22px' }}
            >
              <FaChartBar /> Generate
            </button>

            {dataGenerated && !showAllLines && (
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
      </div>

      <div className="content-section">
        {isLoading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading line logs data...</p>
          </div>
        ) : !filtersApplied ? (
          <div className="no-selection-state">
            <FaSearch className="search-icon" />
            <p>Select a Line Number and click Generate to view data</p>
          </div>
        ) : showAllLines ? (
          <AllLinesReport 
            reportData={allLinesReportData} 
            detailedData={filteredData}
            fromDate={fromDate}
            toDate={toDate}
          />
        ) : showTableView ? (
          <div className="table-container">
            <div className="table-header">
              <h3>Raw Data Report</h3>
              <div className="table-controls">
                <div className="download-buttons button">
                  <button onClick={downloadCSV}>
                    <FaDownload /> CSV
                  </button>
                  <button onClick={downloadHTML}>
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
                  {filteredData.map((dataItem, index) => {
                    const itemWithCalculation = {
                      ...dataItem,
                      calculation: calculateValue(dataItem)
                    };
                    
                    return (
                      <tr key={index}>
                        {TABLE_HEADS.map((th, thIndex) => (
                          <td key={thIndex}>
                            {th.key === "serial_number"
                              ? index + 1
                              : th.key === "created_at" && itemWithCalculation[th.key]
                              ? formatConsistentDateTime(itemWithCalculation[th.key])
                              : itemWithCalculation[th.key] || "-"}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="no-data-state">
            <p>No data available for the current filters</p>
            <div className="filter-summary">
              {selectedLineNumber && <div>Line Number: {selectedLineNumber}</div>}
              {fromDate && <div>From date: {formatDateForDisplay(fromDate)}</div>}
              {toDate && <div>To date: {formatDateForDisplay(toDate)}</div>}
            </div>
          </div>
        ) : (
          <div className="line-report-section">
            <LineReport 
              lineNumber={selectedLineNumber}
              fromDate={fromDate} 
              toDate={toDate}
              onDataLoaded={setLineReportData}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Lineoverall;