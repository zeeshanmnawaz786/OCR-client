import React, { useState, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import "filepond/dist/filepond.min.css";

registerPlugin(FilePondPluginImagePreview);

const App = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [pctg, setPctg] = useState("0.00");
  const pondRef = useRef(null);
  const workerRef = useRef(null);

  const doOCR = async (file) => {
    setIsProcessing(true);
    setOcrText("");
    setPctg("0.00");

    await workerRef.current.load();
    await workerRef.current.loadLanguage("eng");
    await workerRef.current.initialize("eng");

    const {
      data: { text },
    } = await workerRef.current.recognize(file.file);

    setIsProcessing(false);
    setOcrText(text);
  };

  const classifyText = (word) => {
    // This logic attempts to classify based on common name patterns
    const normalizedWord = word.toLowerCase();

    // if (normalizedWord === "john" || normalizedWord === "jane") {
    if (normalizedWord === "kareem") {
      console.log(
        "🚀 ~ file: App.js:37 ~ classifyText ~ normalizedWord:",
        normalizedWord
      );
      return "person-name";
    } else {
      return "other";
    }
  };

  const classifyWords = (text) => {
    const words = text.split(/\s+/); // Split by any whitespace
    const classifiedWords = words.map((word, index) => (
      <span key={index} className={classifyText(word)}>
        {word + " "}
      </span>
    ));
    return classifiedWords;
  };

  const updateProgressAndLog = (m) => {
    const MAX_PERCENTAGE = 1;
    const DECIMAL_COUNT = 2;

    if (m.status === "recognizing text") {
      const pctg = (m.progress / MAX_PERCENTAGE) * 100;
      setPctg(pctg.toFixed(DECIMAL_COUNT));
    }
  };

  useEffect(() => {
    workerRef.current = createWorker({
      logger: (m) => updateProgressAndLog(m),
    });
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div style={{ marginTop: "10%" }} className="row">
          <div className="col-md-4"></div>
          <div className="col-md-4">
            <FilePond
              ref={pondRef}
              onaddfile={(err, file) => {
                doOCR(file);
              }}
              onremovefile={(err, file) => {
                setOcrText("");
              }}
            />
          </div>
          <div className="col-md-4"></div>
        </div>
        <div className="card">
          <h5 className="card-header">
            <div style={{ margin: "1%", textAlign: "left" }} className="row">
              <div className="col-md-12">
                <i
                  className={`fas fa-sync fa-2x ${
                    isProcessing ? "fa-spin" : ""
                  }`}
                ></i>{" "}
                <span className="status-text">
                  {isProcessing
                    ? `Processing Image (${pctg} %)`
                    : "Parsed Text"}
                </span>
              </div>
            </div>
          </h5>
          <div className="card-body">
            <p className="card-text">
              {isProcessing ? (
                "..........."
              ) : ocrText.length === 0 ? (
                "No Valid Text Found / Upload Image to Parse Text From Image"
              ) : (
                <span>{classifyWords(ocrText)}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
