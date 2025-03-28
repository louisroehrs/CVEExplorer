const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:5173' // Vite's default port
  }));
}

// API Routes
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

app.get('/api/cwe/:id', async (req, res) => {
  try {
    const response = await axios.get(
      `https://cwe.mitre.org/data/definitions/${req.params.id}.html`,
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
      name: $('h1').first().text().trim(),
      description: $('div#content div.description').text().trim(),
      related_attack_patterns: [],
      mitigations: [],
      examples: []
    };

    // Extract related attack patterns
    $('div#content div.related_attack_patterns ul li').each((i, elem) => {
      const text = $(elem).text().trim();
      const capecMatch = text.match(/CAPEC-(\d+)/);
      if (capecMatch) {
        transformedData.related_attack_patterns.push({
          id: capecMatch[1],
          description: text
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

app.get('/api/capec/:cweId', async (req, res) => {
  try {
    // First, get the CWE HTML page
    const cweResponse = await axios.get(
      `https://cwe.mitre.org/data/definitions/${req.params.cweId}.html`,
      {
        headers: {
          'Accept': 'text/html'
        }
      }
    );
    
    // Load the CWE HTML into cheerio
    const $ = cheerio.load(cweResponse.data);
    
    // Find the Related Attack Patterns section
    const relatedAttackPatterns = [];
    $('div#content div.related_attack_patterns ul li').each((i, elem) => {
      const text = $(elem).text().trim();
      // Extract CAPEC ID from the text (format: CAPEC-XXX)
      const capecMatch = text.match(/CAPEC-(\d+)/);
      if (capecMatch) {
        relatedAttackPatterns.push(capecMatch[1]);
      }
    });
    
    if (relatedAttackPatterns.length > 0) {
      // Get the first CAPEC ID
      const capecId = relatedAttackPatterns[0];
      
      // Fetch the CAPEC HTML page
      const capecResponse = await axios.get(
        `https://capec.mitre.org/data/definitions/${capecId}.html`,
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
        id: capecId,
        name: $capec('h1').first().text().trim(),
        description: $capec('div#content div.description').text().trim(),
        typical_severity: $capec('div#content div.typical_severity').text().trim(),
        typical_likelihood_of_exploit: $capec('div#content div.typical_likelihood_of_exploit').text().trim(),
        resources_required: $capec('div#content div.resources_required').text().trim(),
        execution_flow: [],
        prerequisites: []
      };

      // Extract execution flow steps
      $capec('div#content div.execution_flow ul li').each((i, elem) => {
        transformedData.execution_flow.push($capec(elem).text().trim());
      });

      // Extract prerequisites
      $capec('div#content div.prerequisites ul li').each((i, elem) => {
        transformedData.prerequisites.push($capec(elem).text().trim());
      });

      // Clean up empty arrays
      if (transformedData.execution_flow.length === 0) {
        transformedData.execution_flow = [];
      }
      if (transformedData.prerequisites.length === 0) {
        transformedData.prerequisites = [];
      }
      
      res.json(transformedData);
    } else {
      res.status(404).json({ error: 'No CAPEC data found for this CWE' });
    }
  } catch (error) {
    console.error('Error fetching CAPEC data:', error);
    res.status(500).json({ error: 'Failed to fetch CAPEC data' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the client/dist directory
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}); 