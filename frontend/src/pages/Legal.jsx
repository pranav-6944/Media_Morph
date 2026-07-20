import React from 'react';
import Navbar from '../components/Navbar';

export default function Legal() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="orb-bg">
        <div className="orb orb-1" />
      </div>
      <div className="grain" />
      
      <div className="relative z-50">
        <Navbar />
      </div>

      <div className="relative z-10 pt-32 pb-20 max-w-4xl mx-auto px-6">
        <div className="card p-8 md:p-12">
          <h1 className="display-lg text-4xl cream-text mb-8">Terms of Service & Privacy Policy</h1>
          
          <div className="space-y-8 text-sm leading-relaxed muted-text">
            <section>
              <h2 className="text-xl font-semibold cream-text mb-3">1. Zero Cloud Data Retention</h2>
              <p>MediaMorph is built with privacy at its core. All files uploaded to this service are processed entirely on our local secure servers. The original files and converted files are <strong>immediately deleted</strong> after processing or when explicitly removed by the user. We do not store, backup, or analyze your personal media files.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold cream-text mb-3">2. Service Usage</h2>
              <p>The MediaMorph tool is provided "as is" without warranty of any kind. You agree not to use the service for processing illegal materials, distributing malware, or abusing the server infrastructure.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold cream-text mb-3">3. Analytics & Cookies</h2>
              <p>We collect completely anonymized data regarding the volume and format types of conversions strictly to monitor performance and popular usage. This cannot be tied to any individual user. We use local storage for essential settings (such as cookie consent and format preferences). You may reject non-essential tracking via our consent banner.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold cream-text mb-3">4. Disclaimer of Liability</h2>
              <p>While we use standard conversion tools (FFmpeg, Sharp), we are not responsible for any data loss, file corruption, or unexpected changes in file quality during the conversion process.</p>
            </section>

            <div className="gold-rule my-8" />
            <p className="text-xs">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
