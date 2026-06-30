const io = require("socket.io-client");
const socket = io("http://localhost:5000");

// Start slightly offset from the default Faridabad hospital location (28.3670, 77.3159)
let currentLat = 28.3500;
let currentLng = 77.3000;

socket.on("connect", () => {
  console.log("Hardware Simulator connected to Dispatch Server");
  console.log("Beginning telemetry broadcast...");

  setInterval(() => {
    // Increment latitude and longitude to simulate ambulance driving
    currentLat += 0.0002;
    currentLng += 0.0002;

    const telemetryData = {
      lat: currentLat,
      lng: currentLng,
      deviceId: "AMB-101",
      status: "En Route"
    };

    socket.emit("telemetry-update", telemetryData);
    console.log(`[${new Date().toISOString()}] Telemetry Sent:`, telemetryData);
  }, 2000);
});

socket.on("disconnect", () => {
  console.log("Simulator disconnected");
});
