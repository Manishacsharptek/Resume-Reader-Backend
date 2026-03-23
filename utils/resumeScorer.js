export const scoreResumeText = (text) => {
    let score = 100;
    const fixes = [];
    const goods = [];

    // Safety check
    if (!text || typeof text !== 'string') {
        text = "";
    }

    // Length check
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    if (wordCount < 200) {
        score -= 15;
        fixes.push({
            title: "Resume is too short",
            description: `We only found ${wordCount} words. Aim for at least 300-400 words to adequately describe your experience.`,
            category: "DEPTH",
            icon: "length"
        });
    } else if (wordCount > 1000) {
        score -= 10;
        fixes.push({
            title: "Resume is too long",
            description: `We found ${wordCount} words. Try keeping it under 800 words to respect recruiter time constraints.`,
            category: "BREVITY",
            icon: "length"
        });
    } else {
        goods.push({
            title: "Ideal Length",
            description: `Your resume is ${wordCount} words, which is within the ideal range.`
        });
    }

    // Impact / Quantifiable Metrics check
    const numberMatches = text.match(/\b\d{1,3}(,\d{3})*(\.\d+)?%?\b/g);
    const numCount = numberMatches ? numberMatches.length : 0;

    if (numCount < 5) {
        score -= 20;
        fixes.push({
            title: "Quantify impact",
            description: `We only found ${numCount} numbers. Add more numbers or percentages to quantify your accomplishments.`,
            category: "IMPACT",
            icon: "impact"
        });
    } else {
        goods.push({
            title: "Impact quantified",
            description: `Great job! We found ${numCount} metrics/numbers highlighting your results.`
        });
    }

    // formatting / bullet points
    const bulletMatches = text.match(/[•\-\*]/g);
    const bulletCount = bulletMatches ? bulletMatches.length : 0;

    if (bulletCount < 5) {
        score -= 15;
        fixes.push({
            title: "Change your resume layout",
            description: `We only found ${bulletCount} bullet points. Your resume should use bullet points, not heavy paragraphs.`,
            category: "STYLE",
            icon: "style"
        });
    } else {
        goods.push({
            title: "Scannable layout",
            description: "Your document uses bullet points effectively making it easy to read."
        });
    }

    // Action verbs / weak words
    const fillerWords = ["very", "really", "just", "stuff", "things"];
    let fillerCount = 0;
    words.forEach(w => {
        if (fillerWords.includes(w.toLowerCase())) fillerCount++;
    });

    if (fillerCount > 3) {
        score -= 5;
        fixes.push({
            title: "Remove weak action verbs",
            description: `We found several filler words. Use strong action verbs instead.`,
            category: "WORD CHOICE",
            icon: "words"
        });
    } else {
        goods.push({
            title: "Strong word choice",
            description: "No excessively weak filler words detected."
        });
    }

    // Bottom out score
    if (score < 10) score = Math.floor(Math.random() * 15) + 10; // random low score

    return { 
        score, 
        fixes, 
        goods
    };
};
