# 🌍 European Data Explorer (EURODATA)

Interactive visualization of European social and economic data patterns

Website (put the tab in full screen): [https://com-480-data-visualization.github.io/JSError/](https://com-480-data-visualization.github.io/JSError/)

## 🎯 Overview
European Data Explorer is an interactive web application that visualizes social and economic patterns across European countries. Built with D3.js and modern web technologies, it provides intuitive exploration of religious beliefs, economic perceptions, marriage patterns, and social attitudes using data from the Pew Research Center.

## 🎥 Demo

Video on Youtube: [https://youtu.be/KFgboshj0NI](https://youtu.be/KFgboshj0NI)

## Process Book: PDF or HTML format (we prefer if you take a look at the html)

PDF: [Process Book](<Process Book.pdf>)

HTML: [Process Book HTML](process_book.html)

## ✨ Features
### 🗺️ Interactive Visualizations

- Dynamic European Map - Hover and click interactions with country-specific data
- Temporal Analysis - Religious trends from 2002-2024 with animated timeline
- Denomination Mapping - Year-based religious denomination exploration
- Country Comparison - Side-by-side analysis with pie chart comparisons
- Data Categories: Religion 🛐, Economics 💰, Marriage 💑, Abortion 🏥, LGBTQ+ Rights 🏳️‍🌈

### 🎨 User Experience

- Responsive Design - Works seamlessly across desktop, tablet, and mobile
- Smooth Navigation - fullPage.js powered section transitions
- Glassmorphism UI - Modern design with translucent elements
- Interactive Tooltips - Rich hover information with detailed breakdowns
- Keyboard Shortcuts - Quick navigation with Ctrl+H, Ctrl+M, Ctrl+T, Ctrl+R

## 🛠️ Technical Setup

### Prerequisites
#### Node.js (for data processing scripts)
`node --version  # v14.0.0 or higher`

Installation: `npm install -g http-server`

Clone the repository: `git clone git@github.com:com-480-data-visualization/JSError.git`

Install dependencies (for data processing): `npm install`

#### Python3 (for local webserver)

Start local server: `python3 -m http.server 8000`

Access the application at [http://localhost:8000](http://localhost:8000)

## Uses

### Interactive Map

Select data category using radio buttons (🛐 💰 💑 🏥 🏳️‍🌈).

Hover over countries to see detailed tooltips.

Compare countries:

1. Click "Compare Countries" button.
2. Select two countries by clicking them.
3. View side-by-side pie chart comparison in popup.

### Temporal Visualization

Choose data type: Religious Belonging or Denominations.

Use year slider to explore different time periods.

View animated bar charts showing country rankings over time.

### Religious Denominations Map

Select focus: Show All or specific denomination.

Use year slider to see temporal changes.

Hover for detailed breakdowns by denomination.

