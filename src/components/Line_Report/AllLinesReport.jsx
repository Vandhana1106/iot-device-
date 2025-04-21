import React, { useState } from "react";
import Chart from "react-apexcharts";
import { FaTshirt, FaClock, FaTools, FaDownload, FaTable, FaChartBar } from "react-icons/fa";
import "./LineStyles.css";

const SUMMARY_TABLE_HEADS = [
  { label: "Date", key: "Date" },
  { label: "Line Number", key: "Line Number" },
  { label: "Sewing Hours (PT)", key: "Sewing Hours (PT)" },
  { label: "No Feeding Hours", key: "No Feeding Hours" },
  { label: "Meeting Hours", key: "Meeting Hours" },
  { label: "Maintenance Hours", key: "Maintenance Hours" },
  { label: "Idle Hours", key: "Idle Hours" },
  { label: "Total Hours", key: "Total Hours" },
  { label: "PT %", key: "Productive Time (PT) %" },
  { label: "NPT %", key: "Non-Productive Time (NPT) %" },
  { label: "Sewing Speed", key: "Sewing Speed" },
  { label: "Stitch Count", key: "Stitch Count" },
  { label: "Needle Runtime", key: "Needle Runtime" },
  { label: "Machine Count", key: "Machine Count" }
];

const DETAILED_TABLE_HEADS = [
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
  { label: "Created At", key: "created_at" }
];

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

const AllLinesReport = ({ reportData, fromDate, toDate, detailedData }) => {
  const [showTableView, setShowTableView] = useState(false);

  const toggleView = () => {
    setShowTableView(!showTableView);
  };

  const downloadCSV = () => {
    const headers = showTableView 
      ? DETAILED_TABLE_HEADS.map(head => head.label) 
      : SUMMARY_TABLE_HEADS.map(head => head.label);
    
    const rows = showTableView
      ? detailedData.map((row, index) => 
          DETAILED_TABLE_HEADS.map(head => 
            head.key === "serial_number" ? index + 1 : 
            head.key === "created_at" && row[head.key] ? formatConsistentDateTime(row[head.key]) :
            row[head.key] || ""
          )
        )
      : reportData.flatMap(line => line.tableData || []).map(row => 
          SUMMARY_TABLE_HEADS.map(head => 
            row[head.key]?.toFixed ? row[head.key].toFixed(2) : row[head.key] || ""
          )
        );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `all_lines_${showTableView ? 'raw_data' : 'summary'}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadHTML = () => {
    const headers = showTableView 
      ? DETAILED_TABLE_HEADS.map(head => `<th>${head.label}</th>`).join('')
      : SUMMARY_TABLE_HEADS.map(head => `<th>${head.label}</th>`).join('');
    
    const rows = showTableView
      ? detailedData.map((row, index) => `
          <tr>
            ${DETAILED_TABLE_HEADS.map(head => `
              <td>${
                head.key === "serial_number" ? index + 1 : 
                head.key === "created_at" && row[head.key] ? formatConsistentDateTime(row[head.key]) :
                row[head.key] || ''
              }</td>
            `).join('')}
          </tr>
        `).join('')
      : reportData.flatMap(line => line.tableData || []).map(row => `
          <tr>
            ${SUMMARY_TABLE_HEADS.map(head => `
              <td>${row[head.key]?.toFixed ? row[head.key].toFixed(2) : row[head.key] || ''}</td>
            `).join('')}
          </tr>
        `).join('');

    const htmlContent = `<!DOCTYPE html>
      <html>
      <head>
        <title>${showTableView ? 'All Lines Raw Data' : 'All Lines Summary'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .report-info { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${showTableView ? 'All Lines Raw Data Report' : 'All Lines Summary Report'}</h1>
        <div class="report-info">
          <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
          ${fromDate ? `<p><strong>From Date:</strong> ${new Date(fromDate).toLocaleDateString()}</p>` : ''}
          ${toDate ? `<p><strong>To Date:</strong> ${new Date(toDate).toLocaleDateString()}</p>` : ''}
        </div>
        <table>
          <thead><tr>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `all_lines_${showTableView ? 'raw_data' : 'summary'}_${new Date().toISOString().slice(0,10)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals
  const totals = reportData.reduce((acc, line) => {
    acc.totalHours += line.totalHours || 0;
    acc.totalProductiveHours += line.totalProductiveTime?.hours || 0;
    acc.totalNonProductiveHours += line.totalNonProductiveTime?.hours || 0;
    acc.totalNoFeedingHours += line.totalNonProductiveTime?.breakdown?.noFeedingHours || 0;
    acc.totalMeetingHours += line.totalNonProductiveTime?.breakdown?.meetingHours || 0;
    acc.totalMaintenanceHours += line.totalNonProductiveTime?.breakdown?.maintenanceHours || 0;
    acc.totalIdleHours += line.totalNonProductiveTime?.breakdown?.idleHours || 0;
    return acc;
  }, {
    totalHours: 0,
    totalProductiveHours: 0,
    totalNonProductiveHours: 0,
    totalNoFeedingHours: 0,
    totalMeetingHours: 0,
    totalMaintenanceHours: 0,
    totalIdleHours: 0
  });

  const averageProductivePercentage = totals.totalHours > 0 ? 
    (totals.totalProductiveHours / totals.totalHours) * 100 : 0;
  const averageNonProductivePercentage = totals.totalHours > 0 ? 
    (totals.totalNonProductiveHours / totals.totalHours) * 100 : 0;
  const averageNeedleRuntimePercentage = reportData.length > 0 ? 
    reportData.reduce((sum, line) => sum + (line.needleRuntimePercentage || 0), 0) / reportData.length : 0;
  const averageSewingSpeed = reportData.length > 0 ? 
    reportData.reduce((sum, line) => sum + (line.averageSewingSpeed || 0), 0) / reportData.length : 0;

  if (showTableView) {
    return (
      <div className="line-container">
        <div className="table-section">
          <div className="table-header">
            <h3>All Lines Raw Data</h3>
            <div className="table-controls">
              <button 
                className="toggle-view-button view-toggle-button green-button"
                onClick={toggleView}
                title="View Summary"
              >
                <FaChartBar /> View Summary
              </button>
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
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {DETAILED_TABLE_HEADS.map((th, index) => (
                    <th key={index}>{th.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailedData.map((dataItem, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{dataItem.MACHINE_ID || '-'}</td>
                    <td>{dataItem.LINE_NUMB || '-'}</td>
                    <td>{dataItem.OPERATOR_ID || '-'}</td>
                    <td>{dataItem.operator_name || '-'}</td>
                    <td>{dataItem.DATE || '-'}</td>
                    <td>{dataItem.START_TIME || '-'}</td>
                    <td>{dataItem.END_TIME || '-'}</td>
                    <td>{dataItem.MODE || '-'}</td>
                    <td>{dataItem.mode_description || '-'}</td>
                    <td>{dataItem.STITCH_COUNT || '-'}</td>
                    <td>{dataItem.NEEDLE_RUNTIME || '-'}</td>
                    <td>{dataItem.NEEDLE_STOPTIME || '-'}</td>
                    <td>{dataItem.DEVICE_ID || '-'}</td>
                    <td>{dataItem.RESERVE || '-'}</td>
                    <td>{dataItem.Tx_LOGID || '-'}</td>
                    <td>{dataItem.Str_LOGID || '-'}</td>
                    <td>{dataItem.created_at ? formatConsistentDateTime(dataItem.created_at) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="line-container">
      <div className="table-section">
        <div className="table-header">
          <h3>All Lines Report</h3>
          <div className="table-controls">
            <button 
              className="toggle-view-button view-toggle-button green-button"
              onClick={toggleView}
              title="View Raw Data"
            >
              <FaTable /> View Raw Data
            </button>
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
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {SUMMARY_TABLE_HEADS.map((th, index) => (
                  <th key={index}>{th.label}</th>
                ))}
              </tr>
            </thead>
          
<tbody>
  {reportData.flatMap(line => 
    (line.tableData || []).map((row, index) => (
      <tr key={`${line.lineNumber}-${index}`}>
        <td>{row.Date || '-'}</td>
        <td>{line.lineNumber || '-'}</td> {/* Display the actual line number */}
        <td>{row["Sewing Hours (PT)"]?.toFixed(2) || '0.00'}</td>
        <td>{row["No Feeding Hours"]?.toFixed(2) || '0.00'}</td>
        <td>{row["Meeting Hours"]?.toFixed(2) || '0.00'}</td>
        <td>{row["Maintenance Hours"]?.toFixed(2) || '0.00'}</td>
        <td>{row["Idle Hours"]?.toFixed(2) || '0.00'}</td>
        <td>{row["Total Hours"]?.toFixed(2) || '0.00'}</td>
        <td>{row["Productive Time (PT) %"]?.toFixed(2) || '0.00'}%</td>
        <td>{row["Non-Productive Time (NPT) %"]?.toFixed(2) || '0.00'}%</td>
        <td>{row["Sewing Speed"]?.toFixed(2) || '0.00'}</td>
        <td>{row["Stitch Count"] || '0'}</td>
        <td>{row["Needle Runtime"]?.toFixed(2) || '0.00'}</td>
        <td>{row["Machine Count"] || '0'}</td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>
      </div>

      <div className="top-indicators">
        <div className="indicator">
          <h4><FaTshirt /> Total Productive Time (All Lines)</h4>
          <p>{totals.totalProductiveHours.toFixed(2)} Hrs</p>
          <small>{averageProductivePercentage.toFixed(2)}% of total</small>
        </div>
        <div className="indicator">
          <h4><FaTools /> Total Non-Productive Time (All Lines)</h4>
          <p>{totals.totalNonProductiveHours.toFixed(2)} Hrs</p>
          <small>{averageNonProductivePercentage.toFixed(2)}% of total</small>
        </div>
        <div className="indicator">
          <h4><FaClock /> Total Hours (All Lines)</h4>
          <p>{totals.totalHours.toFixed(2)} Hrs</p>
        </div>
      </div>

      <div className="summary-tiles">
        <div className="tile production-percentage">
          <p>{averageProductivePercentage.toFixed(2)}%</p>
          <span>Avg Productive Time</span>
        </div>
        <div className="tile average-speed">
          <p>{averageSewingSpeed.toFixed(2)}</p>
          <span>Avg Sewing Speed</span>
        </div>
        <div className="tile needle-runtime-percentage">
          <p>{averageNeedleRuntimePercentage.toFixed(2)}%</p>
          <span>Avg Needle Runtime</span>
        </div>
      </div>

      <div className="chart-breakdown-container">
        <div className="graph-section">
          <h3>Hours Breakdown (All Lines Total: {totals.totalHours.toFixed(2)} Hrs)</h3>
          <Chart
            options={{
              chart: { type: "donut" },
              labels: [
                "Sewing Hours", 
                "No Feeding Hours", 
                "Meeting Hours", 
                "Maintenance Hours", 
                "Idle Hours"
              ],
              colors: [
                "#3E3561", // Productive Time
                "#8E44AD", // No Feeding
                "#E74C3C", // Meeting Hours
                "#118374", // Maintenance
                "#F8A723"  // Idle Time
              ],
              legend: { show: false },
              dataLabels: { enabled: true },
              plotOptions: {
                pie: {
                  donut: {
                    labels: {
                      show: true,
                      total: {
                        show: true,
                        label: 'Total Hours',
                        formatter: () => `${totals.totalHours.toFixed(2)} Hrs`
                      },
                      value: {
                        formatter: (val) => `${val.toFixed(2)} Hrs`
                      }
                    }
                  }
                }
              },
              tooltip: {
                y: {
                  formatter: (val) => {
                    const percentage = ((val / totals.totalHours) * 100).toFixed(2);
                    return `${val.toFixed(2)} Hrs (${percentage}%)`;
                  }
                }
              }
            }}
            series={[
              totals.totalProductiveHours,
              totals.totalNoFeedingHours,
              totals.totalMeetingHours,
              totals.totalMaintenanceHours,
              totals.totalIdleHours
            ]}
            type="donut"
            height={350}
          />
        </div>

        <div className="hour-breakdown">
          <div className="hour-box">
            <span className="dot production"></span>
            <p>{totals.totalProductiveHours.toFixed(2)} Hrs: Sewing Hours</p>
            <small>{averageProductivePercentage.toFixed(2)}%</small>
          </div>
          <div className="hour-box">
            <span className="dot no-feeding"></span>
            <p>{totals.totalNoFeedingHours.toFixed(2)} Hrs: No Feeding</p>
            <small>{((totals.totalNoFeedingHours / totals.totalHours) * 100 || 0).toFixed(2)}%</small>
          </div>
          <div className="hour-box">
            <span className="dot meeting"></span>
            <p>{totals.totalMeetingHours.toFixed(2)} Hrs: Meetings</p>
            <small>{((totals.totalMeetingHours / totals.totalHours) * 100 || 0).toFixed(2)}%</small>
          </div>
          <div className="hour-box">
            <span className="dot maintenances"></span>
            <p>{totals.totalMaintenanceHours.toFixed(2)} Hrs: Maintenance</p>
            <small>{((totals.totalMaintenanceHours / totals.totalHours) * 100 || 0).toFixed(2)}%</small>
          </div>
          <div className="hour-box">
            <span className="dot idle"></span>
            <p>{totals.totalIdleHours.toFixed(2)} Hrs: Idle Time</p>
            <small>{((totals.totalIdleHours / totals.totalHours) * 100 || 0).toFixed(2)}%</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllLinesReport;