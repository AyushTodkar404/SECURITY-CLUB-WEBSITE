import type { GalleryFolder, GalleryItem } from '../types'

export const gallery: GalleryItem[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    caption: 'Live blue-team log analysis session.',
    event: 'Network Defense Lab',
    date: '2026-03-11',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    caption: 'Final round of Cyber Siege challenge.',
    event: 'Cyber Siege',
    date: '2026-02-02',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    caption: 'Workshop on secure coding practices.',
    event: 'Secure Stack Sprint',
    date: '2026-01-20',
  },
]

export const galleryFolders: GalleryFolder[] = [
  {
    id: '2026',
    name: '2026',
    photos: [],
    children: [
      {
        id: 'dsci-2026',
        name: 'DSCI 2026',
        photos: gallery.map((item) => ({
          id: `demo-${item.id}`,
          imageUrl: item.imageUrl,
          name: `${item.event}.jpg`,
          caption: item.caption,
          event: item.event,
          date: item.date,
        })),
        children: [],
      },
    ],
  },
]
