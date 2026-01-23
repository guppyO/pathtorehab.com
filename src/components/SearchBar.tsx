'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Building2, Loader2 } from 'lucide-react';

// Search result types
interface FacilityResult {
  id: string;
  name: string;
  city: string;
  state: string;
  slug: string;
  facility_type: string;
}

interface StateResult {
  id: number;
  code: string;
  name: string;
  slug: string;
  facility_count: number;
}

type SearchResult = FacilityResult | StateResult;

// Debounce hook - REQUIRED to avoid API spam
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Portal dropdown - REQUIRED to avoid clipping issues
// CRITICAL: Must handle mobile screens properly!
function DropdownPortal({
  children,
  isOpen,
  inputRef,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration safety pattern
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (!isOpen || !inputRef.current) return;
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setPosition({
          top: rect.bottom + 8,
          left: mobile ? 16 : rect.left, // On mobile: 16px from left edge
          width: mobile ? window.innerWidth - 32 : rect.width, // On mobile: full width minus padding
        });
      }
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, inputRef]);

  if (!mounted || !isOpen) return null;
  return createPortal(
    <div
      className="fixed z-[9999]"
      style={{
        top: position.top,
        left: position.left,
        width: isMobile ? position.width : 'auto',
        minWidth: isMobile ? 'auto' : Math.max(position.width, 400),
        maxWidth: isMobile ? 'calc(100vw - 32px)' : '600px',
        maxHeight: '60vh',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

// Facility result item
function FacilityResultItem({ result }: { result: FacilityResult }) {
  const facilityTypeLabel =
    result.facility_type === 'SA'
      ? 'Substance Abuse'
      : result.facility_type === 'MH'
        ? 'Mental Health'
        : 'Treatment Center';

  return (
    <Link
      href={`/facility/${result.slug}`}
      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 hover:bg-muted transition-colors"
    >
      {/* Title - full width on mobile */}
      <span className="font-medium text-foreground truncate sm:flex-1">
        {result.name}
      </span>

      {/* Metadata row - wraps on mobile */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {result.city}, {result.state}
        </span>
        <span className="px-2 py-0.5 bg-muted rounded text-xs">
          {facilityTypeLabel}
        </span>
      </div>
    </Link>
  );
}

// State result item
function StateResultItem({ result }: { result: StateResult }) {
  return (
    <Link
      href={`/${result.slug}`}
      className="flex items-center justify-between gap-3 p-3 hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold text-sm">
          {result.code}
        </div>
        <span className="font-medium text-foreground">{result.name}</span>
      </div>
      <span className="text-sm text-muted-foreground">
        {result.facility_count.toLocaleString()} facilities
      </span>
    </Link>
  );
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  searchType?: 'facilities' | 'states';
}

export function SearchBar({
  placeholder,
  className = '',
  searchType = 'facilities',
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 200);

  // Default placeholders based on search type
  const defaultPlaceholder = searchType === 'states'
    ? 'Search states...'
    : 'Search by facility name...';

  const actualPlaceholder = placeholder || defaultPlaceholder;

  // Minimum characters for search
  const minChars = searchType === 'states' ? 1 : 2;

  // API endpoint based on search type
  const apiEndpoint = searchType === 'states' ? '/api/search-states' : '/api/search';

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < minChars) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${apiEndpoint}?q=${encodeURIComponent(debouncedQuery)}`
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, apiEndpoint, minChars]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          const result = results[highlightedIndex];
          if (searchType === 'states') {
            router.push(`/${(result as StateResult).slug}`);
          } else {
            router.push(`/facility/${(result as FacilityResult).slug}`);
          }
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Type guard to check if result is a state
  const isStateResult = (result: SearchResult): result is StateResult => {
    return 'code' in result && 'facility_count' in result;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={actualPlaceholder}
          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          aria-label={searchType === 'states' ? 'Search states' : 'Search treatment centers'}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
        )}
      </div>

      <DropdownPortal isOpen={isOpen && query.length >= minChars} inputRef={inputRef}>
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-border">
              {results.map((result, index) => (
                <div
                  key={isStateResult(result) ? result.id : result.id}
                  className={
                    index === highlightedIndex ? 'bg-muted' : ''
                  }
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {isStateResult(result) ? (
                    <StateResultItem result={result} />
                  ) : (
                    <FacilityResultItem result={result as FacilityResult} />
                  )}
                </div>
              ))}
            </div>
          ) : query.length >= minChars ? (
            <div className="p-4 text-center text-muted-foreground">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              {searchType === 'states' ? (
                <>
                  <p>No states found for &quot;{query}&quot;</p>
                  <p className="text-sm mt-1">Try searching by state name or abbreviation</p>
                </>
              ) : (
                <>
                  <p>No facilities found for &quot;{query}&quot;</p>
                  <p className="text-sm mt-1">Try searching by facility name</p>
                </>
              )}
            </div>
          ) : null}
        </div>
      </DropdownPortal>
    </div>
  );
}
