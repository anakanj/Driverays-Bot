export interface Metadata {
	title: string;
	year: string;
	thumbnail: string;
	image: string;
	score: string;
	quality: string;
	tagline: string;
	duration: string;
	rating: string;
	genre: string[];
	synopsis: string;
	link_download: Partial<Record<"480p" | "720p" | "1080p", LinkDownload>>;
}

interface LinkDownload {
	Googledrive?: string;
	"1fichier"?: string;
	Mega?: string;
	Uptobox?: string;
}

export function DriveraysMetadata(url: string): Promise<Metadata>;
