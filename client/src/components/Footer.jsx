import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Mail, Phone } from 'lucide-react';
import { useGetSettingsQuery } from '../store/api/apiSlice';

export default function Footer({ onOpenSizeGuide, onOpenContact }) {
  const { data: settingsData } = useGetSettingsQuery();
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('atelier_site_settings');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      siteName: 'ATELIER',
      contactEmail: 'info@fashion.com',
      contactPhone: '0300-1234567',
    };
  });

  useEffect(() => {
    if (settingsData?.data) {
      setSiteSettings({
        siteName: settingsData.data.siteName || 'ATELIER',
        contactEmail: settingsData.data.contactEmail || 'info@fashion.com',
        contactPhone: settingsData.data.contactPhone || '0300-1234567',
      });
    }
  }, [settingsData]);

  useEffect(() => {
    let bc = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('atelier_live_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'SETTINGS_UPDATED' && event.data?.settings) {
            setSiteSettings((prev) => ({ ...prev, ...event.data.settings }));
          }
        };
      }
    } catch (e) {}

    const handleSettingsChange = (e) => {
      if (e.detail) setSiteSettings((prev) => ({ ...prev, ...e.detail }));
    };
    window.addEventListener('atelier_settings_change', handleSettingsChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('atelier_settings_change', handleSettingsChange);
    };
  }, []);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      try {
        const stored = JSON.parse(localStorage.getItem('atelier_customer_emails') || '[]');
        const newMail = {
          _id: `email_${Date.now()}`,
          senderName: 'Salon Patron',
          senderEmail: email,
          senderPhone: '',
          department: 'Private Salon Registry',
          subject: 'Private Salon Registry Inscription',
          message: `Client requested membership in the Maison Private Salon Registry. Transmit invitations to ${email}.`,
          recipientEmail: 'info@fashion.com',
          status: 'unread',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('atelier_customer_emails', JSON.stringify([newMail, ...stored]));
      } catch (e) {
        // ignore
      }
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#F1EFEA] border-t border-[#DAD7D1] mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-16 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12 mb-10 sm:mb-16">
          {/* Brand Manifesto & Newsletter */}
          <div className="sm:col-span-2 lg:col-span-2 pr-0 lg:pr-10">
            <h3 className="font-editorial text-xl sm:text-2xl uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#171717] mb-3 sm:mb-4">
              {siteSettings.siteName || 'ATELIER'}
            </h3>
            <p className="text-sm text-[#77736E] leading-relaxed mb-6 max-w-sm">
              Contemporary bespoke tailoring and architectural silhouettes crafted with archival textile discipline. Generative precision meets hand-finished haute couture.
            </p>

            <div className="space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#171717] block">
                Private Salon Registry
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-[#35664A] bg-white border border-[#DAD7D1] p-3 rounded">
                  <Check size={16} />
                  <span>Your invitation has been inscribed. Welcome to the Maison registry.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full bg-[#FFFFFF] border border-[#DAD7D1] border-r-0 px-4 py-3 text-xs text-[#171717] placeholder:text-[#77736E] focus:outline-none focus:border-[#171717]"
                  />
                  <button
                    type="submit"
                    className="bg-[#171717] text-white px-5 text-xs uppercase tracking-wider font-medium hover:bg-[#4D5543] transition-colors shrink-0 flex items-center justify-center"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Department Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.14em] text-[#171717] font-semibold mb-5">
              Collections
            </h4>
            <ul className="space-y-3 text-xs text-[#4B5563]">
              <li>
                <Link to="/collection?cat=men" className="hover:text-[#171717] transition-colors">
                  Men's Sartorial
                </Link>
              </li>
              <li>
                <Link to="/collection?cat=women" className="hover:text-[#171717] transition-colors">
                  Women's Couture
                </Link>
              </li>
              <li>
                <Link to="/collection?cat=kids" className="hover:text-[#171717] transition-colors">
                  Miniature Archive
                </Link>
              </li>
              <li>
                <Link to="/custom-studio" className="hover:text-[#171717] text-[#4D5543] font-semibold flex items-center gap-1 transition-colors">
                  AI Custom Atelier <span>✦</span>
                </Link>
              </li>
              <li>
                <Link to="/collection" className="hover:text-[#171717] transition-colors">
                  Spring/Summer 2026
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.14em] text-[#171717] font-semibold mb-5">
              Client Care
            </h4>
            <ul className="space-y-3 text-xs text-[#4B5563]">
              <li>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="hover:text-[#171717] transition-colors text-left flex items-center gap-1.5 text-[#35664A] font-semibold"
                >
                  <Mail size={13} />
                  <span>Email: {siteSettings.contactEmail}</span>
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${siteSettings.contactPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#171717] transition-colors text-left flex items-center gap-1.5 text-[#171717] font-semibold"
                >
                  <Phone size={13} className="text-[#35664A]" />
                  <span>WhatsApp: {siteSettings.contactPhone}</span>
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="hover:text-[#171717] transition-colors text-left"
                >
                  Dual-Unit Size Guide
                </button>
              </li>
              <li>
                <Link to="/custom-studio" className="hover:text-[#171717] transition-colors">
                  Bespoke Feasibility Review
                </Link>
              </li>
              <li>
                <Link to="/account?tab=orders" className="hover:text-[#171717] transition-colors">
                  Track Atelier Fulfillment
                </Link>
              </li>
              <li>
                <span className="text-[#77736E]">Worldwide Insured Courier</span>
              </li>
              <li>
                <span className="text-[#77736E]">Archival Garment Care</span>
              </li>
            </ul>
          </div>

          {/* The Maison */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.14em] text-[#171717] font-semibold mb-5">
              The Maison
            </h4>
            <ul className="space-y-3 text-xs text-[#4B5563]">
              <li>
                <Link to="/journal" className="hover:text-[#171717] transition-colors">
                  The Journal
                </Link>
              </li>
              <li>
                <span className="text-[#4B5563] flex items-center gap-1.5 font-medium">
                  <span>Artisanal Salons: Milan • Lahore • London</span>
                </span>
              </li>
              <li>
                <span className="text-[#77736E]">Salons: Milan • Lahore • London</span>
              </li>
              <li>
                <span className="text-[#77736E]">Zero-Waste Patterning</span>
              </li>
              <li>
                <span className="text-[#77736E]">Master Tailor Ledger</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-[#DAD7D1] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-[#77736E] text-center md:text-left">
          <p>© 2026 {siteSettings.siteName || 'ATELIER'}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6">
            <span className="hover:text-[#171717] cursor-pointer">Privacy Protocol</span>
            <span>•</span>
            <span className="hover:text-[#171717] cursor-pointer">Terms of Sartorial Service</span>
            <span>•</span>
            <span className="hover:text-[#171717] cursor-pointer">Bespoke Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
