import React, { useRef, useState, useEffect } from 'react';
import * as handpose from "@tensorflow-models/handpose";
import Webcam from 'react-webcam';
import './App.css';
import { drawHand } from './utilities';
import * as fp from "fingerpose";
import img1 from "../src/images_Ai/1.png";
import img2 from "../src/images_Ai/2.png";
import img3 from "../src/images_Ai/3.png";
import * as tf from "@tensorflow/tfjs";
function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const recognizedGestureRef = useRef(null);
  const randomComponentRef = useRef(null);

  const components = [img1, img2, img3];
  const [randomComponent, setRandomComponent] = useState("");
  const [recognizedGesture, setRecognizedGesture] = useState(null);
  const [isKeyboardPressed, setIsKeyboardPressed] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [chosenComponents, setChosenComponents] = useState([]);

  const handleKeyPress = () => {
    setIsKeyboardPressed(true);
  };

  const getRockGesture = () => {
    const RockGesture = new fp.GestureDescription('rock');
    RockGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
    RockGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 0.5);
    RockGesture.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0);
    RockGesture.addCurl(fp.Finger.Index, fp.FingerCurl.HalfCurl, 0.9);
    RockGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
    RockGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.HalfCurl, 0.9);
    RockGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
    RockGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.HalfCurl, 0.9);
    RockGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
    RockGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.HalfCurl, 0.9);
    return RockGesture;
  };

  const getPaperGesture = () => {
    const PaperGesture = new fp.GestureDescription('paper');
    for (let finger of fp.Finger.all) {
      PaperGesture.addCurl(finger, fp.FingerCurl.NoCurl, 1.0);
    }
    return PaperGesture;
  };

  const getScissorsGesture = () => {
    const ScissorsGesture = new fp.GestureDescription('scissors');
    ScissorsGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
    ScissorsGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
    ScissorsGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
    ScissorsGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.HalfCurl, 0.9);
    ScissorsGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
    ScissorsGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.HalfCurl, 0.9);
    return ScissorsGesture;
  };

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");

    setModelLoaded(true);

    const intervalId = setInterval(() => {
      detect(net);
    }, 500); // Reduce interval duration

    return () => clearInterval(intervalId); // Cleanup interval
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4 &&
      canvasRef.current !== null &&
      isKeyboardPressed
    ) {
      const video = webcamRef.current.video;
      const hands = await net.estimateHands(video);

      if (hands.length > 0) {
        const GE = new fp.GestureEstimator([
          getRockGesture(),
          getPaperGesture(),
          getScissorsGesture(),
        ]);
        const gesture = await GE.estimate(hands[0].landmarks, 8);

        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const currentGesture = gesture.gestures[0].name;

          if (currentGesture !== recognizedGestureRef.current) {
            setRecognizedGesture(currentGesture);
            recognizedGestureRef.current = currentGesture;
          }

          let uniqueIndex = Math.floor(Math.random() * components.length);
          setRandomComponent(components[uniqueIndex]);
          randomComponentRef.current = components[uniqueIndex];
          setChosenComponents([...chosenComponents, uniqueIndex]);

          console.log(`Detected gesture: ${currentGesture}`);
          console.log(`Random component: ${components[uniqueIndex]}`);
        }
      }

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        drawHand(hands, ctx);
      }
    }
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await handpose.load();
        console.log("Handpose model loaded locally.");
        runHandpose();
      } catch (error) {
        console.error("Error loading handpose model:", error);
      }
    };
    if (modelLoaded) {
      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      setTimeout(() => clearInterval(countdownInterval), 5000);
    } else {
      loadModel();
    }
  }, [modelLoaded, isKeyboardPressed]);

  return (
    <div className="container">
      <div className="left-panel">
        <div className="ai-frame">
          <img src={randomComponent} alt="Random Component" />
        </div>
      </div>
      <div className="middle-panel">
        <div className="countdown">{countdown}</div>
      </div>
      <div className="right-panel">
        <Webcam ref={webcamRef} className="webcam" />
        <canvas ref={canvasRef} className="canvas" />
      </div>
    </div>
  );
}

export default App;
