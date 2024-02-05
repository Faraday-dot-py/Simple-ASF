

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId:  process.env.REACT_APP_PROJECT_ID,
  storageBucket:  process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId:  process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId:  process.env.REACT_APP_APP_ID,
  measurementId:  process.env.REACT_APP_MEASUREMENT_ID
};

// DO NOT EDIT ABOVE THIS LINE
//---------------------------------------

// ONLY EDIT HERE
const config = {
    firebaseConfig: firebaseConfig, // Don't change this line
    sortMetrics: ["Match Number", "Team Number"], // Not needed if you are using TBA
    renderRequiredStars: true,
    useTPS: true,
}
export default config;