import { Component, For, Show, createSignal, onCleanup, onMount } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"
import { Tag } from "@opencode-ai/ui/v2/badge-v2"
import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { TextInputV2 } from "@opencode-ai/ui/v2/text-input-v2"

interface ModelItem {
  id: string
  name: string
  repo: string
  tagline: string
  category: string
  size: string
  contextLength: string
  defaultFilename: string
  isDownloaded?: boolean
  diskSize?: string
  downloading?: boolean
  progress?: number
  speed?: string
}

export const SovereignModelHubView: Component = () => {
  const [models, setModels] = createSignal<ModelItem[]>([])
  const [filter, setFilter] = createSignal("")
  const [activeCategory, setActiveCategory] = createSignal("All")
  const [runnerStatus, setRunnerStatus] = createSignal("Detecting offline engine...")
  const [runningModelId, setRunningModelId] = createSignal<string | null>(null)

  const refreshCatalog = async () => {
    try {
      // @ts-ignore
      if (window.api?.vigyan?.listCatalog) {
        // @ts-ignore
        const list = await window.api.vigyan.listCatalog()
        setModels(list)
        // @ts-ignore
        const status = await window.api.vigyan.getStatus()
        setRunnerStatus(status.activeRunner)
      }
    } catch (e) {
      console.error("Failed to load catalog", e)
    }
  }

  onMount(() => {
    refreshCatalog()

    // @ts-ignore
    if (window.api?.vigyan?.onDownloadProgress) {
      // @ts-ignore
      const cleanup = window.api.vigyan.onDownloadProgress((data: any) => {
        setModels((prev) =>
          prev.map((m) => {
            if (m.id === data.modelId) {
              return {
                ...m,
                downloading: data.percent < 100,
                progress: data.percent,
                speed: data.speedMbps,
                isDownloaded: data.percent >= 100
              }
            }
            return m
          })
        )
        if (data.percent >= 100) {
          refreshCatalog()
        }
      })
      onCleanup(() => cleanup())
    }
  })

  const startDownload = async (modelId: string) => {
    try {
      setModels((prev) =>
        prev.map((m) => (m.id === modelId ? { ...m, downloading: true, progress: 0 } : m))
      )
      // @ts-ignore
      await window.api?.vigyan?.downloadModel(modelId)
    } catch (err: any) {
      alert("Download error: " + err.message)
      refreshCatalog()
    }
  }

  const runModel = async (modelId: string) => {
    try {
      setRunningModelId(modelId)
      // @ts-ignore
      const res = await window.api?.vigyan?.runOffline(modelId)
      alert(res.message || "Model running offline!")
      refreshCatalog()
    } catch (err: any) {
      alert("Runner error: " + err.message)
      setRunningModelId(null)
    }
  }

  const categories = ["All", "Code Agent", "Reasoning / Math", "Legal / Vidhi", "MoE", "SQL Engine", "Cybersecurity"]

  const filteredModels = () => {
    return models().filter((m) => {
      const matchCat = activeCategory() === "All" || m.category === activeCategory()
      const matchSearch =
        m.name.toLowerCase().includes(filter().toLowerCase()) ||
        m.tagline.toLowerCase().includes(filter().toLowerCase())
      return matchCat && matchSearch
    })
  }

  return (
    <div class="flex flex-col h-full overflow-y-auto no-scrollbar px-6 py-6 gap-6">
      
      <div class="flex flex-col gap-2 p-5 rounded-xl border border-[var(--border-base,#222226)] bg-[#07070a]">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-18-bold text-white tracking-wide">Vigyan Sovereign Model Hub</span>
            <Tag variant="primary">Offline First</Tag>
          </div>
          <div class="flex items-center gap-2 text-12-regular text-[#888899]">
            <span>Engine:</span>
            <span class="text-white font-mono">{runnerStatus()}</span>
          </div>
        </div>
        <p class="text-13-regular text-[#a0a0b0]">
          1-Click download and execute sovereign AI models from Hugging Face (<code class="text-white">shreyansh12183</code>). 
          Run 100% offline on your device with zero telemetry and zero cloud dependencies.
        </p>
      </div>

      
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          <For each={categories}>
            {(cat) => (
              <button
                class={`px-3 py-1 rounded-full text-12-medium transition-all ${
                  activeCategory() === cat
                    ? "bg-white text-black font-bold"
                    : "bg-[#111116] text-[#888899] hover:text-white"
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            )}
          </For>
        </div>
        <div class="w-full md:w-64">
          <TextInputV2
            placeholder="Search sovereign models..."
            value={filter()}
            onInput={(e: any) => setFilter(e.target.value)}
          />
        </div>
      </div>

      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <For each={filteredModels()}>
          {(model) => (
            <div class="flex flex-col justify-between p-4 rounded-xl border border-[#1a1a22] bg-[#09090d] hover:border-[#333344] transition-all">
              <div class="flex flex-col gap-2">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex flex-col">
                    <span class="text-15-bold text-white">{model.name}</span>
                    <span class="text-11-mono text-[#666677]">{model.repo}</span>
                  </div>
                  <Tag variant="secondary">{model.category}</Tag>
                </div>

                <p class="text-12-regular text-[#9999aa] leading-relaxed min-h-[36px]">
                  {model.tagline}
                </p>

                <div class="flex items-center gap-4 text-11-mono text-[#777788] pt-2 border-t border-[#16161e]">
                  <span>Size: {model.size}</span>
                  <span>•</span>
                  <span>Context: {model.contextLength}</span>
                </div>
              </div>

              
              <div class="mt-4 pt-3 border-t border-[#16161e]">
                <Show when={model.downloading}>
                  <div class="flex flex-col gap-1.5 w-full">
                    <div class="flex justify-between text-11-mono text-white">
                      <span>Downloading from HF... {model.progress || 0}%</span>
                      <span>{model.speed || "0"} MB/s</span>
                    </div>
                    <div class="w-full bg-[#1c1c24] h-2 rounded-full overflow-hidden">
                      <div
                        class="bg-white h-full transition-all duration-300"
                        style={{ width: `${model.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </Show>

                <Show when={!model.downloading}>
                  <div class="flex items-center justify-between gap-2">
                    <Show
                      when={model.isDownloaded}
                      fallback={
                        <ButtonV2
                          variant="primary"
                          class="w-full text-12-medium"
                          onClick={() => startDownload(model.id)}
                        >
                          1-Click Download ({model.size})
                        </ButtonV2>
                      }
                    >
                      <div class="flex items-center gap-2 w-full">
                        <Tag variant="primary" class="shrink-0">Downloaded</Tag>
                        <ButtonV2
                          variant="primary"
                          class="w-full text-12-medium"
                          onClick={() => runModel(model.id)}
                        >
                          {runningModelId() === model.id ? "Running..." : "Run Offline"}
                        </ButtonV2>
                      </div>
                    </Show>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
