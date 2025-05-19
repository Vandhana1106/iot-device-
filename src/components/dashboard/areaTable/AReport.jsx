import React, { useState, useEffect } from "react";
import { 
  FaRedo, 
  FaDownload, 
  FaFilePdf, 
  FaFileCode, 
  FaAngleLeft, 
  FaAngleRight, 
  FaAngleDoubleLeft, 
  FaAngleDoubleRight 
} from "react-icons/fa";
import "./AreaTable.scss";

const TABLE_HEADS = [
  { label: "S.No", key: "index" },
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
  { label: "Operation Count", key: "DEVICE_ID" },
  { label: "Stitch Count", key: "RESERVE" },
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
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return dateTimeString;
  }
};

const API_URL = "http://127.0.0.1:8000/api/user-machine-logs/";

const AReport = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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
    
    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    
    const requestUrl = `${API_URL}?${params.toString()}`;
    console.log("Fetching data from:", requestUrl);
    
    const response = await fetch(requestUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Raw data received:", data);
    
    if (data) {
      // Handle both array format and {logs: [...]} format
      const logsArray = Array.isArray(data) ? data : (Array.isArray(data.logs) ? data.logs : []);
      
      console.log("Log entries count:", logsArray.length);
      
      // Check for missing fields
      const missingOperatorNames = logsArray.filter(item => !item.operator_name).length;
      const missingModeDesc = logsArray.filter(item => !item.mode_description).length;
      console.log(`Missing fields: operator_name=${missingOperatorNames}, mode_description=${missingModeDesc}`);
      
      // Sample a few records
      if (logsArray.length > 0) {
        console.log("Sample record:", logsArray[0]);
      }
      
      // Filter out unknown operators
      let processedData = logsArray.filter(item => {
        return item.OPERATOR_ID !== 0 && 
               (item.operator_name ? !item.operator_name.toLowerCase().includes("unknown") : true);
      });
      
      setTableData(processedData);
      setFilteredData(processedData);
    } else {
      throw new Error("Invalid data format received from server");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
  // Pagination functions
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
  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setTableData([]);
    setFilteredData([]);
    setError(null);
    setCurrentPage(1);
  };

  const downloadCSV = () => {
    try {
      const headers = TABLE_HEADS.map((th) => th.label).join(",");
      const rows = filteredData
        .map((item, index) =>
          TABLE_HEADS.map((th) => {
            if (th.key === "index") {
              return index + 1;
            } else if (th.key === "created_at") {
              return `"${formatDateTime(item[th.key])}"`;
            } else {
              return item[th.key] ? `"${String(item[th.key]).replace(/"/g, '""')}"` : "";
            }
          }).join(",")
        )
        .join("\n");
      const csvContent = `${headers}\n${rows}`;      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `report_${fromDate}_to_${toDate}.csv`;
      link.click();
    } catch (error) {
      console.error("Error generating CSV:", error);
      alert("Failed to generate CSV file");
    }
  };

  const downloadHTML = () => {
    try {
      let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report ${fromDate} to ${toDate}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          h1 { color: #333; }
          .report-header { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>Report: ${fromDate} to ${toDate}</h1>
          <p>Generated on: ${formatDateTime(new Date().toISOString())}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${TABLE_HEADS.map(th => `<th>${th.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
      `;
      
      filteredData.forEach((item, index) => {
        htmlContent += '<tr>';
        TABLE_HEADS.forEach(th => {
          if (th.key === 'index') {
            htmlContent += `<td>${index + 1}</td>`;
          } else if (th.key === 'created_at') {
            htmlContent += `<td>${formatDateTime(item[th.key])}</td>`;
          } else {
            htmlContent += `<td>${item[th.key] || '-'}</td>`;
          }
        });
        htmlContent += '</tr>';
      });
      
      htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
      `;
      
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `report_${fromDate}_to_${toDate}.html`;
      link.click();
    } catch (error) {
      console.error("Error generating HTML:", error);
      alert("Failed to generate HTML file");
    }
  };
  return (
    <section className="content-area-table">
      <div className="data-table-info">
        <h4 className="data-table-title">Report Generator</h4>
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
              style={{ marginTop: "25px", backgroundColor: "green" }}
            >
              Generate
            </button>

            {tableData.length > 0 && (
              <button
                className="reset-button"
                style={{ marginTop: "25px", marginLeft: "15px" }}
                onClick={handleReset}
              >
                <FaRedo /> Reset
              </button>
            )}
          </div>
        </div>
      </div>      <div className="results-section">
        <div className="results-header">
          <div className="results-header-left">
            <h4>
              {`Results (${filteredData.length} records)`}
              {loading && <span className="loading-indicator">Loading...</span>}
            </h4>
          </div>
          
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
            
            {filteredData.length > 0 && (
              <div className="download-options">
                <button 
                  onClick={downloadCSV} 
                  className="download-button" 
                  style={{ marginTop: "25px", marginRight: "10px" }}
                >
                  <FaDownload /> CSV
                </button>
                <button 
                  onClick={downloadHTML} 
                  className="download-button" 
                  style={{ marginTop: "25px", backgroundColor: "#4a86e8" }}
                >
                  <FaFileCode /> HTML
                </button>
              </div>
            )}
          </div>
        </div>

        {(fromDate || toDate) && (
          <div className="active-filters">
            <div className="active-filter">
              Date Range: {fromDate || "Start"} to {toDate || "End"}
            </div>
          </div>
        )}        <div className="table-container">
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
                          {th.key === "index"
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
                      {error ? error : "No records found. Please select dates and click Generate."}
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

export default AReport;