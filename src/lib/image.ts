/**
 * Image helpers shared by the client (downscale before saving) and the server
 * (re-validate on every write). The client is untrusted, so `createProduct` /
 * `updateProduct` run `validateProductImage` again on the payload.
 */

/** Maximum width/height, in pixels, that a product image may have. */
export const MAX_IMAGE_DIMENSION = 512;

/** Maximum decoded size of a product image (base64 data URL payload). */
export const MAX_IMAGE_BYTES = 512 * 1024;

export type ImageDimensions = { width: number; height: number };

const DATA_URL_RE = /^data:image\/(png|jpe?g|gif|webp);base64,([a-z0-9+/=]+)$/i;

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64ToBytes(base64: string): Uint8Array {
	const clean = base64.replace(/[^A-Za-z0-9+/]/g, "");
	const length = Math.floor((clean.length * 3) / 4);
	const bytes = new Uint8Array(length);
	let position = 0;

	for (let i = 0; i < clean.length; i += 4) {
		const a = BASE64_ALPHABET.indexOf(clean[i] ?? "A");
		const b = BASE64_ALPHABET.indexOf(clean[i + 1] ?? "A");
		const c = BASE64_ALPHABET.indexOf(clean[i + 2] ?? "A");
		const d = BASE64_ALPHABET.indexOf(clean[i + 3] ?? "A");

		if (position < length) bytes[position++] = (a << 2) | (b >> 4);
		if (position < length) bytes[position++] = ((b & 15) << 4) | (c >> 2);
		if (position < length) bytes[position++] = ((c & 3) << 6) | d;
	}

	return bytes;
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
	return (
		((bytes[offset] ?? 0) << 24) |
		((bytes[offset + 1] ?? 0) << 16) |
		((bytes[offset + 2] ?? 0) << 8) |
		(bytes[offset + 3] ?? 0)
	);
}

function readJpegDimensions(bytes: Uint8Array): ImageDimensions | null {
	let offset = 2;

	while (offset + 9 < bytes.length) {
		if (bytes[offset] !== 0xff) {
			offset++;
			continue;
		}

		let marker = bytes[offset + 1] ?? 0;
		while (marker === 0xff) {
			offset++;
			marker = bytes[offset + 1] ?? 0;
		}
		offset += 2;

		// Standalone markers carry no length payload.
		if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
			continue;
		}

		const segmentLength = ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
		const isStartOfFrame =
			marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

		if (isStartOfFrame) {
			const height = ((bytes[offset + 3] ?? 0) << 8) | (bytes[offset + 4] ?? 0);
			const width = ((bytes[offset + 5] ?? 0) << 8) | (bytes[offset + 6] ?? 0);
			return { width, height };
		}

		offset += segmentLength;
	}

	return null;
}

function readWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
	const fourcc = String.fromCharCode(
		bytes[12] ?? 0,
		bytes[13] ?? 0,
		bytes[14] ?? 0,
		bytes[15] ?? 0,
	);

	if (fourcc === "VP8X") {
		return {
			width: 1 + ((bytes[24] ?? 0) | ((bytes[25] ?? 0) << 8) | ((bytes[26] ?? 0) << 16)),
			height: 1 + ((bytes[27] ?? 0) | ((bytes[28] ?? 0) << 8) | ((bytes[29] ?? 0) << 16)),
		};
	}

	if (fourcc === "VP8L") {
		const b0 = bytes[21] ?? 0;
		const b1 = bytes[22] ?? 0;
		const b2 = bytes[23] ?? 0;
		const b3 = bytes[24] ?? 0;
		return {
			width: 1 + (((b1 & 0x3f) << 8) | b0),
			height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
		};
	}

	if (fourcc === "VP8 ") {
		return {
			width: ((bytes[26] ?? 0) | ((bytes[27] ?? 0) << 8)) & 0x3fff,
			height: ((bytes[28] ?? 0) | ((bytes[29] ?? 0) << 8)) & 0x3fff,
		};
	}

	return null;
}

/** Read width/height straight from an image's binary header (no DOM needed). */
export function getImageDimensionsFromBytes(bytes: Uint8Array): ImageDimensions | null {
	if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
		return { width: readUint32BE(bytes, 16), height: readUint32BE(bytes, 20) };
	}

	if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
		return {
			width: (bytes[6] ?? 0) | ((bytes[7] ?? 0) << 8),
			height: (bytes[8] ?? 0) | ((bytes[9] ?? 0) << 8),
		};
	}

	if (bytes[0] === 0xff && bytes[1] === 0xd8) {
		return readJpegDimensions(bytes);
	}

	if (
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		return readWebpDimensions(bytes);
	}

	return null;
}

/** Decode an image data URL into its MIME type and raw bytes. */
export function parseImageDataUrl(dataUrl: string): { mime: string; bytes: Uint8Array } | null {
	const match = DATA_URL_RE.exec(dataUrl.trim());
	if (!match) return null;

	return { mime: match[1].toLowerCase(), bytes: base64ToBytes(match[2]) };
}

export type ImageValidation = { ok: true; value: string | null } | { ok: false; error: string };

/**
 * Server-side validation for a product image. Accepts `null`/empty (no image)
 * and image data URLs that decode to at most `MAX_IMAGE_DIMENSION` px on either
 * side and `MAX_IMAGE_BYTES` bytes.
 */
export function validateProductImage(input: string | null | undefined): ImageValidation {
	if (input === null || input === undefined || input.trim() === "") {
		return { ok: true, value: null };
	}

	const parsed = parseImageDataUrl(input);
	if (!parsed) {
		return { ok: false, error: "Image must be a PNG, JPEG, GIF, or WebP data URL." };
	}

	if (parsed.bytes.length > MAX_IMAGE_BYTES) {
		return { ok: false, error: "Image is too large (max 512 KB after compression)." };
	}

	const dimensions = getImageDimensionsFromBytes(parsed.bytes);
	if (!dimensions) {
		return { ok: false, error: "Could not read the image dimensions." };
	}

	if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION) {
		return {
			ok: false,
			error: `Image must be at most ${MAX_IMAGE_DIMENSION}\u00d7${MAX_IMAGE_DIMENSION}px.`,
		};
	}

	return { ok: true, value: input.trim() };
}

async function loadImageSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
	if (typeof createImageBitmap === "function") {
		try {
			return await createImageBitmap(file);
		} catch {
			// Fall through to the <img> based path below.
		}
	}

	const objectUrl = URL.createObjectURL(file);
	try {
		return await new Promise<HTMLImageElement>((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = () => reject(new Error("Unsupported or corrupted image file."));
			image.src = objectUrl;
		});
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

/**
 * Client-side helper: read a picked file and downscale it (preserving aspect
 * ratio) so neither side exceeds `max`, returning a JPEG data URL ready to be
 * submitted. Keeps the form usable and avoids shipping huge payloads.
 */
export async function downscaleImageFile(
	file: File,
	max: number = MAX_IMAGE_DIMENSION,
): Promise<string> {
	const source = await loadImageSource(file);
	const sourceWidth = source.width;
	const sourceHeight = source.height;
	const scale = Math.min(1, max / Math.max(sourceWidth, sourceHeight));
	const width = Math.max(1, Math.round(sourceWidth * scale));
	const height = Math.max(1, Math.round(sourceHeight * scale));

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Canvas is not supported in this browser.");
	}

	context.drawImage(source as CanvasImageSource, 0, 0, width, height);
	if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
		source.close();
	}

	return canvas.toDataURL("image/jpeg", 0.85);
}
