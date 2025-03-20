import pandas as pd
import pyreadstat as prs
import matplotlib.pyplot as plt
import seaborn as sns

# Load the SPSS file
file_path = 'data/Eastern Europe/Eastern Europe Public Data_12.5 CHECKED.sav'
df, meta = prs.read_sav(file_path)

# Display the shape and first few rows of the DataFrame
# print("Dataset Shape:", df.shape)
# print("Columns:", df.columns.tolist())
# df.head()

# ==============================================LITHUANIA==================================================

# Present religion in Lithuania(qcurrellitrec is type)
label_mapping = {}
if meta.variable_value_labels.get('qcurrellitrec'):
    label_mapping = meta.variable_value_labels.get('qcurrellitrec')
else:
    print("No value labels found for qcurrellitrec.")

# Determine the order of categories (adjust if needed)
order = sorted(df['qcurrellitrec'].dropna().unique())

plt.figure(figsize=(8, 4))
ax = sns.countplot(data=df, x='qcurrellitrec', order=order)

# Map the original codes to new labels using the mapping dictionary
new_labels = [label_mapping.get(val, val) for val in order]
ax.set_xticklabels(new_labels)
plt.title('Present religion Lithuania (qcurrellitrec)')
plt.xlabel('Religion')
plt.ylabel('Frequency')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("data/Eastern Europe/religion_lithuania.png")


# Satifaction with the country in Lithuania
if meta.variable_value_labels.get('COUNTRY'):
    country_mapping = meta.variable_value_labels.get('COUNTRY')
    df['COUNTRY_readable'] = df['COUNTRY'].map(country_mapping)

if meta.variable_value_labels.get('Q1'):
    q1_mapping = meta.variable_value_labels.get('Q1')
    # Create a new column with the readable labels
    df['Q1_readable'] = df['Q1'].map(q1_mapping)
else:
    print("No value labels found for Q1.")

lithuania_df = df[df['COUNTRY_readable'] == 'Lithuania']
plt.figure(figsize=(10, 6))
sns.countplot(data=lithuania_df, x='Q1_readable', order=sorted(
    lithuania_df['Q1_readable'].dropna().unique()))
plt.title('Overall Satisfaction with the Country (Q1) in Lithuania')
plt.xlabel('Response')
plt.ylabel('Count')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("data/Eastern Europe/satisfaction_lithuania.png")

# # Age distribution (assuming QAGE is numeric)
plt.figure(figsize=(8, 4))
sns.histplot(lithuania_df['QAGE'].dropna(), bins=20)
plt.title('Age Distribution Lithuania (QAGE)')
plt.xlabel('Age')
plt.ylabel('Frequency')
plt.savefig("data/Eastern Europe/age_distribution_lithuania.png")


# ==============================================ROMANIA==================================================

# Present religion in Romania(qcurrelromrec is type)
label_mapping = {}
if meta.variable_value_labels.get('qcurrelromrec'):
    label_mapping = meta.variable_value_labels.get('qcurrelromrec')
else:
    print("No value labels found for qcurrelromrec.")

# Determine the order of categories (adjust if needed)
order = sorted(df['qcurrelromrec'].dropna().unique())

plt.figure(figsize=(8, 8))
ax = sns.countplot(data=df, x='qcurrellitrec', order=order)

# Map the original codes to new labels using the mapping dictionary
new_labels = [label_mapping.get(val, val) for val in order]
ax.set_xticklabels(new_labels)
plt.title('Present religion Romania (qcurrelromrec)')
plt.xlabel('Religion')
plt.ylabel('Frequency')
plt.savefig("data/Eastern Europe/religion_Romania.png")

# Satifaction with the country in Romania
romania_df = df[df['COUNTRY_readable'] == 'Romania']
plt.figure(figsize=(10, 8))
sns.countplot(data=romania_df, x='Q1_readable', order=sorted(
    romania_df['Q1_readable'].dropna().unique()))
plt.title('Overall Satisfaction with the Country (Q1) in Romania')
plt.xlabel('Response')
plt.ylabel('Count')
plt.savefig("data/Eastern Europe/satisfaction_Romania.png")

# # Age distribution (assuming QAGE is numeric)
plt.figure(figsize=(8, 4))
sns.histplot(romania_df['QAGE'].dropna(), bins=20)
plt.title('Age Distribution Romania (QAGE)')
plt.xlabel('Age')
plt.ylabel('Frequency')
plt.savefig("data/Eastern Europe/age_distribution_Romania.png")
