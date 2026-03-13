(function () {
  "use strict";

  const npmPackage = "tailwind-architect";
  const vsxPublisher = "vitoriowingert";
  const vsxExtension = "tailwind-architect-vscode";
  const githubOwner = "tailwind-architect";
  const githubRepo = "tailwind-architect";
  const NPM_HISTORY_DAYS = 180;

  let chartInstance = null;

  function formatNumber(n) {
    if (typeof n !== "number" || !Number.isFinite(n)) return "—";
    return n.toLocaleString();
  }

  async function fetchNpmDownloadsPoint() {
    try {
      const res = await fetch(
        "https://api.npmjs.org/downloads/point/last-week/" +
          encodeURIComponent(npmPackage)
      );
      if (!res.ok) throw new Error("NPM API " + res.status);
      const data = await res.json();
      return data.downloads != null ? { downloads: data.downloads } : null;
    } catch (e) {
      console.error("fetchNpmDownloadsPoint:", e);
      return null;
    }
  }

  async function fetchOpenVSXDownloads() {
    try {
      const res = await fetch(
        "https://open-vsx.org/api/" +
          encodeURIComponent(vsxPublisher) +
          "/" +
          encodeURIComponent(vsxExtension)
      );
      if (!res.ok) throw new Error("OpenVSX API " + res.status);
      const data = await res.json();
      const count = data.downloadCount;
      return typeof count === "number" ? { downloadCount: count } : null;
    } catch (e) {
      console.error("fetchOpenVSXDownloads:", e);
      return null;
    }
  }

  async function fetchGithubRepoStats() {
    try {
      const res = await fetch(
        "https://api.github.com/repos/" +
          encodeURIComponent(githubOwner) +
          "/" +
          encodeURIComponent(githubRepo)
      );
      if (!res.ok) throw new Error("GitHub API " + res.status);
      const data = await res.json();
      return {
        stargazers_count: data.stargazers_count,
        forks_count: data.forks_count
      };
    } catch (e) {
      console.error("fetchGithubRepoStats:", e);
      return null;
    }
  }

  function getDateRange(days) {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10)
    };
  }

  async function fetchNpmHistory() {
    try {
      const { startDate, endDate } = getDateRange(NPM_HISTORY_DAYS);
      const res = await fetch(
        "https://api.npmjs.org/downloads/range/" +
          startDate +
          ":" +
          endDate +
          "/" +
          encodeURIComponent(npmPackage)
      );
      if (!res.ok) throw new Error("NPM range API " + res.status);
      const data = await res.json();
      const downloads = data.downloads;
      if (!Array.isArray(downloads) || downloads.length === 0)
        return { labels: [], values: [] };
      const labels = downloads.map(function (d) {
        return d.day;
      });
      const values = downloads.map(function (d) {
        return d.downloads;
      });
      return { labels: labels, values: values };
    } catch (e) {
      console.error("fetchNpmHistory:", e);
      return { labels: [], values: [] };
    }
  }

  function renderNpmSummary(npmPointData) {
    const el = document.getElementById("npmDownloads");
    if (!el) return;
    if (npmPointData && npmPointData.downloads != null) {
      el.textContent =
        formatNumber(npmPointData.downloads) + " downloads in the last 7 days";
    } else {
      el.textContent = "Unavailable";
    }
  }

  function renderOpenVSXSummary(vsxData) {
    const el = document.getElementById("vsxDownloads");
    if (!el) return;
    if (vsxData && typeof vsxData.downloadCount === "number") {
      el.textContent =
        formatNumber(vsxData.downloadCount) + " installs on OpenVSX";
    } else {
      el.textContent = "Unavailable";
    }
  }

  function renderGithubSummary(ghData) {
    const el = document.getElementById("githubStars");
    if (!el) return;
    if (ghData && typeof ghData.stargazers_count === "number") {
      el.textContent = formatNumber(ghData.stargazers_count) + " GitHub stars";
    } else {
      el.textContent = "Unavailable";
    }
  }

  function renderNpmHistoryChart(labels, values) {
    const canvas = document.getElementById("downloadsChart");
    if (!canvas || typeof Chart === "undefined") return;
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    if (labels.length === 0 || values.length === 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = "14px system-ui, sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "center";
        ctx.fillText(
          "No download data available",
          canvas.width / 2,
          canvas.height / 2
        );
      }
      return;
    }
    chartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "NPM downloads per day",
            data: values,
            borderColor: "#38bdf8",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            fill: true,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: "rgba(148, 163, 184, 0.15)" },
            ticks: { color: "#94a3b8", maxTicksLimit: 10 }
          },
          y: {
            grid: { color: "rgba(148, 163, 184, 0.15)" },
            ticks: { color: "#94a3b8" },
            beginAtZero: true
          }
        }
      }
    });
  }

  async function loadMetrics() {
    const [npmPoint, vsxData, ghData] = await Promise.all([
      fetchNpmDownloadsPoint(),
      fetchOpenVSXDownloads(),
      fetchGithubRepoStats()
    ]);
    renderNpmSummary(npmPoint);
    renderOpenVSXSummary(vsxData);
    renderGithubSummary(ghData);
  }

  async function loadHistoryChart() {
    const { labels, values } = await fetchNpmHistory();
    renderNpmHistoryChart(labels, values);
  }

  function init() {
    loadMetrics();
    loadHistoryChart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
