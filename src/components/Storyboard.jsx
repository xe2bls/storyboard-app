import { useEffect, useState, useCallback, useRef } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
} from "firebase/firestore";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { db } from "../firebase";
import SceneCard from "./SceneCard";

const COLLECTION = "scenes";

export default function Storyboard({ user }) {
  const [scenes, setScenes] = useState([]);
  const debounceTimers = useRef({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setScenes(data);
    });
    return () => unsub();
  }, []);

  // Debounced field update → Firestore
  const handleUpdate = useCallback((id, fields) => {
    // Optimistic local update
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...fields } : s))
    );

    // Debounce the Firestore write
    const key = `${id}-${Object.keys(fields).join(",")}`;
    clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(() => {
      const ref = doc(db, COLLECTION, id);
      setDoc(ref, fields, { merge: true });
    }, 400);
  }, []);

  async function addScene() {
    const id = crypto.randomUUID();
    const newScene = {
      title: "",
      description: "",
      imageUrl: "",
      order: scenes.length,
      createdBy: user.uid,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, COLLECTION, id), newScene);
  }

  async function deleteScene(id) {
    await deleteDoc(doc(db, COLLECTION, id));
    // Re-index remaining scenes
    const remaining = scenes.filter((s) => s.id !== id);
    const batch = writeBatch(db);
    remaining.forEach((s, i) => {
      batch.update(doc(db, COLLECTION, s.id), { order: i });
    });
    await batch.commit();
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = scenes.findIndex((s) => s.id === active.id);
    const newIndex = scenes.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(scenes, oldIndex, newIndex);

    // Optimistic
    setScenes(reordered);

    // Persist new order
    const batch = writeBatch(db);
    reordered.forEach((s, i) => {
      batch.update(doc(db, COLLECTION, s.id), { order: i });
    });
    await batch.commit();
  }

  return (
    <div className="storyboard">
      <header className="board-header">
        <div className="board-title-group">
          <h1>Storyboard</h1>
          <span className="scene-count">{scenes.length} scene{scenes.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="header-right">
          <div className="user-pill">
            <img src={user.photoURL} alt="" className="avatar" referrerPolicy="no-referrer" />
            <span>{user.displayName?.split(" ")[0]}</span>
          </div>
        </div>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={scenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="scene-list">
            {scenes.map((scene, i) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                index={i}
                onUpdate={handleUpdate}
                onDelete={deleteScene}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button className="add-scene-btn" onClick={addScene}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="9" y1="3" x2="9" y2="15" />
          <line x1="3" y1="9" x2="15" y2="9" />
        </svg>
        Add scene
      </button>
    </div>
  );
}
