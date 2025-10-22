import { BookData, Book } from './types';

// Importar os JSONs
import CaminhoData from '../data/Caminho.json';
import SulcoData from '../data/Sulco.json';
import ForjaData from '../data/Forja.json';

// Configuração dos livros com metadados visuais
export const BOOKS: BookData[] = [
  {
    id: '1',
    slug: 'caminho',
    title: 'Caminho',
    author: 'São Josemaria Escrivá',
    description: 'Uma coletânea de 999 pontos de meditação que iluminam o caminho da vida cristã, abordando temas como vocação, oração, trabalho e santidade no dia a dia.',
    color: '#4A90E2',
    gradient: ['#4A90E2', '#357ABD'],
    icon: '✝️',
    data: CaminhoData as Book,
  },
  {
    id: '2',
    slug: 'sulco',
    title: 'Sulco',
    author: 'São Josemaria Escrivá',
    description: 'Continuação de Caminho, com 1000 pontos que aprofundam a espiritualidade cristã, incentivando a fidelidade, perseverança e amor a Deus na vida cotidiana.',
    color: '#E67E22',
    gradient: ['#E67E22', '#D35400'],
    icon: '🌾',
    data: SulcoData as Book,
  },
  {
    id: '3',
    slug: 'forja',
    title: 'Forja',
    author: 'São Josemaria Escrivá',
    description: 'Completa a trilogia com 1055 pontos que forjam a alma cristã no amor divino, abordando a santificação do trabalho, compromisso apostólico e vida de oração.',
    color: '#E74C3C',
    gradient: ['#E74C3C', '#C0392B'],
    icon: '🔥',
    data: ForjaData as Book,
  },
];

// Função auxiliar para obter um livro por slug
export const getBookBySlug = (slug: string): BookData | undefined => {
  return BOOKS.find(book => book.slug === slug);
};

// Função auxiliar para obter um capítulo específico
export const getChapter = (slug: string, chapterId: number) => {
  const book = getBookBySlug(slug);
  if (!book) return null;
  
  return book.data.chapters.find(ch => ch.chapter === chapterId);
};

// Função para buscar em todos os livros
export const searchInBooks = (query: string): Array<{
  book: BookData;
  chapter: number;
  chapterName: string;
  paragraph: number;
  text: string;
}> => {
  const results: Array<{
    book: BookData;
    chapter: number;
    chapterName: string;
    paragraph: number;
    text: string;
  }> = [];
  
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return results;

  BOOKS.forEach(book => {
    book.data.chapters.forEach(chapter => {
      chapter.paragraphs.forEach(paragraph => {
        if (paragraph.text.toLowerCase().includes(searchTerm)) {
          results.push({
            book,
            chapter: chapter.chapter,
            chapterName: chapter.name,
            paragraph: paragraph.number,
            text: paragraph.text,
          });
        }
      });
    });
  });

  return results;
};
