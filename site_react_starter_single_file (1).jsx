import React, { useState, useCallback } from "react";

// Doudou Directe — single-file app (fixed syntax, messaging destinations, accueil image upload, selects for prof actions)
export default function App() {
  const [page, setPage] = useState("start");
  const [role, setRole] = useState(null); // "prof" | "eleve" | null
  const [eleveClasse, setEleveClasse] = useState(""); // selected class when an eleve logs in

  const classesDisponibles = ["CP", "CE1", "CE2", "CM1", "CM2"];

  const [comptes, setComptes] = useState([
    { nom: "Alice", email: "alice@mail.com", classe: "CM2", age: 12, id: 1, role: "eleve" },
    { nom: "Bob", email: "bob@mail.com", classe: "CM1", age: 13, id: 2, role: "eleve" },
    { nom: "Mme Dupont", email: "dupont@mail.com", classe: "Prof", age: 35, id: 3, role: "prof" }
  ]);

  // Data stores
  const [messages, setMessages] = useState([]); // {eleve?, dest, texte, date, classe}
  const [accueilItems, setAccueilItems] = useState([]); // {texte, image, classe}
  const [sanctions, setSanctions] = useState([]); // {eleve, date, raison, classe}
  const [notes, setNotes] = useState([]); // {eleve, note, date, commentaire, classe}
  const [devoirs, setDevoirs] = useState([]); // {eleve, texte, date, classe}

  // --- Header ---
  const Header = () => (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <div className="font-bold text-lg">Doudou Directe</div>
      <nav className="flex gap-4 items-center">
        {role && (
          <>
            <button onClick={() => setPage("home")}>Accueil</button>
            <button onClick={() => setPage("sanctions")}>Sanctions</button>
            <button onClick={() => setPage("devoirs")}>Devoirs</button>
            <button onClick={() => setPage("notes")}>Notes</button>
            <button onClick={() => setPage("messagerie")}>Messagerie</button>
            {role === "prof" && <button onClick={() => setPage("doudou")}>Doudou</button>}
          </>
        )}
        {role && <button onClick={() => { setRole(null); setPage("start"); setEleveClasse(""); }}>Déconnexion</button>}
      </nav>
    </header>
  );

  // --- Pages: Start / Login / Signup ---
  const PageStart = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6">
      <h1 className="text-4xl font-bold mb-6">Doudou Directe</h1>
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-slate-900 text-white rounded-xl" onClick={() => setPage("login")}>Se connecter</button>
        <button className="px-6 py-3 bg-white border rounded-xl" onClick={() => setPage("signup")}>Créer un compte</button>
      </div>
    </div>
  );

  const PageLogin = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6">
      <h2 className="text-3xl font-bold mb-4">Connexion</h2>
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm space-y-4">
        <input className="w-full p-2 border rounded" placeholder="Email" />
        <input className="w-full p-2 border rounded" placeholder="Mot de passe" type="password" />
        <button className="w-full bg-slate-900 text-white rounded p-2" onClick={() => setPage("role")}>Continuer</button>
      </div>
    </div>
  );

  const PageSignup = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6">
      <h2 className="text-3xl font-bold mb-4">Créer un compte</h2>
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm space-y-4">
        <input className="w-full p-2 border rounded" placeholder="Nom" />
        <input className="w-full p-2 border rounded" placeholder="Email" />
        <input className="w-full p-2 border rounded" placeholder="Mot de passe" type="password" />
        <button className="w-full bg-slate-900 text-white rounded p-2" onClick={() => setPage("role")}>Continuer</button>
      </div>
    </div>
  );

  // --- Role selection: students choose class; prof triggers email code (simulated) ---
  const PageRole = () => {
    const handleProfClick = () => {
      // simulate sending code via email then allow prof access
      alert("Un code a été envoyé par mail au professeur (simulation). Vous êtes connecté en tant que professeur.");
      setRole("prof");
      setPage("home");
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6">
        <h2 className="text-3xl font-bold mb-6">Vous êtes :</h2>
        <div className="flex flex-col gap-4">
          <button className="px-6 py-4 bg-blue-600 text-white rounded-xl" onClick={handleProfClick}>Professeur</button>
          <div className="flex flex-col gap-2">
            <span>Élève : choisissez votre classe</span>
            <select className="border p-2 rounded" onChange={e => { setRole("eleve"); setEleveClasse(e.target.value); setPage("home"); }}>
              <option value="">Choisir la classe</option>
              {classesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  };

  // --- Generic list page component used for Sanctions, Notes, Devoirs, Messagerie, Accueil ---
  // Props:
  //  - titre: string
  //  - items: array
  //  - setItems: setter
  //  - champs: [{ label, key }] (keys excluding 'eleve' or 'dest')
  //  - allowAdd: boolean
  //  - isMessage: boolean -> special handling for destinatary selection
  const PageListe = ({ titre, items, setItems, champs, allowAdd = false, isMessage = false }) => {
    const [newItem, setNewItem] = useState({});

    const handleAdd = () => {
      // minimal validation: when adding a student-targeted item, require eleve or dest
      if (allowAdd) {
        // if prof adds and selected eleve name, attach that eleve's classe automatically
        if (newItem.eleve) {
          const c = comptes.find(x => x.nom === newItem.eleve);
          if (c) newItem.classe = c.classe;
        }
        // if message has dest value, try attach dest classe when dest is an eleve
        if (newItem.dest) {
          const c = comptes.find(x => x.nom === newItem.dest);
          if (c && c.role === 'eleve') newItem.classe = c.classe;
        }
        // set date if missing
        if (!newItem.date) newItem.date = new Date().toLocaleDateString();

        setItems(prev => [...prev, newItem]);
        setNewItem({});
      }
    };

    // determine recipient options depending on context and current user role
    const recipientOptions = () => {
      if (isMessage) {
        if (role === 'eleve') return comptes.filter(c => c.role === 'prof');
        if (role === 'prof') return comptes.filter(c => c.role === 'eleve');
        return comptes;
      }
      // for other pages (sanctions/notes/devoirs) only professors add and they should select an eleve
      return comptes.filter(c => c.role === 'eleve');
    };

    // Filtered view for eleves: show only items matching their classe
    const visibleItems = items.filter(item => (role !== 'eleve') || (item.classe === eleveClasse));

    // compute student's average (for Notes) — average of notes for this student (by name)
    const studentAverage = () => {
      if (role !== 'eleve') return null;
      const myName = null; // we don't have login name in this prototype; so compute by class average
      const myNotes = notes.filter(n => n.classe === eleveClasse);
      if (myNotes.length === 0) return null;
      const sum = myNotes.reduce((acc, n) => acc + (parseFloat(n.note) || 0), 0);
      return (sum / myNotes.length).toFixed(2);
    };

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold mb-4">{titre}</h2>

        {allowAdd && role === 'prof' && (
          <div className="bg-white p-4 rounded shadow flex flex-col gap-2">
            {/* recipient select: for messages, dest selects depending on role; for others, choose eleve */}
            <select className="border p-2 rounded" value={newItem.eleve || ''} onChange={e => setNewItem(prev => ({ ...prev, eleve: e.target.value }))}>
              <option value="">Choisir un élève</option>
              {comptes.filter(c => c.role === 'eleve').map(c => (
                <option key={c.id} value={c.nom}>{c.nom} ({c.classe})</option>
              ))}
            </select>

            {/* other fields from champs */}
            {champs.map(c => (
              <input
                key={c.key}
                className="border p-2 rounded"
                placeholder={c.label}
                value={newItem[c.key] || ''}
                onChange={e => setNewItem(prev => ({ ...prev, [c.key]: e.target.value }))}
              />
            ))}

            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleAdd}>Ajouter</button>
          </div>
        )}

        {allowAdd && role === 'eleve' && isMessage && (
          <div className="bg-white p-4 rounded shadow flex flex-col gap-2">
            <select className="border p-2 rounded" value={newItem.dest || ''} onChange={e => setNewItem(prev => ({ ...prev, dest: e.target.value }))}>
              <option value="">Choisir un professeur</option>
              {comptes.filter(c => c.role === 'prof').map(c => (
                <option key={c.id} value={c.nom}>{c.nom} ({c.email})</option>
              ))}
            </select>
            <textarea className="border p-2 rounded" placeholder="Message" value={newItem.texte || ''} onChange={e => setNewItem(prev => ({ ...prev, texte: e.target.value }))} />
            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleAdd}>Envoyer</button>
          </div>
        )}

        {/* List of existing items */}
        {visibleItems.length === 0 ? (
          <p className="text-slate-500">Aucun {titre.toLowerCase()} pour l'instant.</p>
        ) : (
          visibleItems.map((item, i) => (
            <div key={i} className="bg-white p-4 rounded shadow flex flex-col gap-2">
              {champs.map(c => (
                <div key={c.key}><b>{c.label} :</b> {item[c.key]}</div>
              ))}

              {item.eleve && <div><b>Élève :</b> {item.eleve}</div>}
              {item.dest && <div><b>Destinataire :</b> {item.dest}</div>}
              {item.image && <img src={item.image} alt="item" className="max-w-full" />}

              {role === 'prof' && (
                <button className="text-red-500 self-start" onClick={() => setItems(prev => prev.filter((_, idx2) => idx2 !== i))}>Supprimer</button>
              )}
            </div>
          ))
        )}

        {/* student summary: average for notes by class (prototype) */}
        {role === 'eleve' && titre === 'Notes' && (
          <div className="mt-2 font-bold">Moyenne (classe {eleveClasse}) : {studentAverage() ?? '—'}</div>
        )}
      </div>
    );
  };

  // --- Accueil with image upload (drag & drop + file input) ---
  const PageHome = () => {
    const onDrop = useCallback((e) => {
      e.preventDefault();
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f && f.type.startsWith('image/')) {
        const url = URL.createObjectURL(f);
        setAccueilItems(prev => [...prev, { texte: '', image: url, classe: 'ALL' }]);
      }
    }, []);

    const onDragOver = (e) => e.preventDefault();

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Accueil</h2>

        {role === 'prof' && (
          <div className="mb-4">
            <form onSubmit={(e) => { e.preventDefault(); }}>
              <div className="flex gap-2">
                <input className="border p-2 rounded flex-1" placeholder="Ajouter un texte" value={newText} onChange={e => setNewText(e.target.value)} />
                <button type="button" className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => { if (newText) { setAccueilItems(prev => [...prev, { texte: newText, image: null, classe: 'ALL' }]); setNewText(''); } }}>Ajouter</button>
              </div>
            </form>

            <div className="mt-3 p-4 border-dashed border-2 rounded" onDrop={onDrop} onDragOver={onDragOver}>
              Glisse une image ici pour l'ajouter à l'accueil, ou utilise le bouton ci-dessous.
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { const url = URL.createObjectURL(f); setAccueilItems(prev => [...prev, { texte: '', image: url, classe: 'ALL' }]); } }} />
            </div>
          </div>
        )}

        {accueilItems.length === 0 ? <p className="text-slate-500">Aucun élément pour l'instant.</p> : accueilItems.map((item, i) => (
          <div key={i} className="bg-white p-4 rounded shadow mb-2 flex flex-col gap-2">
            {item.texte && <div>{item.texte}</div>}
            {item.image && <img src={item.image} alt={`acc-${i}`} className="max-w-full" />}
            {role === 'prof' && <button className="text-red-500 self-start" onClick={() => setAccueilItems(prev => prev.filter((_, idx) => idx !== i))}>Supprimer</button>}
          </div>
        ))}
      </div>
    );
  };

  // small state for home text input
  const [newText, setNewText] = useState('');

  // --- Routing ---
  if (page === "start") return <PageStart />;
  if (page === "login") return <PageLogin />;
  if (page === "signup") return <PageSignup />;
  if (page === "role") return <PageRole />;
  if (page === "home") return <><Header /><PageHome /></>;
  if (page === "messagerie") return <><Header /><PageListe titre="Messagerie" items={messages} setItems={setMessages} champs={[{label: 'Message', key: 'texte'}]} allowAdd={true} isMessage={true} /></>;
  if (page === "doudou") return <><Header /><div className="p-6">Doudou (liste élèves détaillée)</div></>;
  if (page === "sanctions") return <><Header /><PageListe titre="Sanctions" items={sanctions} setItems={setSanctions} champs={[{label: 'Date', key: 'date'}, {label: 'Raison', key: 'raison'}]} allowAdd={true} /></>;
  if (page === "notes") return <><Header /><PageListe titre="Notes" items={notes} setItems={setNotes} champs={[{label: 'Note', key: 'note'}, {label: 'Date', key: 'date'}, {label: 'Commentaire', key: 'commentaire'}]} allowAdd={true} /></>;
  if (page === "devoirs") return <><Header /><PageListe titre="Devoirs" items={devoirs} setItems={setDevoirs} champs={[{label: 'Devoir', key: 'texte'}, {label: 'Date', key: 'date'}]} allowAdd={true} /></>;

  return <><Header /><div className="p-6">Page principale existante...</div></>;
}
