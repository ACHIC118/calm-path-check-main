import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { questions, SCORE_LABELS } from "@/data/scl90-questions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Input } from "@/components/ui/input";

const PER_PAGE = 10;
const TOTAL_PAGES = Math.ceil(questions.length / PER_PAGE);

const TestPage = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const currentQuestions = questions.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const allCurrentAnswered = currentQuestions.every((q) => answers[q.id] !== undefined);

  const handleSelect = (questionId: number, score: number) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: score };
      if (Object.keys(next).length === 3) {
        const finalNickname = nickname.trim() || "测试用户";
        navigate("/result", { state: { answers: next, nickname: finalNickname } });
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (answeredCount < questions.length || !nickname.trim()) return;
    navigate("/result", { state: { answers, nickname: nickname.trim() } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1 -ml-2">
              <Home className="h-4 w-4" />
              返回首页
            </Button>
            <span>第 {page + 1} / {TOTAL_PAGES} 页</span>
            <span>已答 {answeredCount} / {questions.length} 题</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Questions */}
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-sm text-muted-foreground">请先填写您的昵称（用于保存测试结果）</p>
          <Input
            placeholder="请输入昵称，例如：小明"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        {currentQuestions.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-border bg-card p-4 space-y-3 transition-shadow hover:shadow-sm"
          >
            <p className="font-medium text-card-foreground">
              <span className="text-primary mr-2">{q.id}.</span>
              {q.text}
            </p>
            <div className="flex gap-2 flex-wrap">
              {SCORE_LABELS.map((label, idx) => {
                const score = idx + 1;
                const selected = answers[q.id] === score;
                return (
                  <button
                    key={score}
                    onClick={() => handleSelect(q.id, score)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {score} - {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一页
          </Button>

          {page < TOTAL_PAGES - 1 ? (
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={!allCurrentAnswered}
            >
              下一页
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length || !nickname.trim()}
            >
              提交
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
