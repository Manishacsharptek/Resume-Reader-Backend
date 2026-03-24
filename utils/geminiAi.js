import { GoogleGenerativeAI } from "@google/generative-ai";

export const getGeminiSuggestions = async (resumeText) => {
    const wordCount = resumeText ? resumeText.trim().split(/\s+/).length : 0;

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing Gemini API Key");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an expert HR Manager and Resume Strategist with 20 years of experience.
Analyze the following resume text and provide 4-5 high-impact, actionable suggestions to make it more effective and likely to be chosen by a recruiter.

Focus on:
1. Impact and Quantifiable Results (e.g. "Increased sales by 30%").
2. ATS Optimization - suggest specific missing keywords.
3. Resume Summary/Objective - how to make it stand out.
4. Action Verbs - replace weak verbs with powerful ones.
5. Structure and Readability - any layout improvements.

Format the response STRICTLY as a JSON array of objects with exactly these keys:
- "title": A short catchy title (5 words max).
- "suggestion": A specific, actionable 1-2 sentence explanation.
- "impact": Exactly one of: "High", "Medium", or "Small".

Resume Text:
${resumeText}

Respond ONLY with the raw JSON array. No markdown, no backticks, no extra text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();

        const parsed = JSON.parse(cleanedText);
        if (!Array.isArray(parsed)) throw new Error("Gemini response was not an array");

        return { suggestions: parsed, isLive: true, wordCount };

    } catch (error) {
        console.error("Gemini AI Error:", error.message || error);
        return {
            isLive: false,
            wordCount,
            suggestions: [
                {
                    title: "Quantify Your Achievements",
                    suggestion: "Add specific numbers to your work experience — e.g. 'Increased sales by 35%' or 'Reduced load time by 200ms'. Recruiters scan for measurable impact.",
                    impact: "High"
                },
                {
                    title: "Optimize for ATS Keywords",
                    suggestion: "Include industry-specific keywords from the job description in your skills and experience sections. Many companies filter resumes automatically before a human reads them.",
                    impact: "High"
                },
                {
                    title: "Strengthen Your Summary",
                    suggestion: "Your career objective should be a 2-3 line punchy summary tailored to the role. Lead with your strongest skill and years of experience.",
                    impact: "Medium"
                },
                {
                    title: "Use Power Action Verbs",
                    suggestion: "Replace weak phrases like 'worked on' or 'helped with' with strong verbs like 'Engineered', 'Spearheaded', 'Delivered', or 'Optimized' to instantly impress recruiters.",
                    impact: "Medium"
                }
            ]
        };
    }
};
