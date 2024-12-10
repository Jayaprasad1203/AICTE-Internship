import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const App = () => {
  const videoRef = useRef(null);
  const [attendance, setAttendance] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Sample data: Add user details such as ID, department, email, and phone
  const users = {
    John: {
      name: 'John',
      id: '123',
      department: 'Engineering',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: '1234 Elm St, City, Country',
      imageUrl: '/labeled_images/John/1.jpg',
    },
    Jane: {
      name: 'Jane',
      id: '124',
      department: 'Marketing',
      email: 'jane@example.com',
      phone: '234-567-8901',
      address: '5678 Oak St, City, Country',
      imageUrl: '/labeled_images/John/2.jpg',
    },
  };

  // Load face-api.js models
  const loadModels = async () => {
    const MODEL_URL = process.env.PUBLIC_URL + '/models';
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  // Start the webcam video stream
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error('Error accessing the camera:', err));
  };

  // Load labeled face data for recognition
  const loadLabeledImages = async () => {
    const labels = Object.keys(users); // Use the keys of the users object as labels
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) { // Assuming each person has two images
          const img = await faceapi.fetchImage(`${process.env.PUBLIC_URL}/labeled_images/${label}/${i}.jpg`);
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          if (detections) {
            descriptions.push(detections.descriptor);
          } else {
            console.warn(`No faces detected in image for ${label}`);
          }
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  };

  // Recognize faces in the video feed
  const handleVideoPlay = async () => {
    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    setInterval(async () => {
      if (videoRef.current) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length > 0) {
          const results = detections.map((d) => faceMatcher.findBestMatch(d.descriptor));
          results.forEach((result) => {
            const name = result.toString().split(' ')[0];
            if (name !== 'unknown' && !attendance.includes(name)) {
              markAttendance(name);
              setAttendance((prev) => [...prev, name]);
            }
          });
        }
      }
    }, 1000);
  };

  // Mark attendance (you can enhance this by sending data to a backend)
  const markAttendance = (name) => {
    const timestamp = new Date().toLocaleString();
    console.log(`Attendance marked for ${name} at ${timestamp}`);
  };

  useEffect(() => {
    loadModels();
    startVideo();
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>Face Recognition Attendance System</h1>
      {!modelsLoaded ? <p>Loading face recognition models...</p> : null}
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={handleVideoPlay}
        style={{ width: '720px', height: '540px', border: '1px solid black', marginTop: '20px' }}
      />
      <div style={{ marginTop: '20px' }}>
        <h2>Attendance List:</h2>
        <ul>
          {attendance.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      </div>

      <h2>User Details:</h2>
      <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Department</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Phone</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Address</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(users).map((user, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{user.name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{user.id}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{user.department}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{user.email}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{user.phone}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{user.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
