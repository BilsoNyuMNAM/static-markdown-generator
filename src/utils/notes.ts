import { execSync } from 'child_process';
import path from 'path';

export type Topic = 'dev' | 'nutrition' | 'training';

export interface NoteItem {
  id: string;
  slug: string;
  url: string;
  rawTitle: string;
  title: string;
  description: string;
  topic: Topic;
  tags: string[];
  date: string; // YYYY-MM-DD
  formattedDate: string; // "Sep 28, 2026"
  shortDate: string; // "Sep 28"
  monthYear: string; // "September 2026"
  timestamp: number;
  series?: string | null;
  order?: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const SPECIAL_TERMS: Record<string, string> = {
  NODEJS: 'Node.js',
  DOCKERFILE: 'Dockerfile',
  'DOCKER-COMPOSE': 'Docker Compose',
  POSTGRES: 'PostgreSQL',
  POSTGRESQL: 'PostgreSQL',
  PRISMA: 'Prisma',
  MONGODB: 'MongoDB',
  USEEFFECT: 'useEffect',
  'ASYNC/AWAIT': 'async/await',
  ASYNC: 'Async',
  AWAIT: 'Await',
  REACT: 'React',
  DOCKER: 'Docker',
  API: 'API',
  DNS: 'DNS',
  URL: 'URL',
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
  JSON: 'JSON',
  ORM: 'ORM',
  UI: 'UI',
  ID: 'ID',
  DOM: 'DOM',
  ENOTFOUND: 'ENOTFOUND',
  CMD: 'CMD',
  WORKDIR: 'WORKDIR',
  FROM: 'FROM',
};

const MINOR_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with', 'from',
]);

/**
 * Stop using ALL CAPS on titles while preserving case for technical names
 */
export function cleanTitle(raw: string | null | undefined): string {
  if (!raw) return 'Untitled Note';
  const trimmed = raw.trim();

  // Check if string is predominantly uppercase letters
  const lettersOnly = trimmed.replace(/[^a-zA-Z]/g, '');
  const isAllCaps = lettersOnly.length > 3 && lettersOnly === lettersOnly.toUpperCase();

  if (!isAllCaps) {
    // Already mixed case, but fix common lowercase start or technical casing
    return trimmed;
  }

  // Convert ALL CAPS to Clean Title Case
  const words = trimmed.split(/\s+/);
  const formatted = words.map((word, index) => {
    // Preserve punctuation
    const cleanWord = word.replace(/[.,:;!?()"`]/g, '');
    const upper = cleanWord.toUpperCase();

    if (SPECIAL_TERMS[upper]) {
      return word.replace(cleanWord, SPECIAL_TERMS[upper]);
    }

    const lower = cleanWord.toLowerCase();
    if (index > 0 && MINOR_WORDS.has(lower)) {
      return word.replace(cleanWord, lower);
    }

    // Capitalize first letter
    const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    return word.replace(cleanWord, capitalized);
  });

  return formatted.join(' ');
}

/**
 * Infer primary topic: 'dev' | 'nutrition' | 'training'
 */
export function resolveTopic(
  explicitTopic: string | null | undefined,
  docId: string,
  tags: string[] = []
): Topic {
  if (explicitTopic && ['dev', 'nutrition', 'training'].includes(explicitTopic.toLowerCase())) {
    return explicitTopic.toLowerCase() as Topic;
  }

  const normalizedTags = tags.map((t) => t.toLowerCase());
  const str = (docId + ' ' + normalizedTags.join(' ')).toLowerCase();

  // Training checks
  if (
    normalizedTags.some((t) => ['training', 'hypertrophy', 'strength', 'workout'].includes(t)) ||
    str.includes('preworkout')
  ) {
    return 'training';
  }

  // Nutrition checks
  if (
    normalizedTags.some((t) => ['diet', 'nutrition', 'weight-loss', 'refeed'].includes(t)) ||
    str.includes('diet') ||
    str.includes('refeed')
  ) {
    return 'nutrition';
  }

  // Default to dev
  return 'dev';
}

/**
 * Extract date from doc frontmatter or git history
 */
export function resolveDate(
  docDate: string | Date | null | undefined,
  year: string | number | null | undefined,
  docFilePath?: string
): {
  dateStr: string;
  formattedDate: string;
  shortDate: string;
  monthYear: string;
  timestamp: number;
} {
  let dateObj: Date | null = null;

  if (docDate) {
    const d = new Date(docDate);
    if (!isNaN(d.getTime())) {
      dateObj = d;
    }
  }

  if (!dateObj && docFilePath) {
    try {
      const gitOut = execSync(`git log -n 1 --format="%as" -- "${docFilePath}"`, {
        cwd: path.resolve(process.cwd(), 'src/content/docs'),
        encoding: 'utf8',
      }).trim();

      if (gitOut && /^\d{4}-\d{2}-\d{2}$/.test(gitOut)) {
        const d = new Date(gitOut + 'T00:00:00Z');
        if (!isNaN(d.getTime())) {
          dateObj = d;
        }
      }
    } catch {
      // ignore git error
    }
  }

  if (!dateObj) {
    const y = String(year || '2026').trim();
    dateObj = new Date(`${y}-09-01T00:00:00Z`);
  }

  const yyyy = dateObj.getUTCFullYear();
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getUTCDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const monthName = MONTH_NAMES[dateObj.getUTCMonth()] || 'September';
  const shortMonth = SHORT_MONTH_NAMES[dateObj.getUTCMonth()] || 'Sep';
  const day = dateObj.getUTCDate();

  return {
    dateStr,
    formattedDate: `${shortMonth} ${day}, ${yyyy}`,
    shortDate: `${shortMonth} ${day}`,
    monthYear: `${monthName} ${yyyy}`,
    timestamp: dateObj.getTime(),
  };
}
