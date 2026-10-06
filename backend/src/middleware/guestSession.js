import { resolveGuestSession } from "../utils/guestSession.js";

async function attach(req, res) {
  const token = req.headers["x-guest-session"];

  if (!token) {
    res.status(401).json({ message: "Guest session required" });
    return false;
  }

  const session = await resolveGuestSession(token);

  if (!session) {
    res.status(401).json({
      message: "Guest session expired or invalid. Please rescan the table QR code.",
    });
    return false;
  }

  req.guestSession = session;
  return true;
}

// For routes only guests ever call (updateOrderDetails, the session-based
// active-order lookup) — a valid session is always required.
export async function requireGuestSession(req, res, next) {
  if (await attach(req, res)) next();
}

// For routes shared with staff (createOrder, addItem) — staff requests
// pass straight through unchanged; only requests claiming to be a guest
// need a verified session. req.guestSession is left undefined for staff
// calls, same as before this middleware existed.
export async function requireGuestSessionIfGuestChannel(req, res, next) {
  if (req.body?.channel !== "guest") return next();
  if (await attach(req, res)) next();
}
