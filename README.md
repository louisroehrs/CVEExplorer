# CVE Explorer

A modern web application that provides comprehensive information about Common Vulnerabilities and Exposures (CVEs), including related CWEs, CAPECs, and CVSS scoring.

## Features

- Search for CVE information by ID
- Display detailed CVE descriptions
- Show CVSS v3 scores and severity levels
- List related Common Weakness Enumerations (CWEs)
- Provide reference links for further reading
- Modern, responsive UI with TailwindCSS

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cveexplorer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

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
