import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export default function SceneCard({ scene, index, onUpdate, onDelete }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `storyboard/${scene.id}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onUpdate(scene.id, { imageUrl: url });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="scene-card">
      <div className="scene-header">
        <button className="drag-handle" {...attributes} {...listeners}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
        <span className="scene-number">{String(index + 1).padStart(2, "0")}</span>
        <input
          className="scene-title"
          type="text"
          placeholder="Scene title…"
          value={scene.title || ""}
          onChange={(e) => onUpdate(scene.id, { title: e.target.value })}
        />
        <button className="delete-btn" onClick={() => onDelete(scene.id)} title="Delete scene">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="2" y1="2" x2="12" y2="12" />
            <line x1="12" y1="2" x2="2" y2="12" />
          </svg>
        </button>
      </div>

      <div className="scene-body">
        <div
          className="image-slot"
          onClick={() => fileRef.current?.click()}
        >
          {scene.imageUrl ? (
            <img src={scene.imageUrl} alt={scene.title || "Scene"} />
          ) : (
            <div className="image-placeholder">
              {uploading ? (
                <span className="uploading-text">Uploading…</span>
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span>Add sketch</span>
                </>
              )}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageUpload}
          />
        </div>

        <textarea
          className="scene-description"
          placeholder="Describe the action, dialogue, camera angle…"
          value={scene.description || ""}
          onChange={(e) => onUpdate(scene.id, { description: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}
