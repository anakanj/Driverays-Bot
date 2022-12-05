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
	link_download: SelectResolution[];
}

interface LinkDownload {
	Googledrive?: string;
	"1fichier"?: string;
	Mega?: string;
	Uptobox?: string;
}

interface SelectResolution {
	"480p"?: LinkDownload;
	"720p"?: LinkDownload;
	"1080p"?: LinkDownload;
}
export function DriveraysMetadata(url: string): Promise<Metadata>;
