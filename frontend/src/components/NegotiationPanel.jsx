import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Handshake,
  IndianRupee,
  LoaderCircle,
  MessageSquareText,
  RotateCcw,
  Send,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import api from "../services/api";

const money = value =>
  value == null || value === ""
    ? "—"
    : `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const getId = value => String(value?._id || value || "");

export default function NegotiationPanel({ booking, user, onRefresh }) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const currentOffer = booking?.negotiation?.currentOffer;
  const history = booking?.negotiation?.history || [];
  const isWorker = user?.role === "worker";
  const isCustomer = user?.role === "customer";
  const isNegotiable = booking?.priceType === "negotiable";
  const pricingStatus = booking?.pricingStatus;
  const counterCount = Number(booking?.counterOfferCount || 0);
  const activeNegotiation = booking?.status === "accepted" &&
    ["pending", "proposed", "countered"].includes(pricingStatus);
  const offerOwnerId = getId(currentOffer?.proposedBy);
  const isMyOffer = Boolean(currentOffer && offerOwnerId === getId(user?._id));
  const canRespond = Boolean(currentOffer && !isMyOffer && activeNegotiation);
  const canMakeInitialOffer = isWorker && activeNegotiation &&
    pricingStatus === "pending" && !currentOffer;
  const canCounter = canRespond && counterCount < 10;
  const canCancel = isCustomer && activeNegotiation;

  const status = useMemo(() => {
    if (!isNegotiable) return { label: "Fixed price", style: "bg-slate-100 text-slate-700" };
    if (pricingStatus === "agreed") return { label: "Price agreed", style: "bg-emerald-50 text-emerald-700" };
    if (pricingStatus === "rejected" || booking?.status === "rejected") return { label: "Negotiation closed", style: "bg-rose-50 text-rose-700" };
    if (pricingStatus === "pending") return { label: "Awaiting worker offer", style: "bg-amber-50 text-amber-700" };
    if (isMyOffer) return { label: "Waiting for response", style: "bg-blue-50 text-blue-700" };
    return { label: "Your response needed", style: "bg-violet-50 text-violet-700" };
  }, [isNegotiable, pricingStatus, booking?.status, isMyOffer]);

  const runAction = async (action, payload = {}) => {
    try {
      setBusy(action);
      setError("");
      setNotice("");
      await api.post(`/bookings/${booking._id}/negotiation/${action}`, payload);
      setAmount("");
      setNotice(
        action === "accept" ? "Offer accepted. The booking is now in progress." :
        action === "reject" ? "Offer rejected. This booking is now closed." :
        action === "counter" ? "Your counteroffer has been sent." :
        "Your price offer has been sent."
      );
      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the negotiation. Please try again.");
      await onRefresh?.();
    } finally {
      setBusy("");
    }
  };

  const cancelBooking = async () => {
    try {
      setBusy("cancel");
      setError("");
      setNotice("");
      await api.put(`/bookings/${booking._id}/cancel`);
      setNotice("Booking cancelled.");
      await onRefresh?.();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel this booking.");
      await onRefresh?.();
    } finally {
      setBusy("");
    }
  };

  const submitAmount = event => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    runAction(canMakeInitialOffer ? "offer" : "counter", { amount: value });
  };

  const formatDate = date => date
    ? new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "";

  if (!isNegotiable) {
    return (
      <section className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Booking amount</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{money(booking?.price)}</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${status.style}`}>{status.label}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Handshake size={19} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price negotiation</p>
              <h2 className="text-lg font-extrabold text-slate-900">Agree on a fair price</h2>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Offers are private to this booking. Both sides must agree before work starts.</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${status.style}`}>{status.label}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">Current offer</p>
          <p className="mt-1 flex items-center gap-1 text-2xl font-extrabold text-slate-900">
            <IndianRupee size={20} />{currentOffer ? Number(currentOffer.amount).toLocaleString("en-IN") : "Not received"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {currentOffer ? `Offered by ${isMyOffer ? "you" : isWorker ? "customer" : "worker"}` : "The worker will send the first offer"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">Counteroffers used</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{counterCount}<span className="text-base font-semibold text-slate-400"> / 10</span></p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${Math.min(counterCount, 10) * 10}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">Initial worker offer is not counted</p>
        </div>
      </div>

      {pricingStatus === "agreed" && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="shrink-0 text-emerald-600" size={22} />
          <div>
            <p className="font-bold text-emerald-800">Final price agreed</p>
            <p className="text-sm text-emerald-700">{money(booking.price)} · Booking is now in progress</p>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <RotateCcw size={15} /> Offer history
          </div>
          <div className="space-y-2">
            {history.map((item, index) => {
              const mine = getId(item.proposedBy) === getId(user?._id);
              const actionLabel = item.action === "proposed" ? "Initial offer" :
                item.action === "countered" ? "Counteroffer" :
                item.action === "accepted" ? "Accepted" : "Rejected";
              return (
                <div key={item._id || `${item.action}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{actionLabel} <span className="font-normal text-slate-500">by {mine ? "you" : "the other party"}</span></p>
                    <p className="text-[11px] text-slate-400">{formatDate(item.createdAt)}</p>
                  </div>
                  <p className="shrink-0 font-bold text-slate-900">{money(item.amount)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(canMakeInitialOffer || canCounter) && (
        <form onSubmit={submitAmount} className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
          <label className="mb-2 block text-sm font-bold text-slate-800">
            {canMakeInitialOffer ? "Send your price offer" : "Make a counteroffer"}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <IndianRupee size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={event => setAmount(event.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-sm font-semibold text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <button type="submit" disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50">
              {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
              {canMakeInitialOffer ? "Send offer" : "Send counter"}
            </button>
          </div>
          {canCounter && <p className="mt-2 text-xs text-slate-500">You can still send {10 - counterCount} counteroffer{10 - counterCount === 1 ? "" : "s"}.</p>}
        </form>
      )}

      {canRespond && (
        <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
          <p className="text-sm font-bold text-blue-900">The other party has made an offer</p>
          <p className="mt-1 text-xs text-blue-700">Accept this amount to finalize the price, or reject it to close the booking.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => runAction("accept")} disabled={Boolean(busy)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
              {busy === "accept" ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />} Accept {money(currentOffer.amount)}
            </button>
            <button type="button" onClick={() => runAction("reject")} disabled={Boolean(busy)} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
              {busy === "reject" ? <LoaderCircle size={16} className="animate-spin" /> : <X size={16} />} Reject offer
            </button>
          </div>
        </div>
      )}

      {isMyOffer && activeNegotiation && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-3 text-sm text-blue-800">
          <Clock3 size={17} className="mt-0.5 shrink-0" />
          Waiting for the other party to respond. You can send another offer after they counter.
        </div>
      )}

      {pricingStatus === "pending" && isCustomer && activeNegotiation && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-800">
          <Clock3 size={17} className="mt-0.5 shrink-0" />
          Waiting for the worker to send the first price offer.
        </div>
      )}

      {counterCount >= 10 && currentOffer && activeNegotiation && (
        <p className="mt-3 text-xs font-medium text-amber-700">The counteroffer limit has been reached. The current offer can still be accepted or rejected.</p>
      )}

      {pricingStatus === "rejected" && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-700">
          <XCircle size={17} /> Negotiation rejected. This booking is closed.
        </div>
      )}

      {canCancel && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">You can cancel while the price is not finalized.</p>
          <button type="button" onClick={cancelBooking} disabled={Boolean(busy)} className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
            {busy === "cancel" ? "Cancelling..." : "Cancel booking"}
          </button>
        </div>
      )}

      {notice && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{notice}</p>}
      {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
    </section>
  );
}
