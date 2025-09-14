# Google Sheets Lead Import Setup Guide

This guide will help you set up the Google Sheets lead import functionality for both admin and sales users.

## Prerequisites

1. A Google Cloud Project with the Google Sheets API enabled
2. A service account with appropriate permissions
3. The Google Sheets you want to import from must be shared with the service account

## Step 1: Google Cloud Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your Project ID

### 1.2 Enable Google Sheets API
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 1.3 Create a Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `travel-crm-sheets-import`
   - Description: `Service account for importing leads from Google Sheets`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 1.4 Generate Service Account Key
1. Click on the created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file

### 1.5 Extract Credentials
From the downloaded JSON file, extract these values:
- `project_id`
- `private_key_id`
- `private_key`
- `client_email`
- `client_id`

## Step 2: Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Google Sheets API Configuration
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your_client_id
```

**Important Notes:**
- The `GOOGLE_PRIVATE_KEY` should include the `\n` characters as shown
- Make sure to wrap the private key in quotes
- The private key should be on a single line with `\n` for line breaks

## Step 3: Database Migration

Run the database migration to create the import logs table:

```bash
npm run migrate
```

Or manually run the migration:

```sql
CREATE TABLE IF NOT EXISTS import_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  import_type VARCHAR(50) NOT NULL,
  total_records INT NOT NULL DEFAULT 0,
  successful_imports INT NOT NULL DEFAULT 0,
  failed_imports INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_import_type (import_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Step 4: Google Sheets Setup

### 4.1 Create Your Lead Sheet
1. Create a new Google Sheet
2. Use the following column headers (case-insensitive):
   - **Required**: Name, Email, Phone, Destination, Source
   - **Optional**: Travel Date, Return Date, Travelers Count, Budget Range, Status, Priority, Notes, Assigned To

### 4.2 Share the Sheet
1. Click the "Share" button in your Google Sheet
2. Add the service account email (from `GOOGLE_CLIENT_EMAIL`) as a viewer
3. Copy the shareable link

### 4.3 Sample Data Format
Here's an example of how your sheet should look:

| Name | Email | Phone | Destination | Source | Travel Date | Return Date | Travelers Count | Budget Range | Status | Priority | Notes | Assigned To |
|------|-------|-------|-------------|--------|-------------|-------------|-----------------|--------------|--------|----------|-------|-------------|
| John Doe | john@example.com | +1234567890 | Paris | Website | 2024-06-15 | 2024-06-22 | 2 | 5000-8000 | new | medium | Interested in city tour | |
| Jane Smith | jane@example.com | +1234567891 | Tokyo | Social Media | 2024-07-10 | 2024-07-17 | 1 | 3000-5000 | contacted | high | Business trip | 2 |

## Step 5: Using the Import Feature

### 5.1 Access the Import Feature
1. Log in as an admin or sales user
2. Go to the Leads page
3. Click "Import from Google Sheets" button

### 5.2 Import Process
1. **Step 1 - Configure**: Enter your Google Sheets URL and configure options
2. **Step 2 - Preview**: Review the data that will be imported
3. **Step 3 - Results**: See the import results and any errors

### 5.3 Import Options
- **Create Customers**: Automatically create customer records for new leads
- **Assign to User**: Assign all imported leads to a specific user
- **Range**: Specify which range to import (default: entire first sheet)

## Step 6: Troubleshooting

### Common Issues

#### 1. "Failed to initialize Google Sheets authentication"
- Check that all environment variables are set correctly
- Verify the private key format (should include `\n` characters)
- Ensure the service account has the Google Sheets API enabled

#### 2. "Failed to fetch data from Google Sheets"
- Make sure the Google Sheet is shared with the service account email
- Check that the sheet URL is correct and accessible
- Verify the sheet has data in the specified range

#### 3. "Missing required columns"
- Ensure your sheet has the required columns: Name, Email, Phone, Destination, Source
- Column names are case-insensitive but must match exactly

#### 4. "Invalid email format" or "Invalid date format"
- Check that email addresses are valid
- Use YYYY-MM-DD format for dates
- Ensure phone numbers are in a valid format

### Validation Rules

The system validates:
- **Email**: Must be a valid email format
- **Travel/Return Date**: Must be in YYYY-MM-DD format
- **Travelers Count**: Must be a positive number
- **Status**: Must be one of: new, contacted, qualified, proposal, negotiation, closed_won, closed_lost
- **Priority**: Must be one of: low, medium, high, urgent
- **Assigned To**: Must be a valid user ID

## Step 7: Security Considerations

1. **Service Account Permissions**: The service account only needs read access to Google Sheets
2. **Environment Variables**: Keep your service account credentials secure and never commit them to version control
3. **Sheet Access**: Only share sheets with the service account that you want to import from
4. **User Permissions**: Only admin and sales users can access the import feature

## Step 8: Monitoring and Logs

The system automatically logs all import activities in the `import_logs` table, including:
- User who performed the import
- Import type (google_sheets)
- Total records processed
- Number of successful imports
- Number of failed imports
- Timestamp of the import

You can view import history through the API endpoint `/api/leads/import-history`.

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Ensure your Google Sheet is properly shared and formatted
4. Check the server logs for detailed error information

For additional support, please contact the development team.
