
export interface Newsletter {
    id: string;
    title: string;
    date: Date;
    status: 'published' | 'draft';
    replies: number;
    subscribers: number;
    imageUrl?: string;
    content: string;
  }