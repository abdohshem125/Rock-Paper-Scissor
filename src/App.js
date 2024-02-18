import React, { useRef, useState, useEffect } from 'react';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from 'react-webcam';
import './App.css';
import { drawHand } from './utilities';
import * as fp from "fingerpose";
import img1 from "../src/images_Ai/1.png"
import img2 from "../src/images_Ai/2.png"
import img3 from "../src/images_Ai/3.png"


// const imageUrls = [
//   '',
//   'url_to_image_2',
//   'url_to_image_3',
// ];


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const components = [img1, img2, img3];
  const [randomComponent, setRandomComponent] = useState("");
  const printRandomComponent = () => {
    const randomIndex = Math.floor(Math.random() * components.length);
    const selectedComponent = components[randomIndex];
    setRandomComponent(selectedComponent);
  }


  const [recognizedGesture, setRecognizedGesture] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [waitingForInput, setWaitingForInput] = useState(false);


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
    for (let finger of fp.Finger.all) {
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

      if (hand.length > 0 && !waitingForInput) {
        const GE = new fp.GestureEstimator([
          getRockGesture(),
          getPaperGesture(),
          getScissorsGesture(),
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 8);

        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // const recognizedGesture = gesture.gestures[0].name;

          if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
            const recognizedGesture = gesture.gestures[0].name;
            setRecognizedGesture(recognizedGesture);
            setWaitingForInput(true); // Set to true to wait for 's' input again
            // console.log(`Recognized Gesture: ${recognizedGesture}`);
          }
        }
      }


      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 's' || event.key === 'S') {
        // Start the countdown when 'S' is pressed
        setCountdown(0);
        setRecognizedGesture(null); // Reset recognizedGesture
        setWaitingForInput(false); // Allow new gesture recognition
        const timer = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown + 1);
        }, 1000);

        // Clear the interval after 3 seconds
        setTimeout(() => {
          clearInterval(timer);
        }, 3000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [waitingForInput]);
  
  useEffect(() => {
    if (countdown === 3) {
      console.log(`Recognized Gesture: ${recognizedGesture}`);
      printRandomComponent();
    }
  }, [countdown, recognizedGesture]);

  runHandpose();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 725,
            right: 0,
            top: 150,
            textAlign: "center",
            zIndex: 9,
            width: 410,
            height: 500,
          }} />

        <canvas ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 725,
            right: 0,
            top: 150,
            textAlign: "center",
            zIndex: 9,
            width: 410,
            height: 500,
          }} />
        <div
          style={{
            position: "absolute",
            top: "57%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: 70,
          }}
        >
          {countdown}
        </div>
        <div
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: -900,
            right: 0,
            top: 130,
            textAlign: "center",
            zIndex: 9,
            width: 100,
            // height: 200,
          }}
        >
          <img src={randomComponent} /> 
        </div>
      </header>
    </div>
  );
}

export default App;