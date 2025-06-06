"use client";

import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { BookingProvider } from "@/components/booking-context";
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/components/currency-context";
import Script from "next/script";
import { useEffect, useState } from "react";
import { MessageCircle, X, Globe } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isHotelSiteOpen, setIsHotelSiteOpen] = useState(false);
    
    // Replace with your actual Streamlit app URL
    const streamlitUrl = "https://hotelmate-chatbot.streamlit.app/";
    
    // Replace with your actual Vercel hotel website URL
    const hotelWebsiteUrl = "https://hotelmate.vercel.app/";

    useEffect(() => {
        // Hide chatbot when inside iframe to avoid nested chatbots
        if (window !== window.parent) {
            return;
        }

        // Dynamically create the hidden Google Translate container
        const div = document.createElement('div');
        div.id = 'google_translate_element';
        div.style.position = 'fixed';
        div.style.top = '-1000px';
        div.style.left = '-1000px';
        div.style.visibility = 'hidden';
        div.style.zIndex = '-1';
        document.body.appendChild(div);

        // Define the callback for Google Translate
        window.googleTranslateElementInit = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: 'en,es,fr,de,it,pt,ru,ja,ko,zh,ar,hi,th,vi,nl,sv',
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false,
                        multilanguagePage: true,
                    },
                    'google_translate_element'
                );
            }
        };

        // Cleanup to avoid memory leaks
        return () => {
            try {
                const element = document.getElementById('google_translate_element');
                if (element && element.parentNode && element.parentNode.contains(element)) {
                    element.parentNode.removeChild(element);
                }
            } catch (error) {
                console.log('Cleanup error handled:', error);
            }
        };
    }, []);

    const toggleChatbot = () => {
        setIsChatOpen(!isChatOpen);
        // Close hotel site if open
        if (isHotelSiteOpen) {
            setIsHotelSiteOpen(false);
        }
    };

    const toggleHotelSite = () => {
        setIsHotelSiteOpen(!isHotelSiteOpen);
        // Close chatbot if open
        if (isChatOpen) {
            setIsChatOpen(false);
        }
    };

    // Don't render chatbot if inside iframe
    if (window !== window.parent) {
        return (
            <html lang="en" suppressHydrationWarning>
                <head>
                    <title>Hotel Mate IBE</title>
                    <meta name="description" content="Hotel Mate IBE" />
                    <meta name="generator" content="v0.dev" />
                    <link rel="icon" href="/favicon.ico" />
                </head>
                <body className={inter.className} suppressHydrationWarning>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <CurrencyProvider>
                            <BookingProvider>
                                <div className="flex flex-col min-h-screen" suppressHydrationWarning>
                                    <main className="flex-1">{children}</main>
                                    <Footer />
                                </div>
                            </BookingProvider>
                        </CurrencyProvider>
                    </ThemeProvider>
                </body>
            </html>
        );
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>Hotel Mate IBE</title>
                <meta name="description" content="Hotel Mate IBE" />
                <meta name="generator" content="v0.dev" />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <CurrencyProvider>
                        <BookingProvider>
                            <div className="flex flex-col min-h-screen" suppressHydrationWarning>
                                {/* Header will be conditionally rendered in each page */}
                                <main className="flex-1">{children}</main>
                                <Footer />
                            </div>
                            
                            {/* Floating Action Buttons */}
                            <>
                                {/* Hotel Website Button */}
                                <button
                                    onClick={toggleHotelSite}
                                    className={`fixed bottom-24 right-6 z-50 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-105 ${
                                        isHotelSiteOpen || isChatOpen ? 'scale-0' : 'scale-100'
                                    }`}
                                    aria-label="Open Hotel Website"
                                >
                                    <Globe size={20} />
                                </button>

                                {/* Chatbot Button */}
                                <button
                                    onClick={toggleChatbot}
                                    className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-105 ${
                                        isChatOpen || isHotelSiteOpen ? 'scale-0' : 'scale-100'
                                    }`}
                                    aria-label="Open HoteMate Assistant"
                                >
                                    <MessageCircle size={24} />
                                </button>

                                {/* Hotel Website Iframe Container - Desktop */}
                                <div
                                    className={`fixed bottom-6 right-6 z-50 transition-all duration-300 hidden lg:block ${
                                        isHotelSiteOpen 
                                            ? 'w-96 h-[600px] opacity-100 scale-100' 
                                            : 'w-0 h-0 opacity-0 scale-0'
                                    }`}
                                >
                                    <div className="relative w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden border">
                                        {/* Header */}
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                            <h3 className="font-semibold text-lg">🏨 Hotel Website</h3>
                                            <button
                                                onClick={toggleHotelSite}
                                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                                aria-label="Close hotel website"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        {/* Iframe Container */}
                                        <div className="w-full h-[calc(100%-64px)]">
                                            {isHotelSiteOpen && (
                                                <iframe
                                                    src={hotelWebsiteUrl}
                                                    className="w-full h-full border-0"
                                                    title="Hotel Website"
                                                    loading="lazy"
                                                    allow="camera; microphone; geolocation"
                                                    sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Chatbot Iframe Container - Desktop */}
                                <div
                                    className={`fixed bottom-6 right-6 z-50 transition-all duration-300 hidden lg:block ${
                                        isChatOpen 
                                            ? 'w-96 h-[600px] opacity-100 scale-100' 
                                            : 'w-0 h-0 opacity-0 scale-0'
                                    }`}
                                >
                                    <div className="relative w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden border">
                                        {/* Header */}
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                            <h3 className="font-semibold text-lg">🤖 HoteMate Assistant</h3>
                                            <button
                                                onClick={toggleChatbot}
                                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                                aria-label="Close chatbot"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        {/* Iframe Container */}
                                        <div className="w-full h-[calc(100%-64px)]">
                                            {isChatOpen && (
                                                <iframe
                                                    src={streamlitUrl}
                                                    className="w-full h-full border-0"
                                                    title="HoteMate Chatbot"
                                                    loading="lazy"
                                                    allow="camera; microphone; geolocation"
                                                    sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Overlay Background */}
                                {(isChatOpen || isHotelSiteOpen) && (
                                    <div 
                                        className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
                                        onClick={() => {
                                            setIsChatOpen(false);
                                            setIsHotelSiteOpen(false);
                                        }} 
                                    />
                                )}

                                {/* Mobile Full Screen Hotel Website */}
                                <div
                                    className={`fixed inset-4 z-50 lg:hidden transition-all duration-300 ${
                                        isHotelSiteOpen 
                                            ? 'opacity-100 scale-100' 
                                            : 'opacity-0 scale-0 pointer-events-none'
                                    }`}
                                >
                                    <div className="relative w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden">
                                        {/* Mobile Header */}
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                            <h3 className="font-semibold text-lg">🏨 Hotel Website</h3>
                                            <button
                                                onClick={toggleHotelSite}
                                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                                aria-label="Close hotel website"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        {/* Mobile Iframe */}
                                        <div className="w-full h-[calc(100%-64px)]">
                                            {isHotelSiteOpen && (
                                                <iframe
                                                    src={hotelWebsiteUrl}
                                                    className="w-full h-full border-0"
                                                    title="Hotel Website"
                                                    loading="lazy"
                                                    allow="camera; microphone; geolocation"
                                                    sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Full Screen Chatbot */}
                                <div
                                    className={`fixed inset-4 z-50 lg:hidden transition-all duration-300 ${
                                        isChatOpen 
                                            ? 'opacity-100 scale-100' 
                                            : 'opacity-0 scale-0 pointer-events-none'
                                    }`}
                                >
                                    <div className="relative w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden">
                                        {/* Mobile Header */}
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                            <h3 className="font-semibold text-lg">🤖 HoteMate Assistant</h3>
                                            <button
                                                onClick={toggleChatbot}
                                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                                aria-label="Close chatbot"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        {/* Mobile Iframe */}
                                        <div className="w-full h-[calc(100%-64px)]">
                                            {isChatOpen && (
                                                <iframe
                                                    src={streamlitUrl}
                                                    className="w-full h-full border-0"
                                                    title="HoteMate Chatbot"
                                                    loading="lazy"
                                                    allow="camera; microphone; geolocation"
                                                    sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        </BookingProvider>
                    </CurrencyProvider>
                </ThemeProvider>

                {/* Google Translate Script */}
                <Script
                    src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                    strategy="afterInteractive"
                    onError={() => {
                        console.log("Google Translate script failed to load");
                    }}
                />
            </body>
        </html>
    );
}