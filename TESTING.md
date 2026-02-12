# Testing Documentation

## Setup Requirements

### Business Central Setup
1. Azure AD tenant with Business Central access
2. Web Services enabled on BC environment
3. User with API permissions
4. At least one active employee with email matching Zendesk agent
5. Active customers and jobs (projects) in the system

### Zendesk Setup
1. Zendesk Support account (Professional plan or higher)
2. ZCLI installed globally (`npm install -g @zendesk/zcli`)
3. Test ticket available

## Local Testing

### 1. Build the App

```bash
cd zendesk-bc-timetracker
npm install
npm run build
```

### 2. Start Local Server

```bash
zcli apps:server
```

This starts a local server on `http://localhost:4567`

### 3. Test in Zendesk

Navigate to any ticket with `?zcli_apps=true`:
```
https://yoursubdomain.zendesk.com/agent/tickets/123?zcli_apps=true
```

### 4. Configure Settings

When prompted, enter your BC credentials:
- **bc_tenant_id**: Your Azure AD tenant GUID
- **bc_environment**: `production` or `sandbox`
- **bc_company_id**: Business Central company GUID
- **bc_username**: Web service username
- **bc_password**: Web service access key

## Test Cases

### TC001: App Initialization
**Steps:**
1. Open a Zendesk ticket with `?zcli_apps=true`
2. Look for the app in the sidebar

**Expected:**
- App shows loading state "Connecting to Business Central..."
- Employee badge appears with your name
- Client dropdown populates

### TC002: Employee Detection
**Steps:**
1. Wait for app initialization
2. Check the employee badge in header

**Expected:**
- Badge shows BC employee name matching your Zendesk email
- If no match, error message appears

### TC003: Client Selection
**Steps:**
1. Click the Client dropdown
2. Select a client

**Expected:**
- Dropdown shows all BC customers (format: "C-001 - Customer Name")
- After selection, Project dropdown updates
- Projects filter by selected client

### TC004: Project Selection
**Steps:**
1. Select a client first
2. Click the Project dropdown
3. Select a project

**Expected:**
- Shows only open jobs linked to selected client
- Format: "P-123 - Project Description"
- Task dropdown may appear if project has tasks

### TC005: Time Entry Validation
**Steps:**
1. Enter various time values:
   - Valid: 0.25, 1, 1.5, 2.25, 8
   - Invalid: 0, -1, 25, abc

**Expected:**
- Valid values accepted (no error)
- Invalid values show red border and error text
- Save button disabled for invalid values

### TC006: Description Character Limit
**Steps:**
1. Type in description field
2. Enter more than 250 characters

**Expected:**
- Character counter shows remaining (250 - typed)
- Counter turns warning color below 50 chars
- Cannot type beyond 250 characters

### TC007: Form Submission
**Steps:**
1. Complete all required fields:
   - Select a project
   - Enter time (e.g., 1.5)
   - Enter description
2. Click "Log Time"

**Expected:**
- Button shows loading spinner
- Success message: "Time entry saved to Business Central!"
- Form clears (time and description reset)
- Task selection resets

### TC008: Verify in Business Central
**Steps:**
1. After successful submission, open BC
2. Navigate to Time Registration Entries
3. Find the new entry

**Expected:**
- Employee matches logged-in user
- Job/Project correct
- Quantity matches entered hours
- Description includes Zendesk ticket URL

### TC009: Error Handling - Network
**Steps:**
1. Disconnect network
2. Try to save an entry

**Expected:**
- Error message displayed
- Form data preserved
- Can retry after reconnecting

### TC010: Error Handling - Invalid Credentials
**Steps:**
1. Enter incorrect BC credentials
2. Try to load app

**Expected:**
- Error message with authentication failure
- No data loaded

## Test Report Template

```markdown
## Test Execution Report

**Date:** YYYY-MM-DD
**Tester:** [Name]
**Environment:** Zendesk [subdomain], BC [environment]

### Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC001 | PASS/FAIL | |
| TC002 | PASS/FAIL | |
| TC003 | PASS/FAIL | |
| TC004 | PASS/FAIL | |
| TC005 | PASS/FAIL | |
| TC006 | PASS/FAIL | |
| TC007 | PASS/FAIL | |
| TC008 | PASS/FAIL | |
| TC009 | PASS/FAIL | |
| TC010 | PASS/FAIL | |

### Screenshots

[Attach screenshots of app in sidebar, successful submission, BC entry]

### Issues Found

[List any bugs or issues]
```

## Packaging for Production

```bash
# Build production version
npm run build

# Create Zendesk package
zcli apps:package

# Output: tmp/zendesk-bc-timetracker.zip
```

## Uploading to Zendesk

1. Go to Zendesk Admin Center
2. Apps and Integrations > Apps > Zendesk Support apps
3. Click "Upload private app"
4. Upload the `.zip` file
5. Configure settings
6. Install

## Troubleshooting

### "Employee not found" Error
- Verify agent email matches an employee email in BC
- Check employee is active in BC

### "Failed to load clients" Error
- Verify BC credentials
- Check Web Services are enabled
- Verify user has API permissions

### App Not Loading
- Check browser console for errors
- Verify ZAF SDK loads correctly
- Check manifest.json location settings

### CORS Issues (Local Testing)
- Use zcli apps:server (proxies requests)
- Don't test directly against BC API from browser
