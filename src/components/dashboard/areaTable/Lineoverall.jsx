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
  { label: "Created At", key: "created_at" },
];

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
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
  if (item.OPERATOR_ID === 0 && item.MODE === 2) {
    return 0;
  }

  const startTime = item.START_TIME ? new Date(`1970-01-01T${item.START_TIME}`) : null;
  const endTime = item.END_TIME ? new Date(`1970-01-01T${item.END_TIME}`) : null;

  if (!startTime || !endTime) return 1;

  const breakPeriods = [
    { start: new Date(`1970-01-01T10:30:00`), end: new Date(`1970-01-01T10:40:00`) },
    { start: new Date(`1970-01-01T13:20:00`), end: new Date(`1970-01-01T14:00:00`) },
    { start: new Date(`1970-01-01T16:20:00`), end: new Date(`1970-01-01T16:30:00`) },
  ];

  const isWithinBreakPeriod = breakPeriods.some(
    (breakPeriod) => startTime >= breakPeriod.start && endTime <= breakPeriod.end
  );

  return isWithinBreakPeriod ? 0 : 1;
};

const formatConsistentDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  try {
    // If the date is already in the correct format, return it as-is
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTimeString)) {
      return dateTimeString;
    }
    
    // Otherwise, parse it and format it correctly
    const dateTime = new Date(dateTimeString);
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateTimeString;
  }
};

const Lineoverall = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedLineNumber, setSelectedLineNumber] = useState("");
  const [availableLineNumbers, setAvailableLineNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLines, setIsFetchingLines] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showTableView, setShowTableView] = useState(false);
  const [dataGenerated, setDataGenerated] = useState(false);
  const [lineReportData, setLineReportData] = useState([]);
  const [showAllLines, setShowAllLines] = useState(false);
  const [allLinesReportData, setAllLinesReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchAvailableLineNumbers();
    } else {
      setAvailableLineNumbers([]);
      setSelectedLineNumber("");
    }
  }, [fromDate, toDate]);

  const fetchAvailableLineNumbers = () => {
    setIsFetchingLines(true);
    
    const params = new URLSearchParams();
    params.append('from_date', fromDate);
    params.append('to_date', toDate);

    fetch(`https://oceanatlantic.pinesphere.co.in/api/logs/line-numbers/?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setAvailableLineNumbers(data.line_numbers || []);
      })
      .catch((error) => {
        console.error("Error fetching line numbers:", error);
        setAvailableLineNumbers([]);
      })
      .finally(() => {
        setIsFetchingLines(false);
      });
  };

  const applyFilters = () => {
    setCurrentPage(1);
    if (!selectedLineNumber) {
      alert("Please select a Line Number");
      return;
    }

    setIsLoading(true);
    setFiltersApplied(true);
    setDataGenerated(false);

    const params = new URLSearchParams();
    if (selectedLineNumber !== "all") {
      params.append('line_number', selectedLineNumber);
    }
    params.append('from_date', fromDate);
    params.append('to_date', toDate);

    fetch(`https://oceanatlantic.pinesphere.co.in/api/logs/filter/?${params}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setTableData(sortedData);
          setFilteredData(sortedData);
          
          if (selectedLineNumber === "all") {
            fetchAllLinesReport(sortedData);
          } else {
            setDataGenerated(true);
            setIsLoading(false);
          }
        } else {
          console.error("Fetched data is not an array:", data);
          setTableData([]);
          setFilteredData([]);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching filtered data:", error);
        setTableData([]);
        setFilteredData([]);
        setIsLoading(false);
      });
  };

  const fetchAllLinesReport = (filteredData) => {
    const params = new URLSearchParams();
    params.append('from_date', fromDate);
    params.append('to_date', toDate);

    fetch(`https://oceanatlantic.pinesphere.co.in/api/line-reports/all/?${params}`)
      .then(response => response.json())
      .then(data => {
        setAllLinesReportData(data.allLinesReport || []);
        setDataGenerated(true);
        setShowAllLines(true);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching all lines report:", error);
        setIsLoading(false);
      });
  };

  const handleLineNumberChange = (e) => {
    setSelectedLineNumber(e.target.value);
  };
  
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    setSelectedLineNumber("");
  };
  
  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    setSelectedLineNumber("");
  };

  const toggleView = () => {
    setShowTableView(!showTableView);
  };

  const handleReset = () => {
    setSelectedLineNumber("");
    setFromDate("");
    setToDate("");
    setTableData([]);
    setFilteredData([]);
    setFiltersApplied(false);
    setDataGenerated(false);
    setShowTableView(false);
    setShowAllLines(false);
    setAvailableLineNumbers([]);
    setCurrentPage(1);
  };

  const downloadCSV = () => {
    const csvContent = [
      TABLE_HEADS.map(head => head.label).join(","),
      ...filteredData.map(row => {
        return TABLE_HEADS.map(head => {
          if (head.key === "created_at" && row[head.key]) {
            return formatConsistentDateTime(row[head.key]);
          }
          return row[head.key] || "";
        }).join(",");
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
              return `
                <tr>${TABLE_HEADS.map(head => {
                  const value = head.key === "created_at" && row[head.key] 
                    ? formatConsistentDateTime(row[head.key]) 
                    : row[head.key] || "";
                  return `<td>${value}</td>`;
                }).join("")}</tr>
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

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <section className="content-area-table">
      <div className="filter-section">
        <div className="main-filters">
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

          <div className="machine-selector">
            <label>Select Line Number:</label>
            <div className="select-wrapper">
              <select
                value={selectedLineNumber}
                onChange={handleLineNumberChange}
                className="line-number-select"
                disabled={!fromDate || !toDate || isFetchingLines}
              >
                <option value="">
                  {isFetchingLines 
                    ? "Loading lines..." 
                    : !fromDate || !toDate 
                      ? "Select dates first" 
                      : availableLineNumbers.length === 0 
                        ? "No lines available" 
                        : "Select a line number"}
                </option>
                <option value="all">All Lines</option>
                {availableLineNumbers.map((lineNumber) => (
                  <option key={lineNumber} value={lineNumber}>
                    {lineNumber}
                  </option>
                ))}
              </select>
              {isFetchingLines && <div className="select-loading-indicator"></div>}
            </div>
          </div>
          
          <div className="apply-filter-container">
            <button
              className={`generate-button green-button ${!selectedLineNumber ? 'disabled' : ''}`}
              onClick={applyFilters}
              disabled={!selectedLineNumber}
              title="Apply Filters"
              style={{ marginRight: '22px' }}
            >
              <FaChartBar /> Generate
            </button>

            {dataGenerated && !showAllLines && (
              <button
                className={`view-toggle-button green-button ${!dataGenerated ? 'disabled' : ''}`}
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
            <p>Loading data...</p>
          </div>
        ) : !fromDate || !toDate ? (
          <div className="no-selection-state">
            <FaSearch className="search-icon" />
            <p>Select a date range to view available line numbers</p>
          </div>
        ) : !selectedLineNumber ? (
          <div className="no-selection-state">
            <FaSearch className="search-icon" />
            <p>{availableLineNumbers.length === 0 ? "No lines available for selected dates" : "Select a line number from the dropdown"}</p>
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
              {filteredData.length > 0 ? (
                <>
                  <table>
                    <thead>
                      <tr>
                        {TABLE_HEADS.map((th, index) => (
                          <th key={index}>{th.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentRows.map((dataItem, index) => (
                        <tr key={index}>
                          {TABLE_HEADS.map((th, thIndex) => (
                            <td key={thIndex}>
                              {th.key === "serial_number"
                                ? indexOfFirstRow + index + 1
                                : th.key === "created_at" && dataItem[th.key]
                                ? formatConsistentDateTime(dataItem[th.key])
                                : dataItem[th.key] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination-controls">
                    <div className="rows-per-page">
                      <span>Rows per page:</span>
                      <select 
                        value={rowsPerPage} 
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        {[10, 25, 50, 100].map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="page-info">
                      {`${indexOfFirstRow + 1}-${Math.min(indexOfLastRow, filteredData.length)} of ${filteredData.length}`}
                    </div>
                    
                    <div className="page-buttons">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => setCurrentPage(prev => 
                          Math.min(prev + 1, Math.ceil(filteredData.length / rowsPerPage))
                        )}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-data-state">
                  <p>No data available for the selected filters</p>
                </div>
              )}
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="no-data-state">
            <p>No data available for the selected filters</p>
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