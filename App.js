import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import { db } from "./firebase";
import {
      collection,
      addDoc, 
      getDocs,
      deleteDoc,
      doc,
      query,
      orderBy,
      serverTimestamp,
} from "firebase/firestore";

function App() {
      // Editor state
      const [htmlCode, setHtmlCode] = useState("");
      const [cssCode, setCssCode] = useState("");
      const [jsCode, setJsCode] = useState("");

      // Preview state
      const [srcDoc, setSrcDoc] = useState("");

      // History state
      const [history, setHistory] = useState([]);
      const [showHistory, setShowHistory] = useState(false);
      const [isSaving, setIsSaving] = useState(false);
      const [isClearing, setIsClearing] = useState(false);

       // Helper: build iframe srcDoc
      const buildSrcDoc = (html, css, js) => {
            return `
                   <!DOCTYPE html>
                      <html>
                         <head>
                            <meta charset="utf-8" />
                              <style>${css || ""}</style>
                         </head>
                          <body>
                             ${html || ""}
                          <script>
                              try {
                              ${js || ""}
                              } catch (e) {
                                 console.error(e);
                                 const pre = document.createElement('pre');
                                 pre.style.color = 'red';
                                 pre.textContent = 'Runtime error: ' + e.message;
                                 document.body.appendChild(pre);
                              }
                           <\/script>
                            </body>
                       </html>
                   `;
                              };

      // Update preview whenever code changes (debounced for smoother typing)
       const debouncedSrcDoc = useMemo(() => buildSrcDoc(htmlCode, cssCode, jsCode), [htmlCode, cssCode, jsCode]);
            useEffect(() => {
                  const t = setTimeout(() => setSrcDoc(debouncedSrcDoc), 150);
                        return () => clearTimeout(t);
                  }, [debouncedSrcDoc]);

                   // Firestore: load history (most recent first)
                  const loadHistory = async () => {
                         try {
                              const q = query(collection(db, "codes"), orderBy("createdAt", "desc"));
                              const snap = await getDocs(q);
                              const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                              setHistory(data);
                              } catch (err) {
                                    console.error("Error loading history:", err);
                                    alert("Failed to load history. Check your Firestore rules/connection.");
                              }
                  };

       // On mount: load history
            useEffect(() => {
                  loadHistory();
            }, []);

       // Save current editor as a new history item
       const saveCurrent = async () => {
            setIsSaving(true);
       try {
            await addDoc(collection(db, "codes"), {
                  html: htmlCode,
                  css: cssCode,
                  js: jsCode,
                  createdAt: serverTimestamp(),
            });
            await loadHistory();
            alert("✅ Saved to Firestore!");
            } catch (err) {
                  console.error("Error saving:", err);
                  alert("❌ Save failed. Check Firestore rules and your firebase config.");
            } finally {
                  setIsSaving(false);
            }
      };

      // Delete one item from history
      const deleteItem = async (id) => {
      if (!window.confirm("Delete this entry permanently?")) return;
            try {
                  await deleteDoc(doc(db, "codes", id));
                  await loadHistory();
                  } catch (err) {
                        console.error("Error deleting:", err);
                        alert("❌ Delete failed. Check permissions.");
            }
      };

       // Clear ALL history
      const clearAll = async () => {
      if (!window.confirm("Delete ALL history entries? This cannot be undone.")) return;
            setIsClearing(true);
       try {
             const snap = await getDocs(collection(db, "codes"));
             const deletions = snap.docs.map((d) => deleteDoc(doc(db, "codes", d.id)));
             await Promise.all(deletions);
             setHistory([]);
           } catch (err) {
                 console.error("Error clearing history:", err);
                 alert("❌ Failed to clear history.");
           } finally {
                 setIsClearing(false);
           }
      };

      // Load a history entry into the editor
      const loadEntryIntoEditor = (entry) => {
            setHtmlCode(entry.html || "");
            setCssCode(entry.css || "");
            setJsCode(entry.js || "");
           // Preview will rebuild automatically via useEffect
      };

            return (
             <div className="App" style={{ fontFamily: "Inter, system-ui, Arial, sans-serif" }}>
                  {/* Top bar */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderBottom: "1px solid #eee" }}>
                  <button onClick={saveCurrent} disabled={isSaving} style={btn()}>
                  {isSaving ? "Saving..." : "💾 Save"}
                  </button>
                  <button onClick={() => setShowHistory((s) => !s)} style={btn()}>
                   📜 History
                  </button>
             </div>

             {/* Editors + Preview */}
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 12 }}>
             <div style={{ display: "grid", gridTemplateRows: "1fr 1fr 1fr", gap: 12, minHeight: "70vh" }}>
                  <Editor
                        label="HTML"
                        value={htmlCode}
                        onChange={setHtmlCode}
                        placeholder="<h1>Hello</h1>"
                  />
                  <Editor
                        label="CSS"
                        value={cssCode}
                        onChange={setCssCode}
                        placeholder="h1 { color: tomato; }"
                  />
                  <Editor
                        label="JS"
                        value={jsCode}
                        onChange={setJsCode}
                        placeholder="console.log('Hello from JS')"
                  />
             </div>

             <div style={{ display: "flex", flexDirection: "column", minHeight: "70vh" }}>
             <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Preview</div>
                  <iframe
                        title="preview"
                        sandbox="allow-scripts"
                        style={{
                              flex: 1,
                              width: "100%",
                              border: "1px solid #ddd",
                              borderRadius: 8,
                              background: "white",
                        }}
                        srcDoc={srcDoc}
                  />
             </div>
             </div>

                        
                                                                                                                                                                                                
                  {/* Sliding History Sidebar */}
                  <div style={{
                        position: "fixed",
                        top: 0,
                        right: showHistory ? 0 : -420,
                        width: 420,
                        height: "100%",
                        background: "#1e1e1e",
                        color: "#fff",
                                             
                        padding: 16,
                        boxShadow: "-4px 0 12px rgba(0,0,0,0.35)",
                                                                                                                                                                                                                                    
                        transition: "right 0.3s ease-in-out",
                        overflowY: "auto",
                        zIndex: 1000,
                  }}
                  >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                     <h2 style={{ margin: 0, fontSize: 18 }}>📜 History</h2>
                     <button onClick={() => setShowHistory(false)} style={btn("danger")}>Close</button>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <button onClick={loadHistory} style={btn()}>Refresh</button>
                        <button onClick={clearAll} disabled={isClearing} style={btn("danger")}>
                              {isClearing ? "Clearing..." : "Clear All"}
                        </button>
                  </div>

                  {history.length === 0 ? (
                        <p style={{ opacity: 0.8 }}>No history yet. Click “Save” to create your first snapshot.</p>
                  ) : (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                        {history.map((item) => (
                              <li key={item.id} style={{ background: "#2b2b2b", borderRadius: 10, padding: 12 }}>
                              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
                                    {item.createdAt?.toDate?.()
                                    ? item.createdAt.toDate().toLocaleString()
                                    : "Pending timestamp"}
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                                    <Snippet label="HTML" text={item.html} />
                                    <Snippet label="CSS" text={item.css} />
                                    <Snippet label="JS" text={item.js} />
                              </div>
                              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                                    <button onClick={() => loadEntryIntoEditor(item)} style={btn("primary")}>Load</button>
                                    <button onClick={() => deleteItem(item.id)} style={btn("danger")}>Delete</button>
                              </div>
                              </li>
                        ))}
                        </ul>
                  )}
            </div>
      </div>
);
}

/* ---------- Small UI helpers ---------- */

function Editor({ label, value, onChange, placeholder }) {
      return (
            <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{label}</div>
                  <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        spellCheck={false}
                        style={{
                        flex: 1,
                        minHeight: 0,
                        resize: "vertical",
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        background: "#0b0b0b",
                        color: "#fafafa",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        fontSize: 13,
                        lineHeight: 1.5,
                        }}
                  />
            </div>
      );
}

function Snippet({ label, text }) {
      const trimmed = (text || "").trim();
      const preview =
            trimmed.length > 120 ? trimmed.slice(0, 120) + "…" : trimmed || "—";
              return (
                  <div>
                        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>{label}</div>
                              <pre
                                    style={{
                                          margin: 0,
                                          whiteSpace: "pre-wrap",
                                          wordBreak: "break-word",
                                          background: "#1a1a1a",
                                          border: "1px solid #3a3a3a",
                                          borderRadius: 8,
                                          padding: 10,
                                          fontSize: 12,
                                          lineHeight: 1.4,
                                        }}
                              >
                                    {preview}
                              </pre>
                  </div>
      );
}

function btn(variant) {
      const base = {
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#f8f8f8",
            cursor: "pointer",
            fontWeight: 600,
      };
        if (variant === "danger") {
                return { ...base, background: "#ffebeb", borderColor: "#ffb8b8", color: "#c01818" };
        }
          if (variant === "primary") {
                return { ...base, background: "#eef4ff", borderColor: "#c9d8ff", color: "#1a48c2" };
          }
            return base;
}

export default App;
          
        
      

                                       
              

                                                                
      

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                                                                                                                                                                                                  
                                                              
                                                            
                                                                        
                                                                        
                                                                        
                                                        
                                                                
                                                          
                                                    
                                                            
                                                            
                                                                    
                                                           
                                                
                                            
                                                
                                                
                                        
                                    
                                                                                                                            
                                                                                                                            
                              























































