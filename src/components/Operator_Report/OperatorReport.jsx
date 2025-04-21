import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { FaTshirt, FaClock, FaTools, FaDownload, FaFilter } from "react-icons/fa";
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

    fetch(`https://2nbcjqrb-8000.inc1.devtunnels.ms/api/operator_report_by_name/${operator_name}/?${params}`)
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
      })
      .catch((error) => console.error("Error fetching report:", error));
  }, [operator_name, fromDate, toDate]);

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
  };

  const resetTableFilter = () => {
    setTableFilter({ fromDate: '', toDate: '' });
    setReportData(prev => ({
      ...prev,
      tableData: prev.allTableData
    }));
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
              {reportData.tableData.map((row, index) => (
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