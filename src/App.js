import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHand } from "./utilities";
import rock from "../src/images_Ai/rock.png";
import paper from "../src/images_Ai/paper.png";
import scissor from "../src/images_Ai/scissors.png";

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [started, setStarted] = useState(false); // State to track if the game has started
  const [winner, setWinner] = useState(null); // State to track the winner

  useEffect(() => {
    const handleKeyPress = (event) => {
      setStarted(true); // Set started to true when any key is pressed
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (started) {
      const runHandpose = async () => {
        const net = await handpose.load();
        console.log("Handpose model loaded.");

        // Detection loop
        const intervalId = setInterval(() => {
          detect(net);
        }, 100);

        return () => clearInterval(intervalId);
      };

      runHandpose();
    }
  }, [started]);

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video dimensions
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas dimensions
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make detections
      const hand = await net.estimateHands(video);
      console.log(hand);

      if (hand.length > 0) {
        const fingers = hand[0].landmarks;
        const thumbTip = fingers[4];
        const indexTip = fingers[8];
        const middleTip = fingers[12];
        const ringTip = fingers[16];
        const pinkyTip = fingers[20];

        // Check if thumb, index, and middle fingers are up
        if (
          thumbTip[1] < indexTip[1] &&
          thumbTip[1] < middleTip[1] &&
          thumbTip[1] < ringTip[1] &&
          thumbTip[1] < pinkyTip[1]
        ) {
          setGesture("rock");
        } else if (
          thumbTip[1] > indexTip[1] &&
          thumbTip[1] > middleTip[1] &&
          thumbTip[1] > ringTip[1] &&
          thumbTip[1] > pinkyTip[1]
        ) {
          setGesture("paper");
        } else {
          setGesture("scissors");
        }
      }
    }
  };

  const generateComputerChoice = () => {
    const choices = [rock, paper, scissor];
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
  };

  useEffect(() => {
    if (gesture) {
      const computerChoice = generateComputerChoice();
      setComputerChoice(computerChoice);

      // Determine the winner
      if (
        (gesture === "rock" && computerChoice === scissor) ||
        (gesture === "paper" && computerChoice === rock) ||
        
      
        (gesture === "scissors" && computerChoice === paper)
      ) {
        setWinner("Player");
      } else if (
        (computerChoice === "rock" && gesture === scissor) ||
        (computerChoice === "paper" && gesture === rock) ||
        (gesture === "paper" && computerChoice === scissor)||
        (gesture === "rock" && computerChoice === paper)||
        (computerChoice === "scissors" && gesture === paper)
      ) {
        setWinner("Computer");
      } else {
        setWinner("no one");
      }
    }
  }, [gesture]);

  return (
    <div>
      {!started && <p>Press any key to start the game</p>}
      {started && (
        <>
          <Webcam
            ref={webcamRef}
            mirrored={true}
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
            }}
          />
          <canvas
            ref={canvasRef}
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
            }}
          />
          {gesture && (
            <div>
              <p>Your gesture: {gesture}</p>
              {computerChoice && <p>Computer choice: <img src={computerChoice}></img></p>}
              
              {winner && <p>{winner} wins!</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
