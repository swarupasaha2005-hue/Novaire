import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-logo">
              <Image 
                src="/images/logos-v2.png" 
                alt="Novaire" 
                width={160} 
                height={32} 
                className="h-[32px] w-auto object-contain"
              />
            </div>
            <div className="footer-desc">
              The Autonomous Yield Layer for Stellar and Soroban.
            </div>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" className="social-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </a>
              <a href="#" className="social-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <div className="footer-col-label">Products</div>
            <a href="#" className="footer-link">Yield Vaults</a>
            <a href="#" className="footer-link">PT / YT Tokens</a>
            <a href="#" className="footer-link">Smart Accounts</a>
            <a href="#" className="footer-link">Analytics</a>
          </div>
          <div>
            <div className="footer-col-label">Developers</div>
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">Github</a>
            <a href="#" className="footer-link">Smart Contracts</a>
            <a href="#" className="footer-link">Bug Bounty</a>
          </div>
          <div>
            <div className="footer-col-label">Company</div>
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Careers</a>
            <a href="#" className="footer-link">Brand Assets</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 X7710 Labs. All rights reserved.</div>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
