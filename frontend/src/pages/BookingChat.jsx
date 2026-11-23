import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { ArrowLeft, Send, MessageCircle, LoaderCircle, IndianRupee } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import NegotiationPanel from "../components/NegotiationPanel";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_DEV_URL;

export default function BookingChat() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [priceDraft, setPriceDraft] = useState("");
  const [priceSaving, setPriceSaving] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      const [response, bookingResponse] = await Promise.all([
        api.get(`/bookings/${bookingId}/chat/messages`),
        api.get(`/bookings/${bookingId}/chat/booking`)
      ]);
      setMessages(response.data.messages || []);
      setBooking(bookingResponse.data.booking);
      setPriceDraft(bookingResponse.data.booking?.price ?? "");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load this booking chat.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!user?._id || !SOCKET_URL) return undefined;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"]
    });
    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit("booking-chat:join", { bookingId }, response => {
        if (!response?.success) {
          setError(response?.message || "Unable to join booking chat.");
        }
      });
    };

    socket.on("connect", joinRoom);
    socket.on("connect_error", err => setError(err.message || "Chat connection failed."));
    socket.on("booking-chat:price", update => {
      if (String(update.bookingId) !== String(bookingId)) return;
      setBooking(current => current ? {
        ...current,
        price: update.price,
        pricingStatus: update.pricingStatus
      } : current);
      setPriceDraft(String(update.price));
    });

    socket.on("booking-chat:message", message => {
      const incomingBookingId = String(message.bookingId?._id || message.bookingId);
      if (incomingBookingId !== String(bookingId)) return;
      setMessages(current => current.some(item => item._id === message._id)
        ? current
        : [...current, message]);
    });

    if (socket.connected) joinRoom();

    return () => {
      socket.off("connect", joinRoom);
      socket.off("booking-chat:price");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingId, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePriceUpdate = event => {
    event.preventDefault();
    const price = Number(priceDraft);
    const socket = socketRef.current;
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }
    if (!socket?.connected) {
      setError("Chat server se connection nahi hai. Please try again.");
      return;
    }
    setPriceSaving(true);
    setError("");
    socket.emit("booking-chat:update-price", { bookingId, price }, response => {
      setPriceSaving(false);
      if (!response?.success) {
        setError(response?.message || "Price could not be updated.");
        return;
      }
      setBooking(current => current ? {
        ...current,
        price: response.booking.price,
        pricingStatus: response.booking.pricingStatus
      } : current);
    });
  };

  const handleSend = event => {
    event.preventDefault();
    const content = draft.trim();
    const socket = socketRef.current;
    if (!content || sending) return;
    if (!socket?.connected) {
      setError("Chat server se connection nahi hai. Please try again.");
      return;
    }

    setSending(true);
    setError("");
    socket.emit("booking-chat:send", { bookingId, content }, response => {
      setSending(false);
      if (!response?.success) {
        setError(response?.message || "Message could not be sent.");
        return;
      }
      setDraft("");
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-5 sm:px-6">
      <div className="mx-auto flex h-[calc(100vh-2.5rem)] max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
          <button type="button" onClick={() => navigate(-1)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <MessageCircle size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-slate-900">Booking Chat</h1>
            <p className="truncate text-xs text-slate-500">Discuss service details and coordinate your booking</p>
          </div>
        </header>

        {booking && (
          <NegotiationPanel
            booking={booking}
            user={user}
            onRefresh={fetchMessages}
          />
        )}

        <main className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin" /> Loading messages...
            </div>
          )}
          {!loading && messages.length === 0 && (
            <div className="mx-auto mt-12 max-w-sm text-center">
              <MessageCircle className="mx-auto text-slate-300" size={36} />
              <p className="mt-3 font-semibold text-slate-700">Start the conversation</p>
              <p className="mt-1 text-sm text-slate-500">Discuss the work and agree on the final price here.</p>
            </div>
          )}
          {messages.map(message => {
            const senderId = message.senderId?._id || message.senderId;
            const ownMessage = String(senderId) === String(user?._id);
            return (
              <div key={message._id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${ownMessage ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>
                  <p className={`mb-1 text-[11px] font-semibold ${ownMessage ? "text-indigo-100" : "text-indigo-600"}`}>
                    {ownMessage ? "You" : message.senderId?.fullName || "Participant"}
                  </p>
                  <p className="whitespace-pre-wrap wrap-break-words text-sm">{message.content}</p>
                  <p className={`mt-1 text-right text-[10px] ${ownMessage ? "text-indigo-100" : "text-slate-400"}`}>
                    {new Date(message.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </main>

        {error && <p className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-700">{error}</p>}

        <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3 sm:p-4">
          <textarea
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="Write a message..."
            className="max-h-32 min-h-11 flex-1 text-black resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button type="submit" disabled={!draft.trim() || sending} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message">
            {sending ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
