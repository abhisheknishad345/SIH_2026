import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { MessageCircle, Send, RefreshCw, UserRound, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_DEV_URL;

export default function CooperativeChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const selectedWorkerIdRef = useRef(null);

  const isAdmin = user?.role === "cooperative_admin";

  const fetchContacts = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/chats/contacts");
      const list = response.data.contacts || [];
      setContacts(list);
      setSelected(current => {
        if (current && list.some(item => String(item.workerId) === String(current.workerId))) {
          return list.find(item => String(item.workerId) === String(current.workerId));
        }
        return list[0] || null;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load chat contacts.");
      setContacts([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (workerId) => {
    if (!workerId) return;
    try {
      const response = await api.get(`/chats/${workerId}/messages`);
      if (selectedWorkerIdRef.current !== String(workerId)) return;
      setMessages(response.data.messages || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load messages.");
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // One authenticated socket connection per mounted chat page.
  useEffect(() => {
    if (!user?._id || !SOCKET_URL) return undefined;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"]
    });
    socketRef.current = socket;

    socket.on("connect_error", err => {
      setError(err.message || "Real-time chat connection failed.");
    });

    socket.on("chat:message", message => {
      const messageWorkerId = String(message.workerId?._id || message.workerId);
      if (messageWorkerId !== selectedWorkerIdRef.current) return;

      setMessages(current => {
        if (current.some(item => item._id === message._id)) return current;
        return [...current, message];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

  // Joining a room and loading history means refresh/reconnect always restores
  // the conversation from MongoDB rather than relying on browser memory.
  useEffect(() => {
    const workerId = selected?.workerId ? String(selected.workerId) : null;
    selectedWorkerIdRef.current = workerId;
    setMessages([]);

    if (!workerId) return undefined;

    const socket = socketRef.current;
    let cancelled = false;

    const joinAndRestore = () => {
      socket?.emit("chat:join", { workerId }, response => {
        if (cancelled) return;
        if (!response?.success) {
          setError(response?.message || "Unable to join this conversation.");
          return;
        }
        fetchMessages(workerId);
      });
    };

    if (socket?.connected) joinAndRestore();
    socket?.on("connect", joinAndRestore);

    // REST history is also requested immediately; it is the source of truth.
    fetchMessages(workerId);

    return () => {
      cancelled = true;
      socket?.off("connect", joinAndRestore);
    };
  }, [selected?.workerId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = event => {
    event.preventDefault();
    const content = draft.trim();
    const workerId = selected?.workerId ? String(selected.workerId) : null;
    const socket = socketRef.current;

    if (!content || !workerId || sending || !socket?.connected) {
      if (!socket?.connected) setError("Chat server se connection nahi hai. Please wait or refresh.");
      return;
    }

    setSending(true);
    setError("");
    socket.emit("chat:send", { workerId, content }, response => {
      setSending(false);
      if (!response?.success) {
        setError(response?.message || "Message could not be sent.");
        return;
      }
      setDraft("");
      // The server broadcasts the saved message to everyone in this room.
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {isAdmin ? (
        <AdminSidebar />
      ) : (
        <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6"><h1 className="text-2xl font-extrabold text-emerald-700">TechConnect</h1><p className="text-sm text-slate-500">Worker Portal</p></div>
          <div className="p-5 text-sm font-semibold text-emerald-700">Workspace</div>
          <button onClick={() => navigate("/worker/dashboard")} className="mx-3 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-100"><ArrowLeft size={18}/> Back to Dashboard</button>
        </aside>
      )}

      <main className="min-h-screen lg:ml-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div><h1 className="text-xl font-bold sm:text-2xl">Messages</h1><p className="text-xs text-slate-500 sm:text-sm">{isAdmin ? "Chat with your approved cooperative workers" : "Chat with your cooperative admin"}</p></div>
          <button onClick={() => { setLoading(true); fetchContacts(); }} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50" title="Refresh contacts"><RefreshCw size={18}/></button>
        </header>

        <div className="mx-auto grid h-[calc(100vh-5rem)] max-w-7xl grid-cols-1 gap-0 p-3 sm:p-6 lg:grid-cols-[300px_1fr]">
          <section className={`overflow-hidden rounded-t-2xl border border-slate-200 bg-white lg:rounded-l-2xl lg:rounded-tr-none ${selected ? "hidden lg:block" : "block"}`}>
            <div className="border-b border-slate-100 p-4"><h2 className="font-semibold">{isAdmin ? "Approved Workers" : "Cooperative Admin"}</h2><p className="mt-1 text-xs text-slate-500">{contacts.length} contact{contacts.length === 1 ? "" : "s"}</p></div>
            <div className="max-h-[calc(100%-5rem)] overflow-y-auto">
              {loading ? <p className="p-5 text-sm text-slate-500">Loading contacts...</p> : contacts.length === 0 ? <div className="p-6 text-center"><MessageCircle className="mx-auto text-slate-300" size={30}/><p className="mt-3 text-sm font-medium text-slate-700">{isAdmin ? "No approved workers yet" : "Chat is not available"}</p><p className="mt-1 text-xs text-slate-500">{isAdmin ? "Workers will appear here after their profiles are approved." : "Your chat will be enabled once your worker profile is approved and an active cooperative admin is assigned."}</p></div> : contacts.map(contact => (
                <button key={contact.workerId} onClick={() => setSelected(contact)} className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${String(selected?.workerId) === String(contact.workerId) ? "bg-indigo-50" : ""}`}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"><UserRound size={20}/></div>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{contact.fullName}</p><p className="truncate text-xs text-slate-500">{contact.email}</p><p className="mt-1 text-[11px] capitalize text-emerald-700">{contact.role.replace("_", " ")}</p></div>
                </button>
              ))}
            </div>
          </section>

          <section className={`flex min-h-0 flex-col overflow-hidden border border-slate-200 bg-white lg:rounded-r-2xl ${selected ? "flex rounded-b-2xl border-t-0 lg:border-t" : "hidden lg:flex"}`}>
            {selected ? <>
              <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><UserRound size={20}/></div>
                <div><h2 className="font-semibold">{selected.fullName}</h2><p className="text-xs text-slate-500">{isAdmin ? "Approved worker" : "Cooperative admin"}</p></div>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500"/> Live chat</span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 sm:p-6">
                {messages.length === 0 ? <div className="flex h-full min-h-40 flex-col items-center justify-center text-center"><MessageCircle size={34} className="text-slate-300"/><p className="mt-3 text-sm font-medium text-slate-600">No messages yet</p><p className="mt-1 text-xs text-slate-500">Start the conversation.</p></div> : messages.map(message => {
                  const senderId = message.senderId?._id || message.senderId;
                  const own = String(senderId) === String(user?._id);
                  return <div key={message._id} className={`flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${own ? "rounded-br-sm bg-emerald-600 text-white" : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"}`}><p className="whitespace-pre-wrap break-words text-sm">{message.content}</p><p className={`mt-1 text-right text-[10px] ${own ? "text-emerald-100" : "text-slate-400"}`}>{new Date(message.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</p></div></div>;
                })}
                <div ref={bottomRef}/>
              </div>
              <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-slate-100 bg-white p-3 sm:p-4">
                <textarea value={draft} onChange={event => setDraft(event.target.value)} maxLength={2000} rows={1} placeholder="Write a message..." className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"/>
                <button type="submit" disabled={!draft.trim() || sending} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message"><Send size={18}/></button>
              </form>
            </> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><MessageCircle size={42} className="text-slate-300"/><h2 className="mt-4 font-semibold">Select a conversation</h2><p className="mt-1 text-sm text-slate-500">Choose a contact to start chatting.</p></div>}
          </section>
        </div>
        {error && <div className="fixed bottom-4 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">{error}</div>}
      </main>
    </div>
  );
}
