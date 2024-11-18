import { useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook to update the location whenever the user navigates.
 * 
 * @param {number} userID - The ID of the user.
 * @param {string} location - The user's location (latitude, longitude).
 */
const useUpdateLocation = (userID, location) => {
  useEffect(() => {
    if (userID && location) {
      // Call the API to update the location when the userID or location changes
      axios.post(`http://127.0.0.1:5000/update_location/${userID}`, { location })
        .then(response => {
          console.log('Location updated successfully:', response.data);
        })
        .catch(error => {
          console.error('Error updating location:', error);
        });
    }
  }, [userID, location]);  // Re-run the effect when userID or location changes
};

export default useUpdateLocation;
