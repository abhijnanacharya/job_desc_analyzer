// For App Router: app/api/analyze-jd/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or another appropriate model
      messages: [
        {
          role: "system",
          content:
            "You are a recruitment expert. Create effective boolean search strings from job descriptions that recruiters can use on platforms like LinkedIn, Indeed, etc. Format your response as plain text boolean strings only.",
        },
        {
          role: "user",
          content: `Generate boolean search strings for this job description: ${jobDescription}`,
        },
      ],
      temperature: 0.7,
    });

    const booleanStrings = completion.choices[0].message.content;

    return NextResponse.json({ booleanStrings });
  } catch (error) {
    console.error("Error processing OpenAI request:", error);
    return NextResponse.json(
      { error: "Error processing your request" },
      { status: 500 }
    );
  }
}
