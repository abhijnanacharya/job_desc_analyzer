"use client";

import React, { useState } from "react";

type Props = {
  onAnalysisResult?: (result: string) => void;
};

const JDUploader = ({ onAnalysisResult }: Props) => {
  const [inputText, setInputText] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const analyzeWithOpenAI = async (jobDescription: string) => {
    try {
      const response = await fetch("/api/analyze_jd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data.booleanStrings;
    } catch (err) {
      console.error("Error analyzing job description:", err);
      throw err;
    }
  };

  const handleAnalyze = async () => {
    // Clear previous results and errors
    setError("");

    // Prevent analysis if there's no text
    if (!inputText.trim()) {
      setAnalysisResult("Please enter text to analyze");
      return;
    }

    setIsAnalyzing(true);

    try {
      const booleanStrings = await analyzeWithOpenAI(inputText);
      setAnalysisResult(booleanStrings);

      // Pass the result back to the parent component
      if (onAnalysisResult) {
        onAnalysisResult(booleanStrings);
      }
    } catch (err) {
      setError("Failed to analyze job description. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md p-6 bg-gray-900 rounded-xl shadow-xl border border-gray-800">
      <h2 className="text-xl font-bold mb-4 text-gray-100">JD Analyzer</h2>

      <textarea
        className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg mb-5 h-48 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
        placeholder="Paste job description text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button
        className="bg-blue-600 text-gray-100 font-medium py-3 px-6 rounded-lg hover:bg-blue-500 transition-all duration-300 mb-5 disabled:bg-gray-700 disabled:text-gray-500 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
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
          "Analyze"
        )}
      </button>

      {error && (
        <div className="mb-5 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {analysisResult && (
        <div className="mt-2 p-5 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-medium mb-3 text-blue-400">
            Boolean Search Strings:
          </h3>
          <div className="whitespace-pre-line text-gray-300">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
};

export default JDUploader;
