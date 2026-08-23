import QRCode from "qrcode";

export const dynamic = "force-dynamic";

// Renders a QR code as SVG. Generated here rather than in the browser so the
// tablet needs no QR library, and drawn as SVG so it stays sharp at any size.
export async function GET(request) {
  const data = new URL(request.url).searchParams.get("data") || "";
  if (!data) return new Response("data is required", { status: 400 });
  // Byte mode tops out at 2953 bytes, and only at the lowest error correction.
  // Refuse clearly rather than letting the library fail obscurely.
  if (data.length > 2953) return new Response("too much data to encode", { status: 413 });

  try {
    const svg = await QRCode.toString(data, {
      type: "svg",
      margin: 1,
      // Slightly higher than default: a fridge tablet is not a clean scan
      // surface, and phones read it at an angle.
      // A big payload only fits at level L. Small ones keep the sturdier M,
      // which matters when scanning a glossy tablet at an angle.
      errorCorrectionLevel: data.length > 1200 ? "L" : "M",
      color: { dark: "#241C12", light: "#FFFFFF" },
    });
    return new Response(svg, {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return new Response(`could not encode: ${err.message}`, { status: 500 });
  }
}
