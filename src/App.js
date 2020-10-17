import React, { Component } from "react";
import "./App.css";
import * as faceapi from "face-api.js";
import WebCamPicture from "./components/WebCamPicture.js";
import axios from "axios";
import swal from "sweetalert";
import Modal from "react-modal";
import ImageUploader from "react-images-upload";
import Close from "./images/close.png";
const MODEL_URL = "models";
const minConfidence = 0.6;

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: 600,
  },
};

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root");

const subtitle = {
  style: {},
};
export default class App extends Component {
  constructor(props) {
    super(props);
    this.fullFaceDescriptions = null;
    this.canvas = React.createRef();
    this.canvasPicWebCam = React.createRef();
    this.state = {
      modalIsOpen: false,
      pictures: [],
      name: "",
      loading: false,
      image: "",
    };
    this.onDrop = this.onDrop.bind(this);
    this.nameChange = this.nameChange.bind(this);
    this.upload = this.upload.bind(this);
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
    console.log(picture);
    let img = picture.split(",")[1];
    this.setState({
      image: img,
    });
    image.src = picture;
  };

  convertCanvasToImage = (canvas) => {
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    return image;
  };

  predict = () => {
    console.log(this.canvasPicWebCam);
    // let img = this.convertCanvasToImage(this.canvasPicWebCam.current);
    // console.log(img.src);
    // console.log(img, "imgge");
    let data = new FormData();
    // img = img.src.split(",")[1];
    // console.log(img);
    console.log(this.state.image);
    data.append("predict_file", this.state.image);

    axios
      .post(`http://0.0.0.0:5000/predict`, data, {
        headers: {
          "content-type": "multipart/form-data",
          Authorization:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoidXNlciIsInBhc3MiOiJwYXNzd29yZCJ9.KrmQH1gT5pE-kd8wYhgXDkQMp1gah6sDu79ns9Ml9pg",
          "Access-Control-Allow-Origin": "*",
        },
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

  upload() {
    let data = new FormData();
    data.append("Image", this.state.pictures[0]);
    data.append("user_name", this.state.name);
    this.setState({ loading: true });
    console.log(this.state.pictures[0], "Pictures [0]");
    axios
      .post(`http://0.0.0.0:5000/upload_Image`, data, {
        headers: {
          "content-type": "multipart/form-data",
          Authorization:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoidXNlciIsInBhc3MiOiJwYXNzd29yZCJ9.KrmQH1gT5pE-kd8wYhgXDkQMp1gah6sDu79ns9Ml9pg",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        console.log(res.data);
        swal({
          title: "Success",
          text: "image uploaded succssfully",
          icon: "success",
          dangerMode: false,
        });
        this.closeModal();
        this.setState({ loading: false });
      })
      .catch((err) => {
        console.log(err);
        swal({
          title: "Error",
          text: "error in uploading image",
          icon: "error",
          dangerMode: true,
        });
        this.setState({ loading: false });
      });
  }

  openModal = () => {
    this.setState({
      modalIsOpen: true,
    });
  };

  afterOpenModal = () => {
    // references are now sync'd and can be accessed.
    subtitle.style.color = "#000000a1";
  };

  closeModal = () => {
    this.setState({
      modalIsOpen: false,
      pictures: [],
      name: "",
    });
  };

  onDrop(picture) {
    this.setState({
      pictures: picture,
    });
  }

  nameChange(e) {
    this.setState({ name: e.target.value });
  }

  render() {
    return (
      <div className="App">
        <div className="navbar">
          <div className="heading">
            <p>Facial Recognition App</p>
          </div>
          <div className="upload">
            <button onClick={this.openModal}>Upload</button>
            <Modal
              isOpen={this.state.modalIsOpen}
              onAfterOpen={this.afterOpenModal}
              onRequestClose={this.closeModal}
              style={customStyles}
              contentLabel="Example Modal"
            >
              <h2 ref={(_subtitle) => (this.subtitle = _subtitle)}>
                Select an image to upload
              </h2>
              <ImageUploader
                withIcon={true}
                buttonText={
                  this.state.pictures[0] && this.state.pictures[0].name
                    ? this.state.pictures[0].name
                    : "Choose an image"
                }
                onChange={this.onDrop}
                imgExtension={[".jpg", ".png"]}
                maxFileSize={5242880}
              />
              <input
                type="text"
                placeholder="Enter name"
                onChange={this.nameChange}
                value={this.state.name}
                className="name-input"
              />
              <button className="closeButton" onClick={this.closeModal}>
                <img src={Close} alt="" />
              </button>
              <div className="upload-cont">
                <button
                  disabled={
                    !this.state.name ||
                    !this.state.pictures.length ||
                    this.state.loading
                  }
                  className="uploadButton"
                  onClick={this.upload}
                >
                  Upload
                </button>
              </div>
            </Modal>
          </div>
        </div>
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
