const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

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
  if (req.params.id.includes("noinfo")) {
    console.info("noinfo for req.params.id: ", req.params.id);
    res.status(404).json({ error: 'noinfoNo CWE data found for this ID' });
    return;
  }
  const url = `https://cwe.mitre.org/data/definitions/${req.params.id.replace("CWE-", "")}.html`;
  try {
    const response = await axios.get(
      url,
      {
        headers: {
          'Accept': 'text/html'
        }
      }
    );
    
    // Load the HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract data from the HTML
    const transformedData = {
      id: req.params.id,
      name: $('h2').first().text().trim(),
      description: $('div#Description .indent').text().trim(),
      related_attack_patterns: [],
      mitigations: [],
      examples: []
    };

    // Extract related attack patterns
    $('div#Related_Attack_Patterns tr').each((i, elem) => {
      const text = $(elem).find('a').eq(0).text().trim();
      const capecMatch = text.match(/CAPEC-(\d+)/);
      if (capecMatch) {
        transformedData.related_attack_patterns.push({
          id: capecMatch[1],
          description: text,
          url: url,
          attackpattern_name: $(elem).find('tr').find('td:last').text().trim()
        });
      }

    });
    // Extract mitigations
    $('div#content div.mitigations ul li').each((i, elem) => {
      transformedData.mitigations.push($(elem).text().trim());
    });

    // Extract examples
    $('div#content div.examples ul li').each((i, elem) => {
      transformedData.examples.push($(elem).text().trim());
    });

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching CWE data:', error);
    res.status(500).json({ error: 'Failed to fetch CWE data' });
  }
});

// Proxy endpoint for CAPEC data
app.get('/api/capec/:capecId', async (req, res) => {
  if (req.params.capecId.includes("noinfo")) {
    console.info("noinfo for req.params.capecId: ", req.params.capecId);
    res.status(404).json({ error: 'noinfoNo CAPEC data found for this ID' });
    return;
  }
  const url = `https://capec.mitre.org/data/definitions/${req.params.capecId.replace("CAPEC-", "")}.html`;
  try {
    // Fetch the CAPEC HTML page
    const capecResponse = await axios.get(
        url,
        {
          headers: {
            'Accept': 'text/html'
          }
        }
      );
      
      // Load the CAPEC HTML into cheerio
      const $capec = cheerio.load(capecResponse.data);
      
      // Extract data from the HTML
      const transformedData = {
        id: req.params.capecId,
        name: $capec('h2').first().text().trim(),
        description: $capec('div#Description .indent').first().text().trim(),
        url: url,
        typical_severity: $capec('div#Typical_Severity p').first().text().trim(),
        typical_likelihood_of_exploit: $capec('div#Likelihood_Of_Attack p').text().trim(),
        execution_flow: [],
        prerequisites: []
      };

      res.json(transformedData);
    
  } catch (error) {
    console.error('Error fetching CAPEC data:', error);
    res.status(500).json({ error: 'Failed to fetch CAPEC data' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
}); 