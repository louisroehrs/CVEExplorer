import { useState } from 'react'
import axios from 'axios'

interface CVE {
  id: string;
  descriptions: { lang:string; value:string;}[];
  references: {
    url: string;
    source: string;
    tags: string[];
  }[];
  metrics: {
    cvssMetricV31: {
      source: string;
      cvssData: {
        baseScore: number;
        baseSeverity: string;
        vectorString: string;
      };
    }[];
  };
  weaknesses: {
    source: string;
    description: {
      lang: string;
      value: string;
    }[];
  }[];
}

interface CWE {
  id: string;
  value: string;
  name: string;
  description: string;
  related_attack_patterns: {
    id: string;
    description: string;
    url: string;
    attackpattern_name: string;
  }[];
  mitigations: string[];
  examples: string[];
}

interface CAPEC {
  id: string;
  name: string;
  description: string;
  typical_severity: string;
  typical_likelihood_of_exploit: string;
  resources_required: string;
  execution_flow: string[];
  prerequisites: string[];
  url: string;
  attackpattern_name: string;
}

function App() {
  const [cveId, setCveId] = useState('')
  const [cveData, setCveData] = useState<CVE | null>(null)
  const [cweData, setCweData] = useState<CWE[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [capecData, setCapecData] = useState<{ [key: string]: CAPEC }>({})

  const fetchCWE = async (cweId: string) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/cwe/${cweId}`)
      if (response.data) {
        setCweData(prev => [...prev, response.data])
      }
      return response.data
    } catch (err) {
      console.error('Error fetching CWE data:', err)
    }
  }
  
  const fetchCAPEC = async (capecId: string) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/capec/${capecId}`)
      if (response.data) {
        setCapecData(prev => ({
          ...prev,
          [capecId]: response.data
        }))
      }
    } catch (err) {
      console.error('Error fetching CAPEC data:', err)
    }
  }

  const searchCVE = async () => {
    if (!cveId) return
    
    setLoading(true)
    setError('')
    setCweData([])
    setCapecData({})
    
    try {
      const response = await axios.get(`http://localhost:3001/api/cve/${cveId}`)
      if (response.data.vulnerabilities && response.data.vulnerabilities.length > 0) {
        setCveData(response.data.vulnerabilities[0].cve)
        // Fetch CAPEC data for each CWE
        for (const weakness of response.data.vulnerabilities[0].cve.weaknesses) {
          for (const cwe of weakness.description) {
            try {
              const cweData = await fetchCWE(cwe.value)
              if (cweData?.related_attack_patterns?.length > 0) {
                cweData.related_attack_patterns.forEach((attackPattern: { id: string }) => {
                  fetchCAPEC(attackPattern.id)
                })
              }
            } catch (err) {
              console.error('Error fetching CWE data:', err)
            }
          }
        }
      } else {
        setError('CVE not found')
      }
    } catch (err) {
      setError('Error fetching CVE data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">CVE Explorer</h1>
          <p className="text-blue-600 text-lg">Search and explore Common Vulnerabilities and Exposures</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 sticky top-4 z-10">
          <div className="flex gap-4">
            <input
              type="text"
              value={cveId}
              onChange={(e) => setCveId(e.target.value.toUpperCase())}
              placeholder="Enter CVE ID (e.g., CVE-2024-0001)"
              className="flex-1 px-6 py-3 border-2 border-blue-100 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <button
              onClick={searchCVE}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all font-medium"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {cveData && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-blue-900">{cveData.id}</h2>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                  {cveData.metrics.cvssMetricV31[0].cvssData.baseSeverity}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{cveData.descriptions[cveData.descriptions.findIndex(element => element.lang === 'en')].value}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">CVSS Scores</h3>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  {cveData.metrics.cvssMetricV31.map((metric, index) => (
                    <div key={index} className="grid grid-cols-8 items-center gap-4">
                      <div className="text-4xl col-span-1 text-right font-bold text-blue-600">
                        {metric.cvssData.baseScore}
                      </div>
                      <div className="text-sm col-span-7 text-blue-600">
                        Vector: {metric.cvssData.vectorString}<br/>
                        Source: {metric.source}
                      </div>
                      {index < cveData.metrics.cvssMetricV31.length - 1 && (
                        <hr className="col-span-5 mb-4 border-blue-200" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {cveData.weaknesses && cveData.weaknesses.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">Related CWEs</h3>
                  <div className="space-y-4">
                    {cveData.weaknesses.map((weakness, index) => (
                      <div key={index} className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <p className="font-medium text-blue-900 mb-3">{weakness.source}</p>
                        {weakness.description.map((cwe, cweIndex) => (
                          <div key={cweIndex} className="mt-4">
                            <p className="text-blue-700 font-medium">
                              <a href={`https://cwe.mitre.org/data/definitions/${cwe.value.replace("CWE-", "")}.html`} target="_blank" rel="noopener noreferrer">{cweData.find(cweEntry => cweEntry.id === cwe.value)?.name}</a>
                            </p>
                            {cweData.find(cweEntry => cweEntry.id === cwe.value)?.related_attack_patterns.map((pattern, idx) => (
                              <div key={idx} className="mt-3 pl-4 border-l-2 border-blue-200">
                                { idx === 0 && <h4 className="text-blue-800 font-medium mb-2">CAPEC Information</h4>}
                                {capecData[pattern.id] && (
                                  <div className="space-y-2 text-sm">
                                    <p><a href={capecData[pattern.id].url} target="_blank" rel="noopener noreferrer"><b>{capecData[pattern.id].name}</b></a></p>
                                    <p><span className="font-medium">Description:</span> {capecData[pattern.id].description}</p>
                                    <p><span className="font-medium">Severity:</span> {capecData[pattern.id].typical_severity}</p>
                                    <p><span className="font-medium">Likelihood:</span> {capecData[pattern.id].typical_likelihood_of_exploit}</p>
                                    {capecData[pattern.id].prerequisites.length > 0 && (
                                      <div>
                                        <span className="font-medium">Prerequisites:</span>
                                        <ul className="list-disc list-inside ml-2">
                                          {capecData[pattern.id].prerequisites.map((prereq, idx) => (
                                            <li key={idx}>{prereq}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {capecData[pattern.id].execution_flow.length > 0 && (
                                      <div>
                                        <span className="font-medium">Execution Flow:</span>
                                        <ul className="list-disc list-inside ml-2">
                                          {capecData[pattern.id].execution_flow.map((step, idx) => (
                                            <li key={idx}>{step}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cveData.references && cveData.references.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">References</h3>
                  <ul className="space-y-3">
                    {cveData.references.map((ref, index) => (
                      <li key={index}>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {ref.source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
