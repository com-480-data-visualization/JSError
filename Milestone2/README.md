---
title: Milestone 2 description
---

## Project goal

> - Include sketches of the vizualiation you want to make in your final product.
> - List the tools that you will use for each visualization and which (past or future) lectures you will need.
> - Break down your goal into independent pieces to implement. Try to design a core visualization (minimal viable product) that will be required at the end. Then list extra ideas (more creative or challenging) that will enhance the visualization but could be dropped without endangering the meaning of the project.

Our sketch is on the website.

## Implementation pieces

### Map of Europe (minimal viable product)

We want to show a map of Europe where each country could be colored according to the selected parameters:

- Predominant religion
- Economic state perception
- How safe people feel? (we don't know if that's in the data)
- Civil partnership approval
- How old were you at your last birthday ( may show the age who believe the religion)
- Frequency of religious activities
- Support for same-sex marriage or not
- Does religion give meaning to life (Happiness)

Coloring would be done based on the survey results and the color would correspond to the most common answer.

For each of the countries, we want to be able to click and compare the selected parameters with another country in plots. Right now, we have used OpenStreetMap to display the map, and we use markers to be able to click on the countries to see the according value. We will do this, using D3.js map coloring as it will be way more countries than currently we have hardcoded on the website.

For this section we would use the lecture about maps.

### Comparison country plots

When comparing countries we want to show the same plot for two different countries to highlight the differences or similarities of them. Currently we have a functionality implemented that for the selected parameter (e.g. "Predominant religion"), we can select two countries for comparison. When two countries are selected, we show the pie charts under the map. We will not use only pie charts as they are not suitable for every type of parameter, as there is both numerical and categorical data.

We will use interactive pie charts, and other graphs to show numerical and categorical data. Lecture on graphs.

### General correlation analysis (extra idea)

Lastly, we want to answer a question if there is a correlation between economic state perception and religious groups, and if there is which religions stand out. We will therefore make an interactive chart that will be linked to the map, which will show both economic state (combination of survey answers) and religious group distributions in the European countries.

This chart is an additional piece to our story telling, as it encapsulates all parts of the data set, and in general can be represented in words.
