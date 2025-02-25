import React, { useEffect, useState } from "react";
import { FaFilter, FaRedo } from "react-icons/fa"; // Add FaRedo import
import "./AreaTable.scss";

const TABLE_HEADS = [
  { label: "Serial Number", key: "serial_number" }, // Add Serial Number
  { label: "Machine ID", key: "MACHINE_ID" },
  { label: "Line Number", key: "LINE_NUMB" },
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
  const dateTime = new Date(dateTimeString);
  const formattedDate = dateTime.toISOString().split('T')[0];
  const formattedTime = dateTime.toTimeString().split(' ')[0];
  const timeZone = dateTime.toTimeString().split(' ')[1];
  return `${formattedDate}  ${formattedTime}.${dateTime.getMilliseconds()}${timeZone}`;
};

const AreaTable = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false); // Toggle filter visibility
  const [fromDate, setFromDate] = useState(""); // From Date state
  const [toDate, setToDate] = useState(""); // To Date state

  useEffect(() => {
    fetch("https://pinesphere.pinesphere.co.in/api/logs/")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTableData(data);
          setFilteredData(data);
        } else {
          console.error("Fetched data is not an array:", data);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
  
    // Apply text filters
    let filtered = tableData.filter((item) =>
      Object.keys(updatedFilters).every((filterKey) =>
        updatedFilters[filterKey]
          ? String(item[filterKey] || "").toLowerCase() === updatedFilters[filterKey].toLowerCase()
          : true
      )
    );
  
    // Apply date filter based on the "Date" field
    if (fromDate || toDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.DATE);
        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
  
        let isAfterFromDate = true;
        let isBeforeToDate = true;
  
        // If 'fromDate' exists, check if the item date is greater than or equal to it
        if (fromDate) {
          const fromDateTime = new Date(fromDate);
          const fromDateOnly = new Date(fromDateTime.getFullYear(), fromDateTime.getMonth(), fromDateTime.getDate());
          isAfterFromDate = itemDateOnly >= fromDateOnly;
        }
  
        // If 'toDate' exists, check if the item date is less than or equal to it
        if (toDate) {
          const toDateTime = new Date(toDate);
          const toDateOnly = new Date(toDateTime.getFullYear(), toDateTime.getMonth(), toDateTime.getDate());
          isBeforeToDate = itemDateOnly <= toDateOnly;
        }
  
        return isAfterFromDate && isBeforeToDate;
      });
    }
  
    setFilteredData(filtered);
  };
  
  // Update filters when date range changes
  useEffect(() => {
    handleFilterChange("dummy", ""); // Trigger filter reapplication
  }, [fromDate, toDate]);

  // Function to generate CSV data
  const downloadCSV = () => {
    const headers = TABLE_HEADS.map((th) => th.label).join(",");
    const rows = filteredData
      .map((item, index) =>
        TABLE_HEADS.map((th) =>
          th.key === "serial_number" ? index + 1 : item[th.key] ? `"${item[th.key]}"` : ""
        ).join(",")
      )
      .join("\n");
    const csvContent = `${headers}\n${rows}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "table_data.csv";
    link.click();
  };

  // Function to generate HTML data
  const downloadHTML = () => {
    let htmlContent = `<table border="1"><thead><tr>${TABLE_HEADS.map(
      (th) => `<th>${th.label}</th>`
    ).join("")}</tr></thead><tbody>`;

    htmlContent += filteredData
      .map(
        (item, index) =>
          `<tr>${TABLE_HEADS.map(
            (th) =>
              `<td>${
                th.key === "serial_number" ? index + 1 : item[th.key] ? item[th.key] : "-"
              }</td>`
          ).join("")}</tr>`
      )
      .join("");

    htmlContent += "</tbody></table>";

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "table_data.html";
    link.click();
  };

  // Handle key press event for filtering
  const handleKeyPress = (e, key) => {
    if (e.key === 'Enter') {
      handleFilterChange(key, e.target.value); // Trigger filter on Enter key press
    }
  };

  // Add reset function
  const handleReset = () => {
    setFilters({});
    setFromDate("");
    setToDate("");
    setFilteredData(tableData);
    setShowFilters(false);
    // Removed window.location.reload()
  };

  return (
    <section className="content-area-table">
      <div className="data-table-info">
        <h4 className="data-table-title">Latest Logs</h4>
        <div className="filter-wrapper">
          <div className="filter-buttons">
            <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
              <FaFilter />
            </button>
            <button className="filter-button reset-button" onClick={handleReset}>
              <FaRedo />
            </button>
          </div>
          {/* Date Range Filter */}
          <div className="date-filter">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="From Date"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="To Date"
            />
          </div>
          {/* Download Buttons */}
          <div className="download-buttons">
            <button onClick={downloadCSV}>Download CSV</button>
            <button onClick={downloadHTML}>Download HTML</button>
          </div>
        </div>
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
              {showFilters && (
                <tr>
                  {TABLE_HEADS.map((th, index) => (
                    <th key={index}>
                      {th.key !== "actions" ? (
                        <input
                          type="text"
                          placeholder="Filter..."
                          className="filter-input"
                          value={filters[th.key] || ""}
                          onChange={(e) => handleFilterChange(th.key, e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, th.key)} // Add key press listener
                        />
                      ) : null}
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((dataItem, index) => (
                  <tr key={dataItem.id}>
                    {TABLE_HEADS.map((th, thIndex) => (
                      <td key={thIndex}>
                        {th.key === "serial_number"
                          ? index + 1
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
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AreaTable;