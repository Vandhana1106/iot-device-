


// import React, { useEffect, useState } from "react";
// import { FaFilter, FaRedo, FaTimes, FaSearch, FaDownload } from "react-icons/fa";
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
//   { label: "Device ID", key: "DEVICE_ID" },
//   { label: "Reserve", key: "RESERVE" },
//   { label: "Created At", key: "created_at" },
// ];

// const formatDateTime = (dateTimeString) => {
//   if (!dateTimeString) return "-";
//   try {
//     const dateTime = new Date(dateTimeString);
//     const formattedDate = dateTime.toISOString().split('T')[0];
//     const formattedTime = dateTime.toTimeString().split(' ')[0];
//     const timeZone = dateTime.toTimeString().split(' ')[1];
//     return `${formattedDate}  ${formattedTime}.${dateTime.getMilliseconds()}${timeZone}`;
//   } catch (e) {
//     return dateTimeString;
//   }
// };

// const ConsolidatedReports = () => {
//   const [tableData, setTableData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [filters, setFilters] = useState({
//     MACHINE_ID: "",
//     LINE_NUMB: "",
//     OPERATOR_ID: ""
//   });
//   const [showFilterPopup, setShowFilterPopup] = useState({
//     show: false,
//     type: null,
//     options: [],
//     selectedValue: ""
//   });
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showResults, setShowResults] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch("https://2nbcjqrb-8000.inc1.devtunnels.ms/api/logs/");
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
        
//         if (Array.isArray(data)) {
//           const sortedData = data.sort((a, b) => 
//             new Date(b.created_at || 0) - new Date(a.created_at || 0)
//           );
//           setTableData(sortedData);
//         } else {
//           throw new Error("Fetched data is not an array");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const getFilterOptions = (type) => {
//     try {
//       let filtered = [...tableData];
      
//       // Apply existing filters to find related options
//       if (type !== "MACHINE_ID" && filters.MACHINE_ID) {
//         filtered = filtered.filter(item => String(item.MACHINE_ID) === String(filters.MACHINE_ID));
//       }
//       if (type !== "LINE_NUMB" && filters.LINE_NUMB) {
//         filtered = filtered.filter(item => String(item.LINE_NUMB) === String(filters.LINE_NUMB));
//       }
//       if (type !== "OPERATOR_ID" && filters.OPERATOR_ID) {
//         filtered = filtered.filter(item => String(item.OPERATOR_ID) === String(filters.OPERATOR_ID));
//       }
      
//       // Get unique values for the requested type
//       const options = [...new Set(
//         filtered.map(item => item[type]).filter(val => val !== undefined && val !== null)
//       )];
      
//       return options;
//     } catch (error) {
//       console.error("Error getting filter options:", error);
//       return [];
//     }
//   };

//   const openFilterPopup = (type) => {
//     const options = getFilterOptions(type);
//     setShowFilterPopup({
//       show: true,
//       type,
//       options,
//       selectedValue: filters[type] || ""
//     });
//     setSearchTerm("");
//   };

//   const applyFilterChanges = () => {
//     const newFilters = {
//       ...filters,
//       [showFilterPopup.type]: showFilterPopup.selectedValue
//     };
//     setFilters(newFilters);
//     setShowFilterPopup({ show: false, type: null, options: [], selectedValue: "" });
//     applyFilters(newFilters);
//     setShowResults(true);
//   };

//   const clearFilterChanges = () => {
//     setShowFilterPopup(prev => ({
//       ...prev,
//       selectedValue: ""
//     }));
//   };

//   const applyFilters = (filterValues) => {
//     try {
//       let filtered = tableData.filter((item) =>
//         Object.keys(filterValues).every((filterKey) =>
//           filterValues[filterKey]
//             ? String(item[filterKey] || "") === String(filterValues[filterKey])
//             : true
//         )
//       );
      
//       // Apply date range filter if specified
//       if (fromDate || toDate) {
//         filtered = filtered.filter((item) => {
//           try {
//             const itemDate = item.DATE ? new Date(item.DATE) : null;
//             if (!itemDate) return false;
            
//             const itemDateOnly = new Date(
//               itemDate.getFullYear(), 
//               itemDate.getMonth(), 
//               itemDate.getDate()
//             );
      
//             let isAfterFromDate = true;
//             let isBeforeToDate = true;
      
//             if (fromDate) {
//               const fromDateTime = new Date(fromDate);
//               const fromDateOnly = new Date(
//                 fromDateTime.getFullYear(), 
//                 fromDateTime.getMonth(), 
//                 fromDateTime.getDate()
//               );
//               isAfterFromDate = itemDateOnly >= fromDateOnly;
//             }
      
//             if (toDate) {
//               const toDateTime = new Date(toDate);
//               const toDateOnly = new Date(
//                 toDateTime.getFullYear(), 
//                 toDateTime.getMonth(), 
//                 toDateTime.getDate()
//               );
//               isBeforeToDate = itemDateOnly <= toDateOnly;
//             }
      
//             return isAfterFromDate && isBeforeToDate;
//           } catch (e) {
//             console.error("Error processing date filter:", e);
//             return false;
//           }
//         });
//       }
      
//       setFilteredData(filtered);
//     } catch (error) {
//       console.error("Error applying filters:", error);
//       setFilteredData([]);
//     }
//   };

//   const handleReset = () => {
//     setFilters({
//       MACHINE_ID: "",
//       LINE_NUMB: "",
//       OPERATOR_ID: ""
//     });
//     setFromDate("");
//     setToDate("");
//     setFilteredData(tableData);
//     setShowResults(false);
//   };

//   const downloadCSV = () => {
//     try {
//       const headers = TABLE_HEADS.map((th) => th.label).join(",");
//       const rows = filteredData
//         .map((item, index) =>
//           TABLE_HEADS.map((th) =>
//             th.key === "serial_number" 
//               ? index + 1 
//               : item[th.key] 
//                 ? `"${String(item[th.key]).replace(/"/g, '""')}"` 
//                 : ""
//           ).join(",")
//         )
//         .join("\n");
//       const csvContent = `${headers}\n${rows}`;

//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = "filtered_data.csv";
//       link.click();
//     } catch (error) {
//       console.error("Error generating CSV:", error);
//       alert("Failed to generate CSV file");
//     }
//   };

//   const filteredOptions = showFilterPopup.options.filter(option =>
//     String(option || "").toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading) {
//     return <div className="loading">Loading data...</div>;
//   }

//   if (error) {
//     return <div className="error">Error: {error}</div>;
//   }

//   return (
//     <section className="content-area-table">
//       <div className="data-table-info">
//         <h4 className="data-table-title">Machine Logs Filter</h4>
//         <div className="filter-wrapper">
//           <div className="primary-filters">
//             <div className="filter-group">
//               <label>Machine ID</label>
//               <div 
//                 className={`filter-value-display clickable ${filters.MACHINE_ID ? 'has-value' : ''}`}
//                 onClick={() => openFilterPopup("MACHINE_ID")}
//               >
//                 {filters.MACHINE_ID || "Select Machine ID"}
//               </div>
//             </div>

//             <div className="filter-group">
//               <label>Line Number</label>
//               <div 
//                 className={`filter-value-display clickable ${filters.LINE_NUMB ? 'has-value' : ''}`}
//                 onClick={() => openFilterPopup("LINE_NUMB")}
//               >
//                 {filters.LINE_NUMB || "Select Line Number"}
//               </div>
//             </div>

//             <div className="filter-group">
//               <label>Operator ID</label>
//               <div 
//                 className={`filter-value-display clickable ${filters.OPERATOR_ID ? 'has-value' : ''}`}
//                 onClick={() => openFilterPopup("OPERATOR_ID")}
//               >
//                 {filters.OPERATOR_ID || "Select Operator ID"}
//               </div>
//             </div>

//             <div className="date-filter">
//               <label>From Date</label>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => {
//                   setFromDate(e.target.value);
//                   if (showResults) {
//                     applyFilters(filters);
//                   }
//                 }}
//               />
//             </div>

//             <div className="date-filter">
//               <label>To Date</label>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => {
//                   setToDate(e.target.value);
//                   if (showResults) {
//                     applyFilters(filters);
//                   }
//                 }}
//               />
//             </div>

//             <button className="reset-button" onClick={handleReset}>
//               <FaRedo /> Reset
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Filter Selection Popup */}
//       {showFilterPopup.show && (
//         <div className="filter-popup">
//           <div className="popup-content">
//             <div className="popup-header">
//               <h3>Select {showFilterPopup.type.replace(/_/g, ' ')}</h3>
//               <button className="close-button" onClick={() => setShowFilterPopup({ show: false, type: null, options: [], selectedValue: "" })}>
//                 ×
//               </button>
//             </div>
            
//             <div className="search-box">
//               <input
//                 type="text"
//                 placeholder={`Search ${showFilterPopup.type.replace(/_/g, ' ')}...`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
            
//             <div className="options-list">
//               {filteredOptions.length > 0 ? (
//                 filteredOptions.map((option, index) => (
//                   <div 
//                     key={index} 
//                     className={`option-item clickable ${showFilterPopup.selectedValue === option ? 'selected' : ''}`}
//                     onClick={() => setShowFilterPopup(prev => ({
//                       ...prev,
//                       selectedValue: option
//                     }))}
//                   >
//                     {String(option)}
//                   </div>
//                 ))
//               ) : (
//                 <div className="no-results">No matching options found</div>
//               )}
//             </div>

//             <div className="popup-footer">
//               <button 
//                 className="clear-button"
//                 onClick={clearFilterChanges}
//                 disabled={!showFilterPopup.selectedValue}
//               >
//                 Clear
//               </button>
//               <button 
//                 className="apply-button"
//                 onClick={applyFilterChanges}
//                 disabled={!showFilterPopup.selectedValue}
//               >
//                 Apply Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Results Section - Only shown after applying filters */}
//       {showResults && (
//         <div className="results-section">
//           <div className="results-header">
//             <h4>Results ({filteredData.length} records)</h4>
//             <button 
//               onClick={downloadCSV} 
//               disabled={!filteredData.length}
//               className="download-button"
//             >
//               <FaDownload /> Download CSV
//             </button>
//           </div>

//           <div className="active-filters">
//             {filters.MACHINE_ID && (
//               <div className="active-filter">
//                 Machine ID: {filters.MACHINE_ID}
//                 <button onClick={() => {
//                   const newFilters = { ...filters, MACHINE_ID: "" };
//                   setFilters(newFilters);
//                   applyFilters(newFilters);
//                 }}>×</button>
//               </div>
//             )}
//             {filters.LINE_NUMB && (
//               <div className="active-filter">
//                 Line Number: {filters.LINE_NUMB}
//                 <button onClick={() => {
//                   const newFilters = { ...filters, LINE_NUMB: "" };
//                   setFilters(newFilters);
//                   applyFilters(newFilters);
//                 }}>×</button>
//               </div>
//             )}
//             {filters.OPERATOR_ID && (
//               <div className="active-filter">
//                 Operator ID: {filters.OPERATOR_ID}
//                 <button onClick={() => {
//                   const newFilters = { ...filters, OPERATOR_ID: "" };
//                   setFilters(newFilters);
//                   applyFilters(newFilters);
//                 }}>×</button>
//               </div>
//             )}
//             {(fromDate || toDate) && (
//               <div className="active-filter">
//                 Date Range: {fromDate || "Start"} to {toDate || "End"}
//                 <button onClick={() => {
//                   setFromDate("");
//                   setToDate("");
//                   applyFilters(filters);
//                 }}>×</button>
//               </div>
//             )}
//           </div>

//           <div className="table-container">
//             <div className="table-wrapper">
//               {filteredData.length > 0 ? (
//                 <table>
//                   <thead>
//                     <tr>
//                       {TABLE_HEADS.map((th, index) => (
//                         <th key={index}>{th.label}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredData.map((dataItem, index) => (
//                       <tr key={index}>
//                         {TABLE_HEADS.map((th, thIndex) => (
//                           <td key={thIndex}>
//                             {th.key === "serial_number"
//                               ? index + 1
//                               : th.key === "created_at"
//                               ? formatDateTime(dataItem[th.key])
//                               : dataItem[th.key] || "-"}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               ) : (
//                 <div className="no-data">No matching records found</div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// };

// export default ConsolidatedReports;



import React, { useEffect, useState } from "react";
import { FaFilter, FaRedo, FaTimes, FaSearch, FaDownload, FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import "./AreaTable.scss";

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
    const formattedDate = dateTime.toISOString().split('T')[0];
    const formattedTime = dateTime.toTimeString().split(' ')[0];
    const timeZone = dateTime.toTimeString().split(' ')[1];
    return `${formattedDate}  ${formattedTime}.${dateTime.getMilliseconds()}${timeZone}`;
  } catch (e) {
    return dateTimeString;
  }
};

const ConsolidatedReports = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    MACHINE_ID: "",
    LINE_NUMB: "",
    OPERATOR_ID: ""
  });
  const [showFilterPopup, setShowFilterPopup] = useState({
    show: false,
    type: null,
    options: [],
    selectedValue: ""
  });
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://2nbcjqrb-8000.inc1.devtunnels.ms/api/logs/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const sortedData = data.sort((a, b) => 
            new Date(b.created_at || 0) - new Date(a.created_at || 0)
          );
          setTableData(sortedData);
          setFilteredData(sortedData);
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

    fetchData();
  }, []);

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
      let filtered = [...tableData];
      
      if (type !== "MACHINE_ID" && filters.MACHINE_ID) {
        filtered = filtered.filter(item => String(item.MACHINE_ID) === String(filters.MACHINE_ID));
      }
      if (type !== "LINE_NUMB" && filters.LINE_NUMB) {
        filtered = filtered.filter(item => String(item.LINE_NUMB) === String(filters.LINE_NUMB));
      }
      if (type !== "OPERATOR_ID" && filters.OPERATOR_ID) {
        filtered = filtered.filter(item => String(item.OPERATOR_ID) === String(filters.OPERATOR_ID));
      }
      
      const options = [...new Set(
        filtered.map(item => item[type]).filter(val => val !== undefined && val !== null)
      )];
      
      return options;
    } catch (error) {
      console.error("Error getting filter options:", error);
      return [];
    }
  };

  const openFilterPopup = (type) => {
    const options = getFilterOptions(type);
    setShowFilterPopup({
      show: true,
      type,
      options,
      selectedValue: filters[type] || ""
    });
    setSearchTerm("");
  };

  const applyFilterChanges = () => {
    const newFilters = {
      ...filters,
      [showFilterPopup.type]: showFilterPopup.selectedValue
    };
    setFilters(newFilters);
    setShowFilterPopup({ show: false, type: null, options: [], selectedValue: "" });
    applyFilters(newFilters);
    setShowResults(true);
    setCurrentPage(1);
  };

  const clearFilterChanges = () => {
    setShowFilterPopup(prev => ({
      ...prev,
      selectedValue: ""
    }));
  };

  const applyFilters = (filterValues) => {
    try {
      let filtered = tableData.filter((item) =>
        Object.keys(filterValues).every((filterKey) =>
          filterValues[filterKey]
            ? String(item[filterKey] || "") === String(filterValues[filterKey])
            : true
        )
      );
      
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
    } catch (error) {
      console.error("Error applying filters:", error);
      setFilteredData([]);
    }
  };

  const handleReset = () => {
    setFilters({
      MACHINE_ID: "",
      LINE_NUMB: "",
      OPERATOR_ID: ""
    });
    setFromDate("");
    setToDate("");
    setFilteredData(tableData);
    setShowResults(true);
    setCurrentPage(1);
  };

  const downloadCSV = () => {
    try {
      const headers = TABLE_HEADS.map((th) => th.label).join(",");
      const rows = filteredData
        .map((item, index) =>
          TABLE_HEADS.map((th) =>
            th.key === "serial_number" 
              ? index + 1 
              : item[th.key] 
                ? `"${String(item[th.key]).replace(/"/g, '""')}"` 
                : ""
          ).join(",")
        )
        .join("\n");
      const csvContent = `${headers}\n${rows}`;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "filtered_data.csv";
      link.click();
    } catch (error) {
      console.error("Error generating CSV:", error);
      alert("Failed to generate CSV file");
    }
  };

  const filteredOptions = showFilterPopup.options.filter(option =>
    String(option || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <section className="content-area-table">
      <div className="data-table-info">
        <h4 className="data-table-title">Consolidated Report</h4>
        <div className="filter-wrapper">
          <div className="primary-filters">
            <div className="filter-group">
              <label>Machine ID</label>
              <div 
                className={`filter-value-display clickable ${filters.MACHINE_ID ? 'has-value' : ''}`}
                onClick={() => openFilterPopup("MACHINE_ID")}
              >
                {filters.MACHINE_ID || "Select Machine ID"}
              </div>
            </div>

            <div className="filter-group">
              <label>Line Number</label>
              <div 
                className={`filter-value-display clickable ${filters.LINE_NUMB ? 'has-value' : ''}`}
                onClick={() => openFilterPopup("LINE_NUMB")}
              >
                {filters.LINE_NUMB || "Select Line Number"}
              </div>
            </div>

            <div className="filter-group">
              <label>Operator ID</label>
              <div 
                className={`filter-value-display clickable ${filters.OPERATOR_ID ? 'has-value' : ''}`}
                onClick={() => openFilterPopup("OPERATOR_ID")}
              >
                {filters.OPERATOR_ID || "Select Operator ID"}
              </div>
            </div>

            <div className="date-filter">
              <label>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (showResults) {
                    applyFilters(filters);
                    setCurrentPage(1);
                  }
                }}
              />
            </div>

            <div className="date-filter">
              <label>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  if (showResults) {
                    applyFilters(filters);
                    setCurrentPage(1);
                  }
                }}
              />
            </div>

            <button className="reset-button" onClick={handleReset}>
              <FaRedo /> Reset
            </button>
          </div>
        </div>
      </div>

      {showFilterPopup.show && (
        <div className="filter-popup">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Select {showFilterPopup.type.replace(/_/g, ' ')}</h3>
              <button className="close-button" onClick={() => setShowFilterPopup({ show: false, type: null, options: [], selectedValue: "" })}>
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
                    className={`option-item clickable ${showFilterPopup.selectedValue === option ? 'selected' : ''}`}
                    onClick={() => setShowFilterPopup(prev => ({
                      ...prev,
                      selectedValue: option
                    }))}
                  >
                    {String(option)}
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
                disabled={!showFilterPopup.selectedValue}
              >
                Clear
              </button>
              <button 
                className="apply-button"
                onClick={applyFilterChanges}
                disabled={!showFilterPopup.selectedValue}
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
              className="download-button"
            >
              <FaDownload /> Download CSV
            </button>
          </div>
        </div>

        <div className="active-filters">
          {filters.MACHINE_ID && (
            <div className="active-filter">
              Machine ID: {filters.MACHINE_ID}
              <button onClick={() => {
                const newFilters = { ...filters, MACHINE_ID: "" };
                setFilters(newFilters);
                applyFilters(newFilters);
                setCurrentPage(1);
              }}>×</button>
            </div>
          )}
          {filters.LINE_NUMB && (
            <div className="active-filter">
              Line Number: {filters.LINE_NUMB}
              <button onClick={() => {
                const newFilters = { ...filters, LINE_NUMB: "" };
                setFilters(newFilters);
                applyFilters(newFilters);
                setCurrentPage(1);
              }}>×</button>
            </div>
          )}
          {filters.OPERATOR_ID && (
            <div className="active-filter">
              Operator ID: {filters.OPERATOR_ID}
              <button onClick={() => {
                const newFilters = { ...filters, OPERATOR_ID: "" };
                setFilters(newFilters);
                applyFilters(newFilters);
                setCurrentPage(1);
              }}>×</button>
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