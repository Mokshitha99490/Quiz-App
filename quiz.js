let questions = [];
let currentQuestionIndex = 0;
let skippedQuestions = [];
let timer;
let baseTime = 10; // Base time for easy questions
let difficultyMultiplier = 1; // Multiplier for difficulty level
let selectedAnswer = null;
let answers = []; // Store selected answers
let dailyChallenge = localStorage.getItem("dailyChallenge") === "true";
let dailyQuestion = {
    category: "Daily Challenge",
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris"
};

// Load questions from JSON
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        localStorage.setItem("quizScore", 0); // Reset score at the beginning
        displayQuestion();
    });

function displayQuestion() {
    if (dailyChallenge) {
        questions = [dailyQuestion];
        dailyChallenge = false;
        localStorage.removeItem("dailyChallenge");
        // Add this line to display the daily challenge heading
        document.getElementById('question-category').innerText = "Daily Challenge";
    }

    if (currentQuestionIndex >= questions.length) {
        if (skippedQuestions.length > 0) {
            questions = skippedQuestions;
            skippedQuestions = [];
            currentQuestionIndex = 0;
        } else {
            showResults();
            return;
        }
    }

    let question = questions[currentQuestionIndex];
    document.getElementById('question-text').innerText = question.question;
    let optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = "";

    question.options.forEach(option => {
        let button = document.createElement("button");
        button.innerText = option;
        button.onclick = () => selectAnswer(button, option);
        optionsDiv.appendChild(button);
    });

    let timeLeft = baseTime * difficultyMultiplier;
    document.getElementById('time-left').innerText = timeLeft;
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    let timeLeft = parseInt(document.getElementById('time-left').innerText);
    timeLeft--;
    document.getElementById('time-left').innerText = timeLeft;
    if (timeLeft === 0) {
        clearInterval(timer);
        skipQuestion();
    }
}

function selectAnswer(button, answer) {
    selectedAnswer = answer;
    let buttons = document.querySelectorAll('#options button');
    buttons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    clearInterval(timer); // Stop the timer when an option is selected
}

function submitAnswer() {
    let question = questions[currentQuestionIndex];
    answers.push({ question: question.question, selectedAnswer: selectedAnswer, correctAnswer: question.answer });
    if (selectedAnswer === question.answer) {
        localStorage.setItem("quizScore", (parseInt(localStorage.getItem("quizScore") || 0) + 1));
        difficultyMultiplier += 0.1; // Increase difficulty
    }
    currentQuestionIndex++;
    displayQuestion();
}

function skipQuestion() {
    skippedQuestions.push(questions[currentQuestionIndex]);
    currentQuestionIndex++;
    displayQuestion();
}

function showResults() {
    let score = localStorage.getItem("quizScore") || 0;
    let resultsDiv = document.createElement('div');
    resultsDiv.className = 'results-container';
    resultsDiv.innerHTML = `<h2>Your Score: ${score}</h2>`;
    answers.forEach((answer, index) => {
        let resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="question">Q${index + 1}: ${answer.question}</div>
            <div class="selected-answer">Selected Answer: ${answer.selectedAnswer}</div>
            <div class="correct-answer">Correct Answer: ${answer.correctAnswer}</div>
        `;
        resultsDiv.appendChild(resultItem);
    });
    document.body.innerHTML = '';
    document.body.appendChild(resultsDiv);
    localStorage.setItem("leaderboard", JSON.stringify([...JSON.parse(localStorage.getItem("leaderboard") || "[]"), { name: localStorage.getItem("quizUser"), score }]));
    let button = document.createElement("button");
    button.innerText = "Go to Leaderboard";
    button.onclick = () => window.location.href = "leaderboard.html";
    resultsDiv.appendChild(button);
}

window.onpopstate = function(event) {
    alert("Navigation is disabled during the quiz.");
    history.pushState(null, null, location.href);
};

history.pushState(null, null, location.href);
