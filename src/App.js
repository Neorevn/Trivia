import React, { useState, useEffect } from 'react';

// --- Helper Components ---

// Displays a single question and its answer options.
const Question = ({ question, onAnswer, feedback }) => {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-2xl md-text-3xl font-bold text-white mb-6 text-center">{question.question}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, index) => {
                    const isSelected = feedback && feedback.selectedIndex === index;
                    let buttonClass = "bg-indigo-500 hover:bg-indigo-600";
                    if (isSelected) {
                        buttonClass = feedback.isCorrect ? "bg-green-500" : "bg-red-500";
                    } else if (feedback && index === question.correct) {
                         buttonClass = "bg-green-500";
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => onAnswer(index)}
                            disabled={!!feedback}
                            className={`w-full text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-300 ${buttonClass}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main App Component ---
// This component now focuses on the game's state and logic.
// The question data is fetched from an external questions.json file.
export default function App() {
    const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'finished'
    const [allQuestions, setAllQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [category, setCategory] = useState('General Knowledge');
    const [difficulty, setDifficulty] = useState('Easy');
    
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // { selectedIndex, isCorrect }
    const [showHint, setShowHint] = useState(false);

    // Fetch trivia questions from the JSON file when the component mounts.
    useEffect(() => {
        // This fetch call assumes questions.json is in the same public folder as the app's index.html
        fetch('./questions.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setAllQuestions(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching trivia questions:", error);
                setError("Failed to load questions. Please try again later.");
                setIsLoading(false);
            });
    }, []); // The empty dependency array ensures this effect runs only once on mount.

    // Derive categories and difficulties from the fetched questions.
    const categories = [...new Set(allQuestions.map(q => q.category))];
    const difficulties = [...new Set(allQuestions.map(q => q.difficulty))];

    const startGame = () => {
        // Filter questions by selected category and difficulty from the main data source
        const filteredQuestions = allQuestions.filter(q => q.category === category && q.difficulty === difficulty);
        
        // Shuffle the filtered questions to randomize the order for each game
        const shuffledQuestions = filteredQuestions.sort(() => Math.random() - 0.5);
        
        setQuestions(shuffledQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setFeedback(null);
        setShowHint(false);
        setGameState('playing');
    };

    const handleAnswer = (selectedIndex) => {
        const isCorrect = selectedIndex === questions[currentQuestionIndex].correct;
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        }
        setFeedback({ selectedIndex, isCorrect });

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                setFeedback(null);
                setShowHint(false);
            } else {
                setGameState('finished');
            }
        }, 2000); // Wait 2 seconds before moving to the next question
    };


    const restartGame = () => {
        // When restarting, we just go back to the start screen.
        // A new set of shuffled questions will be generated when the user starts again.
        setGameState('start');
    };
    
    const goToMenu = () => {
        setGameState('start');
    };

    const renderGameScreen = () => {
        if (gameState === 'playing' && questions.length > 0) {
            const currentQuestion = questions[currentQuestionIndex];
            return (
                <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="absolute top-4 left-4 text-white text-lg font-bold">Score: {score}</div>
                    <div className="absolute top-4 right-4 text-white text-lg font-bold">{currentQuestionIndex + 1} / {questions.length}</div>
                    <Question question={currentQuestion} onAnswer={handleAnswer} feedback={feedback} />
                    <div className="mt-6 flex space-x-4">
                        <button onClick={() => setShowHint(!showHint)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg shadow-md">
                            {showHint ? 'Hide Hint' : 'Show Hint'}
                        </button>
                        <button onClick={goToMenu} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md">
                            Menu
                        </button>
                    </div>
                    {showHint && <p className="text-white mt-4 p-3 bg-black bg-opacity-30 rounded-lg text-center">{currentQuestion.hint}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-gray-900 min-h-screen font-sans text-white flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%)'}}>

                {gameState === 'start' && (
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-yellow-300">Asaf's Trivia Challenge</h1>
                        {isLoading ? (
                            <p className="text-indigo-200 mb-8">Loading questions...</p>
                        ) : error ? (
                             <p className="text-red-400 mb-8">{error}</p>
                        ) : (
                            <p className="text-indigo-200 mb-8">Select a category and difficulty to begin!</p>
                        )}
                        <div className="space-y-6 max-w-md mx-auto">
                            <div>
                                <label htmlFor="category" className="block text-lg font-medium text-indigo-100 mb-2">Category</label>
                                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isLoading || error} className="w-full p-3 bg-gray-700 text-white rounded-lg border-2 border-indigo-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50">
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="difficulty" className="block text-lg font-medium text-indigo-100 mb-2">Difficulty</label>
                                <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={isLoading || error} className="w-full p-3 bg-gray-700 text-white rounded-lg border-2 border-indigo-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50">
                                    {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
                                </select>
                            </div>
                            <button onClick={startGame} disabled={isLoading || error} className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-4 rounded-lg shadow-lg text-xl transition-transform transform hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? 'Loading...' : 'Start Game'}
                            </button>
                        </div>
                    </div>
                )}

                {renderGameScreen()}

                {gameState === 'finished' && (
                    <div className="text-center p-8">
                        <h2 className="text-4xl font-bold mb-4 text-yellow-300">Game Over!</h2>
                        <p className="text-2xl text-indigo-200 mb-6">Your final score is: <span className="font-extrabold text-white">{score}</span> out of {questions.length}</p>
                        <div className="flex justify-center space-x-4">
                            <button onClick={restartGame} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg text-lg transition-transform transform hover:scale-105 duration-300">
                                Play Again
                            </button>
                            <button onClick={goToMenu} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-lg transition-transform transform hover:scale-105 duration-300">
                                Main Menu
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
