# Business Central Time Tracker for Zendesk

A Zendesk Support sidebar app that enables agents to track time on tickets and automatically log entries to Microsoft Dynamics 365 Business Central.

![Zendesk Apps Framework](https://img.shields.io/badge/ZAF-v2.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- 🕐 **Time Tracking** - Log time directly from Zendesk ticket sidebar
- 🔗 **Business Central Integration** - Sync time entries to BC timeRegistrationEntries
- 👤 **Auto Employee Detection** - Matches Zendesk agent email to BC employee
- 📎 **Ticket Linking** - Automatically appends ticket URL to time entry description
- 🏢 **Client & Project Selection** - Dropdown selectors populated from BC
- ✅ **Form Validation** - Real-time validation with clear feedback
- 💾 **Data Caching** - Session storage caching for improved performance

## Screenshots

The app appears in the Zendesk ticket sidebar with:
- Client selector (populated from BC Customers)
- Project selector (filtered by client, from BC Jobs)
- Optional task selector (from BC Job Tasks)
- Time input (decimal hours)
- Description field (with character counter)
- Save button with loading states

## Requirements

- Zendesk Support account (Professional plan or higher)
- Microsoft Dynamics 365 Business Central account
- Business Central Web Service access enabled
- Employee email in BC must match Zendesk agent email

## Installation

### 1. Clone and Install

```bash
git clone https://github.com/knowall-ai/zendesk-bc-timetracker.git
cd zendesk-bc-timetracker
npm install
```

### 2. Build the App

```bash
# Development build (with source maps)
npm run dev

# Production build
npm run build
```

### 3. Install ZCLI

```bash
npm install -g @zendesk/zcli
```

### 4. Test Locally

```bash
# Start the local server
zcli apps:server

# In Zendesk, navigate to any ticket and add ?zcli_apps=true
# Example: https://yoursubdomain.zendesk.com/agent/tickets/123?zcli_apps=true
```

### 5. Package for Production

```bash
zcli apps:package
```

This creates a `.zip` file in the `tmp/` directory ready for upload to Zendesk.

## Configuration

When installing the app in Zendesk, you'll need to provide:

| Setting | Description | Example |
|---------|-------------|---------|
| `bc_tenant_id` | Your Azure AD tenant ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `bc_environment` | BC environment name | `production` or `sandbox` |
| `bc_company_id` | BC company GUID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `bc_username` | BC Web Service username | `ADMIN` or service account |
| `bc_password` | BC Web Service access key | Your web service key (not password) |

### Getting Business Central Credentials

1. **Tenant ID**: Found in Azure Portal > Azure Active Directory > Properties
2. **Environment**: Check BC Admin Center (usually `production` or `sandbox`)
3. **Company ID**: In BC, go to Help > About, or use the API: `GET /companies`
4. **Username/Password**: In BC, go to Users > Select user > Web Service Access Key

## API Endpoints Used

The app uses the Business Central v2.0 API:

```
Base: https://api.businesscentral.dynamics.com/v2.0/{tenant}/{environment}/api/v2.0/companies({companyId})

GET  /customers              - Fetch client list
GET  /jobs                   - Fetch project list
GET  /jobs({id})/jobTasks    - Fetch tasks for a project
GET  /employees              - Find employee by email
POST /timeRegistrationEntries - Create time entry
```

## Project Structure

```
zendesk-bc-timetracker/
├── src/
│   ├── App.jsx                 # Main React component
│   ├── index.jsx               # Entry point, ZAF initialization
│   ├── styles.css              # Application styles
│   ├── components/
│   │   ├── ClientSelector.jsx  # Customer dropdown
│   │   ├── ProjectSelector.jsx # Job/Project dropdown
│   │   ├── TaskSelector.jsx    # Job Task dropdown (optional)
│   │   ├── TimeEntry.jsx       # Time & description inputs
│   │   ├── SaveButton.jsx      # Submit button with states
│   │   └── StatusMessage.jsx   # Success/error notifications
│   ├── services/
│   │   ├── zendeskService.js   # ZAF Client API wrapper
│   │   └── businessCentralService.js # BC API wrapper
│   └── utils/
│       └── helpers.js          # Utility functions
├── assets/
│   └── iframe.html             # ZAF SDK container
├── manifest.json               # Zendesk app manifest
├── package.json
├── webpack.config.dev.js
├── webpack.config.prod.js
└── README.md
```

## Development

### Tech Stack

- **React 18** - Functional components with hooks
- **Zendesk Apps Framework v2** - Sidebar app integration
- **Webpack 5** - Module bundling
- **Babel** - JSX and ES6+ transpilation

### Commands

```bash
npm run dev      # Build with watch mode
npm run build    # Production build
npm run lint     # Run ESLint (if configured)
npm run package  # Build and create .zip
```

### Local Development

For local testing without Zendesk:

1. Create a mock `ZAFClient` in development
2. Use sample BC data for testing UI
3. Test BC API calls separately with Postman/curl

## Testing Checklist

### Functional Tests

- [ ] App loads in Zendesk ticket sidebar
- [ ] Employee auto-detected from agent email
- [ ] Client dropdown populated from BC customers
- [ ] Project dropdown populated and filters by client
- [ ] Task dropdown shows when project has tasks
- [ ] Time input validates decimal values (0.25 - 24)
- [ ] Description character limit enforced (250 chars)
- [ ] Save button disabled when form incomplete
- [ ] Time entry created successfully in BC
- [ ] Ticket URL appended to description
- [ ] Success message displayed after save
- [ ] Form clears after successful submission
- [ ] Error handling for API failures

### BC Verification

After saving, verify in Business Central:
1. Navigate to Time Registration Entries
2. Find the new entry
3. Confirm:
   - Correct employee
   - Correct job/project
   - Correct quantity (hours)
   - Description includes Zendesk ticket URL

## Troubleshooting

### "Employee not found" Error

- Ensure the Zendesk agent email matches an employee email in BC
- Check that the employee record exists and is active

### "Failed to load clients/projects" Error

- Verify BC credentials are correct
- Check that Web Services are enabled in BC
- Ensure the user has API permissions

### CORS Errors

- BC API requires proper authentication
- Zendesk apps proxy requests through their servers
- If testing locally, you may need to configure CORS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Inspired by the [Harvest Zendesk Widget](https://www.zendesk.co.uk/marketplace/apps/support/3/harvest/)
- Built following [Zapdesk](https://github.com/knowall-ai/zendesk-zapdesk) architectural patterns
- Uses [Zendesk Apps Framework v2](https://developer.zendesk.com/documentation/apps/)
