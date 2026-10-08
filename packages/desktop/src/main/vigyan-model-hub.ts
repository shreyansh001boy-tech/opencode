import { app, ipcMain, BrowserWindow } from "electron"
import * as fs from "node:fs"
import * as path from "node:path"
import * as os from "node:os"
import * as http from "node:http"
import * as https from "node:https"
import { spawn, type ChildProcess } from "node:child_process"

export interface SovereignModel {
  id: string
  name: string
  repo: string
  tagline: string
  category: "Code Agent" | "Reasoning / Math" | "Legal / Vidhi" | "Generalist" | "MoE" | "Cybersecurity" | "SQL Engine"
  size: string
  contextLength: string
  defaultFilename: string
  quants: {
    name: string
    filename: string
    size: string
  }[]
  systemPrompt: string
}

export const SOVEREIGN_CATALOG: SovereignModel[] = [
  {
    id: "vigyan-coder-7b",
    name: "Vigyan Coder 7B",
    repo: "shreyansh12183/vigyan-coder-qwen2.5-coder-7b",
    tagline: "Sovereign code synthesis, repository navigation & MCP tool agent",
    category: "Code Agent",
    size: "4.68 GB",
    contextLength: "32,768 tokens",
    defaultFilename: "vigyan-coder-7b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vigyan-coder-7b-q4_k_m.gguf", size: "4.68 GB" },
      { name: "Q8_0 (High Precision)", filename: "vigyan-coder-7b-q8_0.gguf", size: "8.12 GB" }
    ],
    systemPrompt: "You are Vigyan Coder, an elite sovereign coding and systems engineering AI created by ExperimentLab. You produce robust, production-grade code with zero placeholders."
  },
  {
    id: "vigyan-deepseek-r1-7b",
    name: "Vigyan R1 Reasoning 7B",
    repo: "shreyansh12183/vigyan-deepseek-r1-qwen-7b",
    tagline: "Autonomous chain-of-thought mathematical & algorithmic reasoning",
    category: "Reasoning / Math",
    size: "4.68 GB",
    contextLength: "32,768 tokens",
    defaultFilename: "vigyan-r1-7b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vigyan-r1-7b-q4_k_m.gguf", size: "4.68 GB" },
      { name: "Q8_0 (High Precision)", filename: "vigyan-r1-7b-q8_0.gguf", size: "8.12 GB" }
    ],
    systemPrompt: "You are Vigyan R1, a sovereign reasoning model designed for deep mathematical derivation and rigorous proof generation."
  },
  {
    id: "vidhi-legal-7b",
    name: "Vidhi Sovereign Legal 7B",
    repo: "shreyansh12183/vidhi-legal-7b",
    tagline: "Indian Law intelligence: BNS/BNSS statutory cross-referencing & jurisprudence",
    category: "Legal / Vidhi",
    size: "4.68 GB",
    contextLength: "32,768 tokens",
    defaultFilename: "vidhi-legal-7b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vidhi-legal-7b-q4_k_m.gguf", size: "4.68 GB" },
      { name: "Q8_0 (High Precision)", filename: "vidhi-legal-7b-q8_0.gguf", size: "8.12 GB" }
    ],
    systemPrompt: "You are Vidhi Legal, India's sovereign AI legal counsel. You analyze Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS), and Supreme Court precedence with strict statutory accuracy."
  },
  {
    id: "vidhi-legal-1.5b",
    name: "Vidhi Legal Edge 1.5B",
    repo: "shreyansh12183/vidhi-legal-qwen2.5-1.5b",
    tagline: "Ultra-fast sovereign edge legal assistant running on <2GB RAM",
    category: "Legal / Vidhi",
    size: "1.12 GB",
    contextLength: "16,384 tokens",
    defaultFilename: "vidhi-legal-1.5b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vidhi-legal-1.5b-q4_k_m.gguf", size: "1.12 GB" },
      { name: "Q8_0 (High Precision)", filename: "vidhi-legal-1.5b-q8_0.gguf", size: "1.89 GB" }
    ],
    systemPrompt: "You are Vidhi Legal Edge, a lightweight statutory assistant providing instant citation and legal definition verification."
  },
  {
    id: "vigyan-generalist-3b",
    name: "Vigyan Edge Generalist 3B",
    repo: "shreyansh12183/vigyan-generalist-qwen2.5-3b",
    tagline: "Efficient low-latency sovereign general-purpose engineering assistant",
    category: "Generalist",
    size: "2.14 GB",
    contextLength: "32,768 tokens",
    defaultFilename: "vigyan-generalist-3b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vigyan-generalist-3b-q4_k_m.gguf", size: "2.14 GB" }
    ],
    systemPrompt: "You are Vigyan Edge Generalist, an ultra-fast sovereign engineering assistant."
  },
  {
    id: "vigyan-moe-4x3b",
    name: "Vigyan MoE 4x3B Upcycled",
    repo: "shreyansh12183/vigyan-moe-4x3b",
    tagline: "Sparse Mixture of Experts with Top-2 routing across 4 specialized subnetworks",
    category: "MoE",
    size: "7.42 GB",
    contextLength: "32,768 tokens",
    defaultFilename: "vigyan-moe-4x3b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vigyan-moe-4x3b-q4_k_m.gguf", size: "7.42 GB" }
    ],
    systemPrompt: "You are Vigyan MoE, an advanced sparse mixture-of-experts model routing queries dynamically across domain expert weights."
  },
  {
    id: "vigyan-agentic-toolcall-7b",
    name: "Vigyan Agentic ToolCall 7B",
    repo: "shreyansh12183/vigyan-agentic-toolcall-7b",
    tagline: "Autonomous JSON-RPC tool calling, AST SymPy execution & MCP mastery",
    category: "Code Agent",
    size: "4.68 GB",
    contextLength: "32,768 tokens",
    defaultFilename: "vigyan-toolcall-7b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vigyan-toolcall-7b-q4_k_m.gguf", size: "4.68 GB" }
    ],
    systemPrompt: "You are Vigyan ToolCall, specialized in deterministic structured function calls, multi-turn agent execution, and MCP communication."
  },
  {
    id: "vigyan-sql-nl2sql-3b",
    name: "Vigyan NL2SQL Engine 3B",
    repo: "shreyansh12183/vigyan-sql-nl2sql-3b",
    tagline: "Zero-shot relational & graph database query synthesis (PostgreSQL / KùzuDB)",
    category: "SQL Engine",
    size: "2.14 GB",
    contextLength: "16,384 tokens",
    defaultFilename: "vigyan-sql-3b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vigyan-sql-3b-q4_k_m.gguf", size: "2.14 GB" }
    ],
    systemPrompt: "You are Vigyan NL2SQL, an expert database engineer converting natural language into precise, optimized SQL and Cypher queries."
  },
  {
    id: "vigyan-cyber-sec-7b",
    name: "Vigyan CyberSec Auditor 7B",
    repo: "shreyansh12183/vigyan-cyber-sec-7b",
    tagline: "Vulnerability surface analysis, memory safety audits & hardening patches",
    category: "Cybersecurity",
    size: "4.68 GB",
    contextLength: "32,768 tokens",
    defaultFilename: "vigyan-cyber-7b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vigyan-cyber-7b-q4_k_m.gguf", size: "4.68 GB" }
    ],
    systemPrompt: "You are Vigyan CyberSec, a sovereign application security researcher auditing code for CVEs, logic flaws, and defensive security hardening."
  },
  {
    id: "vidhi-contract-drafting-7b",
    name: "Vidhi Contract Drafter 7B",
    repo: "shreyansh12183/vidhi-contract-drafting-7b",
    tagline: "Master Service Agreements, iSAFE notes, non-disclosure & indemnity synthesis",
    category: "Legal / Vidhi",
    size: "4.68 GB",
    contextLength: "32,768 tokens",
    defaultFilename: "vidhi-contract-7b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vidhi-contract-7b-q4_k_m.gguf", size: "4.68 GB" }
    ],
    systemPrompt: "You are Vidhi Contract Drafter, specializing in commercial agreements, Indian Contract Act compliance, and clause risk mitigation."
  },
  {
    id: "vigyan-research-14b",
    name: "Vigyan Research Synthesis 14B",
    repo: "shreyansh12183/vigyan-research-qwen2.5-14b",
    tagline: "Complex technical whitepaper deconstruction & multi-document synthesis",
    category: "Reasoning / Math",
    size: "8.95 GB",
    contextLength: "32,768 tokens",
    defaultFilename: "vigyan-research-14b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vigyan-research-14b-q4_k_m.gguf", size: "8.95 GB" }
    ],
    systemPrompt: "You are Vigyan Research Synthesis, extracting core theorems, methodologies, and benchmarks from academic literature."
  },
  {
    id: "vigyan-vision-vl-7b",
    name: "Vigyan Vision VL 7B",
    repo: "shreyansh12183/vigyan-vision-vl-7b",
    tagline: "Multimodal architecture diagram interpretation & visual UI code generation",
    category: "Code Agent",
    size: "5.10 GB",
    contextLength: "32,768 tokens",
    defaultFilename: "vigyan-vision-7b-q4_k_m.gguf",
    quants: [
      { name: "Q4_K_M (Recommended)", filename: "vigyan-vision-7b-q4_k_m.gguf", size: "5.10 GB" }
    ],
    systemPrompt: "You are Vigyan Vision VL, translating technical wireframes and system diagrams into clean code."
  }
]

export class VigyanModelHub {
  private static activeDownloads = new Map<string, https.ClientRequest>()
  private static runnerProcess: ChildProcess | null = null

  public static getModelsDir(): string {
    const dir = path.join(os.homedir(), ".vigyan", "models")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    return dir
  }

  public static listCatalog() {
    const modelsDir = this.getModelsDir()
    return SOVEREIGN_CATALOG.map((model) => {
      const filePath = path.join(modelsDir, model.defaultFilename)
      const isDownloaded = fs.existsSync(filePath)
      let diskSize = ""
      if (isDownloaded) {
        const stats = fs.statSync(filePath)
        diskSize = `${(stats.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
      }
      return {
        ...model,
        isDownloaded,
        diskSize,
        localPath: isDownloaded ? filePath : null
      }
    })
  }

  public static async downloadModel(
    win: BrowserWindow | null,
    modelId: string,
    filename?: string
  ): Promise<{ success: boolean; message: string }> {
    const model = SOVEREIGN_CATALOG.find((m) => m.id === modelId)
    if (!model) {
      throw new Error(`Model not found: ${modelId}`)
    }
    const targetFile = filename || model.defaultFilename
    const modelsDir = this.getModelsDir()
    const targetPath = path.join(modelsDir, targetFile)
    const partPath = `${targetPath}.download`

    // URL to Hugging Face raw file
    const url = `https://huggingface.co/${model.repo}/resolve/main/${targetFile}`

    return new Promise((resolve, reject) => {
      let downloadedBytes = 0
      if (fs.existsSync(partPath)) {
        downloadedBytes = fs.statSync(partPath).size
      }

      const headers: Record<string, string> = {}
      if (downloadedBytes > 0) {
        headers["Range"] = `bytes=${downloadedBytes}-`
      }

      const fileStream = fs.createWriteStream(partPath, { flags: downloadedBytes > 0 ? "a" : "w" })
      const startTime = Date.now()

      const req = https.get(url, { headers }, (res) => {
        // Follow redirects (Hugging Face redirects to CDN)
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
          const redirectUrl = res.headers.location
          if (redirectUrl) {
            https.get(redirectUrl, { headers }, (redirectRes) => {
              this.handleDownloadStream(redirectRes, fileStream, win, modelId, downloadedBytes, startTime, partPath, targetPath, resolve, reject)
            }).on("error", reject)
            return
          }
        }
        this.handleDownloadStream(res, fileStream, win, modelId, downloadedBytes, startTime, partPath, targetPath, resolve, reject)
      })

      req.on("error", (err) => {
        fileStream.close()
        reject(err)
      })

      this.activeDownloads.set(modelId, req)
    })
  }

  private static handleDownloadStream(
    res: http.IncomingMessage,
    fileStream: fs.WriteStream,
    win: BrowserWindow | null,
    modelId: string,
    existingBytes: number,
    startTime: number,
    partPath: string,
    targetPath: string,
    resolve: (val: any) => void,
    reject: (err: any) => void
  ) {
    const totalBytes = existingBytes + parseInt(res.headers["content-length"] || "0", 10)
    let currentBytes = existingBytes

    res.on("data", (chunk: Buffer) => {
      currentBytes += chunk.length
      fileStream.write(chunk)

      const elapsedSec = (Date.now() - startTime) / 1000
      const speedMbps = elapsedSec > 0 ? ((currentBytes - existingBytes) / (1024 * 1024) / elapsedSec).toFixed(1) : "0"
      const percent = totalBytes > 0 ? Math.round((currentBytes / totalBytes) * 100) : 0

      if (win && !win.isDestroyed()) {
        win.webContents.send("vigyan-download-progress", {
          modelId,
          percent,
          currentBytes,
          totalBytes,
          speedMbps
        })
      }
    })

    res.on("end", () => {
      fileStream.end()
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath)
      }
      fs.renameSync(partPath, targetPath)
      this.activeDownloads.delete(modelId)
      resolve({ success: true, message: `Model ${modelId} successfully downloaded` })
    })

    res.on("error", (err) => {
      fileStream.close()
      this.activeDownloads.delete(modelId)
      reject(err)
    })
  }

  public static cancelDownload(modelId: string) {
    const req = this.activeDownloads.get(modelId)
    if (req) {
      req.destroy()
      this.activeDownloads.delete(modelId)
      return true
    }
    return false
  }

  public static async runOffline(modelId: string): Promise<{ success: boolean; endpoint: string; message: string }> {
    const model = SOVEREIGN_CATALOG.find((m) => m.id === modelId)
    if (!model) throw new Error("Model not found")

    const modelsDir = this.getModelsDir()
    const modelPath = path.join(modelsDir, model.defaultFilename)
    if (!fs.existsSync(modelPath)) {
      throw new Error(`Model file not found. Please download ${model.defaultFilename} first.`)
    }

    // 1. Check if Ollama is running on 11434
    const isOllamaRunning = await this.checkPortActive(11434)
    if (isOllamaRunning) {
      // Auto create Modelfile and register with Ollama
      const modelfileContent = `FROM ${modelPath}
PARAMETER temperature 0.2
PARAMETER num_ctx 8192
SYSTEM """${model.systemPrompt}"""`
      const modelfilePath = path.join(modelsDir, `Modelfile.${model.id}`)
      fs.writeFileSync(modelfilePath, modelfileContent)

      const ollamaProcess = spawn("ollama", ["create", model.id, "-f", modelfilePath])
      await new Promise((resolve) => {
        ollamaProcess.on("close", resolve)
      })

      return {
        success: true,
        endpoint: "http://127.0.0.1:11434/v1",
        message: `Registered sovereign model ${model.id} into local Ollama.`
      }
    }

    // 2. Otherwise launch llama-server
    if (this.runnerProcess) {
      this.runnerProcess.kill()
      this.runnerProcess = null
    }

    this.runnerProcess = spawn("llama-server", [
      "-m", modelPath,
      "--port", "8080",
      "--ctx-size", "8192",
      "-ngl", "99"
    ])

    return {
      success: true,
      endpoint: "http://127.0.0.1:8080/v1",
      message: `Launched sovereign model ${model.id} on http://127.0.0.1:8080/v1.`
    }
  }

  private static checkPortActive(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const client = http.get(`http://127.0.0.1:${port}/`, () => {
        resolve(true)
      })
      client.on("error", () => resolve(false))
      client.setTimeout(1000, () => {
        client.destroy()
        resolve(false)
      })
    })
  }

  public static async getStatus() {
    const ollamaActive = await this.checkPortActive(11434)
    const llamaServerActive = await this.checkPortActive(8080)
    return {
      ollamaActive,
      llamaServerActive,
      activeRunner: ollamaActive ? "Ollama (11434)" : llamaServerActive ? "llama-server (8080)" : "Offline (Ready to Launch)"
    }
  }
}

export function registerVigyanModelHubIpc() {
  ipcMain.handle("vigyan-list-catalog", () => {
    return VigyanModelHub.listCatalog()
  })

  ipcMain.handle("vigyan-download-model", async (event, modelId: string, filename?: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return await VigyanModelHub.downloadModel(win, modelId, filename)
  })

  ipcMain.handle("vigyan-cancel-download", (_event, modelId: string) => {
    return VigyanModelHub.cancelDownload(modelId)
  })

  ipcMain.handle("vigyan-run-offline", async (_event, modelId: string) => {
    return await VigyanModelHub.runOffline(modelId)
  })

  ipcMain.handle("vigyan-get-status", async () => {
    return await VigyanModelHub.getStatus()
  })
}
