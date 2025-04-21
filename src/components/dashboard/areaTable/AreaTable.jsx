// import React, { useEffect, useState } from "react";
// import { FaFilter, FaRedo, FaCalendarAlt, FaDownload, FaSearch } from "react-icons/fa";
// import "./AreaTable.scss";

// const TABLE_HEADS = [
//   { label: "S.No", key: "serial_number" },
//   { label: "Machine ID", key: "MACHINE_ID" },
//   { label: "Line Number", key: "LINE_NUMB" },
//   { label: "Operator ID", key: "OPERATOR_ID" },
//   { label: "Date", key: "DATE" },
//   { label: "Start Time", key: "START_TIME" },
//   { label: "End Time", key: "END_TIME" },
//   { label: "Mode", key: "MODE" },
//   { label: "Mode Description", key: "mode_description" },
//   { label: "Stitch Count", key: "STITCH_COUNT" },
//   { label: "Needle Runtime", key: "NEEDLE_RUNTIME" },
//   { label: "Needle Stop Time", key: "NEEDLE_STOPTIME" },
//   { label: "TX Log ID", key: "Tx_LOGID" },
//   { label: "STR Log ID", key: "Str_LOGID" },
//   { label: "Duration", key: "DEVICE_ID" },
//   { label: "SPM", key: "RESERVE" },
//   { label: "Created At", key: "created_at" },
// ];

// const formatDateTime = (dateTimeString) => {
//   const dateTime = new Date(dateTimeString);
//   const formattedDate = dateTime.toISOString().split("T")[0];
//   const formattedTime = dateTime.toTimeString().split(" ")[0]; // Removes timezone
//   return `${formattedDate} ${formattedTime}.${dateTime.getMilliseconds()}`;
// };


// const formatDateForDisplay = (dateString) => {
//   if (!dateString) return ""; 
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit'
//   });
// };

// const AreaTable = () => {
//   const [tableData, setTableData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [showFilters, setShowFilters] = useState(false);
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [selectedMachineId, setSelectedMachineId] = useState("");
//   const [machineIds, setMachineIds] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [dateFilterActive, setDateFilterActive] = useState(false);
//   const [filterSummary, setFilterSummary] = useState("");
//   const [filtersApplied, setFiltersApplied] = useState(false);

//   // Fetch initial data
//   useEffect(() => {
//     setIsLoading(true);
//     fetch("https://2nbcjqrb-8000.inc1.devtunnels.ms/api/logs/")
//       .then((response) => response.json())
//       .then((data) => {
//         if (Array.isArray(data)) {
//           // Sort data by 'created_at' in descending order
//           const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//           setTableData(sortedData);
//           // Don't set filtered data initially - keep it empty
//           setFilteredData([]);
          
//           // Extract unique machine IDs and sort them in ascending order
//           const uniqueMachineIds = [...new Set(sortedData.map(item => item.MACHINE_ID))].filter(Boolean);
          
//           // Sort machine IDs in ascending order (numerically if they're numbers, alphabetically otherwise)
//           uniqueMachineIds.sort((a, b) => {
//             // Try to convert to numbers first for numerical sorting
//             const numA = Number(a);
//             const numB = Number(b);
            
//             // If both are valid numbers, sort numerically
//             if (!isNaN(numA) && !isNaN(numB)) {
//               return numA - numB;
//             }
            
//             // Otherwise sort as strings alphabetically
//             return String(a).localeCompare(String(b));
//           });
          
//           setMachineIds(uniqueMachineIds);
          
//           console.log("Data loaded:", sortedData.length, "records");
//           console.log("Unique machine IDs (sorted):", uniqueMachineIds);
//         } else {
//           console.error("Fetched data is not an array:", data);
//         }
//         setIsLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//         setIsLoading(false);
//       });
//   }, []);

//   // Filter function - only called when filter button is clicked
//   const applyFilters = () => {
//     // Start with all data
//     let filtered = [...tableData];
//     let filterDescription = [];
    
//     // Apply machine ID filter first - this is our primary filter
//     if (selectedMachineId) {
//       filtered = filtered.filter(item => {
//         // Convert both to strings for comparison to avoid type mismatches
//         const itemMachineId = String(item.MACHINE_ID || "").trim();
//         const selectedId = String(selectedMachineId).trim();
//         return itemMachineId === selectedId;
//       });
      
//       filterDescription.push(`Machine ID: ${selectedMachineId}`);
//       console.log(`After machine ID filter: ${filtered.length} records match '${selectedMachineId}'`);
//     }

//     // Apply date filter with proper date object handling
//     if (fromDate || toDate) {
//       setDateFilterActive(true);
//       filtered = filtered.filter((item) => {
//         if (!item.DATE) return false;
        
//         try {
//           // Parse the item date correctly
//           const itemDate = new Date(item.DATE);
//           if (isNaN(itemDate.getTime())) return false;
          
//           // Get just the date part (no time)
//           const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          
//           // Check against from date
//           if (fromDate) {
//             const fromDateTime = new Date(fromDate);
//             const fromDateOnly = new Date(fromDateTime.getFullYear(), fromDateTime.getMonth(), fromDateTime.getDate());
//             if (itemDateOnly < fromDateOnly) return false;
//           }
          
//           // Check against to date
//           if (toDate) {
//             const toDateTime = new Date(toDate);
//             const toDateOnly = new Date(toDateTime.getFullYear(), toDateTime.getMonth(), toDateTime.getDate());
//             if (itemDateOnly > toDateOnly) return false;
//           }
          
//           return true;
//         } catch (e) {
//           console.error("Date filtering error:", e);
//           return false;
//         }
//       });
      
//       // Add date range to filter description
//       if (fromDate && toDate) {
//         filterDescription.push(`Date: ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}`);
//       } else if (fromDate) {
//         filterDescription.push(`Date: From ${formatDateForDisplay(fromDate)}`);
//       } else if (toDate) {
//         filterDescription.push(`Date: Until ${formatDateForDisplay(toDate)}`);
//       }
      
//       console.log("After date filters:", filtered.length, "records");
//     } else {
//       setDateFilterActive(false);
//     }

//     // Apply text filters from the filter inputs
//     if (Object.keys(filters).length > 0) {
//       const activeFilters = Object.keys(filters).filter(key => filters[key] && key !== 'dummy');
      
//       if (activeFilters.length > 0) {
//         filtered = filtered.filter((item) =>
//           activeFilters.every((filterKey) => {
//             const itemValue = String(item[filterKey] || "").toLowerCase();
//             const filterValue = filters[filterKey].toLowerCase();
//             return itemValue.includes(filterValue);
//           })
//         );
        
//         // Add column filters to description
//         activeFilters.forEach(key => {
//           const columnName = TABLE_HEADS.find(h => h.key === key)?.label || key;
//           filterDescription.push(`${columnName}: ${filters[key]}`);
//         });
        
//         console.log("After text filters:", filtered.length, "records");
//       }
//     }
    
//     // Update filter summary for display
//     setFilterSummary(filterDescription.join(", "));
    
//     // Update filtered data state
//     setFilteredData(filtered);
    
//     // Mark that filters have been applied
//     setFiltersApplied(true);
//   };
  
//   const handleFilterChange = (key, value) => {
//     const updatedFilters = { ...filters, [key]: value };
//     setFilters(updatedFilters);
//   };
  
//   // Handle machine ID selection without auto-refresh
//   const handleMachineIdChange = (e) => {
//     const newMachineId = e.target.value;
//     console.log("Selected machine ID changed to:", newMachineId);
//     setSelectedMachineId(newMachineId);
//   };
  
//   // Handle date filter changes
//   const handleFromDateChange = (e) => {
//     const newDate = e.target.value;
//     setFromDate(newDate);
//     console.log("From date changed to:", newDate);
//   };
  
//   const handleToDateChange = (e) => {
//     const newDate = e.target.value;
//     setToDate(newDate);
//     console.log("To date changed to:", newDate);
//   };

//  // Use this single consistent date/time formatter for all outputs
// const formatConsistentDateTime = (dateTimeString) => {
//   if (!dateTimeString) return "-";
  
//   try {
//     const dateTime = new Date(dateTimeString);
    
//     // Format: YYYY-MM-DD HH:MM:SS.ms
//     const year = dateTime.getFullYear();
//     const month = String(dateTime.getMonth() + 1).padStart(2, '0');
//     const day = String(dateTime.getDate()).padStart(2, '0');
//     const hours = String(dateTime.getHours()).padStart(2, '0');
//     const minutes = String(dateTime.getMinutes()).padStart(2, '0');
//     const seconds = String(dateTime.getSeconds()).padStart(2, '0');
    
//     // Get only the first 2 digits of milliseconds for consistency
//     const ms = String(dateTime.getMilliseconds()).padStart(3, '0').slice(0, 2);
    
//     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//   } catch (e) {
//     console.error("Date formatting error:", e);
//     return dateTimeString; // Return original if parsing fails
//   }
// };

// // Function to generate CSV data
// const downloadCSV = () => {
//   const headers = TABLE_HEADS.map((th) => th.label).join(",");
//   const rows = filteredData
//     .map((item, index) =>
//       TABLE_HEADS.map((th) => {
//         if (th.key === "serial_number") return index + 1;
//         if (th.key === "created_at" && item[th.key]) return `"${formatConsistentDateTime(item[th.key])}"`;
//         return item[th.key] ? `"${item[th.key]}"` : "";
//       }).join(",")
//     )
//     .join("\n");
//   const csvContent = `${headers}\n${rows}`;

//   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = `machine_logs_${selectedMachineId}_${new Date().toISOString().slice(0,10)}.csv`;
//   link.click();
// };

// // Function to generate HTML data
// const downloadHTML = () => {
//   let htmlContent = `<table border="1"><thead><tr>${TABLE_HEADS.map(
//     (th) => `<th>${th.label}</th>`
//   ).join("")}</tr></thead><tbody>`;

//   htmlContent += filteredData
//     .map(
//       (item, index) =>
//         `<tr>${TABLE_HEADS.map(
//           (th) => {
//             if (th.key === "serial_number") return `<td>${index + 1}</td>`;
//             if (th.key === "created_at" && item[th.key]) return `<td>${formatConsistentDateTime(item[th.key])}</td>`;
//             return `<td>${item[th.key] ? item[th.key] : "-"}</td>`;
//           }
//         ).join("")}</tr>`
//     )
//     .join("");

//   htmlContent += "</tbody></table>";

//   const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = `machine_logs_${selectedMachineId}_${new Date().toISOString().slice(0,10)}.html`;
//   link.click();
// };

//   // Add reset function
//   const handleReset = () => {
//     setFilters({});
//     setFromDate("");
//     setToDate("");
//     setSelectedMachineId("");
//     setFilteredData([]);
//     setShowFilters(false);
//     setDateFilterActive(false);
//     setFilterSummary("");
//     setFiltersApplied(false);
//     console.log("Filters reset");
//   };

//   return (
//     <section className="content-area-table">
//       <div className="data-table-info">
//         <h4 className="data-table-title">Machine Logs</h4>

//         {/* Enhanced Filter Controls */}
//         <div className="main-filters">
//           {/* Machine ID Selector with improved styling */}
//           <div className="machine-selector">
//             <label>Select Machine ID:</label>
//             <div className="select-wrapper">
//               <select 
//                 value={selectedMachineId}
//                 onChange={handleMachineIdChange}
//                 className="machine-dropdown"
//               >
//                 <option value="">Select a Machine</option>
//                 {machineIds.map((id) => (
//                   <option key={id} value={id}>{id}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Enhanced Date Range Filter */}
//           <div className="date-filter">
//   <div className="date-input-group">
//     <div className="date-field">
//       <FaCalendarAlt className="calendar-icon" />
//       <input
//         type="date"
//         value={fromDate}
//         onChange={handleFromDateChange}
//         className="date-input"
//       />
//       <span className="date-label">From</span>
//     </div>
//     <div className="date-separator">to</div>
//     <div className="date-field">
//       <FaCalendarAlt className="calendar-icon" />
//       <input
//         type="date"
//         value={toDate}
//         onChange={handleToDateChange}
//         className="date-input"
//       />
//       <span className="date-label">To</span>
//     </div>
//   </div>
// </div>
          
//           {/* Dedicated filter button */}
//           <div className="apply-filter-container">
//             <button1
//               className="apply-filter-button" 
//               onClick={applyFilters}
//               disabled={!selectedMachineId}
//               title="Apply Filters"
//             >
//              Generate 
//             </button1>
//           </div>
//         </div>

//         <div className="filter-wrapper">
//           <div className="filter-buttons">
           
//             <button className="filter-button reset-button" onClick={handleReset} title="Reset All Filters">
//               <FaRedo /> Reset
//             </button>
//           </div>
          
//           {/* Enhanced filter status display - only show when filters are applied */}
//           {filtersApplied && selectedMachineId && (
//             <div className="filter-status">
//               <span className="record-count">{filteredData.length} records</span>
//               {filterSummary && <span className="filter-details">Filters: {filterSummary}</span>}
//             </div>
//           )}
          
//           {/* Download Buttons */}
//           <div className="download-buttons">
//             <button 
//               onClick={downloadCSV} 
//               className="download-btn" 
//               disabled={!filtersApplied || filteredData.length === 0}
//               title="Download as CSV"
//             >
//               <FaDownload /> CSV
//             </button>
//             <button 
//               onClick={downloadHTML} 
//               className="download-btn" 
//               disabled={!filtersApplied || filteredData.length === 0}
//               title="Download as HTML"
//             >
//               <FaDownload /> HTML
//             </button>
//           </div>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="loading-state">
//           <div className="loader"></div>
//           <p>Loading machine logs data...</p>
//         </div>
//       ) : !filtersApplied ? (
//         <div className="no-selection-state">
//           <FaSearch className="search-icon" />
//           <p>Select a Machine ID and click "Apply Filters" to view logs</p>
//         </div>
//       ) : filteredData.length === 0 ? (
//         <div className="no-data-state">
//           <p>No data available for the current filters</p>
//           <div className="filter-summary">
//             {selectedMachineId && <div>Machine ID: {selectedMachineId}</div>}
//             {fromDate && <div>From date: {formatDateForDisplay(fromDate)}</div>}
//             {toDate && <div>To date: {formatDateForDisplay(toDate)}</div>}
//           </div>
//         </div>
//       ) : (
//         <div className="table-container">
//           <div className="table-wrapper">
//             <table>
//               <thead>
//                 <tr>
//                   {TABLE_HEADS.map((th, index) => (
//                     <th key={index}>{th.label}</th>
//                   ))}
//                 </tr>
               
//               </thead>
//               <tbody>
//                 {filteredData.map((dataItem, index) => (
//                   <tr key={index}>
//                     {TABLE_HEADS.map((th, thIndex) => (
//                      // In the table rendering section, update the part that formats the created_at field:
// <td key={thIndex}>
//   {th.key === "serial_number"
//     ? index + 1
//     : th.key === "created_at" && dataItem[th.key]
//     ? formatConsistentDateTime(dataItem[th.key])
//     : dataItem[th.key] || "-"}
// </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// };

// export default AreaTable;






import React, { useEffect, useState } from "react";
import { FaFilter, FaRedo, FaCalendarAlt, FaDownload, FaSearch, FaChartBar, FaArrowLeft, FaTable } from "react-icons/fa";
import "./AreaTable.scss";

import MachineReport from "../../Operator_Report/MachineReport";

const TABLE_HEADS = [
  { label: "S.No", key: "serial_number" },
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
 
  { label: "Duration", key: "DEVICE_ID" },
  { label: "SPM", key: "RESERVE" },
  { label: "TX Log ID", key: "Tx_LOGID" },
  { label: "STR Log ID", key: "Str_LOGID" },
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

const MachineOverall = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [machineIds, setMachineIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const [filterSummary, setFilterSummary] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showTableView, setShowTableView] = useState(false);
  const [dataGenerated, setDataGenerated] = useState(false);
  const [machineReportData, setMachineReportData] = useState([]);

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
          
          const uniqueMachineIds = [...new Set(sortedData.map(item => item.MACHINE_ID))].filter(Boolean);
          uniqueMachineIds.sort((a, b) => {
            const numA = Number(a);
            const numB = Number(b);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return String(a).localeCompare(String(b));
          });
          
          setMachineIds(uniqueMachineIds);
          
          console.log("Data loaded:", sortedData.length, "records");
          console.log("Unique machine IDs:", uniqueMachineIds);
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
    
    if (selectedMachineId) {
      filtered = filtered.filter(item => {
        const itemMachineId = String(item.MACHINE_ID || "").trim();
        const selectedId = String(selectedMachineId).trim();
        return itemMachineId === selectedId;
      });
      
      filterDescription.push(`Machine ID: ${selectedMachineId}`);
      console.log(`After machine ID filter: ${filtered.length} records match '${selectedMachineId}'`);
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
  
  const handleMachineIdChange = (e) => {
    const newMachineId = e.target.value;
    console.log("Selected machine ID changed to:", newMachineId);
    setSelectedMachineId(newMachineId);
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
    setSelectedMachineId("");
    setFilteredData([]);
    setShowFilters(false);
    setDateFilterActive(false);
    setFilterSummary("");
    setFiltersApplied(false);
    setShowTableView(false);
    setDataGenerated(false);
    console.log("Filters reset");
  };

  const handleMachineReportData = (data) => {
    setMachineReportData(data);
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
    link.download = `machine_${selectedMachineId}_data.csv`;
    link.click();
  };
  
  const downloadHTML = () => {
    const htmlContent = `
      <html>
      <head>
        <title>Machine Data</title>
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
    link.download = `machine_${selectedMachineId}_data.html`;
    link.click();
  };

  return (
    <section className="content-area-table">
      {/* Filter section - always visible at the top */}
      <div className="filter-section">
        <div className="main-filters">
          <div className="machine-selector">
            <label>Select Machine ID:</label>
            <div className="select-wrapper">
              <select 
                value={selectedMachineId}
                onChange={handleMachineIdChange}
                className="machine-dropdown"
              >
                <option value="">Select a Machine</option>
                {machineIds.map((id) => (
                  <option key={id} value={id}>{id}</option>
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
              className={`toggle-view-button generate-button green-button ${!selectedMachineId ? 'disabled' : ''}`}
              onClick={applyFilters}
              disabled={!selectedMachineId}
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
      </div>

      {/* Content section - changes based on view */}
      <div className="content-section">
        {isLoading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading machine logs data...</p>
          </div>
        ) : !filtersApplied ? (
          <div className="no-selection-state">
            <FaSearch className="search-icon" />
            <p>Select a Machine ID and click Generate to view data</p>
          </div>
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
              {selectedMachineId && <div>Machine ID: {selectedMachineId}</div>}
              {fromDate && <div>From date: {formatDateForDisplay(fromDate)}</div>}
              {toDate && <div>To date: {formatDateForDisplay(toDate)}</div>}
            </div>
          </div>
        ) : (
          <div className="machine-report-section">
            <MachineReport 
              machine_id={selectedMachineId} 
              fromDate={fromDate} 
              toDate={toDate}
              onDataLoaded={handleMachineReportData}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default MachineOverall;