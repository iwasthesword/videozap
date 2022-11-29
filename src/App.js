import React, { useState, useRef } from "react";
import LogsContainer from "./LogsContainer"
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import "./App.css";

const Kb_TARGET = 131072;

function App() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [inputv, setInputv] = useState(null);
  const [message, setMessage] = useState("Select a file and click Convert to start");
  const [prog, setProg] = useState(null);
  const ffmpeg = createFFmpeg({
    log: true,
    progress: p => setProg(p.ratio*100)
  });
  const inputEl = useRef(null);
  const loadVideo = (file) =>
    new Promise((resolve, reject) => {
      try {
        let video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = function () {
          resolve(this);
        };

        video.onerror = function () {
          reject("Invalid video. Please select a video file.");
        };

        video.src = window.URL.createObjectURL(file);
      } catch (e) {
        reject(e);
      }
    });
  const doTranscode = async () => {
    let {
      current: { files },
    } = inputEl;
    const { name } = files[0];
    const dvideo = await loadVideo(files[0]);
    const duration = dvideo.duration;
    let TOTAL_TARGET = Math.floor((Kb_TARGET / duration) * 0.97);
    let BR_AUDIO = Math.min(Math.floor(TOTAL_TARGET * (1 / 3)), 128);
    let BR_VIDEO = Math.floor(TOTAL_TARGET - BR_AUDIO);
    let audio = BR_AUDIO + "k";
    let video = BR_VIDEO + "k";
    let scale = "";

    if (dvideo.videoWidth >= dvideo.videoHeight) {
      scale = "640:-1";
    }
    else {
      scale = "-1:640";
    }

    setMessage("Loading ffmpeg-core.js");
    await ffmpeg.load();
    setVideoSrc(null);
    setMessage("Converting...");
    ffmpeg.FS("writeFile", name, await fetchFile(files[0]));
    await ffmpeg.run(
      "-y",
      "-i",
      name,
      "-c:v",
      "libx264",
      "-b:v",
      video,
      "-b:a",
      audio,
      "-maxrate",
      video,
      "-vf",
      "scale="+scale,
      "convert.mp4"
    );
    setMessage("Conversion completed. Right-click the video and choose 'Save video as...'.");
    const data = ffmpeg.FS("readFile", "convert.mp4");
    setVideoSrc(
      URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }))
    );
  };
  function isThereFile({ target: { files } }) {
    if (files.length > 0) {
      setInputv(true);
      setVideoSrc(null);
      setProg(null);
    }
    else {
      setInputv(null);
    }
    //console.log(files);
  }
  return (
    <div className="App">
      <p />
      <input type="file" id="uploader" ref={inputEl} onChange={isThereFile} disabled={prog > 0 && prog < 100}></input>
      <button onClick={doTranscode} disabled={inputv==null || (prog > 0 && prog < 100)}>Convert</button>
      <br />
      <video src={videoSrc} controls style={{display: videoSrc != null? "initial": "none"}}></video>
      <br />
      <p>{message}</p>
      <br />
      {prog?<p>{prog.toFixed(0)}%</p>:null}
      <LogsContainer />
    </div>
  );
}

export default App;
