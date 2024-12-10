import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const App = () => {
  const videoRef = useRef(null);
  const [attendance, setAttendance] = useState([]);
  const [loaded, setLoaded] = useState(false);

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
    Ram: {
      name: 'Ram',
      id: '124',
      department: 'Marketing',
      email: 'ram@example.com',
      phone: '234-567-8901',
      address: '5678 Oak St, City, Country',
      imageUrl: '/labeled_images/Ram/1.jpg',
    },
    Shiva: {
      name: 'Shiva',
      id: '125',
      department: 'HR',
      email: 'shiva@example.com',
      phone: '345-678-9012',
      address: '7890 Pine St, City, Country',
      imageUrl: '/labeled_images/Shiva/1.jpg',
    },
    Hari: {
      name: 'Hari',
      id: '126',
      department: 'Finance',
      email: 'hari@example.com',
      phone: '456-789-0123',
      address: '2345 Maple St, City, Country',
      imageUrl: '/labeled_images/Hari/1.jpg',
    },
  };

  // Load face-api.js models
  const loadModels = async () => {
    const MODEL_URL = process.env.PUBLIC_URL + '/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    setLoaded(true);
  };

  // Start video stream (optional, for face recognition)
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error('Error starting video:', err));
  };

  // Recognize faces in real-time (not needed for just showing details)
  const handleVideoPlay = async () => {
    // Face recognition logic can be kept here, but for now, we're displaying user details regardless.
  };

  // Load labeled images for recognition (this won't be used since we are not detecting faces here)
  const loadLabeledImages = () => {
    const labels = Object.keys(users);
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`${process.env.PUBLIC_URL}/labeled_images/${label}/${i}.jpg`);
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          descriptions.push(detections.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  };

  useEffect(() => {
    loadModels();
    startVideo();
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Face Recognition Attendance System</h1>
      {!loaded ? <p>Loading models...</p> : null}
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={handleVideoPlay}
        style={{ width: '720px', marginTop: '20px' }}
      />
      <div>
        <h2>Attendance List:</h2>
        <ul>
          {attendance.map((user, index) => (
            <li key={index} style={{ marginBottom: '20px' }}>
              <div>
                <h3>{user.name}</h3>
                <img
                  src={user.imageUrl}
                  alt={user.name}
                  style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                />
                <p>ID: {user.id}</p>
                <p>Department: {user.department}</p>
                <p>Email: {user.email}</p>
                <p>Phone: {user.phone}</p>
                <p>Address: {user.address}</p>
                <p>Timestamp: {new Date().toLocaleString()}</p>
              </div>
            </li>
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
