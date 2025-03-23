import React, {useState, useRef} from 'react';
import {View, Button, Text, StyleSheet, Dimensions} from 'react-native';
import MapView, {Circle, Marker, Polyline, Polygon} from 'react-native-maps';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const MapLineDrawingApp = () => {
  const [markerPositions, setMarkerPositions] = useState([]);
  const [currentMapRegion, setCurrentMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapReference = useRef(null);

  // Calculate distance between two geographic points in meters
  const computeDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const EARTH_RADIUS = 6371e3; // meters
    const toRadians = degrees => (degrees * Math.PI) / 180;

    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);
    const latDiffRad = toRadians(lat2 - lat1);
    const lonDiffRad = toRadians(lon2 - lon1);

    const a =
      Math.sin(latDiffRad / 2) * Math.sin(latDiffRad / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(lonDiffRad / 2) *
        Math.sin(lonDiffRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c; // Distance in meters
  };

  // Place initial marker when clicking "Line" button
  const placeInitialMarker = () => {
    if (markerPositions.length === 0) {
      setMarkerPositions([{...currentMapRegion, id: Date.now()}]);
    }
  };

  // Add new marker at current map center
  const addNewMarker = () => {
    setMarkerPositions([
      ...markerPositions,
      {...currentMapRegion, id: Date.now()},
    ]);
  };

  const removeMarker = () => {
    setMarkerPositions(prev => prev.slice(0, -1));
  };

  // Update latest marker position when map region changes
  const updateMapRegion = newRegion => {
    setCurrentMapRegion(newRegion);
    if (markerPositions.length > 0) {
      const updatedMarkers = [...markerPositions];
      updatedMarkers[markerPositions.length - 1] = {
        ...updatedMarkers[markerPositions.length - 1],
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      };
      setMarkerPositions(updatedMarkers);
    }
  };

  const calculateRadius = (point1, point2) => {
    const R = 6371000; // Radius of the Earth in meters
    const lat1 = (point1.latitude * Math.PI) / 180;
    const lat2 = (point2.latitude * Math.PI) / 180;
    const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const deltaLng = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return Number(distance.toFixed(2)); // Return distance in meters
  };

  // Convert geographic coordinates to canvas coordinates
  const convertToCanvasCoordinates = marker => {
    const {latitude, longitude} = marker;
    const latOffset = latitude - currentMapRegion.latitude;
    const lonOffset = longitude - currentMapRegion.longitude;
    const x =
      SCREEN_WIDTH / 2 +
      (lonOffset / currentMapRegion.longitudeDelta) * SCREEN_WIDTH;
    const y =
      SCREEN_HEIGHT / 2 -
      (latOffset / currentMapRegion.latitudeDelta) * SCREEN_HEIGHT;

    return {x, y};
  };

  // Calculate distance between two markers if they exist
  const distanceBetweenMarkers =
    markerPositions.length === 2
      ? computeDistanceInMeters(
          markerPositions[0].latitude,
          markerPositions[0].longitude,
          markerPositions[1].latitude,
          markerPositions[1].longitude,
        ).toFixed(2)
      : 0;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapReference}
        style={styles.map}
        initialRegion={currentMapRegion}
        onRegionChange={updateMapRegion}>
        {markerPositions.map(marker => (
          <Marker key={marker.id} coordinate={marker} />
        ))}

        {/* {markerPositions.length > 1 && (
          <Polyline
            coordinates={markerPositions}
            strokeColor="#000"
            strokeWidth={3}
          />
        )} */}

        {markerPositions.length > 1 && (
          <Polygon
            coordinates={markerPositions}
            strokeColor="#000"
            fillColor="red"
            strokeWidth={3}
          />
        )}

        {/* {markerPositions.length === 2 && (
          <Circle
            center={markerPositions[0]}
            radius={calculateRadius(markerPositions[0], markerPositions[1])}
            fillColor='red'
            strokeWidth={3}
          />
        )} */}
      </MapView>

      <View style={styles.buttonContainer}>
        <Button title="Line" onPress={placeInitialMarker} />
        <Button title="+" onPress={addNewMarker} />
        <Button title="-" onPress={removeMarker} />
      </View>

      <Text style={styles.distanceText}>
        Distance:{' '}
        {distanceBetweenMarkers > 0
          ? `${distanceBetweenMarkers} meters`
          : 'N/A'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  canvasView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    pointerEvents: 'none',
  },
  canvas: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  distanceText: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 5,
  },
});

export default MapLineDrawingApp;
