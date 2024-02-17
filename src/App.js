import React, { useRef } from 'react';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from 'react-webcam';
import './App.css';
import { drawHand } from './utilities';
import * as fp from "fingerpose";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const getRockGesture = () => {
    const RockGesture = new fp.GestureDescription('rock');
    RockGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
    RockGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.5);


    for (let finger of [fp.Finger.Index, fp.Finger.Middle, fp.Finger.Ring, fp.Finger.Pinky]) {
      RockGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
      RockGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.9);
    }

    return RockGesture;
  };

  const getPaperGesture = () => { 
    const PaperGesture = new fp.GestureDescription('paper');
    for(let finger of fp.Finger.all) {
      PaperGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
  }

    return PaperGesture;
  };

  const getScissorsGesture = () => {
    const ScissorsGesture = new fp.GestureDescription('scissors');
    ScissorsGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
ScissorsGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
  
// ring: curled
ScissorsGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
ScissorsGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.HalfCurl, 0.9);

// pinky: curled
ScissorsGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
ScissorsGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.HalfCurl, 0.9);

    return ScissorsGesture;
  };

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");

    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hand = await net.estimateHands(video);

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          getRockGesture(),
          getPaperGesture(),
          getScissorsGesture(),
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 8);

        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const recognizedGesture = gesture.gestures[0].name;
          console.log(`Recognized Gesture: ${recognizedGesture}`);
        }
      }

      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  runHandpose();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }} />

        <canvas ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }} />
      </header>
    </div>
  );
}

export default App;
