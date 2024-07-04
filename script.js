// script.js

document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setupForm');
    const nameInput = document.getElementById('name');
    const positionSelect = document.getElementById('position');
    const inviteCodeInput = document.getElementById('inviteCode');
    const errorElement = document.getElementById('error');
    
    const setupContainer = document.getElementById('setup');
    const interviewContainer = document.getElementById('interview');
    const timerElement = document.getElementById('timer');
    const speakButton = document.getElementById('speakButton');
    const interruptButton = document.getElementById('interruptButton');
    
    const inviteCode = 'HelloJZX';
    let timerInterval;
    let recognition;
    let isUserSpeaking = false;

    setupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        if (inviteCodeInput.value !== inviteCode) {
            errorElement.textContent = 'Invalid invite code';
            return;
        }
        
        startInterview();
    });
    
    function startInterview() {
        setupContainer.style.display = 'none';
        interviewContainer.style.display = 'block';
        
        startTimer();
        initializeSpeechRecognition();
    }
    
    function startTimer() {
        let seconds = 0;
        let minutes = 0;
        
        timerInterval = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                minutes++;
                seconds = 0;
            }
            
            const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            
            timerElement.textContent = `${formattedMinutes}:${formattedSeconds}`;
        }, 1000);
    }
    
    function initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Your browser does not support speech recognition. Please use Google Chrome.');
            return;
        }
        
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        speakButton.addEventListener('click', () => {
            recognition.start();
            speakButton.disabled = true;
            speakButton.classList.remove('active');
            interruptButton.style.display = 'none';
        });
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            sendToDify(transcript);
        };
        
        recognition.onerror = (event) => {
            console.error(event.error);
        };
    }
    
    function sendToDify(message) {
        appendMessage('User', message);
        
        fetch('YOUR_DIFY_API_ENDPOINT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: JSON.stringify({ text: message })
        })
        .then(response => response.json())
        .then(data => {
            const reply = data.reply;
            appendMessage('AI', reply);
            textToSpeech(reply);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    function appendMessage(sender, message) {
        // This function is now only logging the conversation for debugging purposes
        console.log(`${sender}: ${message}`);
    }
    
    function textToSpeech(text) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.onend = () => {
            speakButton.disabled = false;
            speakButton.classList.add('active');
            interruptButton.style.display = 'none';
        };
        window.speechSynthesis.speak(speech);
    }
});
