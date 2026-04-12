import TradingViewWidget from "@/components/TradingViewWidget";
import { 
  SYMBOL_INFO_WIDGET_CONFIG, 
  CANDLE_CHART_WIDGET_CONFIG, 
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG 
} from "@/lib/constants";
import WatchlistButton from "@/components/WatchlistButton"; // Component anticipated by user request/types

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const decodedSymbol = decodeURIComponent(symbol);
  
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full p-4 md:p-8">
      {/* Left Column */}
      <section className="flex flex-col gap-8 lg:col-span-3">
        <TradingViewWidget 
          scriptUrl={`${scriptUrl}symbol-info.js`}
          config={SYMBOL_INFO_WIDGET_CONFIG(decodedSymbol)}
        />
        <TradingViewWidget 
          scriptUrl={`${scriptUrl}advanced-chart.js`}
          config={CANDLE_CHART_WIDGET_CONFIG(decodedSymbol)}
        />
        <TradingViewWidget
          scriptUrl={`${scriptUrl}advanced-chart.js`}
          config={BASELINE_WIDGET_CONFIG(decodedSymbol)}
        />
      </section>

      {/* Right Column */}
      <section className="flex flex-col gap-8 lg:col-span-2">
        <div className="w-full">
            <WatchlistButton 
                symbol={decodedSymbol} 
                company={decodedSymbol} 
                isInWatchlist={false} 
            />
        </div>
        <TradingViewWidget 
          scriptUrl={`${scriptUrl}technical-analysis.js`}
          config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(decodedSymbol)}
        />
        <TradingViewWidget 
          scriptUrl={`${scriptUrl}symbol-profile.js`}
          config={COMPANY_PROFILE_WIDGET_CONFIG(decodedSymbol)}
        />
        <TradingViewWidget 
          scriptUrl={`${scriptUrl}financials.js`}
          config={COMPANY_FINANCIALS_WIDGET_CONFIG(decodedSymbol)}
        />
      </section>
    </div>
  );
}
