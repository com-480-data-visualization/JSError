// Data Aggregator Script
// Run this in Node.js to convert your CSV files to the expected format
// Usage: node data-aggregator.js

const fs = require('fs');
const path = require('path');

// If you're using this in a browser, replace with Papa Parse
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
    }
    
    return data;
}

// Column name mappings for different possible CSV formats
const COLUMN_MAPPINGS = {
    country: ['Country', 'country', 'COUNTRY', 'Country Name', 'Nation'],
    christian: ['Christian', 'christian', 'Christianity', 'Christians'],
    muslim: ['Muslim', 'muslim', 'Islam', 'Muslims'],
    atheist: ['Atheist', 'atheist', 'Atheists'],
    nothingParticular: ['Nothing in particular', 'Nothing', 'No religion', 'None'],
    other: ['Other', 'other', 'Other religions'],
    veryGood: ['Very good', 'very good', 'Very Good'],
    somewhatGood: ['Somewhat good', 'somewhat good', 'Somewhat Good'],
    somewhatBad: ['Somewhat bad', 'somewhat bad', 'Somewhat Bad'],
    veryBad: ['Very bad', 'very bad', 'Very Bad'],
    married: ['Married', 'married'],
    neverMarried: ['Never been married', 'Never married', 'Single', 'single'],
    divorced: ['Divorced', 'divorced'],
    widowed: ['Widowed', 'widowed'],
    livingTogether: ['Living with a partner', 'Living together', 'Cohabiting'],
    civilPartnership: ['In a civil partnership', 'Civil partnership'],
    separated: ['Separated', 'separated'],
    legalAllCases: ['Legal in all cases', 'Always legal'],
    legalMostCases: ['Legal in most cases', 'Usually legal'],
    illegalMostCases: ['Illegal in most cases', 'Usually illegal'],
    illegalAllCases: ['Illegal in all cases', 'Always illegal'],
    stronglyFavor: ['Strongly favor', 'Strongly support'],
    favor: ['Favor', 'Support'],
    oppose: ['Oppose', 'Against'],
    stronglyOppose: ['Strongly oppose', 'Strongly against'],
    medianAge: ['Median Age', 'median age', 'Age', 'Median_Age']
};

function findColumn(data, possibleNames) {
    if (!data.length) return null;
    const headers = Object.keys(data[0]);
    
    for (const name of possibleNames) {
        if (headers.includes(name)) {
            return name;
        }
    }
    return null;
}

function processData() {
    const dataPath = './data/';
    
    try {
        // Read all CSV files
        const religionCSV = fs.readFileSync(path.join(dataPath, 'religions_cleaned.csv'), 'utf8');
        const economicCSV = fs.readFileSync(path.join(dataPath, 'economic_state_percentages.csv'), 'utf8');
        const marriageCSV = fs.readFileSync(path.join(dataPath, 'marriage_status_percentages.csv'), 'utf8');
        const abortionCSV = fs.readFileSync(path.join(dataPath, 'support_abortion.csv'), 'utf8');
        const sameSexCSV = fs.readFileSync(path.join(dataPath, 'support_same_sex_marriage.csv'), 'utf8');
        const ageCSV = fs.readFileSync(path.join(dataPath, 'median_age.csv'), 'utf8');
        
        // Parse CSV data
        const religionData = parseCSV(religionCSV);
        const economicData = parseCSV(economicCSV);
        const marriageData = parseCSV(marriageCSV);
        const abortionData = parseCSV(abortionCSV);
        const sameSexData = parseCSV(sameSexCSV);
        const ageData = parseCSV(ageCSV);
        
        console.log('CSV files loaded successfully');
        console.log('Religion columns:', Object.keys(religionData[0] || {}));
        console.log('Economic columns:', Object.keys(economicData[0] || {}));
        console.log('Marriage columns:', Object.keys(marriageData[0] || {}));
        
        // Process each dataset
        const processedData = new Map();
        
        // Process religion data
        religionData.forEach(row => {
            const countryCol = findColumn(religionData, COLUMN_MAPPINGS.country);
            if (!countryCol) {
                console.error('Could not find country column in religion data');
                return;
            }
            
            const country = row[countryCol];
            if (!country) return;
            
            const christianCol = findColumn(religionData, COLUMN_MAPPINGS.christian);
            const muslimCol = findColumn(religionData, COLUMN_MAPPINGS.muslim);
            const atheistCol = findColumn(religionData, COLUMN_MAPPINGS.atheist);
            const nothingCol = findColumn(religionData, COLUMN_MAPPINGS.nothingParticular);
            const otherCol = findColumn(religionData, COLUMN_MAPPINGS.other);
            
            const distribution = {
                'Christian': parseFloat(row[christianCol] || 0),
                'Muslim': parseFloat(row[muslimCol] || 0),
                'Atheist': parseFloat(row[atheistCol] || 0),
                'Nothing in particular': parseFloat(row[nothingCol] || 0),
                'Other': parseFloat(row[otherCol] || 0)
            };
            
            const majority = Object.entries(distribution)
                .reduce((a, b) => distribution[a[0]] > distribution[b[0]] ? a : b)[0];
            
            processedData.set(country, {
                country,
                religionMajority: majority,
                rDist: distribution
            });
        });
        
        // Process economic data
        economicData.forEach(row => {
            const countryCol = findColumn(economicData, COLUMN_MAPPINGS.country);
            const country = row[countryCol];
            if (!country) return;
            
            const veryGoodCol = findColumn(economicData, COLUMN_MAPPINGS.veryGood);
            const somewhatGoodCol = findColumn(economicData, COLUMN_MAPPINGS.somewhatGood);
            const somewhatBadCol = findColumn(economicData, COLUMN_MAPPINGS.somewhatBad);
            const veryBadCol = findColumn(economicData, COLUMN_MAPPINGS.veryBad);
            
            const distribution = {
                'Very good': parseFloat(row[veryGoodCol] || 0),
                'Somewhat good': parseFloat(row[somewhatGoodCol] || 0),
                'Somewhat bad': parseFloat(row[somewhatBadCol] || 0),
                'Very bad': parseFloat(row[veryBadCol] || 0)
            };
            
            const majority = Object.entries(distribution)
                .reduce((a, b) => distribution[a[0]] > distribution[b[0]] ? a : b)[0];
            
            if (processedData.has(country)) {
                Object.assign(processedData.get(country), {
                    economicMajority: majority,
                    eDist: distribution
                });
            } else {
                processedData.set(country, {
                    country,
                    economicMajority: majority,
                    eDist: distribution
                });
            }
        });
        
        // Process marriage data
        marriageData.forEach(row => {
            const countryCol = findColumn(marriageData, COLUMN_MAPPINGS.country);
            const country = row[countryCol];
            if (!country) return;
            
            const marriedCol = findColumn(marriageData, COLUMN_MAPPINGS.married);
            const neverMarriedCol = findColumn(marriageData, COLUMN_MAPPINGS.neverMarried);
            const divorcedCol = findColumn(marriageData, COLUMN_MAPPINGS.divorced);
            const widowedCol = findColumn(marriageData, COLUMN_MAPPINGS.widowed);
            const livingTogetherCol = findColumn(marriageData, COLUMN_MAPPINGS.livingTogether);
            const civilPartnershipCol = findColumn(marriageData, COLUMN_MAPPINGS.civilPartnership);
            const separatedCol = findColumn(marriageData, COLUMN_MAPPINGS.separated);
            
            const distribution = {
                'Married': parseFloat(row[marriedCol] || 0),
                'Never been married': parseFloat(row[neverMarriedCol] || 0),
                'Divorced': parseFloat(row[divorcedCol] || 0),
                'Widowed': parseFloat(row[widowedCol] || 0),
                'Living with a partner': parseFloat(row[livingTogetherCol] || 0),
                'In a civil partnership': parseFloat(row[civilPartnershipCol] || 0),
                'Separated': parseFloat(row[separatedCol] || 0)
            };
            
            const majority = Object.entries(distribution)
                .reduce((a, b) => distribution[a[0]] > distribution[b[0]] ? a : b)[0];
            
            if (processedData.has(country)) {
                Object.assign(processedData.get(country), {
                    marriageMajority: majority,
                    mDist: distribution
                });
            } else {
                processedData.set(country, {
                    country,
                    marriageMajority: majority,
                    mDist: distribution
                });
            }
        });
        
        // Process abortion data
        abortionData.forEach(row => {
            const countryCol = findColumn(abortionData, COLUMN_MAPPINGS.country);
            const country = row[countryCol];
            if (!country) return;
            
            const legalAllCol = findColumn(abortionData, COLUMN_MAPPINGS.legalAllCases);
            const legalMostCol = findColumn(abortionData, COLUMN_MAPPINGS.legalMostCases);
            const illegalMostCol = findColumn(abortionData, COLUMN_MAPPINGS.illegalMostCases);
            const illegalAllCol = findColumn(abortionData, COLUMN_MAPPINGS.illegalAllCases);
            
            const distribution = {
                'Legal in all cases': parseFloat(row[legalAllCol] || 0),
                'Legal in most cases': parseFloat(row[legalMostCol] || 0),
                'Illegal in most cases': parseFloat(row[illegalMostCol] || 0),
                'Illegal in all cases': parseFloat(row[illegalAllCol] || 0)
            };
            
            const majority = Object.entries(distribution)
                .reduce((a, b) => distribution[a[0]] > distribution[b[0]] ? a : b)[0];
            
            if (processedData.has(country)) {
                Object.assign(processedData.get(country), {
                    abortionMajority: majority,
                    aDist: distribution
                });
            } else {
                processedData.set(country, {
                    country,
                    abortionMajority: majority,
                    aDist: distribution
                });
            }
        });
        
        // Process same-sex marriage data
        sameSexData.forEach(row => {
            const countryCol = findColumn(sameSexData, COLUMN_MAPPINGS.country);
            const country = row[countryCol];
            if (!country) return;
            
            const stronglyFavorCol = findColumn(sameSexData, COLUMN_MAPPINGS.stronglyFavor);
            const favorCol = findColumn(sameSexData, COLUMN_MAPPINGS.favor);
            const opposeCol = findColumn(sameSexData, COLUMN_MAPPINGS.oppose);
            const stronglyOpposeCol = findColumn(sameSexData, COLUMN_MAPPINGS.stronglyOppose);
            
            const distribution = {
                'Strongly favor': parseFloat(row[stronglyFavorCol] || 0),
                'Favor': parseFloat(row[favorCol] || 0),
                'Oppose': parseFloat(row[opposeCol] || 0),
                'Strongly oppose': parseFloat(row[stronglyOpposeCol] || 0)
            };
            
            const majority = Object.entries(distribution)
                .reduce((a, b) => distribution[a[0]] > distribution[b[0]] ? a : b)[0];
            
            if (processedData.has(country)) {
                Object.assign(processedData.get(country), {
                    sameSexMajority: majority,
                    sDist: distribution
                });
            } else {
                processedData.set(country, {
                    country,
                    sameSexMajority: majority,
                    sDist: distribution
                });
            }
        });
        
        // Process age data
        ageData.forEach(row => {
            const countryCol = findColumn(ageData, COLUMN_MAPPINGS.country);
            const country = row[countryCol];
            if (!country) return;
            
            const ageCol = findColumn(ageData, COLUMN_MAPPINGS.medianAge);
            const medianAge = parseFloat(row[ageCol]);
            
            if (processedData.has(country)) {
                Object.assign(processedData.get(country), {
                    medianAge: isNaN(medianAge) ? null : medianAge
                });
            } else {
                processedData.set(country, {
                    country,
                    medianAge: isNaN(medianAge) ? null : medianAge
                });
            }
        });
        
        // Convert to array and save
        const finalData = Array.from(processedData.values());
        
        console.log(`Processed ${finalData.length} countries`);
        console.log('Sample data:', finalData[0]);
        
        // Save to countries.json
        fs.writeFileSync(path.join(dataPath, 'countries.json'), JSON.stringify(finalData, null, 2));
        console.log('Data saved to data/countries.json');
        
        return finalData;
        
    } catch (error) {
        console.error('Error processing data:', error);
        console.error('Make sure all CSV files exist in the data folder');
    }
}

// Run the processor
if (require.main === module) {
    processData();
}

module.exports = { processData };
