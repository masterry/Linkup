import { useEffect } from 'react';
import axios from 'axios';

const useLocationUpdater = (userID, currentLocation) => {
  useEffect(() => {
    if (userID) {
      // Function to update location
      const updateLocation = (lat, long) => {
        const locationData = `[${lat}, ${long}]`; // Format location as string

        // Send location to the backend API
        axios.post(`https://linkup-dating-2e181815b60e.herokuapp.com/update_location/${userID}`, { location: locationData })
          .then(response => {
            console.log('Location updated successfully:', response.data);
          })
          .catch(error => {
            console.error('Error updating location:', error);
          });
      };

      // Success callback for geolocation
      const success = (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude); // Update location on backend
      };

      // Error callback for geolocation
      const error = (err) => {
        console.error('Error getting geolocation:', err.message);
      };

      // Start watching the user's location
      if (navigator.geolocation) {
        const geoWatchId = navigator.geolocation.watchPosition(success, error, { enableHighAccuracy: true, timeout: 10000 });

        // Cleanup geolocation watch on component unmount
        return () => {
          navigator.geolocation.clearWatch(geoWatchId);
        };
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    }
  }, [userID, currentLocation]); // Watch both userID and currentLocation (route) changes
};

export default useLocationUpdater;
