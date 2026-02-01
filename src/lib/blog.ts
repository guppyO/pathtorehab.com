import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  author: string;
  authorBio?: string;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  category: string;
  tags: string[];
  content: string;
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));

  const posts = files.map((filename) => {
    const filePath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      slug: data.slug || filename.replace(/\.mdx?$/, ''),
      title: data.title || 'Untitled',
      author: data.author || 'Path to Rehab Team',
      authorBio: data.authorBio,
      publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
      updatedAt: data.updatedAt,
      excerpt: data.excerpt || '',
      category: data.category || 'General',
      tags: data.tags || [],
      content,
    };
  });

  return posts.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getAllBlogPosts();
  return posts.find(post => post.slug === slug) || null;
}

export function getRecentPosts(count: number = 5): BlogPost[] {
  return getAllBlogPosts().slice(0, count);
}

export function getAllCategories(): string[] {
  const posts = getAllBlogPosts();
  const categories = new Set(posts.map(p => p.category));
  return Array.from(categories);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllBlogPosts().filter(post => post.category === category);
}
