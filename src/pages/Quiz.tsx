import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");

  const quiz = {
    title: "The Romantic's Quiz",
    questions: [
      {
        id: 1,
        text: "Would you move for love?",
        options: [
          "Absolutely",
          "Maybe, for the right person",
          "No, my roots are here"
        ]
      },
      {
        id: 2,
        text: "How do you handle conflict in relationships?",
        options: [
          "Address it immediately",
          "Take time to think, then discuss",
          "Avoid confrontation when possible"
        ]
      },
      {
        id: 3,
        text: "What's your ideal Friday night?",
        options: [
          "Going out to socialize",
          "Quiet evening at home",
          "Mix of both, depending on mood"
        ]
      }
    ]
  };

  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setExplanation("");
    } else {
      // Quiz complete
      navigate("/explore");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-card rounded-full p-3 shadow-card"
            >
              <ArrowLeft size={20} className="text-card-foreground" />
            </button>
            <h1 className="text-2xl font-black text-foreground">{quiz.title}</h1>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Question {currentQuestion + 1} of {totalQuestions}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="px-6 py-8">
          <div className="bg-card rounded-3xl p-8 shadow-soft border-2 border-primary">
            <h2 className="text-2xl font-black text-card-foreground mb-6 text-center">
              {quiz.questions[currentQuestion].text}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full p-4 rounded-2xl text-left font-medium transition-all ${
                    selectedAnswer === option
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Explanation Box */}
            {selectedAnswer && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Write an explanation (optional)
                </label>
                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Why did you choose this answer?"
                  className="min-h-[100px] rounded-2xl"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          {selectedAnswer && (
            <Button
              onClick={handleNext}
              className="w-full mt-6 h-14 rounded-2xl text-lg font-bold"
            >
              {currentQuestion < totalQuestions - 1 ? "Next Question" : "Complete Quiz"}
            </Button>
          )}

          {/* Instant Feedback */}
          {selectedAnswer && (
            <div className="mt-6 bg-accent/5 border border-accent rounded-2xl p-4 text-center">
              <p className="text-sm text-accent font-medium">
                Your match type is evolving: <span className="font-black">The Steady Soul</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Quiz;
