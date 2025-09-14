# 🚀 Google Sheets Lead Import - Quick Setup

The Google Sheets lead import system has been successfully implemented! Here's how to get it running:

## ✅ What's Already Done

1. **Google Sheets API Integration** - Complete
2. **Import Modal Component** - Complete  
3. **API Endpoints** - Complete
4. **Role-Based Access Control** - Complete
5. **Data Validation** - Complete
6. **Import History System** - Complete

## 🔧 Quick Setup Steps

### Step 1: Database Setup

The system needs a MySQL database. You have two options:

#### Option A: Use Existing Database
If you already have MySQL running with a database, create a `.env.local` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Google Sheets API (Add when ready)
# GOOGLE_PROJECT_ID=your_project_id
# GOOGLE_PRIVATE_KEY_ID=your_private_key_id
# GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
# GOOGLE_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
# GOOGLE_CLIENT_ID=your_client_id
```

#### Option B: Set Up New Database
1. Install MySQL if not already installed
2. Create a database:
   ```sql
   CREATE DATABASE travel_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Create a `.env.local` file with your database credentials

### Step 2: Run Database Migration

```bash
npm run migrate
```

This will create the `import_logs` table needed for the Google Sheets import feature.

### Step 3: Google Sheets API Setup (Optional)

If you want to use the Google Sheets import feature:

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable Google Sheets API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Create a service account
   - Download the JSON key file

4. **Add Credentials to .env.local**
   ```env
   GOOGLE_PROJECT_ID=your_project_id
   GOOGLE_PRIVATE_KEY_ID=your_private_key_id
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   GOOGLE_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
   GOOGLE_CLIENT_ID=your_client_id
   ```

### Step 4: Start the Application

```bash
npm run dev
```

## 🎯 How to Use

1. **Login** as admin or sales user
2. **Go to Leads page**
3. **Click "Import from Google Sheets"** button
4. **Follow the 3-step process**:
   - Enter Google Sheets URL
   - Preview the data
   - Import the leads

## 📊 Google Sheets Format

Your Google Sheet should have these columns:

| Name | Email | Phone | Destination | Source | Travel Date | Return Date | Travelers Count | Budget Range | Status | Priority | Notes | Assigned To |
|------|-------|-------|-------------|--------|-------------|-------------|-----------------|--------------|--------|----------|-------|-------------|
| John Doe | john@example.com | +1234567890 | Paris | Website | 2024-06-15 | 2024-06-22 | 2 | 5000-8000 | new | medium | Interested in city tour | |

**Required columns**: Name, Email, Phone, Destination, Source
**Optional columns**: Travel Date, Return Date, Travelers Count, Budget Range, Status, Priority, Notes, Assigned To

## 🔒 Security Features

- **Role-based access**: Only admin and sales users can import
- **Data validation**: All data is validated before import
- **Duplicate detection**: Prevents importing duplicate leads
- **Activity logging**: All imports are logged for audit
- **Secure API**: JWT authentication required

## 🚨 Troubleshooting

### Database Connection Issues
- Make sure MySQL is running
- Check your database credentials in `.env.local`
- Ensure the database exists

### Google Sheets Issues
- Make sure the sheet is shared with your service account email
- Check that the sheet has the required columns
- Verify your Google Cloud credentials

### Import Errors
- Check the error messages in the import results
- Ensure data formats are correct (dates in YYYY-MM-DD format)
- Verify email addresses are valid

## 📁 Files Created

- `src/lib/googleSheets.js` - Google Sheets API service
- `src/app/api/leads/import-google-sheets/route.js` - Import API
- `src/app/api/leads/import-history/route.js` - Import history API
- `src/components/leads/GoogleSheetsImportModal.js` - Import modal
- `scripts/migrate.cjs` - Database migration script
- `GOOGLE_SHEETS_SETUP.md` - Detailed setup guide

## 🎉 Ready to Use!

The Google Sheets lead import system is now fully integrated into your Travel CRM. Admin and sales users can easily import leads from Google Sheets with full validation, error handling, and audit logging.

For detailed setup instructions, see `GOOGLE_SHEETS_SETUP.md`.
