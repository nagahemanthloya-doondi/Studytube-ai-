
import React, { useState } from 'react';
import type { QuizItem } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizViewProps {
  quiz: QuizItem[] | null;
  setQuiz: React.Dispatch<React.SetStateAction<QuizItem[] | null>>;
  isGeneratingQuiz: boolean;
  quizError: string | null;
  userAnswers: Record<number, string>;
  quizResult: { score: number; total: number } | null;
  onGenerateQuiz: () => void;
  onAnswerChange: (questionIndex: number, answer: string) => void;
  onCheckAnswers: () => void;
  onResetQuiz: () => void;
}

const ManualQuestionForm: React.FC<{onSave: (item: QuizItem) => void; onCancel: () => void;}> = ({ onSave, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    setError('');
    const filledOptions = options.filter(opt => opt.trim() !== '');
    if (question.trim() === '' || filledOptions.length < 2 || correctAnswerIndex === null || options[correctAnswerIndex].trim() === '') {
      setError('Please fill in the question, at least two options, and select a correct answer.');
      return;
    }
    
    onSave({
      question: question.trim(),
      options: filledOptions,
      correctAnswer: options[correctAnswerIndex].trim()
    });
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 mt-4">
      <h4 className="font-semibold mb-2">Add New Question</h4>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors text-sm"
      />
      <div className="grid grid-cols-2 gap-2 mt-2">
        {options.map((opt, index) => (
          <div key={index} className="flex items-center">
             <input
              type="radio"
              name="correct-answer"
              checked={correctAnswerIndex === index}
              onChange={() => setCorrectAnswerIndex(index)}
              className="h-4 w-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="w-full p-2 ml-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors text-sm"
            />
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      <div className="flex gap-2 mt-3">
        <button onClick={handleSave} className="px-3 py-1 text-sm bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700">Save</button>
        <button onClick={onCancel} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
      </div>
    </div>
  );
};


const QuizView: React.FC<QuizViewProps> = (props) => {
  const { 
    quiz, 
    setQuiz,
    isGeneratingQuiz, 
    quizError, 
    userAnswers, 
    quizResult, 
    onGenerateQuiz, 
    onAnswerChange, 
    onCheckAnswers,
    onResetQuiz
  } = props;
  
  const [isAddingManually, setIsAddingManually] = useState(false);

  const renderInitialView = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <SparklesIcon className="mx-auto h-12 w-12 text-cyan-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Test Your Knowledge</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate an AI quiz or create your own to see what you've learned.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={onGenerateQuiz}
              disabled={isGeneratingQuiz}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800 disabled:bg-cyan-400 dark:disabled:bg-cyan-800 transition-colors"
            >
              <SparklesIcon className="h-4 w-4" />
              {isGeneratingQuiz ? 'Generating...' : 'Generate AI Quiz'}
            </button>
             <button
              onClick={() => setQuiz([])}
              disabled={isGeneratingQuiz}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-colors"
            >
              Create Manually
            </button>
        </div>
        {isGeneratingQuiz && <p className="text-xs text-gray-500 mt-3 animate-pulse">AI is thinking... this may take a moment.</p>}
        {quizError && <p className="text-sm text-red-500 mt-3">{quizError}</p>}
      </div>
    </div>
  );

  const getOptionStyle = (option: string, questionIndex: number) => {
    if (!quizResult || !quiz) return 'border-gray-300 dark:border-gray-600 hover:border-cyan-500 dark:hover:border-cyan-400';
    const isCorrect = option === quiz[questionIndex].correctAnswer;
    const isSelected = option === userAnswers[questionIndex];

    if (isCorrect) return 'border-green-500 bg-green-50 dark:bg-green-900/30';
    if (isSelected && !isCorrect) return 'border-red-500 bg-red-50 dark:bg-red-900/30';
    return 'border-gray-300 dark:border-gray-600';
  };
  
  if (isGeneratingQuiz) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <SparklesIcon className="mx-auto h-12 w-12 text-cyan-500 animate-pulse" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Generating Quiz...</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">The AI is crafting questions for you. This might take a moment.</p>
        </div>
    )
  }

  if (quiz === null) {
    return renderInitialView();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 overflow-y-auto">
        <AnimatePresence>
          {quizResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-4 text-center rounded-lg bg-cyan-100 dark:bg-cyan-900/50"
            >
              <h3 className="text-xl font-bold text-cyan-800 dark:text-cyan-200">
                You scored {quizResult.score} out of {quizResult.total}!
              </h3>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-6">
          {quiz.length > 0 ? quiz.map((item, index) => (
            <div key={index}>
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{index + 1}. {item.question}</p>
              <div className="space-y-2">
                {item.options.map((option, optIndex) => (
                  <label key={optIndex} className={`flex items-center p-3 w-full text-sm rounded-md border-2 transition-all cursor-pointer ${getOptionStyle(option, index)}`}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={userAnswers[index] === option}
                      onChange={() => onAnswerChange(index, option)}
                      disabled={!!quizResult}
                      className="h-4 w-4 text-cyan-600 border-gray-300 focus:ring-cyan-500 disabled:opacity-50"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )) : (
            <p className="text-center text-gray-500">No questions yet. Add one below to get started!</p>
          )}

          {!quizResult && (
            isAddingManually ? (
              <ManualQuestionForm
                onSave={(item) => {
                  setQuiz(prev => [...(prev || []), item]);
                  setIsAddingManually(false);
                }}
                onCancel={() => setIsAddingManually(false)}
              />
            ) : (
              <div className="text-center pt-4">
                <button
                  onClick={() => setIsAddingManually(true)}
                  className="px-4 py-2 border border-dashed border-gray-400 dark:border-gray-500 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Add Question
                </button>
              </div>
            )
          )}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 flex gap-2">
        {quizResult ? (
           <button onClick={onResetQuiz} className="w-full px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800 transition-all active:scale-95">
            Create a New Quiz
          </button>
        ) : (
          <button 
            onClick={onCheckAnswers}
            disabled={quiz.length === 0}
            className="w-full px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800 transition-all active:scale-95 disabled:bg-cyan-400 dark:disabled:bg-cyan-800"
          >
            Check Answers
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;
