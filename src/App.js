import React, { Component } from "react";
import "./App.css";
import * as faceapi from "face-api.js";
import WebCamPicture from "./components/WebCamPicture.js";
import axios from "axios";
import swal from "sweetalert";
const MODEL_URL = "models";
const minConfidence = 0.6;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.fullFaceDescriptions = null;
    this.canvas = React.createRef();
    this.canvasPicWebCam = React.createRef();
  }

  componentDidMount() {
    // await faceapi.nets.ssdMobilenet.load("/models");
    faceapi.loadMtcnnModel(MODEL_URL);
    // // await faceapi.l(MODEL_URL);
    // console.log(faceapi.loadFaceDetectionModel(MODEL_URL));
    // console.log(await faceapi.loadFaceDetectionModel(MODEL_URL));
    console.log(faceapi.loadFaceDetectionModel(MODEL_URL));
    faceapi.loadFaceDetectionModel(MODEL_URL);
    faceapi.loadFaceLandmarkModel(MODEL_URL);
    faceapi.loadFaceRecognitionModel(MODEL_URL);
    //  this.loadModels();
    // const testImageHTML = document.getElementById("test");
    // this.drawHTMLImage(this.canvas.current, testImageHTML, 296, 296);
    // await this.getFullFaceDescription(this.canvas.current);
    // this.drawDescription(this.canvas.current);
  }

  // async loadModels() {
  //   console.log(faceapi.nets);
  //   //await faceapi.loadModels(MODEL_URL)
  //   // await faceapi.nets.faceLandmark68Net.loadFromURI(MODEL_URL)
  //   await faceapi.nets.ssdMobilenet.load("/models");
  //   await faceapi.loadMtcnnModel(MODEL_URL);
  //   // await faceapi.l(MODEL_URL);
  //   console.log(faceapi.loadFaceDetectionModel(MODEL_URL));
  //   console.log(await faceapi.loadFaceDetectionModel(MODEL_URL));

  //   await faceapi.loadFaceDetectionModel(MODEL_URL);
  //   await faceapi.loadFaceLandmarkModel(MODEL_URL);
  //   await faceapi.loadFaceRecognitionModel(MODEL_URL);
  // }

  getFullFaceDescription = async (canvas) => {
    console.log(canvas);
    this.fullFaceDescriptions = await faceapi.allFaces(canvas, minConfidence);
  };

  drawDescription = (canvas) => {
    this.fullFaceDescriptions.forEach((fd, i) => {
      faceapi.drawLandmarks(canvas, fd.landmarks, { drawLines: false });
      faceapi.drawDetection(canvas, fd.detection, { drawLines: true });
    });
    // console.log(this.fullFaceDescriptions[0]._detection._score);
    if (this.fullFaceDescriptions[0]) {
      if (this.fullFaceDescriptions[0]._detection._score > 0.79) {
        this.predict();
      } else {
        swal({
          title: "Face detection accuray is lower than 80%",
          text: "Try not to shake your face and make it still, we like you.",
          icon: "error",
          dangerMode: true,
        });
      }
    } else {
      swal({
        title: "Face not detected",
        text: "Try not to shake your face and make it still, we like you.",
        icon: "error",
        dangerMode: true,
      });
    }
  };

  // drawHTMLImage(canvas, image, width, height) {
  //   const ctx = canvas.getContext("2d");
  //   ctx.drawImage(image, 0, 0, width, height);
  // }

  landmarkWebCamPicture = (picture) => {
    const ctx = this.canvasPicWebCam.current.getContext("2d");
    var image = new Image();
    image.onload = async () => {
      ctx.drawImage(image, 0, 0);
      await this.getFullFaceDescription(this.canvasPicWebCam.current);
      this.drawDescription(this.canvasPicWebCam.current);
    };
    console.log(image);
    image.src = picture;
  };

  convertCanvasToImage = (canvas) => {
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    return image;
  };

  predict = () => {
    console.log(this.canvasPicWebCam);
    let img = this.convertCanvasToImage(this.canvasPicWebCam.current);
    console.log(img.src);
    let data = new FormData();
    img = img.src.split(",")[1];
    console.log(img);
    data.append("predict_file", img);

    axios
      .post(`http://3.133.7.77:8080/predict`, data, {
        headers: { "content-type": "multipart/form-data" },
      })
      .then((res) => {
        console.log(res.data);
        swal({
          title: res.data,
          text: "You're looking good today",
          icon: "success",
          dangerMode: false,
        });
      })
      .catch((err) => {
        console.log(err);
        swal({
          title: "You're not being recognised",
          text:
            "Try to maintain half meter distance from the camera, Good lighting, still face and camera should be in front of you",
          icon: "error",
          dangerMode: true,
        });
      });
  };

  render() {
    return (
      <div className="App">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 100,
          }}
        >
          {/* <img id="test" src={testImage} alt="test" />
          <canvas ref={this.canvas} width={296} height={296} /> */}
        </div>
        <WebCamPicture landmarkPicture={this.landmarkWebCamPicture} />
        <canvas ref={this.canvasPicWebCam} width={350} height={350} />
        <br />
        {/* <img
          src="/img/predict.png"
          alt="Take Pic"
          height={100}
          onClick={this.predict}
        /> */}
      </div>
    );
  }
}
