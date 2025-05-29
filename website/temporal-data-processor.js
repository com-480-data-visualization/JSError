// Temporal Data Processor for European Religious Data
// This script processes CSV files for different years and creates the data structure needed for the timeline visualization

const fs = require('fs');
const path = require('path');

// Helper function to parse CSV (replace with Papa Parse if needed)
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                const value = values[index] || '';
                // Try to parse as number, otherwise keep as string
                const numValue = parseFloat(value);
                row[header] = isNaN(numValue) ? value : numValue;
            });
            data.push(row);
        }
    }
    
    return data;
}

// Process religious belonging data (rlgblg files)
function processReligiousBelonging() {
    const belongingData = {};
    const years = [2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
    
    console.log('Processing religious belonging data...');
    
    years.forEach(year => {
        try {
            const filename = `rlgblg${year}_cleaned.csv`;
            const filePath = path.join('./data', filename);
            
            if (fs.existsSync(filePath)) {
                const csvText = fs.readFileSync(filePath, 'utf8');
                const rawData = parseCSV(csvText);
                
                // Process the data for this year
                belongingData[year] = rawData.map(row => {
                    // Handle different possible column names
                    const country = row.country || row.Country;
                    const yes = parseFloat(row.Yes || row.yes || 0);
                    const no = parseFloat(row.No || row.no || 0);
                    
                    return {
                        country: country,
                        Yes: yes,
                        No: no
                    };
                }).filter(item => item.country); // Remove empty entries
                
                console.log(`✓ Processed ${filename}: ${belongingData[year].length} countries`);
            } else {
                console.log(`⚠ File not found: ${filename}`);
            }
        } catch (error) {
            console.error(`Error processing year ${year}:`, error.message);
        }
    });
    
    return belongingData;
}

// Process religious denominations data (rlgdnm files)
function processReligiousDenominations() {
    const denominationsData = {};
    const years = [2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
    
    console.log('Processing religious denominations data...');
    
    years.forEach(year => {
        try {
            const filename = `rlgdnm${year}_cleaned.csv`;
            const filePath = path.join('./data', filename);
            
            if (fs.existsSync(filePath)) {
                const csvText = fs.readFileSync(filePath, 'utf8');
                const rawData = parseCSV(csvText);
                
                // Process the data for this year
                denominationsData[year] = rawData.map(row => {
                    const country = row.country || row.Country;
                    
                    return {
                        country: country,
                        'Roman Catholic': parseFloat(row['Roman Catholic'] || 0),
                        'Protestant': parseFloat(row['Protestant'] || 0),
                        'Eastern Orthodox': parseFloat(row['Eastern Orthodox'] || 0),
                        'Other Christian denomination': parseFloat(row['Other Christian denomination'] || 0),
                        'Jewish': parseFloat(row['Jewish'] || 0),
                        'Islam': parseFloat(row['Islam'] || 0),
                        'Eastern religions': parseFloat(row['Eastern religions'] || 0),
                        'Other Non-Christian religions': parseFloat(row['Other Non-Christian religions'] || 0)
                    };
                }).filter(item => item.country); // Remove empty entries
                
                console.log(`✓ Processed ${filename}: ${denominationsData[year].length} countries`);
            } else {
                console.log(`⚠ File not found: ${filename}`);
            }
        } catch (error) {
            console.error(`Error processing year ${year}:`, error.message);
        }
    });
    
    return denominationsData;
}

// Main processing function
function processTemporalData() {
    console.log('Starting temporal data processing...\n');
    
    const dataPath = './data/';
    
    // Ensure data directory exists
    if (!fs.existsSync(dataPath)) {
        console.error('Data directory not found. Please create a ./data/ folder with your CSV files.');
        return;
    }
    
    try {
        // Process both datasets
        const belongingData = processReligiousBelonging();
        const denominationsData = processReligiousDenominations();
        
        // Combine into final structure
        const finalData = {
            belonging: belongingData,
            denominations: denominationsData,
            years: [2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024],
            metadata: {
                processedAt: new Date().toISOString(),
                totalYears: Object.keys(belongingData).length,
                dataTypes: ['belonging', 'denominations']
            }
        };
        
        // Save processed data
        const outputPath = path.join(dataPath, 'temporal-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
        
        console.log('\n✅ Processing complete!');
        console.log(`📁 Output saved to: ${outputPath}`);
        console.log(`📊 Processed ${Object.keys(belongingData).length} years of belonging data`);
        console.log(`📊 Processed ${Object.keys(denominationsData).length} years of denominations data`);
        
        // Show sample data
        console.log('\n📋 Sample data structure:');
        const sampleYear = Object.keys(belongingData)[0];
        if (sampleYear && belongingData[sampleYear].length > 0) {
            console.log(`Year ${sampleYear} belonging sample:`, belongingData[sampleYear][0]);
        }
        
        return finalData;
        
    } catch (error) {
        console.error('Error during processing:', error);
        console.error('\nPlease ensure your CSV files are in the ./data/ directory with the naming convention:');
        console.error('- rlgblg2002_cleaned.csv, rlgblg2004_cleaned.csv, etc.');
        console.error('- rlgdnm2002_cleaned.csv, rlgdnm2004_cleaned.csv, etc.');
    }
}

// Expected CSV file structure documentation
function showExpectedStructure() {
    console.log('\n📋 Expected CSV file structure:');
    console.log('\nFor religious belonging files (rlgblgYYYY_cleaned.csv):');
    console.log('Columns: country, Yes, No, Sum, Mean, N');
    console.log('Example: "CZ - Czechia", 35.2, 64.8, 100, 1.65, 1420');
    
    console.log('\nFor religious denominations files (rlgdnmYYYY_cleaned.csv):');
    console.log('Columns: country, Roman Catholic, Protestant, Eastern Orthodox, Other Christian denomination, Jewish, Islam, Eastern religions, Other Non-Christian religions, Sum, Mean, N');
    console.log('Example: "CZ - Czechia", 25.5, 15.2, 5.1, 8.3, 0.2, 0.1, 0.3, 1.2, 100, 2.15, 856');
    
    console.log('\n📁 File naming convention:');
    console.log('- rlgblg2002_cleaned.csv, rlgblg2004_cleaned.csv, ..., rlgblg2024_cleaned.csv');
    console.log('- rlgdnm2002_cleaned.csv, rlgdnm2004_cleaned.csv, ..., rlgdnm2024_cleaned.csv');
}

// Utility function to validate data structure
function validateData(data, type, year) {
    if (!data || data.length === 0) {
        console.warn(`⚠ No data found for ${type} in year ${year}`);
        return false;
    }
    
    const requiredFields = type === 'belonging' 
        ? ['country', 'Yes', 'No']
        : ['country', 'Roman Catholic', 'Protestant', 'Eastern Orthodox'];
    
    const sample = data[0];
    const missingFields = requiredFields.filter(field => !(field in sample));
    
    if (missingFields.length > 0) {
        console.warn(`⚠ Missing fields in ${type} ${year}:`, missingFields);
        return false;
    }
    
    return true;
}

// Generate summary statistics
function generateSummary(data) {
    const summary = {
        totalYears: 0,
        totalCountries: new Set(),
        yearsCovered: [],
        countriesPerYear: {},
        dataQuality: {}
    };
    
    // Analyze belonging data
    if (data.belonging) {
        Object.keys(data.belonging).forEach(year => {
            summary.totalYears++;
            summary.yearsCovered.push(parseInt(year));
            summary.countriesPerYear[year] = data.belonging[year].length;
            
            data.belonging[year].forEach(country => {
                summary.totalCountries.add(country.country);
            });
            
            // Data quality check
            const validEntries = data.belonging[year].filter(c => 
                c.Yes !== undefined && c.No !== undefined && 
                !isNaN(c.Yes) && !isNaN(c.No)
            ).length;
            
            summary.dataQuality[year] = {
                total: data.belonging[year].length,
                valid: validEntries,
                quality: (validEntries / data.belonging[year].length * 100).toFixed(1) + '%'
            };
        });
    }
    
    return summary;
}

// Main execution
if (require.main === module) {
    console.log('🚀 European Religious Trends - Temporal Data Processor');
    console.log('=' .repeat(60));
    
    // Show expected structure first
    showExpectedStructure();
    
    // Process the data
    const result = processTemporalData();
    
    if (result) {
        // Generate and display summary
        const summary = generateSummary(result);
        
        console.log('\n📊 Data Summary:');
        console.log(`Total years processed: ${summary.totalYears}`);
        console.log(`Total unique countries: ${summary.totalCountries.size}`);
        console.log(`Years covered: ${summary.yearsCovered.join(', ')}`);
        
        console.log('\n📈 Countries per year:');
        Object.entries(summary.countriesPerYear).forEach(([year, count]) => {
            const quality = summary.dataQuality[year];
            console.log(`  ${year}: ${count} countries (${quality.quality} valid data)`);
        });
        
        console.log('\n🎯 Next steps:');
        console.log('1. Copy temporal-data.json to your website\'s data folder');
        console.log('2. Update the temporal visualization to load this data');
        console.log('3. Add the new section to your main index.html');
        
        console.log('\n💡 Integration tips:');
        console.log('- The data is structured for easy D3.js consumption');
        console.log('- Each year contains an array of country objects');
        console.log('- Use the years array for your timeline slider');
        console.log('- Country names include prefixes (e.g., "CZ - Czechia")');
    }
}

module.exports = {
    processTemporalData,
    processReligiousBelonging,
    processReligiousDenominations,
    parseCSV,
    validateData,
    generateSummary
};
