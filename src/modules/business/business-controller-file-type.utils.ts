import { BusinessControllerFileType, MimeType } from "@shared/constants";

function allowedMimeTypes(fileType: BusinessControllerFileType): readonly MimeType[] {
	const allowedMimeTypesMap: Record<BusinessControllerFileType, readonly MimeType[]> = {
		[BusinessControllerFileType.IDENTIFICATION_FRONT]: [
			MimeType.JPEG,
			MimeType.PNG,
			MimeType.HEIC,
			MimeType.WEBP,
			MimeType.AVIF,
		],
		[BusinessControllerFileType.IDENTIFICATION_BACK]: [
			MimeType.JPEG,
			MimeType.PNG,
			MimeType.HEIC,
			MimeType.WEBP,
			MimeType.AVIF,
		],
		[BusinessControllerFileType.PROOF_OF_ADDRESS]: [
			MimeType.PDF,
			MimeType.JPEG,
			MimeType.PNG,
			MimeType.HEIC,
			MimeType.WEBP,
			MimeType.AVIF,
		],
	};

	return allowedMimeTypesMap[fileType];
}

export const BusinessControllerFileTypeUtils = {
	allowedMimeTypes,
} as const;
