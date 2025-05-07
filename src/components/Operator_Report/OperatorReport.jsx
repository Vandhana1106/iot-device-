import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
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
        
        const totalSewingHours = allTableData.reduce((sum, row) => sum + row["Sewing Hours"], 0);
        const totalIdleHours = allTableData.reduce((sum, row) => sum + row["Idle Hours"], 0);
        const totalMeetingHours = allTableData.reduce((sum, row) => sum + row["Meeting Hours"], 0);
        const totalNoFeedingHours = allTableData.reduce((sum, row) => sum + row["No Feeding Hours"], 0);
        const totalMaintenanceHours = allTableData.reduce((sum, row) => sum + row["Maintenance Hours"], 0);

        setReportData({
          ...data,
          todaySewingHours: totalSewingHours,
          todayIdleHours: totalIdleHours,
          todayMeetingHours: totalMeetingHours,
          todayNoFeedingHours: totalNoFeedingHours,
          todayMaintenanceHours: totalMaintenanceHours,
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
    const filteredData = reportData.allTableData.filter(row => {
      const rowDate = new Date(row.Date);
      const fromDate = tableFilter.fromDate ? new Date(tableFilter.fromDate) : null;
      const toDate = tableFilter.toDate ? new Date(tableFilter.toDate) : null;
      
      let valid = true;
      if (fromDate) valid = valid && rowDate >= fromDate;
      if (toDate) valid = valid && rowDate <= toDate;
      return valid;
    });

    setReportData(prev => ({
      ...prev,
      tableData: filteredData
    }));
    
    // Reset to first page when filtering
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
      'Maintenance Hours', 'Productive Time (%)', 'NPT (%)', 
      'Sewing Speed', 'Stitch Count', 'Needle Runtime'
    ];
    
    const csvRows = [
      headers.join(','),
      ...reportData.tableData.map(row => 
        headers.map(header => {
          const value = row[header] !== undefined ? 
            (header.includes('%') ? row[header] : 
             typeof row[header] === 'number' ? row[header].toFixed(2) : 
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
          <p>Total Production Hours: ${reportData.totalProductionHours.toFixed(2)}</p>
          <p>Total Non-Production Hours: ${reportData.totalNonProductionHours.toFixed(2)}</p>
          <p>Total Idle Hours: ${reportData.totalIdleHours.toFixed(2)}</p>
          <p>Needle Runtime Percentage: ${reportData.needleRuntimePercentage.toFixed(2)}%</p>
        </div>
        <table>
          <thead>
            <tr>
              ${[
                'Date', 'Operator ID', 'Operator Name', 'Total Hours', 
                'Sewing Hours', 'Idle Hours', 'Meeting Hours', 'No Feeding Hours', 
                'Maintenance Hours', 'Productive Time (%)', 'NPT (%)', 
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
                  'Maintenance Hours', 'Productive Time in %', 'NPT in %', 
                  'Sewing Speed', 'Stitch Count', 'Needle Runtime'
                ].map(header => {
                  const value = row[header] !== undefined ? 
                    (header.includes('%') ? row[header].toFixed(2) + '%' : 
                     typeof row[header] === 'number' ? row[header].toFixed(2) : 
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
    reportData.todayMaintenanceHours;

  return (
    <div className="operator-container">
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
                  <td>{row["Total Hours"]?.toFixed(2) || '0.00'}</td>
                  <td>{row["Sewing Hours"].toFixed(2)}</td>
                  <td>{row["Idle Hours"].toFixed(2)}</td>
                  <td>{row["Meeting Hours"].toFixed(2)}</td>
                  <td>{row["No Feeding Hours"].toFixed(2)}</td>
                  <td>{row["Maintenance Hours"].toFixed(2)}</td>
                  <td>{row["Productive Time in %"].toFixed(2)}%</td>
                  <td>{row["NPT in %"].toFixed(2)}%</td>
                  <td>{row["Sewing Speed"].toFixed(2)}</td>
                  <td>{row["Stitch Count"].toFixed(2)}</td> 
                  <td>{row["Needle Runtime"].toFixed(2)}</td>
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
          <p>{reportData.totalProductionHours.toFixed(2)} Hrs</p>
        </div>
        <div className="indicator">
          <h4><FaTools /> Total Non-Production Hours</h4>
          <p>{reportData.totalNonProductionHours.toFixed(2)} Hrs</p>
        </div>
        <div className="indicator">
          <h4><FaClock /> Total Hours</h4>
          <p>{reportData.totalHours?.toFixed(2) || '0.00'} Hrs</p>
        </div>
      </div>
     
      <div className="summary-tiles">
        <div className="tile production-percentage">
          <p>{reportData.productionPercentage.toFixed(2)}%</p>
          <span>Production Percentage</span>
        </div>
        <div className="tile average-speed">
          <p>{reportData.averageSewingSpeed.toFixed(2)}</p>
          <span>Average Sewing Speed</span>
        </div>
        <div className="tile needle-runtime-percentage">
          <p>{reportData.needleRuntimePercentage.toFixed(2)}%</p>
          <span>Needle Runtime Percentage</span>
        </div>
      </div>

      <div className="chart-breakdown-container">
        <div className="graph-section">
          <h3>Hours Breakdown</h3>
          <Chart
            options={{
              chart: { type: "donut" },
              labels: ["Sewing Hours", "No Feeding Hours", "Maintenance Hours", "Meeting Hours", "Idle Hours"],
              colors: ["#3E3561", "#118374", "#F8A723", "#E74C3C", "#8E44AD"],
              legend: { show: false },
              dataLabels: { enabled: true },
              plotOptions: {
                pie: {
                  donut: {
                    labels: {
                      show: true,
                      total: {
                        show: true,
                        label: "Total Hours",
                        formatter: () => totalTodayHours.toFixed(2) + " Hrs",
                      },
                    },
                  },
                },
              },
            }}
            series={[
              reportData.todaySewingHours,
              reportData.todayNoFeedingHours,
              reportData.todayMaintenanceHours,
              reportData.todayMeetingHours,
              reportData.todayIdleHours,
            ]}
            type="donut"
            height={320}
          />
        </div>

        <div className="hour-breakdown">
          <div className="hour-box">
            <span className="dot production"></span>
            <p>{reportData.todaySewingHours.toFixed(2)} Hrs: Sewing Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot non-production"></span>
            <p>{reportData.todayNoFeedingHours.toFixed(2)} Hrs: No Feeding Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot idle"></span>
            <p>{reportData.todayMaintenanceHours.toFixed(2)} Hrs: Maintenance Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot meeting"></span>
            <p>{reportData.todayMeetingHours.toFixed(2)} Hrs: Meeting Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot no-feeding"></span>
            <p>{reportData.todayIdleHours.toFixed(2)} Hrs: Idle Hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorReport;