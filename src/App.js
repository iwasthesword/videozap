import React, { useState, useRef } from "react";
import LogsContainer from "./LogsContainer";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";
import Button from "react-bootstrap/Button";

const Kb_TARGET = 131072;

function App() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [inputv, setInputv] = useState(null);
  const [message, setMessage] = useState(
    "Select a file and click Convert to start"
  );
  const [prog, setProg] = useState(null);
  const ffmpeg = createFFmpeg({
    log: true,
    progress: (p) => setProg(p.ratio * 100),
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
    setVideoSrc(null);
    setProg(null);
    let {
      current: { files },
    } = inputEl;
    const { name } = files[0];
    const dvideo = await loadVideo(files[0]);
    const duration = dvideo.duration;
    let TOTAL_TARGET = Math.floor((Kb_TARGET / duration) * 0.95);
    let BR_AUDIO = Math.min(Math.floor(TOTAL_TARGET * (1 / 3)), 128);
    let BR_VIDEO = Math.floor(TOTAL_TARGET - BR_AUDIO);
    let audio = BR_AUDIO + "k";
    let video = BR_VIDEO + "k";
    let scale = "";

    if (dvideo.videoWidth >= dvideo.videoHeight) {
      scale = "640:-1";
    } else {
      scale = "-1:640";
    }

    setMessage("Loading ffmpeg-core.js");
    await ffmpeg.load();
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
      "scale=" + scale,
      "convert.mp4"
    );
    setMessage(
      "Conversion completed. Right-click the video and choose 'Save video as...'."
    );
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
    } else {
      setInputv(null);
    }
  }
  return (
    <div className="App my-3">
      <Container>
        <Row>
          <Col md={12} lg={6}>
            <h3 className="text-center">Input</h3>
            <Card>
              <Card.Body>
                <input
                  type="file"
                  id="uploader"
                  className="mb-3 w-100 bg-light"
                  ref={inputEl}
                  onChange={isThereFile}
                  disabled={prog > 0 && prog < 100}
                ></input>
                <Button
                  variant="success"
                  className="w-100"
                  onClick={doTranscode}
                  disabled={inputv == null || (prog > 0 && prog < 100)}
                >
                  Convert
                </Button>
                <Card className="my-3 bg-dark text-light">
                  <Card.Body>{message}</Card.Body>
                </Card>
                <ProgressBar
                  className="mb-3"
                  variant="success"
                  animated
                  now={prog ? prog : 0}
                  label={`${prog ? prog.toFixed(0) : 0}%`}
                />
                <video
                  src={videoSrc}
                  className="w-100"
                  controls
                  style={{ display: videoSrc != null ? "initial" : "none" }}
                ></video>
              </Card.Body>
            </Card>
          </Col>
          <Col md={12} lg={6}>
            <h3 className="text-center">Console</h3>
            <Card>
              <Card.Body>
                <LogsContainer />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
