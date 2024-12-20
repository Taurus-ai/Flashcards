// 1. Class definitions
class Flashcard {
    constructor(question, answer) {
        this.question = question;
        this.answer = answer;
    }
}

// 2. Global state variables
let flashcards = [];
let originalFlashcards = [];
let currentCardIndex = 0;
let showAnswer = false;
let currentMode = '';

//3. Mode functions
function generateMatchingButtons(originalFlashcards) {
    console.log('this is the original flashcards:', originalFlashcards);

    if (!Array.isArray(originalFlashcards) || originalFlashcards.length === 0) {
        console.error('Invalid flashcards array provided to generateMatchingButtons');
        return;
    }

    const flashcardContent = document.getElementById('matching-flashcard-content');
    flashcardContent.innerHTML = ''; // Clear previous buttons

    const questions = originalFlashcards.map(card => card.question);
    const answers = originalFlashcards.map(card => card.answer);
    
    const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
    const shuffledAnswers = answers.sort(() => 0.5 - Math.random());

    // Create question buttons
    shuffledQuestions.forEach(question => {
        const button = document.createElement('button');
        button.textContent = question;
        button.dataset.type = 'question';
        button.onclick = (event) => handleSelection(event, originalFlashcards); // Pass originalFlashcards
        flashcardContent.appendChild(button);
    });

    // Create answer buttons
    shuffledAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.dataset.type = 'answer';
        button.onclick = (event) => handleSelection(event, originalFlashcards); // Pass originalFlashcards
        flashcardContent.appendChild(button);
    });
}


let selectedQuestion = null;
let selectedAnswer = null;

function handleSelection(event) {
    const button = event.target;
    const feedback = document.getElementById('matching-feedback');
    
    if (button.dataset.type === 'question') {
        // Handle question selection
        if (selectedQuestion) {
            selectedQuestion.classList.remove('selected');
        }
        selectedQuestion = button;
        selectedQuestion.classList.add('selected');
    } else if (button.dataset.type === 'answer') {
        // Handle answer selection
        if (selectedAnswer) {
            selectedAnswer.classList.remove('selected');
        }
        selectedAnswer = button;
        selectedAnswer.classList.add('selected');
    }

    // If both a question and an answer are selected
    if (selectedQuestion && selectedAnswer) {
        checkMatch(selectedQuestion, selectedAnswer, originalFlashcards); // Pass originalFlashcards here
    }
}


function checkMatch(questionButton, answerButton, originalFlashcards) {
    const questionText = questionButton.textContent;
    const answerText = answerButton.textContent;

    // Find the correct answer for the selected question
    const isCorrect = originalFlashcards.some(card => card.question === questionText && card.answer === answerText);
    const feedback = document.getElementById('matching-feedback');

    if (isCorrect) {
        feedback.textContent = 'Correct match!';
        questionButton.style.display = 'none';
        answerButton.style.display = 'none';
    } else if(!isCorrect) {
        feedback.textContent = 'Wrong match! Try again.';
    } 

    // Reset selections
    selectedQuestion = null;
    selectedAnswer = null;
 
}

// Assume you have a function that loads the selected deck and fetches flashcards
// Call generateMatchingButtons with the fetched flashcards when the deck is selected

function generateMultipleChoiceCards(originalFlashcards) {
    // Ensure the input is valid (non-empty array of flashcards).
    if (!Array.isArray(originalFlashcards) || originalFlashcards.length === 0) {
        console.error('Invalid flashcards array provided to generateMultipleChoiceCards');
        return [];
    }

    const multipleChoiceCards = [];

    // Loop over each flashcard to create a question with 4 answer choices.
    originalFlashcards.forEach(card => {
        const questionObj = {
            question: card.question,
            correctAnswer: card.answer,
            choices: [],
        };

        // Filter out the correct answer and select 3 random incorrect answers.
        const wrongAnswers = originalFlashcards
            .filter(c => c.answer !== card.answer)
            .map(c => c.answer);

        // If not enough wrong answers exist, adjust the selection to avoid errors.
        const shuffledWrongAnswers = wrongAnswers.sort(() => 0.5 - Math.random()).slice(0, 3);

        // Combine the correct answer with 3 incorrect ones.
        const allChoices = [...shuffledWrongAnswers, card.answer];

        // Randomly shuffle the choices to prevent the correct answer from always being last.
        questionObj.choices = allChoices.sort(() => 0.5 - Math.random());

        multipleChoiceCards.push(questionObj);
    });

    return multipleChoiceCards;
}

function generateTrueFalseCards(originalFlashcards) {
    if (!Array.isArray(originalFlashcards) || originalFlashcards.length === 0) {
        console.error('Invalid flashcards array provided to generateTrueFalseCards');
        return [];
    }

    const trueFalseCards = [];

    originalFlashcards.forEach(card => {
        const questionObj = {
            question: card.question,
            answer: card.answer,
            correctAnswer: 'True',
            displayedAnswer: card.answer,
            Answer: 'True'
        };
 
        const wrongAnswers = originalFlashcards
            .filter(c => c.answer !== card.answer)
            .map(c => c.answer);

        if (wrongAnswers.length > 0) {
            const showCorrect = Math.random() < 0.5;
            
            if (!showCorrect) {
                const falseAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
                questionObj.displayedAnswer = falseAnswer;
                questionObj.correctAnswer = 'False';
            }
        }

        trueFalseCards.push(questionObj);
    });

    return trueFalseCards;
}

//4. Logic Functions
function checkAnswer(card, userAnswer) {
    if (!card || typeof card.correctAnswer === 'undefined') {
        console.error('Invalid card object:', card);
        return false;
    }
    console.log('this is the  user answer:', userAnswer);
    const isDisplayedCorrect = (card.Answer === card.correctAnswer);
    console.log('this is the correct answer:', card.correctAnswer);
    console.log('this is the displayed answer:', card.displayedAnswer);
    return (userAnswer === 'true' && isDisplayedCorrect) || 
           (userAnswer === 'false' && !isDisplayedCorrect);
}
// 5. Core data manipulation functions
function deleteFlashcard(event, formElement) {
    event.preventDefault();  // Prevent form submission

    const flashcardDiv = formElement.closest('.flashcard');  // Get the parent flashcard div
    const flashcardId = flashcardDiv.dataset.flashcardId;  // Extract flashcard ID from data attribute
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(`/delete-flashcard/${flashcardId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            flashcardDiv.remove();  // Remove the flashcard div from the DOM
        } else {
            alert('Error deleting flashcard');
        }
    })
    .catch(error => console.error('Error:', error));
}

function deleteDeck(event, buttonElement) {
    event.preventDefault();  // Prevent default form submission

    const deckDiv = buttonElement.closest('.deck-card');  // Get the deck div
    const deckId = deckDiv.dataset.deckId;  // Extract the deck ID
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(`/delete_deck/${deckId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Deck deleted successfully!');
            deckDiv.remove();  // Remove the deck div from the DOM

            // Remove the deck from the select dropdown
            const optionToRemove = document.querySelector(`#selected_deck option[value="${deckId}"]`);
            if (optionToRemove) {
                optionToRemove.remove();
            }

            // Clear the edit deck form and flashcards if the deleted deck was selected
            const selectedDeckInput = document.querySelector('input[name="selected_deck"]');
            if (selectedDeckInput && selectedDeckInput.value == deckId) {
                clearEditDeckForm();  // Call function to clear the form
                hideFlashcardSections();  // Call function to hide the flashcard sections
            }
        } else {
            alert('Error deleting deck');
        }
    })
    .catch(error => console.error('Error:', error));
}

function saveFlashcard(event, flashcardId) {
    event.preventDefault(); // Prevent form from submitting normally

    const form = document.getElementById(`edit-flashcard-form-${flashcardId}`);
    const formData = new FormData(form);

    fetch(`/edit_flashcard/${flashcardId}/`, {
        method: 'POST',
        body: formData,
        headers: {
            // Remove CSRF token header for testing
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to save changes.');
        }
    })
    .then(data => {
        // Update the flashcard display with new values
        document.getElementById(`question_${flashcardId}`).value = data.question;
        document.getElementById(`answer_${flashcardId}`).value = data.answer;
        alert("Flashcard updated successfully!");
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Error saving flashcard.");
    });
}

// Function to clear the edit deck form
function clearEditDeckForm() {
    const deckNameInput = document.querySelector('input[name="edit_deck_name"]');
    const deckDescriptionTextarea = document.querySelector('textarea[name="edit_deck_description"]');
    const editDeckForm = document.getElementById('edit-deck-form');
    if (deckNameInput) deckNameInput.value = '';  // Clear the deck name input
    if (deckDescriptionTextarea) deckDescriptionTextarea.value = '';  // Clear the deck description textarea
    if (editDeckForm) editDeckForm.style.display = 'none';  // Clear the deck ID from the form data attribute
}

// Function to hide the flashcard sections
function hideFlashcardSections() {
    const flashcardsContainer = document.getElementById('flashcards-container');
    const addFlashcardForm = document.getElementById('add-flashcard-form');
    
    if (flashcardsContainer) flashcardsContainer.style.display = 'none';  // Hide flashcards
    if (addFlashcardForm) addFlashcardForm.style.display = 'none';  // Hide add flashcard form
}

// 6. API interaction functions
function fetchFlashcards(deckId, shuffle = false) {
    const url = `/api/flashcards/${deckId}${shuffle ? '?shuffle=true' : ''}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            originalFlashcards = data.map(item => new Flashcard(item.question, item.answer));
            console.log('this is the flashcards1:', originalFlashcards);
            if (currentMode === 'truefalse') {
                flashcards = generateTrueFalseCards(originalFlashcards);
            } else if (currentMode === 'multiplechoice') {
                flashcards = generateMultipleChoiceCards(originalFlashcards);
            } 
            else if (currentMode === 'learn') {
                flashcards = originalFlashcards;
            }
            else if (currentMode === 'matching') {
                flashcards = generateMatchingButtons(originalFlashcards);

               
            }

            currentCardIndex = 0;
            displayCard();
        })
        .catch(error => {
            console.error('Error fetching flashcards:', error);
            alert('Failed to load flashcards. Please try again.');
        });
        
}


function loadDecks() {
    fetch('/api/decks/')
        .then(response => response.json())
        .then(decks => {
            const deckSelects = document.querySelectorAll('[data-deck-select]');
            
            deckSelects.forEach(select => {
                while (select.options.length > 1) {
                    select.remove(1);
                }
                
                decks.forEach(deck => {
                    const option = document.createElement('option');
                    option.value = deck.id;
                    option.textContent = deck.name;
                    select.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Error loading decks:', error));
}

// 7. UI Display functions

function displayCard() {
    if (currentMode === 'matching') {
        console.log('Skipping displayCard for matching mode.');
        return;
    }
    const flashcardContentId = `${currentMode}-flashcard-content`; 
    const flashcardAnswerId = `${currentMode}-flashcard-answer`; 
    const flashcardContent = document.getElementById(flashcardContentId);
    const flashcardAnswer = document.getElementById(flashcardAnswerId);

    if (!flashcardContent) {
        console.error(`No element found for mode: ${currentMode}`);
        return;
    }

    if (flashcards.length === 0) {
        flashcardContent.innerText = 'No flashcards available.';
        return;
    }

    const currentCard = flashcards[currentCardIndex];
    

    if (flashcardAnswer) {
        if (currentMode === 'truefalse') {
            const displayedAnswer = currentCard.displayedAnswer || 'True/False';
            flashcardAnswer.innerText = displayedAnswer;
            flashcardContent.innerText = currentCard.question;
        } else if (currentMode === 'learn') {
            flashcardAnswer.innerText = currentCard.answer;
            flashcardContent.innerText = currentCard.question;       
        } else if (currentMode === 'multiplechoice') {
            flashcardAnswer.innerHTML = '';  // Clear previous answers.
            flashcardContent.innerText = currentCard.question;

            // Loop through all choices and create buttons for each.
            currentCard.choices.forEach(choice => {
                const button = document.createElement('button');
                button.textContent = choice;

                // Set an event listener to check if the answer is correct.
                button.onclick = () => {
                    if (choice === currentCard.correctAnswer) {
                        alert('Correct!');
                        currentCardIndex = (currentCardIndex + 1) % flashcards.length;
                        displayCard();
                    } else {
                        alert('Incorrect. Try again!');
                    }
                };

                // Append the button to the answer container.
                flashcardAnswer.appendChild(button);
            });
        }   
    }
}


function toggleAnswer(mode) {
    const questionId = `${mode}-flashcard-content`;
    const answerId = `${mode}-flashcard-answer`;

    const questionElement = document.getElementById(questionId);
    const answerElement = document.getElementById(answerId);

    if (!questionElement || !answerElement) {
        console.error(`Elements not found for mode: ${mode}`);
        return;
    }

    if (answerElement.style.display === 'none' || answerElement.style.display === '') {
        answerElement.style.display = 'block';
        questionElement.style.display = 'none';
    } else {
        answerElement.style.display = 'none';
        questionElement.style.display = 'block';
    }
}

// 8. View management functions
function showTestground() {
    document.getElementById('dashboard-view').classList.add('hidden');
    document.getElementById('testground-view').classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('testground-view').classList.add('hidden');
    document.getElementById('dashboard-view').classList.remove('hidden');
}

function showLearn() {
    document.getElementById('learn-view').classList.remove('hidden');
    document.getElementById('review-view').classList.add('hidden');
    document.getElementById('truefalse-view').classList.add('hidden');
    document.getElementById('matching-view').classList.add('hidden');
}

function showReview() {
    document.getElementById('learn-view').classList.add('hidden');
    document.getElementById('review-view').classList.remove('hidden');
    document.getElementById('truefalse-view').classList.add('hidden');
    document.getElementById('matching-view').classList.add('hidden');
}

function showTrueFalse() {
    document.getElementById('learn-view').classList.add('hidden');
    document.getElementById('review-view').classList.add('hidden');
    document.getElementById('truefalse-view').classList.remove('hidden');
    document.getElementById('matching-view').classList.add('hidden');
}

function showMatching() {
    document.getElementById('learn-view').classList.add('hidden');
    document.getElementById('review-view').classList.add('hidden');
    document.getElementById('truefalse-view').classList.add('hidden');
    document.getElementById('matching-view').classList.remove('hidden');
}

// 9. Mode and content loading functions
function loadMode(mode) {
    currentMode = mode;

    fetch(`/mode/${mode}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${mode} mode`);
            }
            return response.text();
        })
        .then(html => {
            const modeContainer = document.getElementById('mode-container');
            modeContainer.innerHTML = html;
            
            if (modeContainer.querySelector('[data-deck-select]')) {
                loadDecks();
            }
        })
        .catch(error => {
            console.error('Error loading the mode:', error);
        });
}

// 10. Event listeners and initialization
function setupModeEventListeners() {
    const modeContainer = document.getElementById('mode-container');
    
    if (!modeContainer) return;

    modeContainer.addEventListener('click', (event) => {
        const target = event.target;

        if (target.matches('[data-action]')) {
            const action = target.dataset.action;

            switch (action) {
                case 'toggle-answer-learn':
                    toggleAnswer('learn');
                    break;
                case 'toggle-answer-test':
                    toggleAnswer('test');
                    break;
                case 'next-card':
                    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
                    displayCard();
                    break;
                case 'prev-card':
                    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
                    displayCard();
                    break;
                case 'true':
                    const trueCard = flashcards[currentCardIndex];
                    if (checkAnswer(trueCard, 'true')) {
                        alert('Correct!');
                        currentCardIndex = (currentCardIndex + 1) % flashcards.length;
                    } else {
                        alert(`Incorrect! The correct answer was: ${trueCard.correctAnswer}.`);
                    }
                    displayCard();
                    break;
                
                case 'false':
                    const falseCard = flashcards[currentCardIndex];
                    if (checkAnswer(falseCard, 'false')) {
                        alert('Correct!');
                        currentCardIndex = (currentCardIndex + 1) % flashcards.length;
                    } else {
                        alert(`Incorrect! The correct answer was: ${falseCard.correctAnswer}.`);
                    }
                    displayCard();
                    break;
            }
        }
    });

    modeContainer.addEventListener('change', (event) => {
        const target = event.target;

        if (target.matches('[data-deck-select]')) {
            const mode = target.dataset.deckSelect;
            const deckId = target.value;

            if (!deckId) {
                alert('Please select a valid deck.');
                return;
            }

            fetchFlashcards(deckId, mode === 'truefalse' || mode === 'matching');
        }  
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupModeEventListeners();
});

