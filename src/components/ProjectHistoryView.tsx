import React, { useState, useEffect } from "react";
import { 
  FolderOpen, Film, Image as ImageIcon, Mic, Smile, Download, 
  Trash2, Play, ExternalLink, RefreshCw, Edit3, CheckCircle2
} from "lucide-react";
import { Language, UserAccount, GenerationJob } from "../types";
import { translations } from "../data/translations";

interface ProjectHistoryViewProps {
  user: UserAccount;
  language: Language;
  onSendToEditor: (videoUrl: string) => void;
}

export const ProjectHistoryView: React.FC<ProjectHistoryViewProps> = ({
  user,
  language,
  onSendToEditor,
}) => {
  const t = translations[language];

  const [filter, setFilter] = useState<string>("all");
  const [projects, setProjects] = useState<GenerationJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState<GenerationJob | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/${user.id}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const filteredProjects = filter === "all"
    ? projects
    : projects.filter((p) => p.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case "text_to_video":
      case "image_to_video":
        return <Film className="w-4 h-4 text-rose-400" />;
      case "cartoon_story":
        return <Smile className="w-4 h-4 text-amber-400" />;
      case "voiceover":
        return <Mic className="w-4 h-4 text-blue-400" />;
      case "image_gen":
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      default:
        return <Film className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              {t.historyTitle}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.historyDesc}
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={isLoading}
          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "all", label: "All Projects" },
          { id: "text_to_video", label: "AI Videos" },
          { id: "cartoon_story", label: "3D Cartoons" },
          { id: "image_to_video", label: "Image-to-Video" },
          { id: "image_gen", label: "Images" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              filter === tab.id
                ? "bg-purple-500/20 border-purple-500 text-purple-300"
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <FolderOpen className="w-10 h-10 text-neutral-600 mx-auto" />
          <p className="text-sm text-neutral-400">
            {t.noProjects}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl hover:border-neutral-700 transition flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                      {getIcon(proj.type)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white line-clamp-1">
                        {proj.title}
                      </h3>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      proj.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2">
                  "{proj.prompt}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                {proj.resultUrl ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewItem(proj)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1 transition"
                    >
                      <Play className="w-3 h-3 text-rose-400" />
                      <span>Preview</span>
                    </button>

                    <a
                      href={proj.resultUrl}
                      download="creator_project"
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-[10px] text-neutral-500 italic">
                    Processing in GPU queue...
                  </span>
                )}

                {proj.resultUrl && (proj.type.includes("video") || proj.type.includes("story")) && (
                  <button
                    onClick={() => onSendToEditor(proj.resultUrl!)}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Preview */}
      {previewItem && previewItem.resultUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white truncate max-w-[220px]">
                {previewItem.title}
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-neutral-700">
              <video
                src={previewItem.resultUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
                loop
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
