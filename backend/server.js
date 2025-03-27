const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: 'http://localhost:5173' // Vite's default port
}));

// Proxy endpoint for CVE data
app.get('/api/cve/:id', async (req, res) => {
  try {
    const response = await axios.get(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${req.params.id}`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching CVE data:', error);
    res.status(500).json({ error: 'Failed to fetch CVE data' });
  }
});

// Proxy endpoint for CWE data
app.get('/api/cwe/:id', async (req, res) => {
  try {
    const response = await axios.get(
      `https://cwe.mitre.org/data/definitions/${req.params.id}.json`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching CWE data:', error);
    res.status(500).json({ error: 'Failed to fetch CWE data' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 