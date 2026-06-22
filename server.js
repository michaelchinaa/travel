const express = require('express');
const path = require('path');
const fs = require('fs');
const { put, list } = require('@vercel/blob');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============ LOAD QUESTIONS ============
function loadQuestions() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'questions.txt'), 'utf8');
        const lines = data.split('\n').filter(line => line.trim() !== '');
        const questions = {};
        lines.forEach(line => {
            const parts = line.split('|');
            const id = parts[0].trim();
            const question = parts[1].trim();
            const options = parts[2].split(',').map(opt => opt.trim());
            const hasOther = options.length > 0 && options[options.length - 1].toLowerCase() === 'other';
            questions[id] = { id, question, options, hasOther };
        });
        return questions;
    } catch (error) {
        console.error('Error loading questions:', error);
        return {};
    }
}

// ============ SAVE RESULTS TO VERCEL BLOB ============
async function saveResultsToBlob(answers, questions) {
    const timestamp = new Date().toISOString();
    const resultsFile = 'results.json';

    // Build readable results
    const readableAnswers = {};
    Object.keys(answers).forEach(qId => {
        const question = questions[qId];
        if (question) {
            readableAnswers[question.question] = answers[qId];
        } else {
            readableAnswers[qId] = answers[qId];
        }
    });

    const resultEntry = {
        id: Date.now(),
        timestamp: timestamp,
        answers: answers,
        readableAnswers: readableAnswers,
        totalQuestions: Object.keys(answers).length
    };

    try {
        // Get existing results
        let existingResults = [];
        try {
            console.log('🔍 Fetching existing results...');
            const { blobs } = await list({
                storeId: process.env.BLOB_STORE_ID,
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });
            const resultBlob = blobs.find(b => b.pathname === resultsFile);
            if (resultBlob) {
                console.log(`📄 Found existing results file: ${resultBlob.url}`);
                const response = await fetch(resultBlob.url);
                existingResults = await response.json();
                console.log(`📖 Loaded ${existingResults.length} existing results`);
            } else {
                console.log('📝 No existing results file found');
            }
        } catch (error) {
            console.log('📝 No existing results found, creating new file:', error.message);
        }

        existingResults.push(resultEntry);

        // Upload to Vercel Blob
        console.log('💾 Uploading to Vercel Blob...');
        const blob = await put(resultsFile, JSON.stringify(existingResults, null, 2), {
            access: 'public',
            contentType: 'application/json',
            storeId: process.env.BLOB_STORE_ID,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        console.log(`✅ Results saved! (Total: ${existingResults.length} submissions)`);
        console.log(`📊 Results URL: ${blob.url}`);
        return blob.url;
    } catch (error) {
        console.error('❌ Error saving results:', error);
        throw error;
    }
}

// ============ GET RESULTS FROM VERCEL BLOB ============
async function getResultsFromBlob() {
    const resultsFile = 'results.json';
    try {
        console.log('🔍 Fetching results from blob...');
        const { blobs } = await list({
            storeId: process.env.BLOB_STORE_ID,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        const resultBlob = blobs.find(b => b.pathname === resultsFile);
        if (resultBlob) {
            console.log(`📄 Found results file: ${resultBlob.url}`);
            const response = await fetch(resultBlob.url);
            return await response.json();
        } else {
            console.log('📝 No results file found');
        }
    } catch (error) {
        console.error('Error reading from blob:', error);
    }
    return [];
}

// ============ API ROUTES ============
app.get('/api/questions', (req, res) => {
    const questions = loadQuestions();
    res.json(questions);
});

app.post('/api/next-question', (req, res) => {
    const { currentQuestionId, selectedAnswer } = req.body;
    const questions = loadQuestions();

    console.log(`[API] currentQuestionId: ${currentQuestionId}, selectedAnswer: "${selectedAnswer}"`);

    // ============ HANDLE SPA GENDER CHOICE ============
    if (currentQuestionId === 'Q4_Spa_Choice') {
        const answerLower = selectedAnswer.toLowerCase().trim();
        let nextId = '';

        if (answerLower.includes('female') || answerLower.includes('woman') || answerLower.includes('girl') || answerLower === 'female masseuse') {
            nextId = 'Q4_Spa_Female';
        } else if (answerLower.includes('male') || answerLower.includes('man') || answerLower.includes('guy') || answerLower === 'male masseuse') {
            nextId = 'Q4_Spa_Male';
        } else if (answerLower.includes('both')) {
            nextId = 'Q4_Spa_Male';
        } else if (answerLower.includes('just me') || answerLower.includes('just you') || answerLower.includes('only you')) {
            nextId = 'R1_Combine';
        } else {
            nextId = 'Q4_Spa_Male';
        }

        if (questions[nextId]) {
            res.json({ nextQuestion: questions[nextId], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }

    // ============ HANDLE SPA MALE ============
    if (currentQuestionId === 'Q4_Spa_Male') {
        if (questions['R1_Combine']) {
            res.json({ nextQuestion: questions['R1_Combine'], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }

    // ============ HANDLE SPA FEMALE ============
    if (currentQuestionId === 'Q4_Spa_Female') {
        if (questions['R1_Combine']) {
            res.json({ nextQuestion: questions['R1_Combine'], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }

    // ============ HANDLE Q1 ============
    if (currentQuestionId === 'Q1') {
        const destinationMap = {
            'Secluded Beach': 'Beach',
            'Mountain': 'Mountain',
            'City Penthouse': 'City',
            'Luxury Spa Retreat': 'Spa',
            'European Beach Club': 'BeachClub',
            'Masquerade Ball': 'Masquerade'
        };

        let destKey = destinationMap[selectedAnswer];
        if (!destKey) {
            for (const [key, value] of Object.entries(destinationMap)) {
                if (selectedAnswer.includes(key.substring(0, 8)) || selectedAnswer.includes(value)) {
                    destKey = value;
                    break;
                }
            }
        }
        if (!destKey) destKey = 'Beach';

        const nextId = `Q2_${destKey}`;
        if (questions[nextId]) {
            res.json({ nextQuestion: questions[nextId], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }

    // ============ HANDLE Q2_* → Q3_* ============
    if (currentQuestionId.startsWith('Q2_')) {
        const base = currentQuestionId.replace('Q2_', '');
        const nextId = `Q3_${base}`;
        if (questions[nextId]) {
            res.json({ nextQuestion: questions[nextId], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }

    // ============ HANDLE Q3_* → Q4_* ============
    if (currentQuestionId.startsWith('Q3_')) {
        const base = currentQuestionId.replace('Q3_', '');

        // SPECIAL: Q3_Spa → Q4_Spa_Choice
        if (base === 'Spa') {
            if (questions['Q4_Spa_Choice']) {
                res.json({ nextQuestion: questions['Q4_Spa_Choice'], isLast: false });
            } else {
                res.json({ nextQuestion: null, isLast: true });
            }
            return;
        }

        // SPECIAL: Q3_Masquerade → Q4_Masquerade_FFM
        if (base === 'Masquerade') {
            const nextId = 'Q4_Masquerade_FFM';
            if (questions[nextId]) {
                res.json({ nextQuestion: questions[nextId], isLast: false });
            } else {
                res.json({ nextQuestion: null, isLast: true });
            }
            return;
        }

        // SPECIAL: Q3_BeachClub → Q4_BeachClub_Kiss
        if (base === 'BeachClub') {
            const nextId = 'Q4_BeachClub_Kiss';
            if (questions[nextId]) {
                res.json({ nextQuestion: questions[nextId], isLast: false });
            } else {
                res.json({ nextQuestion: null, isLast: true });
            }
            return;
        }

        const nextId = `Q4_${base}`;
        if (questions[nextId]) {
            res.json({ nextQuestion: questions[nextId], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }

    // ============ HANDLE Q4_* → Q5_* ============
    if (currentQuestionId.startsWith('Q4_') && !currentQuestionId.startsWith('Q4_Spa_')) {
        const base = currentQuestionId.replace('Q4_', '');

        // SPECIAL: Q4_Masquerade_FFM → Q5_Masquerade_WatchHim
        if (base === 'Masquerade_FFM') {
            const nextId = 'Q5_Masquerade_WatchHim';
            if (questions[nextId]) {
                res.json({ nextQuestion: questions[nextId], isLast: false });
            } else {
                res.json({ nextQuestion: null, isLast: true });
            }
            return;
        }

        // SPECIAL: Q4_BeachClub_Kiss → Q5_BeachClub_Watch
        if (base === 'BeachClub_Kiss') {
            const nextId = 'Q5_BeachClub_Watch';
            if (questions[nextId]) {
                res.json({ nextQuestion: questions[nextId], isLast: false });
            } else {
                res.json({ nextQuestion: null, isLast: true });
            }
            return;
        }

        const nextId = `Q5_${base}`;
        if (questions[nextId]) {
            res.json({ nextQuestion: questions[nextId], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }

    // ============ HANDLE Q5_* → Q6_* ============
    if (currentQuestionId.startsWith('Q5_')) {
        const base = currentQuestionId.replace('Q5_', '');

        // SPECIAL: Q5_Masquerade_WatchHim → Q6_Masquerade_WatchHer
        if (base === 'Masquerade_WatchHim') {
            const nextId = 'Q6_Masquerade_WatchHer';
            if (questions[nextId]) {
                res.json({ nextQuestion: questions[nextId], isLast: false });
            } else {
                res.json({ nextQuestion: null, isLast: true });
            }
            return;
        }

        // SPECIAL: Q5_BeachClub_Watch → R1_Combine
        if (base === 'BeachClub_Watch') {
            if (questions['R1_Combine']) {
                res.json({ nextQuestion: questions['R1_Combine'], isLast: false });
            } else {
                res.json({ nextQuestion: null, isLast: true });
            }
            return;
        }

        // Default: Q5_* → R1_Combine
        if (questions['R1_Combine']) {
            res.json({ nextQuestion: questions['R1_Combine'], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }

    // ============ HANDLE Q6_Masquerade_WatchHer → R1_Combine ============
    if (currentQuestionId === 'Q6_Masquerade_WatchHer') {
        if (questions['R1_Combine']) {
            res.json({ nextQuestion: questions['R1_Combine'], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }

    // ============ FINAL ROUNDS ============
    if (currentQuestionId === 'R1_Combine') {
        if (questions['R2_FirstTry']) {
            res.json({ nextQuestion: questions['R2_FirstTry'], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }
    if (currentQuestionId === 'R2_FirstTry') {
        if (questions['R3_TurnOn']) {
            res.json({ nextQuestion: questions['R3_TurnOn'], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }
    if (currentQuestionId === 'R3_TurnOn') {
        if (questions['R4_FinalFantasy']) {
            res.json({ nextQuestion: questions['R4_FinalFantasy'], isLast: false });
        } else {
            res.json({ nextQuestion: null, isLast: true });
        }
        return;
    }

    console.log(`[API] No route found for ${currentQuestionId}`);
    res.json({ nextQuestion: null, isLast: true });
});

app.post('/api/submit', async (req, res) => {
    const { answers } = req.body;
    const questions = loadQuestions();

    console.log('📝 Received submission with', Object.keys(answers).length, 'answers');

    if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({ error: 'No answers provided' });
    }

    try {
        // Check if blob token exists
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error('❌ BLOB_READ_WRITE_TOKEN is not set!');
            return res.status(500).json({
                error: 'Storage not configured',
                details: 'BLOB_READ_WRITE_TOKEN environment variable is missing'
            });
        }

        console.log('💾 Saving to Vercel Blob...');
        const blobUrl = await saveResultsToBlob(answers, questions);

        // Build result with media paths
        const results = Object.keys(answers).map((qId) => {
            const answer = answers[qId];
            const question = questions[qId];
            const imagePath = `/media/images/${answer}.jpg`;
            const videoPath = `/media/videos/${answer}.mp4`;

            return {
                questionId: qId,
                questionText: question ? question.question : qId,
                answer: answer,
                image: fs.existsSync(path.join(__dirname, 'public', imagePath)) ? imagePath : null,
                video: fs.existsSync(path.join(__dirname, 'public', videoPath)) ? videoPath : null
            };
        });

        res.json({
            success: true,
            results,
            blobUrl: blobUrl,
            message: 'Survey results saved successfully!'
        });
    } catch (error) {
        console.error('❌ Error saving results:', error);
        res.status(500).json({
            error: 'Failed to save results',
            details: error.message
        });
    }
});

app.get('/admin/results', async (req, res) => {
    try {
        let results = [];
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            results = await getResultsFromBlob();
        }

        let html = `<!DOCTYPE html>
        <html>
        <head>
            <title>📊 Survey Results</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f5f0f8; padding: 2rem; }
                .container { max-width: 1200px; margin: 0 auto; }
                .card { background: white; border-radius: 16px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                .summary { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem; }
                .stat-box { background: #f8f4ff; padding: 1rem 2rem; border-radius: 12px; border-left: 4px solid #7e4a9e; }
                .stat-number { font-size: 2rem; font-weight: bold; color: #7e4a9e; }
                .stat-label { color: #666; }
                .result-entry { background: #faf8fc; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid #eee; }
                .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem; }
                .result-id { font-weight: bold; color: #7e4a9e; }
                .result-time { color: #888; font-size: 0.9rem; }
                .answer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 0.5rem; margin-top: 0.5rem; }
                .answer-item { background: white; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #e8e0f0; }
                .answer-question { font-size: 0.8rem; color: #888; }
                .answer-value { font-weight: bold; color: #2d1b3d; }
                .btn { background: #7e4a9e; color: white; padding: 0.5rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; font-size: 0.9rem; }
                .btn:hover { background: #693f85; }
                .empty { text-align: center; color: #888; padding: 3rem; }
                .refresh-btn { background: #d9cbe3; color: #2d1b3d; }
                .refresh-btn:hover { background: #cbb6d9; }
                h1 { color: #2d1b3d; }
                .badge { background: #e3d5ee; padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.8rem; }
                .header-actions { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
                @media (max-width: 600px) {
                    body { padding: 1rem; }
                    .card { padding: 1rem; }
                    .stat-box { padding: 0.75rem 1rem; }
                    .stat-number { font-size: 1.5rem; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <h1>📊 Survey Results</h1>
                        <div class="header-actions">
                            <a href="/admin/results" class="btn refresh-btn">🔄 Refresh</a>
                            <a href="/" class="btn">🏠 Back to Survey</a>
                        </div>
                    </div>
                    
                    <div class="summary">
                        <div class="stat-box">
                            <div class="stat-number">${results.length}</div>
                            <div class="stat-label">Total Submissions</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-number">${results.length > 0 ? results[0].totalQuestions || Object.keys(results[0].answers || {}).length : 0}</div>
                            <div class="stat-label">Avg Questions</div>
                        </div>
                    </div>
                </div>`;

        if (results.length === 0) {
            html += `
                <div class="card">
                    <div class="empty">
                        <p style="font-size: 2rem; margin-bottom: 1rem;">📭</p>
                        <p>No results yet. Complete the survey first!</p>
                        <br>
                        <a href="/" class="btn">Take the Survey</a>
                    </div>
                </div>`;
        } else {
            results.forEach((result, index) => {
                const answers = result.readableAnswers || result.answers || {};

                html += `
                    <div class="card result-entry">
                        <div class="result-header">
                            <span class="result-id">#${result.id || index + 1}</span>
                            <span class="result-time">${result.timestamp ? new Date(result.timestamp).toLocaleString() : 'Unknown'}</span>
                            <span class="badge">${Object.keys(answers).length} answers</span>
                        </div>
                        <div class="answer-grid">`;

                Object.keys(answers).forEach(questionText => {
                    const answerText = answers[questionText];
                    html += `
                            <div class="answer-item">
                                <div class="answer-question">${questionText}</div>
                                <div class="answer-value">${answerText}</div>
                            </div>`;
                });

                html += `
                        </div>
                    </div>`;
            });
        }

        html += `
            </div>
        </body>
        </html>`;

        res.send(html);
    } catch (error) {
        console.error('Error loading admin page:', error);
        res.status(500).send('Error loading results');
    }
});

app.get('/api/results', async (req, res) => {
    try {
        let results = [];
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            results = await getResultsFromBlob();
        }
        res.json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Survey server running on http://localhost:${PORT}`);
    console.log(`📊 View results at: http://localhost:${PORT}/admin/results`);
    console.log(`🔑 BLOB_READ_WRITE_TOKEN: ${process.env.BLOB_READ_WRITE_TOKEN ? '✅ Set' : '❌ Not set'}`);
    console.log(`🏪 BLOB_STORE_ID: ${process.env.BLOB_STORE_ID ? '✅ Set' : '❌ Not set'}`);
});