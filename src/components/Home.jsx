import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ApartmentLandingPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    // Handle scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.email && formData.phone) {
            alert('Thank you for your inquiry! We will contact you soon.');
            setFormData({
                name: '',
                email: '',
                phone: '',
                message: ''
            });
        } else {
            alert('Please fill in all required fields.');
        }
    };

    // Smooth scroll to section
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };
    const Navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-yellow-400 mb-6"></div>
                    <span className="text-white text-2xl font-bold">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                scrolled 
                ? 'bg-gradient-to-r from-indigo-600/95 to-purple-600/95 backdrop-blur-lg' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600'
            }`}>
                <nav className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-bold text-white flex items-center">
                            <span className="text-2xl mr-2">🏠</span>
                            UPAHAN
                        </div>
                        <ul className="hidden md:flex space-x-8">
                            <li><button onClick={() => scrollToSection('home')} className="text-white hover:text-yellow-300 transition-colors">Home</button></li>
                            <li><button onClick={() => scrollToSection('features')} className="text-white hover:text-yellow-300 transition-colors">Features</button></li>
                            <li><button onClick={() => scrollToSection('UPAHAN')} className="text-white hover:text-yellow-300 transition-colors">UPAHAN</button></li>
                            <li><button onClick={() => scrollToSection('contact')} className="text-white hover:text-yellow-300 transition-colors">Contact</button></li>
                        </ul>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section id="home" className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-pulse">
                        🏠 UPAHAN
                    </h1>
                    <p className="text-xl md:text-2xl mb-6 opacity-90">
                        Your Perfect Home Away from Home
                    </p>
                    <p className="text-lg md:text-xl mb-12 font-light">
                        Safe, Clean, Comfortable and Affordable
                    </p>
                    <button 
                        onClick={() => Navigate("/upahan")}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-10 py-4 rounded-full text-lg font-bold hover:transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Find Your Home Today
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-800">
                        Why Choose Us?
                    </h2>
                    <p className="text-xl text-center text-gray-600 mb-16">
                        Experience the difference of living in an apartment that truly cares
                    </p>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: '🛡️',
                                title: 'Safe & Secure',
                                description: '24/7 security, CCTV surveillance, and secure access systems ensure your peace of mind and safety at all times.'
                            },
                            {
                                icon: '✨',
                                title: 'Always Clean',
                                description: 'Daily housekeeping services, regular maintenance, and pristine common areas maintained to the highest standards.'
                            },
                            {
                                icon: '🛋️',
                                title: 'Comfortable Living',
                                description: 'Fully furnished units with modern amenities, air conditioning, and comfortable bedding for your ultimate comfort.'
                            },
                            {
                                icon: '💰',
                                title: 'Affordable Rates',
                                description: 'Competitive pricing with flexible payment terms, no hidden fees, and exceptional value for your money.'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300 border-t-4 border-indigo-500">
                                <div className="text-5xl mb-6 text-center">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">{feature.title}</h3>
                                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="UPAHAN" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-800">
                        UPAHAN
                    </h2>
                    <p className="text-xl text-center text-gray-600 mb-16">
                        Choose from our variety of rental accommodations
                    </p>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            '🏠 Apartment',
                            '🏘️ Boarding House',
                            '🛏️ Bed Space',
                            '🏫 Dormitories',
                            '🏡 Rental House',
                            '🏨 Hotels'
                        ].map((item, index) => (
                            <div key={index} className="h-64 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center text-xl font-bold text-indigo-700 hover:scale-105 transition-transform duration-300 cursor-pointer shadow-md hover:shadow-lg">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl md:text-4xl font-bold mb-8">Get in Touch</h3>
                            <div className="space-y-6">
                                {[
                                    { icon: '📍', text: 'Angeles City, Central Luzon, Philippines' },
                                    { icon: '📞', text: '+63 XXX XXX XXXX' },
                                    { icon: '📧', text: 'info@apartmentwithheart.com' },
                                    { icon: '🕒', text: 'Open 24/7 for inquiries' }
                                ].map((contact, index) => (
                                    <div key={index} className="flex items-center space-x-4 text-lg">
                                        <span className="text-2xl">{contact.icon}</span>
                                        <span>{contact.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl">
                            <div className="mb-6">
                                <label htmlFor="name" className="block mb-2 font-semibold">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="email" className="block mb-2 font-semibold">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="phone" className="block mb-2 font-semibold">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                    className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="message" className="block mb-2 font-semibold">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Tell us about your housing needs..."
                                    className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            
                            <button 
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-4 rounded-full text-lg font-bold hover:transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Send Inquiry
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; 2025 UPAHAN. All rights reserved. | Safe, Clean, Comfortable & Affordable</p>
                </div>
            </footer>
        </div>
    );
};

export default ApartmentLandingPage;