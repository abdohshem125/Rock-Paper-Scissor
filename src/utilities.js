// Points for fingers
const fingerJoints = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
  };
  
  // Infinity Gauntlet Style
  const style = {
    0: { color: "yellow", size: 10 },
    1: { color: "gold", size: 3 },
    2: { color: "green", size: 6 },
    3: { color: "gold", size: 3 },
    4: { color: "gold", size: 3 },
    5: { color: "purple", size: 6 },
    6: { color: "gold", size: 3 },
    7: { color: "gold", size: 3 },
    8: { color: "gold", size: 3 },
    9: { color: "blue", size: 6 },
    10: { color: "gold", size: 3 },
    11: { color: "gold", size: 3 },
    12: { color: "gold", size: 3 },
    13: { color: "red", size: 6 },
    14: { color: "gold", size: 3 },
    15: { color: "gold", size: 3 },
    16: { color: "gold", size: 3 },
    17: { color: "orange", size: 6 },
    18: { color: "gold", size: 3 },
    19: { color: "gold", size: 3 },
    20: { color: "gold", size: 3 },
  };
  
  // Drawing function
  export const drawHand = (predictions, ctx) => {
    // Check if we have predictions
    if (predictions.length > 0) {
      // Loop through each prediction
      predictions.forEach((prediction) => {
        // Grab landmarks
        const landmarks = prediction.landmarks;
  
        // Loop through fingers
        for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
          let finger = Object.keys(fingerJoints)[j];
          //  Loop through pairs of joints
          for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
            // Get pairs of joints
            const firstJointIndex = fingerJoints[finger][k];
            const secondJointIndex = fingerJoints[finger][k + 1];
  
            // Draw path
            ctx.beginPath();
            ctx.moveTo(
              landmarks[firstJointIndex][0],
              landmarks[firstJointIndex][1]
            );
            ctx.lineTo(
              landmarks[secondJointIndex][0],
              landmarks[secondJointIndex][1]
            );
            ctx.strokeStyle = "gold";
            ctx.lineWidth = 6;
            ctx.linehieght = 2;
            ctx.stroke();
          }
        }
  
        // Loop through landmarks and draw em
        for (let i = 0; i < landmarks.length; i++) {
          // Get x point
          const x = landmarks[i][0];
          // Get y point
          const y = landmarks[i][1];
          // Start drawing
          ctx.beginPath();
          ctx.arc(x, y, style[i]["size"], 0, 3 * Math.PI);
  
          // Set line color
          ctx.fillStyle = style[i]["color"];
          ctx.fill();
        }
      });
    }
  };