import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Bot, ArrowLeft, Send, CheckCircle, AlertCircle, Loader, Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

const EMAILJS_SERVICE_ID = 'service_6dkm828';
const EMAILJS_TEMPLATE_ID = 'template_vtfs6io';
const EMAILJS_PUBLIC_KEY = 'NjyqAnwi76Ib4pJro';

const ContactPage = ({ onBack }) => {
  const formRef = useRef();
  const { theme, toggleTheme } = useTheme();
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY
      );
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('error');
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
          .font-montserrat { font-family: 'Montserrat', sans-serif; }
        `}
      </style>

      <div className="min-h-screen font-montserrat flex flex-col relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200 overflow-x-hidden">
        {/* Header */}
        <header className="px-6 md:px-12 py-6 flex justify-between items-center relative z-10 text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <button
            onClick={onBack}
            className="flex items-center gap-2 hover:text-brand-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 text-slate-900 dark:text-white">
            <div className="w-9 h-9 bg-brand-500 text-white rounded-lg flex items-center justify-center shadow-md">
              <Bot size={22} />
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
          </button>
        </header>

        {/* Contact Form Section */}
        <main className="flex-1 flex flex-col justify-center items-center px-6 py-16 relative z-10">
          <p className="text-xs tracking-widest uppercase text-brand-600 dark:text-brand-400 mb-2 font-bold">Get in Touch</p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase text-slate-900 dark:text-white mb-3">Contact Us</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium max-w-lg text-center mb-12 leading-relaxed">
            Have a question or want to collaborate? Send us a message and Team Predictra will get back to you.
          </p>

          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-2xl shadow-xl transition-colors">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Email side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Alex Parker"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500 font-medium transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="alex.parker@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500 font-medium transition"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="Inquiry / Feedback / Bug Report"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500 font-medium transition"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Type your message here..."
                  value={form.message}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-brand-500 font-medium transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
              >
                {status === 'sending' ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>

              {/* Feedback messages */}
              {status === 'success' && (
                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-xl">
                  <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                  Your message has been sent successfully! We'll reply soon.
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-3 text-red-700 dark:text-red-300 text-xs font-bold p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800/60 rounded-xl">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                  Failed to send message. Please check your network and try again.
                </div>
              )}
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 text-center text-slate-500 dark:text-slate-400 text-xs tracking-wider font-semibold border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          © 2026 CareerCompass AI · Team Predictra · Sabaragamuwa University of Sri Lanka
        </footer>
      </div>
    </>
  );
};

export default ContactPage;
