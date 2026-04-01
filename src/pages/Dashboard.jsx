import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "./Dashboard.css";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const hours = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
];

const heatingData = [
  180, 160, 140, 200, 320, 380, 290, 240, 200, 160, 140, 160, 200, 260, 300,
  280, 220, 180, 160, 150, 140, 160, 180, 200,
];
const fridgeData = [
  80, 70, 65, 70, 90, 110, 120, 130, 100, 80, 70, 65, 70, 90, 130, 160, 200,
  260, 300, 280, 220, 180, 140, 110,
];
const dishData = [
  5, 5, 4, 4, 5, 6, 20, 60, 80, 40, 10, 5, 5, 5, 5, 5, 5, 40, 80, 100, 60, 20,
  8, 5,
];
const ovenData = [
  10, 8, 7, 8, 10, 12, 20, 60, 80, 40, 15, 10, 8, 10, 60, 120, 180, 200, 160,
  100, 60, 30, 15, 10,
];

const COST_RANGES = [
  "26/06/2022-02/07/2022",
  "03/07/2022-09/07/2022",
  "10/07/2022-16/07/2022",
];

const COST_DATA = {
  "26/06/2022-02/07/2022": {
    total: 58.37,
    budget: 210.0,
    usage: 237,
    focusDate: "28/06/2022 Tuesday",
    focusElec: 4.38,
    focusGas: 2.76,
    weekly: {
      elec: [7.6, 9.1, 4.38, 11.9, 4.4, 6.9, 0.5],
      gas: [2.1, 3.6, 2.76, 3.7, 1.5, 3.4, 0.0],
    },
    monthly: {
      elec: [6.8, 8.2, 4.1, 10.8, 3.9, 6.1, 0.4],
      gas: [1.9, 3.2, 2.3, 3.1, 1.2, 3.0, 0.0],
    },
  },
  "03/07/2022-09/07/2022": {
    total: 62.18,
    budget: 210.0,
    usage: 249,
    focusDate: "05/07/2022 Tuesday",
    focusElec: 4.71,
    focusGas: 2.49,
    weekly: {
      elec: [8.0, 8.9, 4.71, 12.1, 5.0, 7.2, 0.8],
      gas: [2.2, 3.5, 2.49, 3.8, 1.8, 3.1, 0.2],
    },
    monthly: {
      elec: [7.1, 7.9, 4.3, 11.0, 4.3, 6.7, 0.6],
      gas: [2.0, 3.1, 2.2, 3.3, 1.5, 2.8, 0.2],
    },
  },
  "10/07/2022-16/07/2022": {
    total: 55.92,
    budget: 210.0,
    usage: 228,
    focusDate: "12/07/2022 Tuesday",
    focusElec: 4.16,
    focusGas: 2.21,
    weekly: {
      elec: [7.2, 8.1, 4.16, 10.5, 4.1, 6.5, 0.4],
      gas: [1.9, 3.0, 2.21, 3.2, 1.3, 2.9, 0.1],
    },
    monthly: {
      elec: [6.4, 7.4, 3.9, 9.7, 3.7, 5.9, 0.3],
      gas: [1.8, 2.7, 2.0, 2.8, 1.2, 2.4, 0.1],
    },
  },
};

const RECOMMENDATIONS = [
  {
    supplier: "Bulb",
    badge: "Save Money",
    badgeClass: "save",
    tariffName: "Pay Monthly Variable",
    highlightLabel: "Save",
    highlightValue: "£20.87",
    highlightSuffix: "per month",
  },
  {
    supplier: "Octopus",
    badge: "Green Energy",
    badgeClass: "eco",
    tariffName: "Octopus Green Business 24M",
    highlightLabel: "Use",
    highlightValue: "40.2kWh",
    highlightSuffix: "green energy",
  },
  {
    supplier: "British Gas",
    badge: "Best Fit",
    badgeClass: "save",
    tariffName: "Business Flex 12M",
    highlightLabel: "Cut",
    highlightValue: "£14.35",
    highlightSuffix: "yearly",
  },
];

const piePercentLabelsPlugin = {
  id: "piePercentLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const dataset = chart.data.datasets?.[0];
    const meta = chart.getDatasetMeta(0);
    if (!dataset || !meta?.data?.length) return;

    const values = dataset.data.map((value) => Number(value) || 0);
    const total = values.reduce((sum, value) => sum + value, 0);
    if (!total) return;

    ctx.save();
    ctx.fillStyle = "#56606f";
    ctx.font = "600 14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    meta.data.forEach((arc, index) => {
      const value = values[index];
      if (!value) return;
      const angle = (arc.startAngle + arc.endAngle) / 2;
      const radius = (arc.innerRadius + arc.outerRadius) / 2 + 2;
      const x = arc.x + Math.cos(angle) * radius;
      const y = arc.y + Math.sin(angle) * radius;
      const percent = Math.round((value / total) * 100);
      ctx.fillText(`${percent}%`, x, y);
    });

    ctx.restore();
  },
};

function Dashboard() {
  const costBarChartRef = useRef(null);
  const costArcChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const hourlyPieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const [selectedCostRange, setSelectedCostRange] = useState(COST_RANGES[0]);
  const [costViewMode, setCostViewMode] = useState("weekly");
  const [now, setNow] = useState(new Date());

  const activeCostData = useMemo(
    () => COST_DATA[selectedCostRange] ?? COST_DATA[COST_RANGES[0]],
    [selectedCostRange]
  );

  const liveDateText = useMemo(() => {
    const day = String(now.getDate()).padStart(2, "0");
    const month = now.toLocaleString("en-GB", { month: "long" });
    const year = now.getFullYear();
    const hoursNow = String(now.getHours()).padStart(2, "0");
    const minutesNow = String(now.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year} · ${hoursNow}:${minutesNow}`;
  }, [now]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    Chart.defaults.color = "#9ba3b0";
    Chart.defaults.borderColor = "#2c3038";
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;

    const selectedSeries = activeCostData[costViewMode];
    const costBarChart = new Chart(costBarChartRef.current, {
      type: "bar",
      data: {
        labels: days,
        datasets: [
          {
            label: "Electricity",
            data: selectedSeries.elec,
            backgroundColor: "rgba(145,102,255,.95)",
            borderRadius: 3,
            stack: "cost",
            barThickness: 18,
          },
          {
            label: "Gas",
            data: selectedSeries.gas,
            backgroundColor: "rgba(250,238,65,.95)",
            borderRadius: 3,
            stack: "cost",
            barThickness: 18,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: £${ctx.parsed.y.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: "#d8dce3", font: { size: 10, weight: "600" } },
            border: { display: false },
          },
          y: {
            stacked: true,
            suggestedMax: 20,
            ticks: { color: "#d8dce3", stepSize: 5 },
            grid: {
              color: "rgba(216,220,227,.28)",
              borderDash: [3, 3],
              drawTicks: false,
            },
            border: { display: false },
          },
        },
      },
    });

    const remaining = Math.max(activeCostData.budget - activeCostData.total, 0);
    const costArcChart = new Chart(costArcChartRef.current, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [activeCostData.total, remaining],
            backgroundColor: ["#4623ff", "#c7ba88"],
            borderWidth: 0,
            hoverOffset: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        circumference: 180,
        rotation: 270,
        cutout: "72%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
    });

    return () => {
      costBarChart.destroy();
      costArcChart.destroy();
    };
  }, [activeCostData, costViewMode]);

  useEffect(() => {
    Chart.defaults.color = "#9ba3b0";
    Chart.defaults.borderColor = "#2c3038";
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;

    const chartInstances = [];

    chartInstances.push(
      new Chart(pieChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Heating", "Fridge", "Dishwasher", "Oven"],
          datasets: [
            {
              data: [32, 26, 19, 23],
              backgroundColor: [
                "rgba(255,152,48,.85)",
                "rgba(242,73,92,.85)",
                "rgba(87,148,242,.85)",
                "rgba(115,191,105,.85)",
              ],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: "68%",
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } },
          },
        },
      })
    );

    chartInstances.push(
      new Chart(hourlyPieChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Heating", "Fridge", "Dishwasher", "Oven"],
          datasets: [
            {
              data: [32, 26, 23, 19],
              backgroundColor: ["#e6f24e", "#f2495c", "#3fb8f0", "#b8f0ff"],
              borderWidth: 0,
              hoverOffset: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "52%",
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } },
          },
        },
        plugins: [piePercentLabelsPlugin],
      })
    );

    chartInstances.push(
      new Chart(lineChartRef.current, {
        type: "line",
        data: {
          labels: hours,
          datasets: [
            {
              label: "Heating",
              data: heatingData,
              borderColor: "#ff9830",
              backgroundColor: "rgba(255,152,48,.08)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 2,
              pointHoverRadius: 3,
              pointBorderWidth: 1.5,
              pointBackgroundColor: "#111217",
            },
            {
              label: "Fridge",
              data: fridgeData,
              borderColor: "#f2495c",
              backgroundColor: "rgba(242,73,92,.08)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 2,
              pointHoverRadius: 3,
              pointBorderWidth: 1.5,
              pointBackgroundColor: "#111217",
            },
            {
              label: "Dishwasher",
              data: dishData,
              borderColor: "#5794f2",
              backgroundColor: "rgba(87,148,242,.08)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 2,
              pointHoverRadius: 3,
              pointBorderWidth: 1.5,
              pointBackgroundColor: "#111217",
            },
            {
              label: "Oven",
              data: ovenData,
              borderColor: "#73bf69",
              backgroundColor: "rgba(115,191,105,.08)",
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 2,
              pointHoverRadius: 3,
              pointBorderWidth: 1.5,
              pointBackgroundColor: "#111217",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: "rgba(216,220,227,.18)" },
              ticks: { color: "#d8dce3", autoSkip: false, maxRotation: 0, minRotation: 0 },
            },
            y: {
              grid: { color: "rgba(216,220,227,.2)" },
              ticks: { color: "#d8dce3", callback: (v) => v },
            },
          },
        },
      })
    );

    return () => {
      chartInstances.forEach((chart) => chart.destroy());
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="top-bar">
        <div className="title">Energy Monitoring System - ui DEMO</div>
        <div className="meta">
          <span className="badge live">● LIVE</span>
          <span className="date">{liveDateText}</span>
          <span className="badge">Michel Feike</span>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card c-yellow">
          <div className="stat-label">Weekly Cost</div>
          <div className="stat-value">£58.37</div>
          <div className="stat-sub neutral">Budget: £210.00</div>
        </div>
        <div className="stat-card c-blue">
          <div className="stat-label">Usage</div>
          <div className="stat-value">
            237 <span className="unit">kWh</span>
          </div>
          <div className="stat-sub up">↑ 4.2% vs last week</div>
        </div>
        <div className="stat-card c-green">
          <div className="stat-label">Electricity Rate</div>
          <div className="stat-value">
            £0.26 <span className="unit">kWh</span>
          </div>
          <div className="stat-sub up">+1.2% than last week</div>
        </div>
        <div className="stat-card c-orange">
          <div className="stat-label">Gas Rate</div>
          <div className="stat-value">
            £0.05 <span className="unit">kWh</span>
          </div>
          <div className="stat-sub dn">-0.3% than last week</div>
        </div>
      </div>

      <div className="panels-row">
        <div className="panel cost-panel">
          <div className="cost-header">
            <div className="cost-title">Cost</div>
            <div className="cost-toolbar">
              <select
                className="cost-range-select"
                value={selectedCostRange}
                onChange={(event) => setSelectedCostRange(event.target.value)}
              >
                {COST_RANGES.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
              <div className="cost-mode-switch">
                <button
                  type="button"
                  className={costViewMode === "weekly" ? "active" : ""}
                  onClick={() => setCostViewMode("weekly")}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  className={costViewMode === "monthly" ? "active" : ""}
                  onClick={() => setCostViewMode("monthly")}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>
          <div className="cost-layout">
            <div className="cost-summary">
              <div className="cost-gauge-wrap">
                <span className="cost-gauge-label">Budget</span>
                <canvas ref={costArcChartRef} />
                <div className="cost-gauge-center">
                  <div className="cost-center-caption">Total</div>
                  <div className="cost-center-value">£{activeCostData.total.toFixed(2)}</div>
                </div>
              </div>
              <div className="cost-summary-meta">
                <div className="cost-meta-row">
                  <span>Budget</span>
                  <strong>£ {activeCostData.budget.toFixed(2)}</strong>
                </div>
                <div className="cost-meta-row">
                  <span>Usage</span>
                  <strong>{activeCostData.usage} kWh</strong>
                </div>
              </div>
            </div>
            <div className="cost-bars">
              <div className="cost-axis-label pounds">Pounds</div>
              <div className="cost-axis-label day">Day</div>
              <div className="chart-wrap cost-bars-chart">
                <canvas ref={costBarChartRef} />
              </div>
            </div>
            <div className="cost-highlight-card">
              <div className="cost-highlight-date">{activeCostData.focusDate}</div>
              <div className="cost-highlight-row">
                <span className="cost-bullet elec" />
                <span>Electricity</span>
                <strong>£{activeCostData.focusElec.toFixed(2)}</strong>
              </div>
              <div className="cost-highlight-row">
                <span className="cost-bullet gas" />
                <span>Gas</span>
                <strong>£{activeCostData.focusGas.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Energy Consumption</div>
            <div className="panel-subtitle">01/07/2022</div>
          </div>
          <div className="panel-body panel-body-pie">
            <div className="pie-wrap">
              <canvas ref={pieChartRef} />
            </div>
            <div className="pie-info">
              <div className="pie-breakdown-title">05:00 am breakdown</div>
              <div className="pie-breakdown-list">
                <div className="pie-row">
                  <span className="pie-name">
                    <span className="pie-dot dot-orange" />
                    Heating
                  </span>
                  <span className="pie-value">7.17 kWh</span>
                </div>
                <div className="pie-row">
                  <span className="pie-name">
                    <span className="pie-dot dot-red" />
                    Fridge
                  </span>
                  <span className="pie-value">2.68 kWh</span>
                </div>
                <div className="pie-row">
                  <span className="pie-name">
                    <span className="pie-dot dot-blue" />
                    Dishwasher
                  </span>
                  <span className="pie-value">0.01 kWh</span>
                </div>
                <div className="pie-row">
                  <span className="pie-name">
                    <span className="pie-dot dot-green" />
                    Oven
                  </span>
                  <span className="pie-value">1.23 kWh</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Energy Consumption</div>
          <div className="panel-subtitle">01/07/2022</div>
        </div>
        <div className="panel-body hourly-wide-body">
          <div className="hourly-left">
            <div className="hourly-unit-label">kWh</div>
            <div className="hourly-pie-wrap">
              <canvas ref={hourlyPieChartRef} />
              <div className="hourly-pie-center">Total</div>
            </div>
          </div>
          <div className="hourly-middle">
            <div className="chart-wrap chart-line">
              <canvas ref={lineChartRef} />
            </div>
            <div className="hour-markers">
              {hours.map((hour) => (
                <span key={hour} className="hour-dot" />
              ))}
            </div>
          </div>
          <div className="hourly-right-card">
            <div className="hourly-right-date">01/07/2022 05:00 am</div>
            <div className="hourly-right-row">
              <span className="hourly-dot dot-yellow" />
              <span>Heating</span>
              <strong>7.17 kWh</strong>
            </div>
            <div className="hourly-right-row">
              <span className="hourly-dot dot-red" />
              <span>Fridge</span>
              <strong>2.68 kWh</strong>
            </div>
            <div className="hourly-right-row">
              <span className="hourly-dot dot-blue" />
              <span>Dishwasher</span>
              <strong>0.01 kWh</strong>
            </div>
            <div className="hourly-right-row">
              <span className="hourly-dot dot-green-soft" />
              <span>Oven</span>
              <strong>1.23 kWh</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="panels-row2">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Current Tariff</div>
            <div className="panel-subtitle">SVT · British Gas</div>
          </div>
          <div className="panel-body">
            <div>
              <div className="tariff-row">
                <span className="tariff-key">Postcode</span>
                <span className="tariff-val">NM1 4FH</span>
              </div>
              <div className="tariff-row">
                <span className="tariff-key">Tariff type</span>
                <span className="tariff-val">Fixed Dual Fuel</span>
              </div>
              <div className="tariff-row">
                <span className="tariff-key">Tariff ends</span>
                <span className="tariff-val">31/08/2022</span>
              </div>
              <div className="tariff-row">
                <span className="tariff-key">Elec rate</span>
                <span className="tariff-val note-blue">20.493p/kWh</span>
              </div>
              <div className="tariff-row">
                <span className="tariff-key">Gas rate</span>
                <span className="tariff-val note-yellow">4.123p/kWh</span>
              </div>
            </div>
            <div className="rate-grid">
              <div className="rate-item">
                <div className="rate-head">
                  <div className="rate-name">
                    <span className="rate-dot dot-purple" />
                    Electricity
                  </div>
                  <svg className="rate-spark rate-spark-elec" viewBox="0 0 84 34" aria-hidden="true">
                    <path d="M2 22 C12 14, 18 26, 28 20 C38 13, 46 14, 56 26 C64 34, 72 14, 82 8" />
                  </svg>
                </div>
                <div className="rate-num">
                  £0.26<span className="rate-unit">/kWh</span>
                </div>
                <div className="rate-change dn">-1.2% than last week</div>
              </div>
              <div className="rate-item">
                <div className="rate-head">
                  <div className="rate-name">
                    <span className="rate-dot dot-yellow" />
                    Gas
                  </div>
                  <svg className="rate-spark rate-spark-gas" viewBox="0 0 84 34" aria-hidden="true">
                    <path d="M2 26 C10 28, 18 16, 28 10 C38 7, 48 26, 58 20 C66 14, 72 8, 82 12" />
                  </svg>
                </div>
                <div className="rate-num">
                  £0.05<span className="rate-unit">/kWh</span>
                </div>
                <div className="rate-change neutral">-0.3% than last week</div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel recommendation-panel">
          <div className="panel-header recommendation-header">
            <div className="panel-title">Recommendation</div>
            <div className="panel-subtitle">based on your energy usage</div>
          </div>
          <div className="panel-body recommendation-body">
            <div className="recommendation-track">
              {RECOMMENDATIONS.map((item) => (
                <div key={item.supplier} className="rec-card rec-slide">
                  <div className="rec-top">
                    <div className="rec-name">{item.supplier}</div>
                    <div className={`rec-badge ${item.badgeClass}`}>{item.badge}</div>
                  </div>
                  <div className="rec-meta-label">Tariff name</div>
                  <div className="rec-detail">{item.tariffName}</div>
                  <div className="rec-highlight">
                    {item.highlightLabel} <span>{item.highlightValue}</span>{" "}
                    <small>{item.highlightSuffix}</small>
                  </div>
                  <button type="button" className="btn-switch">
                    Switch to this supplier
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
