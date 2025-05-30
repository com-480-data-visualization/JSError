🌍 European Data Explorer (EURODATA)

Interactive visualization of European social and economic data patterns

https://com-480-data-visualization.github.io/JSError/

🎯 Overview
European Data Explorer is an interactive web application that visualizes social and economic patterns across European countries. Built with D3.js and modern web technologies, it provides intuitive exploration of religious beliefs, economic perceptions, marriage patterns, and social attitudes using data from the Pew Research Center.

🎥 Demo

(Look at youtube video)

https://youtu.be/KFgboshj0NI



Process Book: PDF or HTML format (we prefer if you take a look at the html)

✨ Features
🗺️ Interactive Visualizations

Dynamic European Map - Hover and click interactions with country-specific data
Temporal Analysis - Religious trends from 2002-2024 with animated timeline
Denomination Mapping - Year-based religious denomination exploration
Country Comparison - Side-by-side analysis with pie chart comparisons
Data Categories: Religion 🛐, Economics 💰, Marriage 💑, Abortion 🏥, LGBTQ+ Rights 🏳️‍🌈

🎨 User Experience

Responsive Design - Works seamlessly across desktop, tablet, and mobile
Smooth Navigation - fullPage.js powered section transitions
Glassmorphism UI - Modern design with translucent elements
Interactive Tooltips - Rich hover information with detailed breakdowns
Keyboard Shortcuts - Quick navigation with Ctrl+H, Ctrl+M, Ctrl+T, Ctrl+R

🛠️ Technical Setup

Prerequisites
bash# Node.js (for data processing scripts)
node --version  # v14.0.0 or higher

# Web server (for local development)
python --version 
# OR
npm install -g http-server
Installation

Clone the repository


Install dependencies (for data processing)

bashnpm install



Start local server

python -m http.server 8000


Access the application

http://localhost:8000



                      Interactive Map

Select data category using radio buttons (🛐 💰 💑 🏥 🏳️‍🌈)
Hover over countries to see detailed tooltips
Compare countries:

Click "Compare Countries" button
Select two countries by clicking them
View side-by-side pie chart comparison in popup



Temporal Visualization

Choose data type: Religious Belonging or Denominations
Use year slider to explore different time periods
View animated bar charts showing country rankings over time

Religious Denominations Map

Select focus: Show All or specific denomination
Use year slider to see temporal changes
Hover for detailed breakdowns by denomination

