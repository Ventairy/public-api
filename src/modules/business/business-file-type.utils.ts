import { BusinessFileType, MimeType } from "@shared/constants";

function allowedMimeTypes(fileType: BusinessFileType): readonly MimeType[] {
	const allowedMimeTypesMap: Record<BusinessFileType, readonly MimeType[]> = {
		[BusinessFileType.PROOF_OF_ADDRESS]: [
			MimeType.PDF,
			MimeType.JPEG,
			MimeType.PNG,
			MimeType.HEIC,
			MimeType.WEBP,
			MimeType.AVIF,
		],
		[BusinessFileType.INCORPORATION_DOCUMENT]: [
			MimeType.PDF,
			MimeType.JPEG,
			MimeType.PNG,
			MimeType.HEIC,
			MimeType.WEBP,
			MimeType.AVIF,
		],
		[BusinessFileType.PROOF_OF_OWNERSHIP]: [
			MimeType.PDF,
			MimeType.JPEG,
			MimeType.PNG,
			MimeType.HEIC,
			MimeType.WEBP,
			MimeType.AVIF,
		],
	} as const;

	return allowedMimeTypesMap[fileType];
}

export const BusinessFileTypeUtils = {
	allowedMimeTypes,
} as const;
