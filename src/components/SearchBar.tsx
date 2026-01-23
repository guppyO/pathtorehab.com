'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

interface CityResult {
  id: number;
  name: string;
  slug: string;
  state_code: string;
  facility_count: number;
}

type SearchResult = FacilityResult | StateResult | CityResult;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Portal dropdown
function DropdownPortal({
  children,
  isOpen,
  inputRef,
  onClose,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          left: mobile ? 16 : rect.left,
          width: mobile ? window.innerWidth - 32 : rect.width,
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

  // Handle click outside - check if click is inside dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      // Don't close if clicking inside the dropdown or input
      if (dropdownRef.current?.contains(target)) return;
      if (inputRef.current?.contains(target)) return;
      onClose();
    };
    // Use mousedown with a small delay to let link clicks process first
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, inputRef, onClose]);

  if (!mounted || !isOpen) return null;
  return createPortal(
    <div
      ref={dropdownRef}
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
function FacilityResultItem({ result, onClick }: { result: FacilityResult; onClick: () => void }) {
  const facilityTypeLabel =
    result.facility_type === 'SA'
      ? 'Substance Abuse'
      : result.facility_type === 'MH'
        ? 'Mental Health'
        : 'Treatment Center';

  return (
    <Link
      href={`/facility/${result.slug}`}
      onClick={onClick}
      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 hover:bg-muted transition-colors block"
    >
      <span className="font-medium text-foreground truncate sm:flex-1">
        {result.name}
      </span>
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
function StateResultItem({ result, onClick }: { result: StateResult; onClick: () => void }) {
  return (
    <Link
      href={`/${result.slug}`}
      onClick={onClick}
      className="flex items-center justify-between gap-3 p-3 hover:bg-muted transition-colors block"
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

// City result item
function CityResultItem({ result, stateSlug, onClick }: { result: CityResult; stateSlug: string; onClick: () => void }) {
  return (
    <Link
      href={`/${stateSlug}/${result.slug}`}
      onClick={onClick}
      className="flex items-center justify-between gap-3 p-3 hover:bg-muted transition-colors block"
    >
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-primary" />
        <span className="font-medium text-foreground">{result.name}</span>
      </div>
      <span className="text-sm text-muted-foreground">
        {result.facility_count} facilities
      </span>
    </Link>
  );
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  searchType?: 'facilities' | 'states' | 'cities';
  stateCode?: string; // Filter facilities by state
  stateSlug?: string; // For city result links
  citySlug?: string; // Filter facilities by city
}

export function SearchBar({
  placeholder,
  className = '',
  searchType = 'facilities',
  stateCode,
  stateSlug,
  citySlug,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 200);

  // Default placeholders based on search type
  const defaultPlaceholder = searchType === 'states'
    ? 'Search states...'
    : searchType === 'cities'
      ? 'Search cities...'
      : stateCode
        ? 'Search facilities in this area...'
        : 'Search by facility name...';

  const actualPlaceholder = placeholder || defaultPlaceholder;

  // Minimum characters for search
  const minChars = searchType === 'states' || searchType === 'cities' ? 1 : 2;

  // Build API endpoint with filters
  const getApiEndpoint = useCallback(() => {
    if (searchType === 'states') {
      return '/api/search-states';
    }
    if (searchType === 'cities' && stateCode) {
      return `/api/search-cities?state=${stateCode}`;
    }
    // Facilities with optional state/city filter
    let endpoint = '/api/search';
    const params = new URLSearchParams();
    if (stateCode) params.set('state', stateCode);
    if (citySlug) params.set('city', citySlug);
    const paramString = params.toString();
    return paramString ? `${endpoint}?${paramString}` : endpoint;
  }, [searchType, stateCode, citySlug]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < minChars) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const baseEndpoint = getApiEndpoint();
        const separator = baseEndpoint.includes('?') ? '&' : '?';
        const res = await fetch(
          `${baseEndpoint}${separator}q=${encodeURIComponent(debouncedQuery)}`
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
  }, [debouncedQuery, getApiEndpoint, minChars]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleResultClick = useCallback(() => {
    setIsOpen(false);
    setQuery('');
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
          if (isStateResult(result)) {
            router.push(`/${result.slug}`);
          } else if (isCityResult(result)) {
            router.push(`/${stateSlug}/${result.slug}`);
          } else {
            router.push(`/facility/${(result as FacilityResult).slug}`);
          }
          handleResultClick();
        }
        break;
      case 'Escape':
        closeDropdown();
        break;
    }
  };

  // Type guards
  const isStateResult = (result: SearchResult): result is StateResult => {
    return 'code' in result && 'facility_count' in result && !('state_code' in result);
  };

  const isCityResult = (result: SearchResult): result is CityResult => {
    return 'state_code' in result && 'facility_count' in result;
  };

  return (
    <div className={`relative ${className}`}>
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
          aria-label={
            searchType === 'states'
              ? 'Search states'
              : searchType === 'cities'
                ? 'Search cities'
                : 'Search treatment centers'
          }
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
        )}
      </div>

      <DropdownPortal isOpen={isOpen && query.length >= minChars} inputRef={inputRef} onClose={closeDropdown}>
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
                  key={isStateResult(result) ? `state-${result.id}` : isCityResult(result) ? `city-${result.id}` : `facility-${result.id}`}
                  className={index === highlightedIndex ? 'bg-muted' : ''}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {isStateResult(result) ? (
                    <StateResultItem result={result} onClick={handleResultClick} />
                  ) : isCityResult(result) ? (
                    <CityResultItem result={result} stateSlug={stateSlug || ''} onClick={handleResultClick} />
                  ) : (
                    <FacilityResultItem result={result as FacilityResult} onClick={handleResultClick} />
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
              ) : searchType === 'cities' ? (
                <>
                  <p>No cities found for &quot;{query}&quot;</p>
                  <p className="text-sm mt-1">Try searching by city name</p>
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
