import pandas as pd
import pyreadstat as prs
import matplotlib.pyplot as plt
import seaborn as sns

# Load the SPSS file
file_path = 'data/Eastern Europe/Eastern Europe Public Data_12.5 CHECKED.sav'
df, meta = prs.read_sav(file_path)

# Display the shape and first few rows of the DataFrame
print("Dataset Shape:", df.shape)
print("Columns:", df.columns.tolist())
df.head()

print("=====================================================")
# Summary statistics for numeric and categorical variables
print("Descriptive Statistics:")
print(df.describe(include='all'))

# Check missing values
print("\nMissing values per column:")
print(df.isnull().sum())


# Plot histograms for numeric variables
df.hist(bins=20, figsize=(15, 10))
plt.suptitle('Histograms for Numerical Variables', fontsize=16)
plt.savefig("histograms.png")


# Compute correlation matrix for numerical columns
numeric_df = df.select_dtypes(include=['number'])
plt.figure(figsize=(10, 8))
sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Correlation Heatmap')
plt.savefig("correlation.png")

# Check if the 'religion' column exists and plot its distribution
if 'religion' in df.columns:
    print("religion exists")
    plt.figure(figsize=(10, 5))
    sns.countplot(x='religion', data=df)
    plt.xticks(rotation=45)
    plt.title('Distribution of Religion')
    plt.xlabel('Religion')
    plt.ylabel('Count')
    plt.savefig("religion.png")
