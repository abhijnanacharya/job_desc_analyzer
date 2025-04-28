"use client";
import JDUploader from "@/components/jduploader";
import React, { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [relevancyResults, setRelevancyResults] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [booleanStrings, setBooleanStrings] = useState<string>("");

  // This function will be passed to JDUploader component to receive boolean strings
  const handleBooleanStringsUpdate = (strings: string) => {
    setBooleanStrings(strings);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError("");
    } else {
      setFile(null);
      setFileName("");
      setError("Please select a valid PDF file");
    }
  };

  const analyzeRelevancy = async () => {
    if (!file) {
      setError("Please upload a PDF file first");
      return;
    }

    if (!booleanStrings) {
      setError(
        "Please analyze a job description first to generate boolean strings"
      );
      return;
    }

    setIsAnalyzing(true);
    setError("");

    // Create form data for file upload
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("booleanStrings", booleanStrings);

    try {
      const response = await fetch("/api/analyze-relevancy", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setRelevancyResults(data);
    } catch (err) {
      console.error("Error analyzing relevancy:", err);
      setError("Failed to analyze resume relevancy. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-950 text-gray-200">
      <header className="w-full text-center">
        <h1 className="text-4xl font-bold text-blue-400">Am I Relevant?</h1>
      </header>

      <main className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - JD Uploader with onAnalysisResult prop */}
        <div className="w-full flex justify-center">
          <JDUploader onAnalysisResult={handleBooleanStringsUpdate} />
        </div>

        {/* Middle Column - PDF Upload */}
        <div className="w-full flex flex-col items-center p-6 bg-gray-900 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-100">
            Resume Upload
          </h2>

          <div className="w-full mb-6">
            <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800 hover:bg-gray-800/70 transition-all cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                id="pdf-upload"
                onChange={handleFileChange}
              />
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
              >
                <svg
                  className="w-10 h-10 mb-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">PDF only</p>
              </label>
            </div>

            {fileName && (
              <div className="mt-2 p-2 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate">
                  {fileName}
                </span>
                <button
                  onClick={() => {
                    setFile(null);
                    setFileName("");
                  }}
                  className="text-gray-500 hover:text-red-400"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            )}

            {error && (
              <div className="mt-2 p-2 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>

          <button
            className="w-full bg-blue-600 text-gray-100 font-medium py-3 px-6 rounded-lg hover:bg-blue-500 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-500 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={analyzeRelevancy}
            disabled={!file || isAnalyzing || !booleanStrings}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              "Check Relevancy"
            )}
          </button>

          {booleanStrings ? (
            <div className="mt-4 p-2 bg-blue-900/20 border border-blue-800 rounded-lg text-blue-300 text-xs">
              Boolean strings generated and ready for comparison
            </div>
          ) : (
            <div className="mt-4 p-2 bg-yellow-900/20 border border-yellow-800 rounded-lg text-yellow-300 text-xs">
              Please analyze a job description first to generate boolean strings
            </div>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="w-full flex flex-col p-6 bg-gray-900 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-100">
            Relevancy Results
          </h2>

          {!relevancyResults ? (
            <div className="flex flex-col items-center justify-center flex-grow text-gray-500 text-center">
              <svg
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <p>
                Upload a resume and analyze job description to see relevancy
                results
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {/* Relevancy Score */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-gray-200">
                  Relevancy Score
                </h3>
                <div className="relative h-32 w-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-700"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-blue-500"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 40 * (1 - relevancyResults.score / 100)
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
                    {relevancyResults.score}%
                  </div>
                </div>
              </div>

              {/* Keywords Present */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-md font-medium mb-2 text-green-400">
                  Keywords Present
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relevancyResults.presentKeywords?.map(
                    (keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded-md border border-green-800"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Keywords Missing */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-md font-medium mb-2 text-red-400">
                  Keywords Missing
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relevancyResults.missingKeywords?.map(
                    (keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded-md border border-red-800"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full text-center text-gray-500 text-sm">
        © 2025 Made with ❤️ by{" "}
        <a
          href="https://www.linkedin.com/in/abhijnanacharya"
          className="text-blue-400 hover:text-blue-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abhijnan Acharya
        </a>
      </footer>
    </div>
  );
}
