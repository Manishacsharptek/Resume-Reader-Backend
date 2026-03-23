const parseResumeText = (text) => {
    // 1. Core Data Extraction
    const parsedData = {
        name: null,
        email: null,
        phone: null,
        skills: [],
        rawText: text
    };

    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) parsedData.email = emailMatch[0];

    const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    if (phoneMatch) parsedData.phone = phoneMatch[0];

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length > 0) {
        const firstLine = lines[0];
        if (!/(resume|cv|curriculum vitae)/i.test(firstLine) && firstLine.split(' ').length <= 4) {
            parsedData.name = firstLine;
        }
    }

    const commonSkills = [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust',
        'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
        'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP',
        'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'Tailwind', 'GraphQL', 'REST API'
    ];

    commonSkills.forEach(skill => {
        const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (skillRegex.test(text)) parsedData.skills.push(skill);
    });

    // 2. Metric Calculations
    const textLower = text.toLowerCase();
    
    // IMPACT: Look for numbers (quantifiable metrics) and action verbs
    const numberMatches = text.match(/\d+/g) || [];
    const percentages = text.match(/\d+%/g) || [];
    const actionVerbs = ['managed', 'led', 'developed', 'created', 'designed', 'optimized', 'increased', 'decreased', 'delivered', 'built', 'improved', 'spearheaded', 'resolved'];
    let verbCount = 0;
    actionVerbs.forEach(v => {
        if (textLower.includes(v)) verbCount++;
    });
    
    let impactScore = 40 + (numberMatches.length * 2) + (percentages.length * 5) + (verbCount * 4);
    impactScore = Math.min(100, impactScore);

    // BREVITY: Check word count, filler words
    const words = text.split(/\s+/);
    const wordCount = words.length;
    let brevityScore = 95;
    if (wordCount < 200) brevityScore -= 30;
    else if (wordCount > 1000) brevityScore -= 40;
    
    const fillerWords = ['really', 'very', 'utilized', 'assisted', 'helped', 'worked on', 'responsible for', 'duties included'];
    let fillerCount = 0;
    fillerWords.forEach(fw => {
        const fwRegex = new RegExp(`\\b${fw}\\b`, 'g');
        const matches = textLower.match(fwRegex);
        if (matches) fillerCount += matches.length;
    });
    brevityScore -= (fillerCount * 5);
    brevityScore = Math.max(0, Math.min(100, brevityScore));

    // STYLE: Check sections (Experience, Education), contact info
    let styleScore = 50; 
    if (parsedData.email) styleScore += 10;
    if (parsedData.phone) styleScore += 10;
    if (/\b(experience|employment|work history)\b/i.test(textLower)) styleScore += 15;
    if (/\b(education|academic|university|college)\b/i.test(textLower)) styleScore += 15;

    // SKILLS: Directly proportional to skills found
    let skillsScore = Math.min(100, 30 + (parsedData.skills.length * 7));

    // Calculate Overall (weighted average)
    const overallScore = Math.round((impactScore * 1.5 + brevityScore + styleScore + skillsScore) / 4.5);

    // 3. Generate Recommendations
    const recommendations = [];
    if (verbCount < 5) {
        recommendations.push({ title: "Weak Action Verbs", desc: "Use more strong action verbs (e.g., 'Spearheaded', 'Optimized') instead of passive phrasing to describe your achievements." });
    }
    if (numberMatches.length < 5) {
        recommendations.push({ title: "Unquantified Results", desc: "Include more numbers, percentages, or dollar amounts to prove your impact. Recruiters look for measurable success." });
    }
    if (fillerCount > 2) {
        recommendations.push({ title: "Filler Words Detected", desc: "Remove passive or weak phrases like 'responsible for' or 'duties included'. Start bullet points directly with verbs." });
    }
    if (!parsedData.email || !parsedData.phone) {
        recommendations.push({ title: "Missing Contact Info", desc: "We couldn't detect essential contact information. Ensure your phone number and email are clearly listed at the top." });
    }
    if (parsedData.skills.length < 5) {
        recommendations.push({ title: "ATS Keyword Optimization", desc: "ATS systems scan for keywords. Add an explicitly defined 'Skills' section with relevant technical and business keywords." });
    }
    if (recommendations.length === 0) {
        recommendations.push({ title: "Great Foundation", desc: "Your resume looks well-structured and impactful. Minor tweaks might still improve conversion rates." });
    }

    return {
        profile: parsedData,
        scores: {
            overall: overallScore,
            impact: Math.round(impactScore),
            brevity: Math.round(brevityScore),
            style: Math.round(styleScore),
            skills: Math.round(skillsScore)
        },
        recommendations
    };
};

export { parseResumeText };
