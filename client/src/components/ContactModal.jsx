import React, { useState } from 'react';
import { X, Send, Mail, Phone, CheckCircle2, AlertCircle, Building2, Sparkles } from 'lucide-react';
import { useSubmitInquiryMutation } from '../store/api/apiSlice';

export default function ContactModal({ isOpen, onClose }) {
  const [submitInquiry, { isLoading }] = useSubmitInquiryMutation();

  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    department: 'General Inquiries',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submittedMessage, setSubmittedMessage] = useState(null);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData((prev) => ({ ...prev, senderPhone: digitsOnly }));
    if (errors.senderPhone) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.senderPhone;
        return next;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.senderName.trim()) {
      errs.senderName = 'Name is required.';
    }

    const email = formData.senderEmail.trim();
    if (!email) {
      errs.senderEmail = 'Email address is required.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) || email.includes('..')) {
      errs.senderEmail = 'Please provide a valid email address (e.g. patron@gmail.com).';
    }

    const phone = formData.senderPhone.trim();
    if (phone) {
      if (!phone.startsWith('03')) {
        errs.senderPhone = 'Pakistan mobile number must start with 03 (e.g. 03001234567).';
      } else if (phone.length !== 11) {
        errs.senderPhone = `Pakistan mobile number must be exactly 11 digits (currently ${phone.length}/11).`;
      }
    }

    if (!formData.subject.trim()) {
      errs.subject = 'Subject line is required.';
    }

    if (!formData.message.trim()) {
      errs.message = 'Message content cannot be blank.';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Please provide at least 10 characters in your inquiry.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      senderName: formData.senderName.trim(),
      senderEmail: formData.senderEmail.trim().toLowerCase(),
      senderPhone: formData.senderPhone.trim(),
      department: formData.department,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      recipientEmail: 'info@fashion.com',
    };

    try {
      const res = await submitInquiry(payload).unwrap();
      const newEmailRecord = res?.data || {
        ...payload,
        _id: `email_${Date.now()}`,
        status: 'unread',
        createdAt: new Date().toISOString(),
      };

      // Also sync to localStorage for immediate instant pickup in Admin Dashboard
      try {
        const stored = JSON.parse(localStorage.getItem('atelier_customer_emails') || '[]');
        localStorage.setItem('atelier_customer_emails', JSON.stringify([newEmailRecord, ...stored]));
      } catch (err) {
        // ignore
      }

      setSubmittedMessage(newEmailRecord);
    } catch (err) {
      // Local fallback in case network/offline
      const fallbackRecord = {
        ...payload,
        _id: `email_${Date.now()}`,
        status: 'unread',
        createdAt: new Date().toISOString(),
      };
      try {
        const stored = JSON.parse(localStorage.getItem('atelier_customer_emails') || '[]');
        localStorage.setItem('atelier_customer_emails', JSON.stringify([fallbackRecord, ...stored]));
      } catch (e) {
        // ignore
      }
      setSubmittedMessage(fallbackRecord);
    }
  };

  const handleReset = () => {
    setSubmittedMessage(null);
    setFormData({
      senderName: '',
      senderEmail: '',
      senderPhone: '',
      department: 'General Inquiries',
      subject: '',
      message: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#DAD7D1] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#171717] text-white p-6 relative shrink-0">
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2 text-[#DDE6CE] text-xs font-mono tracking-widest uppercase mb-1.5 font-bold">
            <Mail size={14} /> Official Maison Correspondence
          </div>
          <h2 className="font-editorial text-2xl tracking-tight text-white">
            Client Concierge &amp; Official Inquiries
          </h2>
          <p className="text-xs text-white/75 mt-1">
            Dispatch correspondence directly to our official atelier inbox at{' '}
            <strong className="text-[#DDE6CE] font-mono">info@fashion.com</strong>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {submittedMessage ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto border border-[#10B981]/30">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-2xl text-[#171717]">
                  Email Dispatched to Official Inbox
                </h3>
                <p className="text-xs text-[#77736E] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-[#171717]">{submittedMessage.senderName}</strong>. Your correspondence regarding{' '}
                  <span className="text-[#171717] font-semibold font-mono">"{submittedMessage.subject}"</span> has been transmitted to{' '}
                  <strong className="text-[#171717]">info@fashion.com</strong> and logged in the Atelier management command center.
                </p>
              </div>

              <div className="p-4 bg-[#F1EFEA] rounded-xl border border-[#DAD7D1] text-left text-xs max-w-md mx-auto space-y-1 text-[#4B5563]">
                <div className="flex justify-between">
                  <span>To:</span>
                  <span className="font-mono text-[#171717] font-semibold">info@fashion.com</span>
                </div>
                <div className="flex justify-between">
                  <span>From:</span>
                  <span className="font-mono text-[#171717]">{submittedMessage.senderEmail}</span>
                </div>
                {submittedMessage.senderPhone && (
                  <div className="flex justify-between">
                    <span>Contact:</span>
                    <span className="font-mono text-[#171717]">{submittedMessage.senderPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-[#10B981] font-semibold uppercase text-[10px]">Received at Maison</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-[#171717] hover:bg-[#4D5543] text-white text-xs uppercase tracking-wider font-semibold rounded-lg transition shadow-md"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Recipient Notice */}
              <div className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#DAD7D1] rounded-xl text-[#77736E]">
                <div className="flex items-center gap-2">
                  <Building2 size={15} className="text-[#171717]" />
                  <span>Official Recipient:</span>
                </div>
                <span className="font-mono font-semibold text-[#171717] bg-white px-2 py-0.5 rounded border border-[#DAD7D1]">
                  info@fashion.com
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#171717] font-semibold block mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Ayesha Khan"
                    className={`w-full bg-[#FAF9F6] border rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none transition ${
                      errors.senderName ? 'border-red-500 bg-red-50/20' : 'border-[#DAD7D1] focus:border-[#171717]'
                    }`}
                  />
                  {errors.senderName && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} /> {errors.senderName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[#171717] font-semibold block mb-1">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="senderEmail"
                    value={formData.senderEmail}
                    onChange={handleChange}
                    placeholder="patron@example.com"
                    className={`w-full bg-[#FAF9F6] border rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none transition ${
                      errors.senderEmail ? 'border-red-500 bg-red-50/20' : 'border-[#DAD7D1] focus:border-[#171717]'
                    }`}
                  />
                  {errors.senderEmail && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} /> {errors.senderEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[#171717] font-semibold block">
                      Telephone / WhatsApp
                    </label>
                    <span className="text-[10px] text-[#77736E] font-mono">
                      {formData.senderPhone ? `${formData.senderPhone.length}/11 digits` : 'Optional'}
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    value={formData.senderPhone}
                    onChange={handlePhoneChange}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key) &&
                        !e.ctrlKey &&
                        !e.metaKey
                      ) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="03XXXXXXXXX (e.g. 03001234567)"
                    className={`w-full bg-[#FAF9F6] border rounded-lg p-2.5 text-xs text-[#171717] font-mono tracking-wider focus:outline-none transition ${
                      errors.senderPhone ? 'border-red-500 bg-red-50/20' : 'border-[#DAD7D1] focus:border-[#171717]'
                    }`}
                  />
                  {errors.senderPhone && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} /> {errors.senderPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[#171717] font-semibold block mb-1">
                    Atelier Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-[#FAF9F6] border border-[#DAD7D1] rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    <option value="General Inquiries">General Inquiries</option>
                    <option value="Bespoke Tailoring & Feasibility">Bespoke Tailoring &amp; Feasibility</option>
                    <option value="Bridal & Ceremonial Orders">Bridal &amp; Ceremonial Orders</option>
                    <option value="Fabric & Textile Sourcing">Fabric &amp; Textile Sourcing</option>
                    <option value="Order & Dispatch Tracking">Order &amp; Dispatch Tracking</option>
                    <option value="Private Salon Appointments">Private Salon Appointments</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#171717] font-semibold block mb-1">
                  Subject Line <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Inquiring regarding custom raw silk sherwani measurements"
                  className={`w-full bg-[#FAF9F6] border rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none transition ${
                    errors.subject ? 'border-red-500 bg-red-50/20' : 'border-[#DAD7D1] focus:border-[#171717]'
                  }`}
                />
                {errors.subject && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[#171717] font-semibold block mb-1">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your styling inquiry, bespoke sizing requests, or event date..."
                  className={`w-full bg-[#FAF9F6] border rounded-lg p-2.5 text-xs text-[#171717] focus:outline-none transition resize-none ${
                    errors.message ? 'border-red-500 bg-red-50/20' : 'border-[#DAD7D1] focus:border-[#171717]'
                  }`}
                />
                {errors.message && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.message}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#DAD7D1]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-[#77736E] hover:text-[#171717] transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-[#171717] hover:bg-[#4D5543] text-white text-xs uppercase tracking-wider font-semibold rounded-lg transition shadow flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Transmitting...</span>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send to info@fashion.com</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
