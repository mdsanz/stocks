'use server'

import { cache } from 'react';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '';

const fetchJSON = async <T>(url: string, revalidateSeconds?: number): Promise<T> => {
    const options: RequestInit = {};
    if (typeof revalidateSeconds === 'number') {
        options.cache = 'force-cache';
        options.next = { revalidate: revalidateSeconds };
    } else {
        options.cache = 'no-store';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    options.signal = controller.signal;

    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            throw new Error(`Finnhub returned ${res.status} ${res.statusText}`);
        }
        return await res.json() as T;
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error("Finnhub request timed out");
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

export const getNews = async (symbols?: string[]) => {
    try {
        const today = new Date();
        const past = new Date(today);
        past.setDate(past.getDate() - 5);

        const formatDate = (d: Date) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        const from = formatDate(past);
        const to = formatDate(today);

        const finalArticles: RawNewsArticle[] = [];

        if (symbols && symbols.length > 0) {
            const cleanSymbols = symbols.map(s => s.trim().toUpperCase());
            const pools: RawNewsArticle[][] = [];

            for (const sym of cleanSymbols) {
                const data = await fetchJSON<RawNewsArticle[]>(`${FINNHUB_BASE_URL}/company-news?symbol=${sym}&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`, 3600);
                if (Array.isArray(data)) {
                    const valid = data.filter(a => a && a.headline && a.url && a.id);
                    if (valid.length > 0) pools.push(valid);
                }
            }

            let round = 0;
            const seenIds = new Set<number>();
            const seenUrls = new Set<string>();

            while (finalArticles.length < 6 && pools.some(p => round < p.length)) {
                for (const pool of pools) {
                    if (finalArticles.length >= 6) break;
                    if (round < pool.length) {
                        const article = pool[round];
                        if (article.id !== undefined && !seenIds.has(article.id) && article.url && !seenUrls.has(article.url)) {
                            seenIds.add(article.id);
                            seenUrls.add(article.url);
                            finalArticles.push(article);
                        }
                    }
                }
                round++;
            }
        }

        if (finalArticles.length === 0) {
            const data = await fetchJSON<RawNewsArticle[]>(`${FINNHUB_BASE_URL}/news?category=general&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`, 3600);
            if (Array.isArray(data)) {
                const valid = data.filter(a => a && a.headline && a.url && a.id);
                const seenIds = new Set<number>();
                const seenUrls = new Set<string>();
                const seenHeadlines = new Set<string>();

                for (const article of valid) {
                    if (finalArticles.length >= 6) break;
                    
                    if (
                        article.id !== undefined && !seenIds.has(article.id) &&
                        article.url && !seenUrls.has(article.url) &&
                        article.headline && !seenHeadlines.has(article.headline)
                    ) {
                        seenIds.add(article.id);
                        seenUrls.add(article.url);
                        seenHeadlines.add(article.headline);
                        finalArticles.push(article);
                    }
                }
            }
        }

        return finalArticles.sort((a, b) => {
            const timeA = a.datetime || 0;
            const timeB = b.datetime || 0;
            return timeB - timeA;
        });

    } catch (error: unknown) {
        console.error('getNews error:', error);
        throw new Error('Failed to fetch news');
    }
}

type CombinedSearchResult = FinnhubSearchResult & { exchange?: string };

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
        let combinedResults: CombinedSearchResult[] = [];

        if (!query) {
            const topSymbols = POPULAR_STOCK_SYMBOLS.slice(0, 10);
            
            const profilePromises = topSymbols.map(symbol => 
                fetchJSON<{ name?: string; exchange?: string }>(
                    `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`, 
                    3600
                )
            );
            
            const profiles = await Promise.all(profilePromises);

            combinedResults = topSymbols.map((symbol, index) => {
                const profile = profiles[index];
                return {
                    symbol: symbol,
                    description: profile?.name || '',
                    displaySymbol: symbol,
                    type: 'Common Stock',
                    exchange: profile?.exchange || 'US'
                };
            });
        } else {
            const trimmedQuery = query.trim();
            const data = await fetchJSON<FinnhubSearchResponse>(
                `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmedQuery)}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`, 
                1800
            );
            
            if (data?.result) {
                combinedResults = data.result as CombinedSearchResult[];
            }
        }

        const mappedResults: StockWithWatchlistStatus[] = combinedResults.map(result => ({
            symbol: result.symbol.toUpperCase(),
            name: result.description,
            exchange: result.exchange || result.displaySymbol || 'US',
            type: result.type || 'Stock',
            isInWatchlist: false
        }));

        return mappedResults.slice(0, 15);
    } catch (error) {
        console.error('Error in stock search:', error);
        return [];
    }
});
