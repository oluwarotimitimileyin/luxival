export enum AppState {
    IDLE = 0,
    INTERVIEW = 1,
    DRAFTING = 2,
    REVIEW = 3,
    PUBLISHING = 4,
    PUBLISHED = 5,
    SLEEP = 6
}

export interface GapQuestion {
    id: string;
    type: 'table_stakes' | 'gap' | 'paa' | 'unique';
    text: string;
}

export interface SessionData {
    url: string;
    keywords: string[];
    questions: GapQuestion[];
    answers: Record<string, string>;
}

export interface DraftContent {
    title: string;
    contentSEO: string;
    contentGEO: string;
    faqSchema: string;
}

export interface PublishedPost {
    originalUrl: string;
    publishedUrl: string;
    indexingStatus: {
        google: boolean;
        bing: boolean;
        yandex: boolean;
        brave: boolean;
        mojeek: boolean;
    };
    deployedAt: string;
}
