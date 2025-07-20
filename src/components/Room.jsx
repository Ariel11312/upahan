import React, { useState, useEffect, use } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Heart, Share2, Download, Maximize, Minimize, X,Home, Wifi, Waves, Car, Star, MapPin, Calendar, Users, MessageCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

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
    name: 'Bedroom',
    color: 'from-green-500 to-emerald-500',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
    ]
  },
  {
    id: 4,
    name: 'Living Room',
    color: 'from-orange-500 to-red-500',
    images: [
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop'
    ]
  },
  {
    id: 5,
    name: 'Kitchen & Dining',
    color: 'from-indigo-500 to-purple-500',
    images: [
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    ]
  },
  {
    id: 6,
    name: 'Comfort Room ',
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

const Feedback = () => {
const [loading, setLoading] = useState(true);
useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
return (
    <div className="w-full max-w-7xl mx-auto p-4 ">
      <div className="flex h-96 gap-4 animate-pulse">
        <div className="flex-1 bg-gray-300 rounded-xl"></div>
        <div className="w-80 flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
  }
  return (
    <>
      {/* User Feedback Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
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
      </div>
    </>
  );
}

const Map = () => {
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !map) {
      // Initialize the map with your specified coordinates
      const leafletMap = L.map('map-container').setView([14.9669976, 120.9332742], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap);
      
      // Add marker at the specified coordinates
      L.marker([14.9669976, 120.9332742]).addTo(leafletMap)
        .bindPopup('Marker Location')
        .openPopup();
      
      setMap(leafletMap);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [loading, map]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="h-96 bg-gray-300 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
<div className="w-full max-w-7xl mx-auto p-4">
  <div className="border border-gray-200 rounded-xl shadow-md overflow-hidden">
    {/* Header with icon and title */}
    <div className="flex gap-3 items-center justify-center bg-gray-50 p-4 border-b border-gray-200">
      <MapPin className="w-6 h-6 text-red-500" />
      <h2 className="text-2xl font-bold text-gray-800">Location Map</h2>
    </div>
    
    {/* Map container */}
 <div id="map-container" className="h-96 rounded-xl"></div>    
    {/* Optional footer */}
    <div className="bg-gray-50 p-3 text-sm text-gray-500 text-center border-t border-gray-200">
      Interactive map showing our location
    </div>
  </div>
</div>    </>
  );
};

const Description = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
const [paymentTotal, setPaymentTotal] = useState('');
  const calculateTotal ={
    basePrice:5500,
    spendPoints:0,
  };


const handleRental = () => {
  const RentalId = Math.floor(Math.random() * 1000000);  
  
  console.log(`Rental ID: ${RentalId}`);
          navigate(`/upahan/rent/${RentalId}`);
}
useEffect(() => {
          const timer = setTimeout(() => setLoading(false), 1000);
          return () => clearTimeout(timer);
      }, []);
  const amenities = [
    { icon: Home, label: "Air Conditioning", featured: true },
    { icon: Wifi, label: "Free WiFi", featured: true },
    { icon: Waves, label: "Swimming Pool", featured: true },
    { icon: Car, label: "Parking Space", featured: true },
    { icon: Home, label: "Kitchen", featured: false },
    { icon: Home, label: "Laundry", featured: false },
    { icon: Home, label: "TV", featured: false },
    { icon: Home, label: "Balcony", featured: false },
  ];
  const featuredAmenities = amenities.filter(a => a.featured);
  const displayAmenities = showAllAmenities ? amenities : featuredAmenities;
  

if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 mt-8">
      {/* Header Section with Actions */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Modern Apartment in Bulacan
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">5.0</span>
                <span className="underline hover:no-underline cursor-pointer">1 review</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="underline hover:no-underline cursor-pointer">Bulacan, Philippines</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">Share</span>
            </button>
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="hidden md:inline">Save</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-2">
          {/* Property Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1</div>
                <div className="text-sm text-gray-600">Kitchen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">6</div>
                <div className="text-sm text-gray-600">Max Guests</div>
              </div>
            </div>
          </div>
          
          {/* Host Section */}
          <div className="flex items-center gap-4 p-6 border border-gray-200 rounded-2xl mb-8 hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100" 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Host profile" 
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">Hosted by Ariel</h3>
              <p className="text-gray-600">Web Developer • Superhost</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>⭐ 5.0 rating</span>
                <span>• 3 years hosting</span>
              </div>
            </div>
            <button className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors font-medium">
              Contact Host
            </button>
          </div>
          
          {/* Property Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">About this space</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Experience the perfect blend of comfort and convenience in this beautifully designed modern apartment. 
                Located in the heart of Bulacan, this spacious 3-bedroom property offers everything you need for an 
                unforgettable stay.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Whether you're traveling with family or friends, you'll love the thoughtfully designed spaces, 
                premium amenities, and peaceful neighborhood setting. Just minutes away from local attractions 
                and dining options, this is your perfect home base for exploring the Philippines.
              </p>
            </div>
          </div>
          
          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">What this place offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayAmenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <amenity.icon className="w-6 h-6 text-blue-600" />
                  <span className="font-medium text-gray-800">{amenity.label}</span>
                </div>
              ))}
            </div>
            {amenities.length > featuredAmenities.length && (
              <button 
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-4 px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
              </button>
            )}
          </div>
        </div>
        
        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="border border-gray-200 rounded-3xl shadow-xl p-6 bg-white backdrop-blur-sm">
              {/* Price Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-3xl font-bold text-gray-900">₱5,500</span>
                  <span className="text-gray-600 ml-1">/ night</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">5.0</span>
                  <span className="text-gray-500 text-sm">(1)</span>
                </div>
              </div>
              
              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="relative">
                  <div className="border border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Schedule</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <input 
                        type="date" 
                        placeholder="Add date" 
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full focus:outline-none bg-transparent" 
                      />
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Guest Selector */}
              <div className="border border-gray-300 rounded-lg p-4 mb-6 hover:border-gray-400 transition-colors">
                <label className="block text-xs font-semibold text-gray-500 mb-2">TOTAL PERSON LIVE</label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{selectedGuests} {selectedGuests === 1 ? 'guest' : 'guests'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedGuests(Math.max(1, selectedGuests - 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50"
                      disabled={selectedGuests <= 1}
                    >
                      -
                    </button>
                    <button 
                      onClick={() => setSelectedGuests(Math.min(6, selectedGuests + 1))}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50"
                      disabled={selectedGuests >= 6}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Reserve Button */}
              <button onClick={() => handleRental()} className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white py-4 rounded-xl font-bold text-lg transition-all duration-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Rent
              </button>
              
              <p className="text-center text-gray-500 text-sm mt-3">You won't be charged yet</p>
              
              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
      
                  <div className="flex justify-between">
                    <span className="text-gray-700 underline hover:no-underline cursor-pointer">Spend Points</span>
                    <span className="font-medium">{calculateTotal.basePrice * 0.05 / 5}</span>
                  </div>

                </div>
                <div className="flex justify-between font-bold text-lg mt-6 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>₱{calculateTotal.basePrice.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Cancellation Policy */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl">
                <p className="text-center text-sm text-green-700 font-medium">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Free cancellation before May 15
                </p>
              </div>
            </div>
            
            {/* Quick Contact */}
            <div className="mt-6 border border-gray-200 rounded-2xl p-6 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Questions?</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Get quick answers from Ariel</p>
              <button className="w-full border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                Message Host
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const Room = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <ImageCollectionCarousel />
<Description/>
<Map/>
      <Feedback/>


    </div>

);
};


export default Room;