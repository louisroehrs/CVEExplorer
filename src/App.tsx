import { useState } from 'react'
import axios from 'axios'

interface CVE {
  id: string;
  description: string;
  references: {
    url: string;
    source: string;
    tags: string[];
  }[];
  metrics: {
    cvssMetricV31: {
      baseScore: number;
      baseSeverity: string;
      vectorString: string;
    };
  };
  weaknesses: {
    source: string;
    description: {
      lang: string;
      value: string;
    }[];
  }[];
}

function App() {
  const [cveId, setCveId] = useState('')
  const [cveData, setCveData] = useState<CVE | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchCVE = async () => {
    if (!cveId) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.get(`http://localhost:3001/api/cve/${cveId}`)
      if (response.data.vulnerabilities && response.data.vulnerabilities.length > 0) {
        setCveData(response.data.vulnerabilities[0].cve)
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
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">CVE Explorer</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={cveId}
              onChange={(e) => setCveId(e.target.value)}
              placeholder="Enter CVE ID (e.g., CVE-2024-0001)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchCVE}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
            {error}
          </div>
        )}

        {cveData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{cveData.id}</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{cveData.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">CVSS Score</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-2xl font-bold text-blue-600">
                  {cveData.metrics.cvssMetricV31.baseScore}
                </p>
                <p className="text-gray-600">
                  Severity: {cveData.metrics.cvssMetricV31.baseSeverity}
                </p>
                <p className="text-sm text-gray-500">
                  Vector: {cveData.metrics.cvssMetricV31.vectorString}
                </p>
              </div>
            </div>

            {cveData.weaknesses && cveData.weaknesses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Related CWEs</h3>
                <div className="space-y-4">
                  {cveData.weaknesses.map((weakness, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium text-gray-900">{weakness.source}</p>
                      {weakness.description.map((cwe, cweIndex) => (
                        <div key={cweIndex} className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">CWE-{cwe.value}:</span> {cwe.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cveData.references && cveData.references.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">References</h3>
                <ul className="list-disc list-inside space-y-2">
                  {cveData.references.map((ref, index) => (
                    <li key={index}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
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
  )
}

export default App
