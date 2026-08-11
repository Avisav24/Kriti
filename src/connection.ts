/* ==========================================================
 Connection Detection Utility
 ========================================================== */

interface NetworkInformation {
 saveData: boolean;
 effectiveType: string;
}

export function isSlowConnection(): boolean {
 const nav = navigator as Navigator & { connection?: NetworkInformation };
 const conn = nav.connection;

 if (!conn) {
 // Safari doesn't support Network Information API
 // Assume fine, but we still cap video size aggressively
 return false;
 }

 return (
 conn.saveData ||
 ['slow-2g', '2g', '3g'].includes(conn.effectiveType)
 );
}
