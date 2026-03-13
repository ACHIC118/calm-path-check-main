import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FACTORS, FACTOR_ITEMS, type Factor } from "@/data/scl90-questions";
import { Button } from "@/components/ui/button";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const answers: Record<number, number> = location.state?.answers ?? {};
  const nickname: string | undefined = location.state?.nickname;
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  if (!Object.keys(answers).length) {
    navigate("/");
    return null;
  }

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const avgScore = (totalScore / 90).toFixed(2);

  const factorScores = FACTORS.map((factor) => {
    const items = FACTOR_ITEMS[factor as Factor];
    const sum = items.reduce((acc, id) => acc + (answers[id] || 1), 0);
    const avg = +(sum / items.length).toFixed(2);
    return { factor, sum, avg, count: items.length };
  });

  const radarData = factorScores.map((f) => ({
    factor: f.factor,
    score: f.avg,
    fullMark: 5,
  }));

  useEffect(() => {
    const saveResult = async () => {
      if (!nickname || saveStatus !== "idle") return;
      setSaveStatus("saving");
      const { error } = await supabase.from("test_results").insert({
        nickname,
        total_score: totalScore,
        avg_score: Number(avgScore),
        factor_scores: factorScores.map((f) => ({
          factor: f.factor,
          avg: f.avg,
          sum: f.sum,
          count: f.count,
        })),
      });
      if (error) {
        console.error("保存到 Supabase 失败：", error);
        setSaveStatus("error");
      } else {
        setSaveStatus("success");
      }
    };

    void saveResult();
  }, [nickname, totalScore, avgScore, factorScores, saveStatus]);

  const getSeverity = (avg: number) => {
    if (avg < 1.5) return { text: "正常", color: "text-primary" };
    if (avg < 2.5) return { text: "轻度", color: "text-accent-foreground" };
    if (avg < 3.5) return { text: "中度", color: "text-orange-500" };
    return { text: "偏重", color: "text-destructive" };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">测试结果</h1>
          <p className="text-muted-foreground">SCL-90 症状自评量表评估报告</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">总分</p>
            <p className="text-3xl font-bold text-primary">{totalScore}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">均分</p>
            <p className="text-3xl font-bold text-primary">{avgScore}</p>
          </div>
        </div>

        {nickname && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm flex items-center justify-between">
            <span className="text-muted-foreground">
              昵称：<span className="font-medium text-foreground">{nickname}</span>
            </span>
            <span className="text-xs">
              {saveStatus === "saving" && "正在保存到 Supabase..."}
              {saveStatus === "success" && "已保存到 Supabase"}
              {saveStatus === "error" && "保存到 Supabase 失败（请检查控制台）"}
            </span>
          </div>
        )}

        {/* Radar Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-card-foreground mb-4 text-center">
            因子得分雷达图
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="factor"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <Radar
                name="得分"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Factor Details */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-lg font-semibold text-card-foreground">各因子详情</h2>
          <div className="divide-y divide-border">
            {factorScores.map((f) => {
              const severity = getSeverity(f.avg);
              return (
                <div key={f.factor} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-medium text-card-foreground">{f.factor}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({f.count}题)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      均分 {f.avg}
                    </span>
                    <span className={`text-sm font-medium ${severity.color}`}>
                      {severity.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl bg-accent/50 p-4 text-sm text-accent-foreground">
          <p className="font-medium mb-1">⚠️ 温馨提示</p>
          <p>
            本测试结果仅供参考，不能作为临床诊断依据。如有心理困扰，建议寻求专业心理咨询师或精神科医生的帮助。
          </p>
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重新测试
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
