import React, { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import Map from './Map.jsx';
import Room from './Room.jsx';
import { useNavigate, useParams } from 'react-router-dom';

// Your existing Category data
const Category = [
    { id: 1, name: 'Apartment', icon: '🏠' },
    { id: 2, name: 'Bed Space', icon: '🛏️' },
    { id: 3, name: 'Boarding House', icon: '🏘️' },
    { id: 4, name: 'Dormitory', icon: '🏫' },
    { id: 5, name: 'Rental House', icon: '🏡' },
    { id: 6, name: 'Hotel', icon: '🏨' },
];

// Your existing Apartment data
const Apartment = [
    {id: 1, type:'Apartment', name: 'Luxury Apartment', location: 'Downtown', price: '₱ 1200/month', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', lat: 14.5995, lng: 120.9842},
    {id: 2, type:'Apartment', name: 'Luxury Apartment', location: 'Downtown', price: '₱ 1200/month', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', lat: 14.6042, lng: 120.9822},
    {id: 3, type:'Bed Space',  name: 'Luxury Apartment', location: 'Downtown', price: '₱ 1200/month', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', lat: 14.5935, lng: 120.9895},
    {id: 4, type:'Hotel', name: 'Luxury Apartment', location: 'Downtown', price: '₱ 1200/month', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop', lat: 14.6015, lng: 120.9865},
    {id: 5, type:'Apartment', name: 'Cozy Apartment', location: 'Uptown', price: '₱ 900/month', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', lat: 14.6125, lng: 120.9742},
    {id: 6, type:'Apartment', name: 'Modern Apartment', location: 'City Center', price: '₱ 1000/month', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', lat: 14.5875, lng: 120.9945},
    {id: 7, type:'Apartment', name: 'Budget Apartment', location: 'Suburbs', price: '₱ 700/month', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', lat: 14.6200, lng: 120.9600},
    {id: 8, type:'Apartment', name: 'Studio Apartment', location: 'Downtown', price: '₱ 1000/month', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', lat: 14.5955, lng: 120.9885},
    {id: 9, type:'Apartment', name: 'Family Apartment', location: 'Residential', price: '₱ 1300/month', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', lat: 14.6055, lng: 120.9725},
    {id: 10, type:'Apartment', name: 'Penthouse Apartment', location: 'Skyline', price: '₱ 2000/month', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', lat: 14.5915, lng: 120.9965},
    {id: 11, type:'Apartment', name: 'Small Apartment', location: 'Downtown', price: '₱ 800/month', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', lat: 14.6025, lng: 120.9855},
    {id: 12, type:'Apartment', name: 'Large Apartment', location: 'Uptown', price: '₱ 1700/month', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', lat: 14.6135, lng: 120.9735},
];

// Map wrapper component with close button
const MapWrapper = ({ onClose }) => {
    return (
        <div className="w-full h-full bg-white relative">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                >
                <X size={24} />
            </button>

            {/* Your imported Map component */}
            <Map />
        </div>
    );
};

// Room wrapper component with close button
const RoomWrapper = ({ roomId, onClose }) => {
    const room = Apartment.find(apt => apt.id === roomId);
    
    if (!room) {
        return (
            <div className="w-full h-full bg-white relative flex items-center justify-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                >
                    <X size={24} />
                </button>
                <div className="text-center">
                    <span className="text-6xl mb-4 block">😕</span>
                    <span className="text-xl font-semibold text-gray-600">Room not found</span>
                </div>
            </div>
        );
    }

    return <Room roomId={roomId} />;
};

// CategoryBar component
const CategoryBar = ({ selectedCategoryId, setSelectedCategoryId }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setCategories(Category);
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    
    if (loading) {
        return (
            <div className="flex space-x-2 sm:space-x-4 overflow-x-auto p-2 sm:p-4 bg-gray-100 justify-start sm:justify-center rounded-lg shadow-md">
                {[...Array(6)].map((_, idx) => (
                    <div 
                    key={idx}
                    className="flex items-center space-x-2 bg-white p-2 sm:p-3 rounded-lg shadow animate-pulse min-w-[120px]"
                    >
                        <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full"></span>
                        <span className="w-20 sm:w-24 h-4 bg-gray-300 rounded"></span>
                    </div>
                ))}
            </div>
        );
    }
    
    return (
        <div className="flex space-x-2 sm:space-x-4 overflow-x-auto p-2 sm:p-4 bg-gray-100 justify-start sm:justify-center rounded-lg shadow-md scrollbar-hide">
            {categories.map((category) => (
                <div
                onClick={() => setSelectedCategoryId(category.id)}
                key={category.id}
                className={`flex items-center cursor-pointer space-x-2 p-2 sm:p-3 rounded-lg shadow transition-colors min-w-[120px] ${
                    selectedCategoryId === category.id
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white hover:bg-gray-50'
                }`}
                >
                    <span className="text-lg sm:text-2xl">{category.icon}</span>
                    <span className="text-base sm:text-lg font-semibold">{category.name}</span>
                    {selectedCategoryId === category.id && (
                        <span className="ml-2 text-lg sm:text-xl">⬅️</span>
                    )}
                </div>
            ))}
        </div>
    );
};

// SearchBar component
const SearchBar = ({ search, setSearch, onMapClick }) => {
    const [loading, setLoading] = useState(true);
    const [gpsAllowed, setGpsAllowed] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);
    
    // Check and request GPS location
    const handleMapClick = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            () => {
                setGpsAllowed(true);
                onMapClick();
            },
            () => {
                navigator.geolocation.getCurrentPosition(
                    () => {
                        setGpsAllowed(true);
                        onMapClick();
                    },
                    () => alert('Please enable GPS/location services to use the map.')
                );
            }
        );
    };
    
    if (loading) {
        return (
            <div className="flex justify-center ">
                <div className="relative w-full max-w-md ">
                    <div className="w-full px-4 py-2 border-gray-500 rounded-lg shadow bg-gray-200 animate-pulse h-10 mt-4"></div>
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-300 rounded-full mt-2 animate-pulse"></span>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center my-4">
            <div className="relative w-full max-w-md">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onClick={handleMapClick}
                    placeholder="Search apartments near you. (Click to open map)"
                    className="w-full px-4 py-2 border-gray-500 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-yellow-600 cursor-pointer"
                    />
                <MapPin 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                    size={20}
                    onClick={handleMapClick}
                    />
            </div>
        </div>
    );
};

// ApartmentList component
const ApartmentList = ({ selectedCategoryId, search, onRoomClick }) => {
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 15;

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, [selectedCategoryId, page, search]);
    
    const selectedCategory = Category.find(cat => cat.id === selectedCategoryId);
    let filteredApartments = selectedCategory
    ? Apartment.filter(ap => ap.type === selectedCategory.name)
    : Apartment;
    
    if (search) {
        filteredApartments = filteredApartments.filter(ap =>
            ap.name.toLowerCase().includes(search.toLowerCase()) ||
            ap.location.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    const totalPages = Math.ceil(filteredApartments.length / limit);
    const paginatedApartments = filteredApartments.slice((page - 1) * limit, page * limit);
    
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-4">
                {[...Array(limit)].map((_, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                        <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                        <div className="h-6 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (filteredApartments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <span className="text-6xl mb-4">😕</span>
                <span className="text-xl font-semibold">Nothing found</span>
            </div>
        );
    }
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-4">
                {paginatedApartments.map((apartment) => (
                    <div 
                        key={apartment.id} 
                        onClick={() => onRoomClick(apartment.id)} 
                        className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                        <img src={apartment.image} alt={apartment.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{apartment.name}</h3>
                        <p className="text-gray-600 mb-2">{apartment.location}</p>
                        <p className="text-lg font-bold text-yellow-600">{apartment.price}</p>
                    </div>
                ))}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-4">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded bg-gray-200 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                        >
                        ←
                    </button>
                    <span className="font-semibold">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className={`px-4 py-2 rounded bg-gray-200 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                        >
                        →
                    </button>
                </div>
            )}
        </div>
    );
};

// Main Upahan component
const Upahan = () => {
    const navigate = useNavigate();
    const { roomId } = useParams(); // Get roomId from URL
    
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [search, setSearch] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [showRoom, setShowRoom] = useState(!!roomId); // Show room if roomId exists in URL
    const [selectedRoomId, setSelectedRoomId] = useState(roomId ? parseInt(roomId) : null);

    // Update room state when URL changes
    useEffect(() => {
        if (roomId) {
            setSelectedRoomId(parseInt(roomId));
            setShowRoom(true);
        } else {
            setSelectedRoomId(null);
            setShowRoom(false);
        }
    }, [roomId]);

    const handleMapClick = () => {
        setShowMap(true);
    };

    const handleMapClose = () => {
        setShowMap(false);
    };

    const handleRoomClick = (roomId) => {
        // Navigate to URL with roomId
        navigate(`/upahan/room/${roomId}`);
    };

    const handleRoomClose = () => {
        // Navigate back to main upahan page
        navigate('/upahan');
    };

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden">
            {/* Map overlay with left-to-right animation */}
            <div className={`fixed inset-0 z-50 transition-transform duration-500 ease-in-out ${
                showMap ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <MapWrapper onClose={handleMapClose} />
            </div>

            {/* Room overlay with left-to-right animation */}
            <div className={`fixed inset-0 z-40 transition-transform duration-500 ease-in-out ${
                showRoom ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <RoomWrapper roomId={selectedRoomId} onClose={handleRoomClose} />
            </div>

            {/* Main content with slide animation */}
            <div className={`transition-transform duration-500 ease-in-out ${
                showMap || showRoom ? '-translate-x-full' : 'translate-x-0'
            }`}>
                <CategoryBar 
                    selectedCategoryId={selectedCategoryId} 
                    setSelectedCategoryId={setSelectedCategoryId} 
                />
                <SearchBar 
                    search={search} 
                    setSearch={setSearch} 
                    onMapClick={handleMapClick}
                />
                <ApartmentList 
                    selectedCategoryId={selectedCategoryId} 
                    search={search} 
                    onRoomClick={handleRoomClick}
                />
            </div>
        </div>
    );
};

export default Upahan;