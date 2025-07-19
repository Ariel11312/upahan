import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Heart, Share2, Download, Maximize, Minimize, X } from 'lucide-react';

// Sample data for 6 categories
const imageCategories = [
  {
    id: 1,
    name: 'Featured Collection',
    isMain: true,
    color: 'from-purple-600 to-pink-600',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop'
    ]
  },
  {
    id: 2,
    name: 'Architecture',
    color: 'from-blue-500 to-cyan-500',
    images: [
      'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=300&fit=crop'
    ]
  },
  {
    id: 3,
    name: 'Nature',
    color: 'from-green-500 to-emerald-500',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
    ]
  },
  {
    id: 4,
    name: 'Urban Life',
    color: 'from-orange-500 to-red-500',
    images: [
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop'
    ]
  },
  {
    id: 5,
    name: 'Abstract',
    color: 'from-indigo-500 to-purple-500',
    images: [
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ]
  },
  {
    id: 6,
    name: 'Minimalist',
    color: 'from-gray-500 to-slate-600',
    images: [
      'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1616628188467-fea8c34bf980?w=400&h=300&fit=crop'
    ]
  }
];

const ImageCollectionCarousel = () => {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentCategory = imageCategories.find(cat => cat.id === selectedCategory);
  const currentImages = currentCategory?.images || [];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay || currentImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % currentImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, currentImages.length, selectedCategory]);

  // Loading simulation
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  // Reset image index when category changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedCategory]);

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + currentImages.length) % currentImages.length);
  };

  const toggleFavorite = (categoryId, imageIndex) => {
    const key = `${categoryId}-${imageIndex}`;
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(key)) {
        newFavorites.delete(key);
      } else {
        newFavorites.add(key);
      }
      return newFavorites;
    });
  };

  const isFavorite = (categoryId, imageIndex) => {
    return favorites.has(`${categoryId}-${imageIndex}`);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Fullscreen Modal Component
  const FullscreenModal = () => {
    if (!isFullscreen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* Close button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-all duration-300"
        >
          <X size={24} />
        </button>

        {/* Fullscreen image display */}
        <div className="relative h-full flex items-center justify-center">
          {currentImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 transform ${
                index === currentImageIndex 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={image.replace('w=400&h=300', 'w=1920&h=1080')}
                alt={`${currentCategory?.name} ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}

          {/* Navigation buttons */}
          <button
            onClick={prevImage}
            className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-4 rounded-full hover:bg-black/70 transition-all duration-300 transform hover:scale-110"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-4 rounded-full hover:bg-black/70 transition-all duration-300 transform hover:scale-110"
          >
            <ChevronRight size={32} />
          </button>

          {/* Bottom controls */}
          <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-white">
            <div>
              <h2 className="text-4xl font-bold mb-2">{currentCategory?.name}</h2>
              <p className="text-white/80 text-lg">
                {currentImageIndex + 1} of {currentImages.length} images
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className="bg-black/50 backdrop-blur-sm p-3 rounded-full hover:bg-black/70 transition-all duration-300"
              >
                {isAutoPlay ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={() => toggleFavorite(selectedCategory, currentImageIndex)}
                className={`backdrop-blur-sm p-3 rounded-full transition-all duration-300 ${
                  isFavorite(selectedCategory, currentImageIndex)
                    ? 'bg-red-500/80 text-white'
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <Heart size={24} fill={isFavorite(selectedCategory, currentImageIndex) ? 'currentColor' : 'none'} />
              </button>
              <button className="bg-black/50 backdrop-blur-sm p-3 rounded-full hover:bg-black/70 transition-all duration-300">
                <Share2 size={24} />
              </button>
              <button className="bg-black/50 backdrop-blur-sm p-3 rounded-full hover:bg-black/70 transition-all duration-300">
                <Download size={24} />
              </button>
            </div>
          </div>

          {/* Image indicators */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3">
            {currentImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-white scale-150'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="flex h-96 gap-4 animate-pulse">
          {/* Main category skeleton */}
          <div className="flex-1 bg-gray-300 rounded-2xl"></div>
          {/* Other categories skeleton */}
          <div className="w-80 flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-1 bg-gray-300 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        {/* Main Carousel Layout */}
        <div className="flex h-96 gap-4">
          {/* Main Category (Left Side - Almost Half) */}
          <div className="flex-1 relative group rounded-2xl overflow-hidden shadow-2xl">
            <div className={`absolute inset-0 bg-gradient-to-br ${currentCategory?.color} opacity-10`}></div>
            
            {/* Main Image Display */}
            <div className="relative h-full overflow-hidden">
              {currentImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    index === currentImageIndex 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-105'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${currentCategory?.name} ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={toggleFullscreen}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                </div>
              ))}

              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>

              {/* Fullscreen button */}
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-110 group"
                title="Enter fullscreen"
              >
                <Maximize size={20} />
                <div className="absolute -bottom-10 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Click for fullscreen
                </div>
              </button>

              {/* Category Title & Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{currentCategory?.name}</h2>
                    <p className="text-white/80">
                      {currentImageIndex + 1} of {currentImages.length} images
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all duration-300"
                    >
                      {isAutoPlay ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                      onClick={() => toggleFavorite(selectedCategory, currentImageIndex)}
                      className={`backdrop-blur-sm p-2 rounded-full transition-all duration-300 ${
                        isFavorite(selectedCategory, currentImageIndex)
                          ? 'bg-red-500/80 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Heart size={20} fill={isFavorite(selectedCategory, currentImageIndex) ? 'currentColor' : 'none'} />
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all duration-300">
                      <Share2 size={20} />
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all duration-300">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Indicators */}
              <div className="absolute bottom-20 left-6 flex gap-2">
                {currentImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'bg-white scale-150'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Category Selector (Right Side) */}
          <div className="w-80 flex flex-col gap-2">
            {imageCategories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-500 transform hover:scale-105 ${
                  category.isMain 
                    ? 'hidden' // Hide main category from selector
                    : selectedCategory === category.id
                      ? 'flex-1 shadow-lg ring-2 ring-white'
                      : 'flex-1 hover:shadow-md'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color}`}></div>
                <img
                  src={category.images[0]}
                  alt={category.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    selectedCategory === category.id ? 'scale-100' : 'scale-110 group-hover:scale-105'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                {/* Category Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="transform transition-all duration-300 group-hover:translate-y-0 translate-y-2">
                    <h3 className={`font-bold text-white transition-all duration-300 ${
                      selectedCategory === category.id ? 'text-lg mb-2' : 'text-base'
                    }`}>
                      {category.name}
                    </h3>
                    {selectedCategory === category.id && (
                      <div className="flex items-center gap-2 text-white/80 text-sm animate-fadeIn">
                        <span>{category.images.length} images</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Heart 
                            size={12} 
                            fill={category.images.some((_, idx) => isFavorite(category.id, idx)) ? 'currentColor' : 'none'}
                          />
                          Favorites
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedCategory === category.id && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Image Counter & Stats */}
        <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-semibold">Collection Stats:</span>
            <span>{imageCategories.reduce((acc, cat) => acc + cat.images.length, 0)} Total Images</span>
            <span>•</span>
            <span>{favorites.size} Favorites</span>
            <span>•</span>
            <span>6 Categories</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isAutoPlay ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isAutoPlay ? 'Auto-playing' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Premium Image Collections</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Discover stunning, high-quality images across diverse categories. Our curated collection features breathtaking landscapes, 
              modern architecture, urban photography, and abstract art. Each image is professionally selected and optimized for both 
              personal and commercial use. Perfect for designers, marketers, bloggers, and creative professionals seeking exceptional visual content.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">High Quality</h3>
              <p className="text-gray-600">Professional grade images with exceptional resolution and clarity</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Licensed</h3>
              <p className="text-gray-600">Full commercial rights included with every download</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Curated</h3>
              <p className="text-gray-600">Hand-picked by professional photographers and designers</p>
            </div>
          </div>
        </div>

        {/* Payment Plans - Airbnb Style */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Payment Description (Left Side) */}
            <div className="lg:w-2/3 p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Secure Payment</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Flexible Plans</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Choose from our range of subscription plans that fit your needs.
                    All plans come with a 30-day money-back guarantee and full commercial rights.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Trusted Payment Methods</h3>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="w-16 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">VISA</span>
                    </div>
                    <div className="w-16 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">MC</span>
                    </div>
                    <div className="w-16 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">AMEX</span>
                    </div>
                    <div className="w-16 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">PP</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Security Guarantee</h3>
                  <p className="text-gray-600 leading-relaxed">
                    All transactions are encrypted and secure. We never store your payment details
                    on our servers. Your privacy and security are our top priorities.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Options (Right Side) */}
            <div className="lg:w-1/3 bg-gray-50 p-8 border-l border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Plan</h3>
              
              <div className="space-y-4">
                {/* Basic Plan */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">Basic</h4>
                      <p className="text-sm text-gray-500">10 downloads/month</p>
                    </div>
                    <span className="font-bold text-gray-800">$9/mo</span>
                  </div>
                </div>
                
                {/* Pro Plan */}
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">Pro</h4>
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Popular</span>
                      </div>
                      <p className="text-sm text-gray-500">50 downloads/month</p>
                    </div>
                    <span className="font-bold text-gray-800">$19/mo</span>
                  </div>
                </div>
                
                {/* Enterprise Plan */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">Enterprise</h4>
                      <p className="text-sm text-gray-500">Unlimited downloads</p>
                    </div>
                    <span className="font-bold text-gray-800">$49/mo</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Continue to Payment
              </button>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>30-day money-back guarantee</p>
                <p className="mt-1">Cancel anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Feedback Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Users Say</h2>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="text-lg font-semibold text-gray-700 ml-2">4.9/5 from 2,847 reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Absolutely stunning collection! The quality is outstanding and the variety is incredible. 
                I've found the perfect images for all my design projects. The Pro plan is worth every penny!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SJ</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">Graphic Designer</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "The carousel interface is so intuitive and beautiful. I love how easy it is to browse through 
                categories and find exactly what I need. The fullscreen feature is a game-changer!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MC</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Michael Chen</h4>
                  <p className="text-sm text-gray-600">Marketing Manager</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "As a blogger, I need high-quality images regularly. This platform has become my go-to source. 
                The licensing is clear, and the download process is seamless. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">ER</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Emily Rodriguez</h4>
                  <p className="text-sm text-gray-600">Content Creator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Reviews Row */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Review 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "The Enterprise plan has transformed our workflow. Unlimited downloads and team collaboration 
                features are exactly what we needed. Customer support is fantastic too!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">DL</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">David Kim</h4>
                  <p className="text-sm text-gray-600">Creative Director</p>
                </div>
              </div>
            </div>

            {/* Review 5 */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Great service overall! The image quality is superb and the variety keeps growing. 
                Would love to see more abstract art categories, but definitely satisfied with my subscription."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">AT</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Alex Thompson</h4>
                  <p className="text-sm text-gray-600">Web Developer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Join thousands of satisfied users</h3>
            <p className="text-gray-600 mb-4">Start your free trial today and discover the perfect images for your projects</p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Start Free Trial
            </button>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal />
    </>
  );
};

const Room = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <ImageCollectionCarousel />


    </div>

);
};


export default Room;