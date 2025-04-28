import { NextResponse } from "next/server";
import OpenAI from "openai";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File;
    const booleanStrings = formData.get("booleanStrings") as string;

    if (!pdfFile || !booleanStrings) {
      return NextResponse.json(
        { error: "PDF file and boolean strings are required" },
        { status: 400 }
      );
    }

    // Convert File to Blob and load PDF
    const blob = new Blob([await pdfFile.arrayBuffer()], {
      type: pdfFile.type,
    });
    const loader = new WebPDFLoader(blob);
    const docs = await loader.load();
    const pdfText = docs.map((doc) => doc.pageContent).join(" ");

    // OpenAI analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a resume analysis expert. Compare a resume against boolean search strings and provide a relevancy score, present keywords, and missing keywords.",
        },
        {
          role: "user",
          content: `Boolean strings: ${booleanStrings}\n\nResume text: ${pdfText}\n\nAnalyze the resume against these boolean strings. Return a JSON object with: { "score": number from 0-100, "presentKeywords": array of strings, "missingKeywords": array of strings }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return NextResponse.json(
      JSON.parse(completion.choices[0].message.content || "{}")
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error processing your request" },
      { status: 500 }
    );
  }
}
