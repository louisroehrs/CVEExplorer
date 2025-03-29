import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using CVE Explorer, you agree to be bound by these Terms and Conditions. 
            If you do not agree with any part of these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Disclaimer of Warranties</h2>
          <p>
            CVE Explorer provides information about Common Vulnerabilities and Exposures (CVEs), 
            Common Weakness Enumerations (CWEs), and Common Attack Pattern Enumeration and 
            Classification (CAPEC) data. This information is provided "as is" and "as available" 
            without any warranties of any kind, either express or implied.
          </p>
          <p className="mt-2">
            We do not warrant that:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>The information provided is accurate, complete, or current</li>
            <li>The service will be uninterrupted or error-free</li>
            <li>Any defects will be corrected</li>
            <li>The service is free of viruses or other harmful components</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. Data Accuracy and Reliability</h2>
          <p>
            The information provided through CVE Explorer is sourced from publicly available 
            databases and may not be complete, accurate, or up-to-date. Users should:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>Conduct their own due diligence before relying on any information</li>
            <li>Verify information from multiple sources</li>
            <li>Not solely rely on this service for critical security decisions</li>
            <li>Consider the timeliness and accuracy of the data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">4. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, CVE Explorer and its operators shall not be 
            liable for any direct, indirect, incidental, special, consequential, or exemplary 
            damages, including but not limited to:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>Loss of profits, goodwill, or data</li>
            <li>Business interruption</li>
            <li>Any other intangible losses</li>
            <li>Damages resulting from the use or inability to use the service</li>
            <li>Any errors, mistakes, or inaccuracies in the content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. No Professional Advice</h2>
          <p>
            The information provided through CVE Explorer is for informational purposes only and 
            does not constitute professional advice. Users should:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>Consult with qualified security professionals for specific advice</li>
            <li>Not use this service as a substitute for professional security assessment</li>
            <li>Make their own independent evaluation of security risks</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">6. Third-Party Content</h2>
          <p>
            CVE Explorer aggregates information from various third-party sources. We are not 
            responsible for:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>The accuracy or reliability of third-party content</li>
            <li>Any changes or updates to third-party data</li>
            <li>The availability of third-party services</li>
            <li>Any loss or damage resulting from third-party content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">7. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless CVE Explorer and its operators from 
            any claims, damages, losses, liabilities, costs, and expenses (including reasonable 
            attorneys' fees) arising from or relating to your use of the service or any violation 
            of these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any 
            material changes by posting the new terms on this page. Your continued use of the 
            service after such changes constitutes your acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">9. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of the 
            jurisdiction in which CVE Explorer operates, without regard to its conflict of law 
            provisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">10. Contact Information</h2>
          <p>
            For any questions regarding these terms and conditions, please contact us at:
            <br />
            <a href="mailto:contact@cveexplorer.com" className="text-blue-600 hover:underline">
              contact@cveexplorer.com
            </a>
          </p>
        </section>

        <div className="mt-8 text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 