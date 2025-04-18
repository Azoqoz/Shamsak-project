import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Slider } from '@/components/ui/slider';

// Fix for Leaflet marker icons
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Default icon settings
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationRadiusSelectorProps {
  initialRadius?: number;
  onChange?: (location: { lat: number; lng: number; radius: number }) => void;
  technicians?: Array<{
    id: number;
    latitude: string;
    longitude: string;
    serviceRadius: number;
    specialty: string;
    user: {
      name: string;
    };
  }>;
}

// This is a helper component to update the map view when the center changes
const ChangeMapView = ({ center }: { center: LatLngExpression }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

const LocationRadiusSelector = ({
  initialRadius = 25,
  onChange,
  technicians = [],
}: LocationRadiusSelectorProps) => {
  const { t } = useTranslation();
  const [radius, setRadius] = useState<number>(initialRadius);
  const [userLocation, setUserLocation] = useState<LatLngExpression>([24.7136, 46.6753]); // Default to Riyadh
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          
          if (onChange) {
            onChange({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              radius,
            });
          }
          
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  // Handle radius change
  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setRadius(newRadius);
    
    if (onChange && userLocation) {
      const [lat, lng] = userLocation as number[];
      onChange({
        lat,
        lng,
        radius: newRadius,
      });
    }
  };

  // Calculate distance between two points using the Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Filter technicians within user's selected radius
  const techniciansInRadius = technicians.filter((technician) => {
    if (!technician.latitude || !technician.longitude) return false;
    
    const [userLat, userLng] = userLocation as number[];
    const techLat = parseFloat(technician.latitude);
    const techLng = parseFloat(technician.longitude);
    
    // Calculate the distance
    const distance = calculateDistance(userLat, userLng, techLat, techLng);
    
    // A technician is available if:
    // 1. The user is within the technician's service radius
    // 2. The technician is within the user's selected radius
    return distance <= technician.serviceRadius && distance <= radius;
  });

  // Custom marker colors for technicians
  const specialtyColors: Record<string, string> = {
    'Solar Panel Installation': 'blue',
    'Energy Efficiency Assessment': 'green',
    'Maintenance and Repair': 'orange',
  };

  return (
    <div className="flex flex-col">
      <div className="my-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">{t('map.selectRadius')}</span>
          <span className="text-sm font-medium">{radius} km</span>
        </div>
        <Slider
          value={[radius]}
          min={5}
          max={100}
          step={5}
          onValueChange={handleRadiusChange}
          className="my-4"
        />
      </div>
      
      <div className="mt-2 mb-4">
        <h3 className="text-sm font-medium mb-2">{t('map.techniciansInRadius')}: {techniciansInRadius.length}</h3>
        {techniciansInRadius.length > 0 && (
          <ul className="text-sm">
            {techniciansInRadius.map((tech) => (
              <li key={tech.id} className="mb-1">
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: specialtyColors[tech.specialty] || 'gray' }}
                ></span>
                {tech.user.name} - {tech.specialty}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="h-[400px] w-full rounded-md overflow-hidden border border-gray-200 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <MapContainer
            center={userLocation}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User location marker */}
            <Marker position={userLocation} />
            
            {/* User radius circle */}
            <Circle
              center={userLocation}
              radius={radius * 1000} // Convert km to meters
              pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, color: 'blue' }}
            />
            
            {/* Technician markers */}
            {technicians.map((technician) => {
              if (!technician.latitude || !technician.longitude) return null;
              
              const techLatLng: LatLngExpression = [
                parseFloat(technician.latitude),
                parseFloat(technician.longitude)
              ];
              
              // Create a custom colored icon for each specialty
              const techIcon = new L.Icon({
                iconUrl: icon,
                shadowUrl: iconShadow,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                className: `tech-marker-${technician.id}`, // For custom styling if needed
              });
              
              return (
                <div key={technician.id}>
                  <Marker position={techLatLng} icon={techIcon} />
                  <Circle
                    center={techLatLng}
                    radius={technician.serviceRadius * 1000}
                    pathOptions={{ 
                      fillColor: specialtyColors[technician.specialty] || 'gray', 
                      fillOpacity: 0.1, 
                      color: specialtyColors[technician.specialty] || 'gray' 
                    }}
                  />
                </div>
              );
            })}
            
            <ChangeMapView center={userLocation} />
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default LocationRadiusSelector;