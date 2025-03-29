import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS in development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle client-side routing
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist','index.html'));
  });
}

// API Routes
app.get('/api/cve/:id', async (req, res) => {
  try {
    const response = await axios.get(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching CVE:', error);
    res.status(500).json({ error: 'Failed to fetch CVE data' });
  }
});

app.get('/api/cwe/:id', async (req, res) => {
  const url = `https://cwe.mitre.org/data/definitions/${req.params.id.replace("CWE-", "")}.html`;

  try {
    if (req.params.id.includes("noinfo")) {
       console.info("noinfo for req.params.id: ", req.params.id);
       res.status(404).json({ error: 'noinfoNo CWE data found for this ID' });
       return;
    }
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const description = $('div#Description .indent').text().trim();
    const name = $('h2').first().text().trim();
    

    const relatedAttackPatterns = [];
    // Extract related attack patterns
    $('div#Related_Attack_Patterns tr').each((i, elem) => {
      const text = $(elem).find('a').eq(0).text().trim();
      const capecMatch = text.match(/CAPEC-(\d+)/);
      if (capecMatch) {
        relatedAttackPatterns.push({
          id: capecMatch[1],
          description: text,
          url: url,
          attackpattern_name: $(elem).find('tr').find('td:last').text().trim()
        });
      }
    });

    // Extract mitigations
    const mitigations = [];
    $('#Mitigations').next('ul').find('li').each((_, element) => {
      mitigations.push($(element).text().trim());
    });

    // Extract examples
    const examples = [];
    $('#Examples').next('ul').find('li').each((_, element) => {
      examples.push($(element).text().trim());
    });

    res.json({
      id: req.params.id,
      name: name,
      description: description,
      related_attack_patterns: relatedAttackPatterns,
      mitigations: mitigations,
      examples: examples
    });

  } catch (error) {
    console.error('Error fetching CWE:', error);
    res.status(500).json({ error: 'Failed to fetch CWE data' });
  }
});

app.get('/api/capec/:capecId', async (req, res) => {
  if (req.params.capecId.includes("noinfo")) {
    console.info("noinfo for req.params.capecId: ", req.params.capecId);
    res.status(404).json({ error: 'noinfoNo CAPEC data found for this ID' });
    return;
  }
  const url = `https://capec.mitre.org/data/definitions/${req.params.capecId.replace("CAPEC-", "")}.html`;

  try {
    const response = await axios.get(url);
    const $capec = cheerio.load(response.data);
    
    const name = $capec('h2').first().text().trim();
    const description = $capec('div#Description .indent').first().text().trim();
    const likelihoodOfAttack = $capec('div#Likelihood_Of_Attack .indent').first().text().trim();
    const typicalSeverity = $capec('div#Typical_Severity .indent').first().text().trim();
    const resourcesRequired = $capec('div#Resources_Required .indent').first().text().trim();

    // Extract execution flow
    const executionFlow = [];
    $capec('div#Execution_Flow').next('ol').find('li').each((_, element) => {
      executionFlow.push($(element).text().trim());
    });
    
    // Extract prerequisites
    const prerequisites = [];
    $capec('div#Prerequisites').next('ul').find('li').each((_, element) => {
      prerequisites.push($(element).text().trim());
    });

    res.json({
      id: req.params.id,
      name,
      description,
      typical_severity: typicalSeverity,
      likelihood_of_attack: likelihoodOfAttack,
      resources_required: resourcesRequired,
      execution_flow: executionFlow,
      prerequisites,
      url: url,
      attackpattern_name: name
    });
  } catch (error) {
    console.error('Error fetching CAPEC:', error);
    res.status(500).json({ error: 'Failed to fetch CAPEC data' });
  }
});



app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
}); 