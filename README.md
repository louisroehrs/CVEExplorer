# CVE Explorer

A web application for exploring CVE (Common Vulnerabilities and Exposures) information with CAPEC (Common Attack Pattern Enumeration and Classification) integration.

## Features

- Search and view CVE details
- View related CWE (Common Weakness Enumeration) information
- View related CAPEC attack patterns
- Modern, responsive UI built with React and TailwindCSS

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cveexplorer
```

2. Install dependencies for both client and server:
```bash
npm run install-all
```

## Development

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

This will start:
- Frontend development server at http://localhost:5173
- Backend API server at http://localhost:3001

## Production

To build and run the application in production mode:

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The application will be available at http://localhost:3001

## Project Structure

- `/client` - Frontend React application
- `/backend` - Express.js API server
- `/client/dist` - Built frontend files (generated during build)

## API Endpoints

- `GET /api/cve/:id` - Get CVE details
- `GET /api/cwe/:id` - Get CWE details
- `GET /api/capec/:id` - Get CAPEC details

## Usage

1. Enter a CVE ID in the search box (e.g., CVE-2024-0001)
2. Click the "Search" button
3. View the detailed information about the CVE, including:
   - Description
   - CVSS Score and Severity
   - Related CWEs
   - Reference links

## API Usage

This application uses the following APIs:
- NVD (National Vulnerability Database) API for CVE information
- MITRE CWE API for weakness information

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
