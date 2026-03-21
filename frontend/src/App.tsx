import { useState, useRef } from "react";

function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const LOADING_STEPS = [
    "// ANALYZING IMAGE...",
    "// ISOLATING SUBJECT...",
    "// STRIPPING BACKGROUND...",
    "// RENDERING OUTPUT...",
  ];
  const [loadingStep, setLoadingStep] = useState(0);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    fileRef.current = file;
    setOriginalImage(URL.createObjectURL(file));
    setResultImage(null);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemoveBackground = async () => {
    if (!fileRef.current) return;
    setIsLoading(true);
    setError(null);
    setLoadingStep(0);

    // Cycle through loading messages
    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 600);

    try {
      const formData = new FormData();
      formData.append("file", fileRef.current);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/remove-background`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      setResultImage(URL.createObjectURL(blob));
      setRevealKey((k) => k + 1); // triggers glitch animation
    } catch {
      setError("ERR: PROCESS FAILED — CHECK API CONNECTION");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-center justify-between py-4 border-b border-[var(--border)]">
        <h1 className="glitch text-2xl font-bold" data-text="VOID.EXTRACT">
          VOID.EXTRACT
        </h1>
        <span className="tag">v0.1.0 // BETA</span>
      </header>

      {/* Description */}
      <div className="panel rounded p-6 flex flex-col gap-2">
        <p className="font-mono text-xs text-[var(--accent)] opacity-70 tracking-widest">
          // SYSTEM DESCRIPTION
        </p>
        <p className="text-[var(--text-bright)] text-lg font-semibold leading-snug">
          Instant background removal — powered by AI.
        </p>
        <p className="text-[var(--text)] text-sm leading-relaxed">
          Upload any image and VOID.EXTRACT will isolate the subject and strip
          the background in seconds. No manual masking, no subscriptions. Drop
          your image below and hit extract.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`dropzone panel rounded p-12 flex flex-col items-center gap-4 text-center ${isDragging ? "active" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
        <p className="text-4xl">⬡</p>
        <p className="font-semibold text-[var(--text-bright)] tracking-wide">
          DROP IMAGE OR CLICK TO UPLOAD
        </p>
        <p className="text-sm font-mono text-[var(--text)] opacity-60">
          PNG / JPG / WEBP
        </p>
      </div>

      {/* Progress bar */}
      {isLoading && (
        <div className="progress-bar rounded">
          <div className="progress-bar-fill" />
        </div>
      )}

      {/* Error */}
      {error && <p className="error-msg">{error}</p>}

      {/* Action button */}
      <button
        className="btn-primary w-full py-4 text-lg rounded"
        onClick={handleRemoveBackground}
        disabled={!originalImage || isLoading}
      >
        {isLoading ? LOADING_STEPS[loadingStep] : "// EXTRACT SUBJECT"}
      </button>

      {/* Preview panels */}
      {originalImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="panel rounded overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
              <span className="tag">INPUT</span>
            </div>
            <div className="h-72 flex items-center justify-center p-4">
              <img src={originalImage} alt="Original" className="preview-img" />
            </div>
          </div>

          <div className="panel rounded overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
              <span className="tag">OUTPUT</span>
              {resultImage && (
                <a
                  href={resultImage}
                  download="void_extract.png"
                  className="tag hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  ↓ SAVE
                </a>
              )}
            </div>
            <div className="h-72 flex items-center justify-center p-4">
              {resultImage ? (
                <img
                  key={revealKey}
                  src={resultImage}
                  alt="Result"
                  className="preview-img result glitch-reveal"
                />
              ) : (
                <p className="font-mono text-sm opacity-30">AWAITING PROCESS</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-4 border-t border-[var(--border)] font-mono text-xs opacity-30 text-center">
        VOID.EXTRACT // ❤️ LOUISININI ❤️ // BACKGROUND REMOVAL SYSTEM //{" "}
        {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
