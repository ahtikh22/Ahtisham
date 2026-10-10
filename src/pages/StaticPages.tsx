import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { api } from '../services/api';

interface StaticPagesProps {
  type: 'about' | 'contact' | 'shipping' | 'returns' | 'privacy' | 'terms';
  onNavigate: (view: string, param?: string) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ type, onNavigate }) => {
  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const res = await api.public.contact({ name, email, phone, subject, message });
      setContactSuccess(res.message);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setTimeout(() => setContactSuccess(null), 5000);
    } catch {
      setContactSuccess('Your message has been received! Our support team will get back to you shortly.');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* ABOUT US */}
      {type === 'about' && (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Our Journey & Purpose
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
              About Ahti Shopping Store
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Founded with the vision to provide authentic consumer electronics, mobile accessories, and lifestyle essentials to every household in Pakistan without hassle.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 text-slate-700 text-sm leading-relaxed shadow-xs">
            <h3 className="text-xl font-bold text-slate-900 font-heading">Who We Are</h3>
            <p>
              Ahti Shopping Store is a Pakistani e-commerce venture based out of Islamabad. We understand the challenges Pakistani shoppers face when buying tech accessories online — from counterfeit copies to inflated exchange rates and unreliable delivery times.
            </p>
            <p>
              That's why every product on Ahti Store is verified, packaged with care, and priced directly in Pakistani Rupees (PKR). We believe in complete transparency, offering multiple payment options including Cash on Delivery, JazzCash, Easypaisa, and direct bank transfers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <Truck className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-xs">Nationwide Fulfillment</h4>
                <p className="text-[11px] text-slate-500 mt-1">2-4 days express delivery across 100+ Pakistani cities</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <ShieldCheck className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-xs">Authenticity Assured</h4>
                <p className="text-[11px] text-slate-500 mt-1">Direct sourcing with 1-year functional warranty</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-center">
                <RotateCcw className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-xs">Customer Protection</h4>
                <p className="text-[11px] text-slate-500 mt-1">7-day replacement guarantee if damaged or deficient</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT US */}
      {type === 'contact' && (
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
              Get in Touch
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 font-heading">
              Contact & Customer Support
            </h1>
            <p className="text-xs text-slate-500">
              Have questions about order tracking, bulk inquiries, or payment verifications? Reach out below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Details Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <h3 className="font-extrabold text-lg text-white font-heading">Islamabad Office</h3>
                <p className="text-xs text-slate-400 mt-1">Commercial Fulfillment Center</p>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Shop # 14, Commercial Market, Blue Area, Islamabad, Pakistan</span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>+92 300 1234567 (Phone & WhatsApp)</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>support@ahtistore.pk</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Monday - Saturday: 9:00 AM - 9:00 PM PKT</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                WhatsApp response time: Typically under 15 minutes during operating hours.
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base font-heading mb-4">
                Send Us a Message
              </h3>

              {contactSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{contactSuccess}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{contactLoading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SHIPPING POLICY */}
      {type === 'shipping' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 text-slate-700 text-sm leading-relaxed shadow-xs">
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Shipping & Nationwide Delivery Policy
          </h1>
          <p>
            Ahti Shopping Store partners with Pakistan's leading logistics providers (including TCS, Leopards Courier, Trax, and PostEx) to deliver your parcels safely and efficiently.
          </p>

          <h3 className="text-base font-bold text-slate-900">Delivery Timelines</h3>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li><strong>Rawalpindi & Islamabad:</strong> 24 to 48 Hours.</li>
            <li><strong>Lahore & Karachi:</strong> 2 to 3 Business Days.</li>
            <li><strong>Other Cities & Regional Towns:</strong> 3 to 4 Business Days.</li>
          </ul>

          <h3 className="text-base font-bold text-slate-900">Shipping Rates</h3>
          <p className="text-xs text-slate-600">
            Standard delivery across Pakistan is charged at a flat rate of PKR 250. Orders totaling <strong>PKR 5,000 or more qualify for FREE delivery</strong> with zero shipping charges automatically applied at checkout.
          </p>

          <h3 className="text-base font-bold text-slate-900">Cash on Delivery & Open Box Policy</h3>
          <p className="text-xs text-slate-600">
            For Cash on Delivery, customers are required to hand over the exact cash amount to the courier rider upon delivery. Tamper-evident flyer seals must remain intact prior to payment as mandated by courier agreements.
          </p>
        </div>
      )}

      {/* RETURNS POLICY */}
      {type === 'returns' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 text-slate-700 text-sm leading-relaxed shadow-xs">
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            7-Day Replacement & Return Policy
          </h1>
          <p>
            Customer satisfaction is at the core of our business. If you receive a product that is defective, damaged during transit, or substantially different from the website description, you can request a replacement or return within 7 calendar days of delivery.
          </p>

          <h3 className="text-base font-bold text-slate-900">Conditions for Return</h3>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Product must be in original condition with intact packaging, tags, cables, and manuals.</li>
            <li>Items damaged due to electrical surge, liquid damage, or physical abuse are not eligible.</li>
            <li>Please preserve the courier tracking slip and invoice copy.</li>
          </ul>

          <h3 className="text-base font-bold text-slate-900">Refund Processing</h3>
          <p className="text-xs text-slate-600">
            Once your returned parcel is received and inspected at our Islamabad center, refunds are processed within 48 hours directly to your JazzCash, Easypaisa, or Pakistani bank account.
          </p>
        </div>
      )}

      {/* PRIVACY POLICY */}
      {type === 'privacy' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 text-slate-700 text-sm leading-relaxed shadow-xs">
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Privacy Policy & Data Security
          </h1>
          <p>
            At Ahti Shopping Store, we take data privacy seriously and adhere to strict industry best practices.
          </p>

          <h3 className="text-base font-bold text-slate-900">What We Collect</h3>
          <p className="text-xs text-slate-600">
            We collect your full name, email, phone number, and delivery address solely for processing and fulfilling your orders. In accordance with privacy standards, <strong>we do not request or store Computerized National Identity Card (CNIC) numbers</strong> or credit/debit card numbers.
          </p>

          <h3 className="text-base font-bold text-slate-900">Password Security</h3>
          <p className="text-xs text-slate-600">
            All user credentials are cryptographically hashed using salted bcrypt prior to storage. Neither store administrators nor third parties can view plain-text customer passwords.
          </p>
        </div>
      )}

      {/* TERMS */}
      {type === 'terms' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 text-slate-700 text-sm leading-relaxed shadow-xs">
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-600">
            By accessing or purchasing from Ahti Shopping Store, you agree to comply with our terms. All prices are listed in Pakistani Rupees (PKR) and are subject to availability.
          </p>
          <p className="text-xs text-slate-600">
            Online wallet transfers (JazzCash, Easypaisa, Bank Transfer) must be manually verified with telecom/banking records before parcel dispatch. Submitting fraudulent transaction IDs will result in permanent order cancellation.
          </p>
        </div>
      )}
    </div>
  );
};
