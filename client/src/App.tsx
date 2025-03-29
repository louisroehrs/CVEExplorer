import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import TermsAndConditions from './components/TermsAndConditions'

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
  likelihood_of_attack : string;
  resources_required: string;
  execution_flow: string[];
  prerequisites: string[];
  url: string;
  attackpattern_name: string;
}

const API_BASE_URL = '';

function App() {
  const [cveId, setCveId] = useState('')
  const [cveData, setCveData] = useState<CVE | null>(null)
  const [cweData, setCweData] = useState<CWE[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [capecData, setCapecData] = useState<{ [key: string]: CAPEC }>({})

  const fetchCWE = async (cweId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cwe/${cweId}`)
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
      const response = await axios.get(`${API_BASE_URL}/api/capec/${capecId}`)
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
      const response = await axios.get(`${API_BASE_URL}/api/cve/${cveId}`)
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
        setError('CVE not found ' + JSON.stringify(response));
      }
    } catch (err) {
      setError('Error fetching CVE data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="py-8">
          <div className="w-full bg-white mx-auto shadow-lg px-4 fixed top-0 left-0">
            <div className="flex justify-between h-24">
                <div className="flex flex-row justify-between w-full items-center">
                  <Link to="/" className="text-xl font-bold text-gray-800">
                    <h2 className="text-2xl font-bold text-blue-800">CVEExplorer</h2>
                  </Link>
                  <p className="text-blue-600 text-2xl font-bold text-right left-48">Search and explore Common Vulnerabilities and Exposures</p>
                  <div></div>
                </div>
            </div>
          </div>
        </nav>

        <main className="max-w-screen">
          <Routes>
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/" element={
              <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-5xl mx-auto px-4 py-4">
                  <div className="text-center mb-12"></div>
                  <div className="bg-white rounded-xl shadow-lg p-4 ml-40 mb-8 sticky top-2 z-10">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={cveId} 
                        onChange={(e) => setCveId(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            searchCVE()
                          }
                        }}
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
                          <h2 className="text-3xl font-bold text-blue-900">
                            <a href={`https://nvd.nist.gov/vuln/detail/${cveData.id}`} target="_blank" > {cveData.id}</a>
                          </h2>
                          
                          {
                          cveData.metrics.cvssMetricV31[0].cvssData.baseSeverity.includes('HIGH') 
                          || 
                          cveData.metrics.cvssMetricV31[0].cvssData.baseSeverity.includes('CRITICAL') ? (
                            <span className="bg-red-50 text-red-700 px-4 py-2 rounded-lg font-medium">
                            {cveData.metrics.cvssMetricV31[0].cvssData.baseSeverity}
                            </span>
                          ) : (
                            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                            {cveData.metrics.cvssMetricV31[0].cvssData.baseSeverity}
                            </span>
                          )}

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
                                <div className="text-sm col-span-5 text-blue-600">
                                  Vector: {metric.cvssData.vectorString}<br/>
                                  Source: {metric.source}
                                </div>
                                <div className="text-sm col-span-2 text-blue-600">
                                  <a href={`https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator?name=${cveData.id}&vector=${metric.cvssData.vectorString}&version=3.1&source=NIST`} target="_blank" > CVSS for {cveData.id}</a>
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
                                      {cweData.find(cweEntry => cweEntry.id === cwe.value)?.description}
                                      {cweData.find(cweEntry => cweEntry.id === cwe.value)?.related_attack_patterns.map((pattern, idx) => (
                                        <div key={idx} className="mt-3 pl-4 border-l-2 border-blue-200">
                                          { idx === 0 && <h4 className="text-blue-800 font-medium mb-2">CAPEC Information</h4>}
                                          {capecData[pattern.id] && (
                                            <div className="space-y-2 text-sm">
                                              <p><a href={capecData[pattern.id].url} target="_blank" rel="noopener noreferrer"><b>{capecData[pattern.id].name}</b></a></p>
                                              <p><span className="font-medium">Description:</span> {capecData[pattern.id].description}</p>
                                              <p><span className="font-medium">Severity:</span> {capecData[pattern.id].typical_severity}</p>
                                              <p><span className="font-medium">Likelihood:</span> {capecData[pattern.id].likelihood_of_attack}</p>
                                              <p><span className="font-medium">Resources Required:</span> {capecData[pattern.id].resources_required}</p>
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
            } />
          </Routes>
        </main>

        <footer className="bg-white shadow-lg mt-8 fixed bottom-0 w-full">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="text-gray-500 text-sm">
                © {new Date().getFullYear()} CVE Explorer. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <Link to="/terms" className="text-gray-500 hover:text-gray-700 text-sm">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
