"use client";

import { useToolInput } from "@/components/useToolInput";
import { useState } from "react";
import { Output } from "@/components/ui";

const TEMPLATES: Record<string, string[]> = {
  Node: ["node_modules/", "npm-debug.log*", "yarn-debug.log*", "yarn-error.log*", "pnpm-debug.log*", ".npm/", "*.tsbuildinfo"],
  "Next.js": [".next/", "out/", "next-env.d.ts", ".vercel/"],
  Vite: ["dist/", "dist-ssr/", "*.local"],
  Python: ["__pycache__/", "*.py[cod]", ".venv/", "venv/", "*.egg-info/", ".pytest_cache/", ".mypy_cache/", "dist/", "build/"],
  Django: ["*.log", "db.sqlite3", "media/", "staticfiles/"],
  Java: ["*.class", "*.jar", "*.war", "target/", "hs_err_pid*"],
  Gradle: [".gradle/", "build/", "!gradle/wrapper/gradle-wrapper.jar"],
  Android: ["*.apk", "*.aab", "local.properties", ".cxx/", "captures/", ".externalNativeBuild/"],
  Kotlin: ["*.class", ".kotlin/"],
  Go: ["*.exe", "*.test", "*.out", "vendor/", "go.work"],
  Rust: ["target/", "**/*.rs.bk"],
  PHP: ["vendor/", ".phpunit.result.cache"],
  Laravel: ["/vendor", "/node_modules", "/public/hot", "/public/storage", "/storage/*.key", ".env.backup", "Homestead.json"],
  Ruby: ["*.gem", ".bundle/", "vendor/bundle", "log/", "tmp/"],
  Swift: ["xcuserdata/", "DerivedData/", "*.xcuserstate", ".build/", "Pods/"],
  Flutter: [".dart_tool/", ".flutter-plugins", ".flutter-plugins-dependencies", "build/", ".pub-cache/"],
  Unity: ["[Ll]ibrary/", "[Tt]emp/", "[Oo]bj/", "[Bb]uild/", "[Ll]ogs/", "*.csproj", "*.sln"],
  Terraform: [".terraform/", "*.tfstate", "*.tfstate.*", "crash.log", "*.tfvars"],
  Docker: [".docker/", "docker-compose.override.yml"],
  macOS: [".DS_Store", ".AppleDouble", ".LSOverride", "._*"],
  Windows: ["Thumbs.db", "ehthumbs.db", "Desktop.ini", "$RECYCLE.BIN/"],
  Linux: ["*~", ".directory", ".Trash-*"],
  "VS Code": [".vscode/*", "!.vscode/settings.json", "!.vscode/extensions.json"],
  JetBrains: [".idea/", "*.iml", "out/"],
  Env: [".env", ".env.*", "!.env.example"],
  Logs: ["logs/", "*.log"],
  Coverage: ["coverage/", ".nyc_output/", "htmlcov/"],
};

export default function GitignoreTool() {
  const [picked, setPicked] = useState<string[]>(["Node", "Next.js", "macOS", "Env"]);
  useToolInput("gitignore", (settings) => {
    if (settings.picked !== undefined) setPicked(settings.picked as typeof picked);
  });
  const toggle = (k: string) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const seen = new Set<string>();
  const out = picked
    .map((k) => {
      const lines = TEMPLATES[k].filter((l) => !seen.has(l) && seen.add(l));
      return lines.length ? `# ${k}\n${lines.join("\n")}` : "";
    })
    .filter(Boolean)
    .join("\n\n");

  return (
    <>
      <div className="chips">
        {Object.keys(TEMPLATES).map((k) => (
          <button key={k} className={`chip ${picked.includes(k) ? "active" : ""}`} onClick={() => toggle(k)}>{k}</button>
        ))}
      </div>
      <Output label=".gitignore" value={out} rows={16} />
      <div className="btn-group">
        <a className="btn" href={`data:text/plain;charset=utf-8,${encodeURIComponent(out + "\n")}`} download=".gitignore">Download .gitignore</a>
      </div>
    </>
  );
}
