import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaTshirt, FaClock, FaTools, FaDownload, FaFilter } from "react-icons/fa";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import "./OperatorStyles.css";

const OperatorReport = ({ operator_name, fromDate, toDate }) => {
  const [reportData, setReportData] = useState({
    totalProductionHours: 0,
    totalNonProductionHours: 0,
    totalIdleHours: 0,
    todayProductionHours: 0,
    todayNonProductionHours: 0,
    todayIdleHours: 0,
    todaySewingHours: 0,
    todayNoFeedingHours: 0,
    todayMaintenanceHours: 0,
    todayMeetingHours: 0,
    tableData: [],
    allTableData: [],
    needleRuntimePercentage: 0,
    averageSewingSpeed: 0,
    productionPercentage: 0,
    nptPercentage: 0,
    totalStitchCount: 0,
    totalNeedleRuntime: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [tableFilter, setTableFilter] = useState({
    fromDate: '',
    toDate: ''
  });

  const [dateError, setDateError] = useState("");

  // Utility to format decimal hours to HH:MM
  const formatToHHMM = (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return '00:00';
    const totalMinutes = Math.round(num * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Helper function to safely convert to number and format
  const safeToFixed = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  useEffect(() => {
    if (!operator_name) return;

    const params = new URLSearchParams({
      from_date: fromDate || '',
      to_date: toDate || ''
    });

    fetch(`https://oceanatlantic.pinesphere.co.in/api/operator_report_by_name/${operator_name}/?${params}`)
      .then((response) => response.json())
      .then((data) => {
        const allTableData = data.tableData;
        
        const totalSewingHours = allTableData.reduce((sum, row) => sum + (parseFloat(row["Sewing Hours"]) || 0), 0);
        const totalIdleHours = allTableData.reduce((sum, row) => sum + (parseFloat(row["Idle Hours"]) || 0), 0);
        const totalMeetingHours = allTableData.reduce((sum, row) => sum + (parseFloat(row["Meeting Hours"]) || 0), 0);
        const totalNoFeedingHours = allTableData.reduce((sum, row) => sum + (parseFloat(row["No Feeding Hours"]) || 0), 0);
        const totalMaintenanceHours = allTableData.reduce((sum, row) => sum + (parseFloat(row["Maintenance Hours"]) || 0), 0);
        const totalReworkHours = allTableData.reduce((sum, row) => sum + (parseFloat(row["Rework Hours"]) || 0), 0);
        const totalNeedleBreakHours = allTableData.reduce((sum, row) => sum + (parseFloat(row["Needle Break Hours"]) || 0), 0);

        setReportData({
          ...data,
          todaySewingHours: totalSewingHours,
          todayIdleHours: totalIdleHours,
          todayMeetingHours: totalMeetingHours,
          todayNoFeedingHours: totalNoFeedingHours,
          todayMaintenanceHours: totalMaintenanceHours,
          todayReworkHours: totalReworkHours,
          todayNeedleBreakHours: totalNeedleBreakHours,
          tableData: allTableData,
          allTableData: allTableData,
        });
        
        // Reset to first page when new data is loaded
        setCurrentPage(1);
      })
      .catch((error) => console.error("Error fetching report:", error));
  }, [operator_name, fromDate, toDate]);

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = reportData.tableData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(reportData.tableData.length / rowsPerPage);

  // Pagination navigation handlers
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(Math.min(Math.max(1, pageNumber), totalPages));
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Show maximum 5 page numbers at a time
    
    if (totalPages <= maxVisiblePages) {
      // Show all page numbers if total pages are less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page, last page, current page and pages around current page
      const leftOffset = Math.min(Math.floor(maxVisiblePages / 2), currentPage - 1);
      const rightOffset = Math.min(Math.floor(maxVisiblePages / 2), totalPages - currentPage);
      
      const startPage = Math.max(1, currentPage - leftOffset);
      const endPage = Math.min(totalPages, currentPage + rightOffset);
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const handleTableFilterChange = (e) => {
    const { name, value } = e.target;
    setTableFilter(prev => ({ ...prev, [name]: value }));
  };

  const applyTableFilter = () => {
    const { fromDate, toDate } = tableFilter;
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setDateError('From date must be earlier than or equal to To date.');
      return;
    }
    const filteredData = reportData.allTableData.filter(row => {
      const rowDate = new Date(row.Date);
      const fromDateObj = fromDate ? new Date(fromDate) : null;
      const toDateObj = toDate ? new Date(toDate) : null;
      let valid = true;
      if (fromDateObj) valid = valid && rowDate >= fromDateObj;
      if (toDateObj) valid = valid && rowDate <= toDateObj;
      return valid;
    });
    setReportData(prev => ({
      ...prev,
      tableData: filteredData
    }));
    setCurrentPage(1);
  };

  const resetTableFilter = () => {
    setTableFilter({ fromDate: '', toDate: '' });
    setReportData(prev => ({
      ...prev,
      tableData: prev.allTableData
    }));
    
    // Reset to first page when clearing filter
    setCurrentPage(1);
  };

  const downloadCSV = () => {
    const headers = [
      'Date', 'Operator ID', 'Operator Name', 'Total Hours', 
      'Sewing Hours', 'Idle Hours', 'Meeting Hours', 'No Feeding Hours', 
      'Maintenance Hours', 'Rework Hours', 'Needle Break Hours', 'Productive Time (%)', 'NPT (%)', 
      'Sewing Speed', 'Stitch Count', 'Needle Runtime'
    ];
    
    const csvRows = [
      headers.join(','),
      ...reportData.tableData.map(row => 
        headers.map(header => {
          const value = row[header] !== undefined ? 
            (header.includes('%') ? safeToFixed(row[header]) : 
             typeof row[header] === 'number' ? safeToFixed(row[header]) : 
             row[header]) : '';
          return `"${value}"`;
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${operator_name}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .title { text-align: center; }
          .summary { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="summary">
          <h2 class="title">Operator Report: ${operator_name}</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Operator ID: ${reportData.tableData[0]?.['Operator ID'] || 'N/A'}</p>
          <p>Total Production Hours: ${safeToFixed(reportData.totalProductionHours)}</p>
          <p>Total Non-Production Hours: ${safeToFixed(reportData.totalNonProductionHours)}</p>
          <p>Total Idle Hours: ${safeToFixed(reportData.totalIdleHours)}</p>
          <p>Total Rework Hours: ${safeToFixed(reportData.totalReworkHours)}</p>
          <p>Total Needle Break Hours: ${safeToFixed(reportData.totalNeedleBreakHours)}</p>
          <p>Needle Runtime Percentage: ${safeToFixed(reportData.needleRuntimePercentage)}%</p>
        </div>
        <table>
          <thead>
            <tr>
              ${[
                'Date', 'Operator ID', 'Operator Name', 'Total Hours', 
                'Sewing Hours', 'Idle Hours', 'Meeting Hours', 'No Feeding Hours', 
                'Maintenance Hours', 'Rework Hours', 'Needle Break Hours', 'Productive Time in %', 'NPT in %', 
                'Sewing Speed', 'Stitch Count', 'Needle Runtime'
              ].map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${reportData.tableData.map(row => 
              `<tr>
                ${[
                  'Date', 'Operator ID', 'Operator Name', 'Total Hours', 
                  'Sewing Hours', 'Idle Hours', 'Meeting Hours', 'No Feeding Hours', 
                  'Maintenance Hours', 'Rework Hours', 'Needle Break Hours', 'Productive Time in %', 'NPT in %', 
                  'Sewing Speed', 'Stitch Count', 'Needle Runtime'
                ].map(header => {
                  const value = row[header] !== undefined ? 
                    (header.includes('%') ? safeToFixed(row[header]) + '%' : 
                     typeof row[header] === 'number' ? safeToFixed(row[header]) : 
                     row[header]) : '';
                  return `<td>${value}</td>`;
                }).join('')}
              </tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
      </html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${operator_name}_report_${new Date().toISOString().slice(0,10)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalTodayHours = 
    reportData.todaySewingHours + 
    reportData.todayIdleHours + 
    reportData.todayMeetingHours + 
    reportData.todayNoFeedingHours + 
    reportData.todayMaintenanceHours +
    (reportData.todayReworkHours || 0) +
    (reportData.todayNeedleBreakHours || 0);

  // Prepare data for Recharts
 const chartData = [
  { name: "Sewing Hours", value: reportData.todaySewingHours, color: "#3E3561" },
  { name: "No Feeding Hours", value: reportData.todayNoFeedingHours, color: "#118374" },
  { name: "Maintenance Hours", value: reportData.todayMaintenanceHours, color: "#F8A723" },
  { name: "Meeting Hours", value: reportData.todayMeetingHours, color: "#E74C3C" },
  { name: "Idle Hours", value: reportData.todayIdleHours, color: "#8E44AD" },
  { name: "Rework Hours", value: reportData.todayReworkHours || 0, color: "#FF6F61" },
  { name: "Needle Break Hours", value: reportData.todayNeedleBreakHours || 0, color: "#00B8D9" }
].filter(item => item.value > 0); // Only include items with values > 0

  return (
    <div className="operator-container">
      {dateError && (
        <div className="popup-overlay">
          <div className="popup-modal">
            <p>{dateError}</p>
            <button onClick={() => setDateError("")}>Close</button>
          </div>
        </div>
      )}
      <div className="table-section">
        <div className="table-header">
          <h3>Operator Report</h3>
          <div className="table-controls">
            <div className="filter-row">
             
            </div>
            
            <div className="actions-row">
              <div className="download-buttons">
                <button onClick={downloadCSV} className="download-button csv">
                  <FaDownload /> CSV
                </button>
                <button onClick={downloadHTML} className="download-button html">
                  <FaDownload /> HTML
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Operator ID</th>
                <th>Operator Name</th>
                <th>Total Hours</th>
                <th>Sewing Hours</th>
                <th>Idle Hours</th>
                <th>Meeting Hours</th>
                <th>No Feeding Hours</th>
                <th>Maintenance Hours</th>
                <th>Rework Hours</th>
                <th>Needle Break Hours</th>
                <th>Productive Time (%)</th>
                <th>NPT (%)</th>
                <th>Sewing Speed</th>
                <th>Stitch Count</th>
                <th>Needle Runtime</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.Date}</td>
                  <td>{row["Operator ID"]}</td>
                  <td>{row["Operator Name"]}</td>
                  <td>{formatToHHMM(row["Total Hours"])}</td>
                  <td>{formatToHHMM(row["Sewing Hours"])}</td>
                  <td>{formatToHHMM(row["Idle Hours"])}</td>
                  <td>{formatToHHMM(row["Meeting Hours"])}</td>
                  <td>{formatToHHMM(row["No Feeding Hours"])}</td>
                  <td>{formatToHHMM(row["Maintenance Hours"])}</td>
                  <td>{formatToHHMM(row["Rework Hours"])}</td>
                  <td>{formatToHHMM(row["Needle Break Hours"])}</td>
                  <td>{safeToFixed(row["Productive Time in %"])}%</td>
                  <td>{safeToFixed(row["NPT in %"])}%</td>
                  <td>{safeToFixed(row["Sewing Speed"])}</td>
                  <td>{safeToFixed(row["Stitch Count"])}</td> 
                  <td>{formatToHHMM(row["Needle Runtime"])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        <div className="pagination-controls">
          <div className="rows-per-page">
            <span>Rows per page:</span>
            <select 
              value={rowsPerPage} 
              onChange={handleRowsPerPageChange}
              className="rows-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="pagination-info">
            <span>
              {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, reportData.tableData.length)} of {reportData.tableData.length}
            </span>
          </div>
          
          <div className="pagination-buttons">
            <button 
              onClick={goToPreviousPage} 
              disabled={currentPage === 1}
              className="page-button"
            >
              <FaAngleLeft />
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? 
                <span key={index} className="ellipsis">...</span> : 
                <button
                  key={index}
                  onClick={() => goToPage(page)}
                  className={`page-number ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
            ))}
            
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages}
              className="page-button"
            >
              <FaAngleRight />
            </button>
          </div>
        </div>
      </div>
      
      <div className="top-indicators">
        <div className="indicator">
          <h4><FaTshirt /> Total Sewing Hours</h4>
          <p>{formatToHHMM(reportData.totalProductionHours)} Hrs</p>
        </div>
        <div className="indicator">
          <h4><FaTools /> Total Non-Production Hours</h4>
          <p>{formatToHHMM(reportData.totalNonProductionHours)} Hrs</p>
        </div>
        <div className="indicator">
          <h4><FaClock /> Total Hours</h4>
          <p>{formatToHHMM(reportData.totalHours)} Hrs</p>
        </div>
       
      </div>
     
      <div className="summary-tiles">
        <div className="tile production-percentage">
          <p>{safeToFixed(reportData.productionPercentage)}%</p>
          <span>Production Percentage</span>
        </div>
        <div className="tile average-speed">
          <p>{safeToFixed(reportData.averageSewingSpeed)}</p>
          <span>Average Sewing Speed</span>
        </div>
        <div className="tile needle-runtime-percentage">
          <p>{safeToFixed(reportData.needleRuntimePercentage)}%</p>
          <span>Needle Runtime Percentage</span>
        </div>
      </div>

      <div className="chart-breakdown-container">
        <div className="graph-section">
          <h3>Hours Breakdown</h3>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => safeToFixed(value) + " Hrs"} 
                  labelFormatter={(_, payload) => payload[0]?.name || ""}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
        
          <div className="total-hours" style={{ textAlign: 'center', marginTop: '10px' }}>
            <strong>Total Hours: {formatToHHMM(totalTodayHours)} Hrs</strong>
          </div>
        </div>

        <div className="hour-breakdown">
          <div className="hour-box">
            <span className="dot production"></span>
            <p>{formatToHHMM(reportData.todaySewingHours)} Hrs: Sewing Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot non-production"></span>
            <p>{formatToHHMM(reportData.todayNoFeedingHours)} Hrs: No Feeding Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot idle"></span>
            <p>{formatToHHMM(reportData.todayMaintenanceHours)} Hrs: Maintenance Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot meeting"></span>
            <p>{formatToHHMM(reportData.todayMeetingHours)} Hrs: Meeting Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot no-feeding"></span>
            <p>{formatToHHMM(reportData.todayIdleHours)} Hrs: Idle Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot rework"></span>
            <p>{formatToHHMM(reportData.todayReworkHours)} Hrs: Rework Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot needle-break"></span>
            <p>{formatToHHMM(reportData.todayNeedleBreakHours)} Hrs: Needle Break Hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorReport;