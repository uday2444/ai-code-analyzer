"use client";

import React, { useRef, useState } from "react";

const Home = () => {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRepoURL, setRepoURL] = useState("");
  const inputFile = useRef();

  const handlefileUpload = () => {
    inputFile.current.click();
  };

  const analyzeCode = async () => {
    setLoading(true);
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  const analyzeFile = async () => {
    if (!file) {
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/analyze-file", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  const analyzeProject = async () => {
    const formData = new FormData();
    formData.append("file", file);

    if (!file) {
      return;
    }
    setLoading(true);

    const response = await fetch("/api/analyze-project", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  const analyzeRepoURL = async () => {
    if (!isRepoURL) {
      return;
    }
    setLoading(true);
    const response = await fetch("/api/analyze-github-repo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repoURL: isRepoURL,
      }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  const handleFunction = () => {
    if (code.trim()) {
      analyzeCode();
    } else if (file && file.name.endsWith(".zip")) {
      analyzeProject();
    } else if (file) {
      analyzeFile();
    } else if (isRepoURL) {
      analyzeRepoURL();
    }
  };
  return (
    <div style={{ padding: "40px" }}>
      <header>
        <h1>Paste your code to analyze</h1>
      </header>
      <section>
        <textarea
          rows="10"
          cols="80"
          placeholder="Paste your code here...."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <div>
          <input
            type="text"
            placeholder="Paste remote repo url"
            value={isRepoURL}
            onChange={(e) => setRepoURL(e.target.value)}
            width="100%"
          />
        </div>
        <div>
          <input
            type="file"
            accept=".js,.ts,.jsx,.tsx,.zip"
            onChange={(e) => setFile(e.target.files[0])}
            ref={inputFile}
            style={{ display: "none" }}
          />
          <button type="button" onClick={handlefileUpload}>
            {!file
              ? "Upload file or zip"
              : file.name.endsWith(".zip")
              ? "Project Uploaded"
              : "File Uploaded"}
          </button>
        </div>
        <div>
          <button onClick={handleFunction}>Analyze</button>
        </div>
      </section>
      <section>
        {loading ? (
          <div>Content Loading</div>
        ) : (
          <>
            {" "}
            <p>Result</p>
            <pre>{result.message}</pre>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
