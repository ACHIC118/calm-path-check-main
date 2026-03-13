import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";

const VALID_CODE = "SCL2024";

const InvitePage = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === VALID_CODE) {
      navigate("/test");
    } else {
      setError("邀请码无效，请重新输入");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            SCL-90 症状自评量表
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-sm">
            本量表用于评估您近一周的心理健康状况，共 90 道题目，约需 15-20 分钟完成。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="请输入邀请码"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              className="h-12 text-center text-lg tracking-widest"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <Button type="submit" size="lg" className="w-full text-base">
            开始测试
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          提示：请联系管理员获取邀请码
        </p>
      </div>
    </div>
  );
};

export default InvitePage;
