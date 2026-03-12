# Tailwind Architect --- Growth Metrics Dashboard (GitHub Pages)

This document describes how to implement a **metrics dashboard inside
the existing repository** to track the growth of:

-   NPM package downloads
-   OpenVSX extension installs

The dashboard will be generated using **GitHub Pages (GitHub.io)** and
will fetch metrics directly from the public APIs every time the page
loads.

No external backend is required.

------------------------------------------------------------------------

# Architecture Overview

Data Sources - NPM API - OpenVSX API

Frontend - Static page in the repository - Hosted via GitHub Pages

Data Flow

User opens metrics page ↓ Browser fetches APIs ↓ Transform data in JS ↓
Render charts ↓ Show installs and growth

This approach is: - free - zero infrastructure - deploys automatically
with GitHub

------------------------------------------------------------------------

# Repository Structure

Add a new folder inside the repo:

/metrics index.html metrics.js charts.js styles.css

Example:

repo-root src/ extension/ package.json metrics/ index.html metrics.js
charts.js

------------------------------------------------------------------------

# Step 1 --- Enable GitHub Pages

Inside the repository:

Settings → Pages → Source: Deploy from branch

Branch: main

Folder: /metrics

GitHub will expose:

https://`<username>`{=html}.github.io/`<repo>`{=html}/

Example:

https://username.github.io/tailwind-architect/

------------------------------------------------------------------------

# Step 2 --- Create the Dashboard Page

Create:

metrics/index.html

Example:

``` html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Extension Metrics</title>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="./metrics.js" defer></script>

<style>
body {
    font-family: Arial;
    padding: 40px;
    background: #0f172a;
    color: white;
}

.card {
    background: #1e293b;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
}
</style>
</head>

<body>

<h1>Tailwind Architect — Metrics</h1>

<div class="card">
<h2>NPM Downloads</h2>
<p id="npmDownloads">Loading...</p>
</div>

<div class="card">
<h2>OpenVSX Installs</h2>
<p id="vsxDownloads">Loading...</p>
</div>

<canvas id="downloadsChart"></canvas>

</body>
</html>
```

------------------------------------------------------------------------

# Step 3 --- Fetch Metrics from APIs

Create:

metrics/metrics.js

``` javascript
const npmPackage = "YOUR_PACKAGE_NAME"
const vsxPublisher = "YOUR_PUBLISHER"
const vsxExtension = "YOUR_EXTENSION"

async function fetchNpmDownloads() {
  const res = await fetch(
    `https://api.npmjs.org/downloads/point/last-week/${npmPackage}`
  )
  return res.json()
}

async function fetchOpenVSXDownloads() {
  const res = await fetch(
    `https://open-vsx.org/api/${vsxPublisher}/${vsxExtension}`
  )
  return res.json()
}

async function loadMetrics() {
  const npm = await fetchNpmDownloads()
  const vsx = await fetchOpenVSXDownloads()

  document.getElementById("npmDownloads").innerText =
    npm.downloads + " downloads last week"

  document.getElementById("vsxDownloads").innerText =
    vsx.downloadCount + " installs"
}

loadMetrics()
```

------------------------------------------------------------------------

# Step 4 --- Historical Downloads Chart

Add:

``` javascript
async function fetchNpmHistory() {
  const res = await fetch(
    `https://api.npmjs.org/downloads/range/2026-01-01:2026-12-31/${npmPackage}`
  )

  return res.json()
}

async function renderChart() {
  const data = await fetchNpmHistory()

  const labels = data.downloads.map(d => d.day)
  const values = data.downloads.map(d => d.downloads)

  new Chart(document.getElementById("downloadsChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "NPM Downloads",
        data: values
      }]
    }
  })
}

renderChart()
```

------------------------------------------------------------------------

# Step 5 --- Add Metrics Page to README

Add inside README.md

    ## Metrics

    Track growth here:

    https://username.github.io/repository/metrics

------------------------------------------------------------------------

# Step 6 --- Optional Metrics to Add Later

Additional growth signals:

Daily installs

NPM vs OpenVSX comparison

Weekly growth rate

GitHub stars

GitHub clones

Example APIs:

GitHub Repo Stats

https://api.github.com/repos/`<owner>`{=html}/`<repo>`{=html}

------------------------------------------------------------------------

# Step 7 --- Growth Dashboard Layout

Recommended layout:

Header

Total Installs

Cards

NPM installs OpenVSX installs GitHub stars

Charts

Downloads per day Weekly growth Install trend

------------------------------------------------------------------------

# Step 8 --- Future Improvements

Later you can evolve this into a full analytics system:

Cache metrics via GitHub Action

Generate JSON daily

Avoid API rate limits

Example:

/metrics/data.json

Then the page reads the JSON instead of APIs.

------------------------------------------------------------------------

# Step 9 --- What Cursor Should Implement

Prompt for Cursor:

Implement a metrics dashboard in the `/metrics` folder that:

-   fetches npm downloads using npm API
-   fetches OpenVSX install count
-   displays totals
-   renders a line chart of downloads using Chart.js
-   works as a static site
-   is compatible with GitHub Pages
-   requires no backend

------------------------------------------------------------------------

# Result

You will have a live public dashboard:

username.github.io/repo/metrics

That shows:

Real installs Growth over time Charts Package traction

All automatically updating when someone opens the page.
