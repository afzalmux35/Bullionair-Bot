// Add these sections to your dashboard:

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* STRATEGY STATUS SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Status & Market Analysis</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Market Regime</h4>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${marketRegime === 'TRENDING' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>{marketRegime || 'Loading...'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Primary Trend</h4>
            <span className={`px-2 py-1 rounded text-xs ${trendDirection === 'BULLISH' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {trendDirection || 'Neutral'}
            </span>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Volatility Level</h4>
            <Progress value={volatilityPercent || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* LIVE INDICATORS SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Live Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <IndicatorCard 
              title="RSI (14)" 
              value={rsi || 50} 
              status={rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'}
            />
            <IndicatorCard 
              title="ADX (14)" 
              value={adx || 0} 
              status={adx > 25 ? 'TRENDING' : 'RANGING'}
            />
            <IndicatorCard 
              title="ATR" 
              value={atr || 0} 
              suffix="pips"
            />
            <IndicatorCard 
              title="EMA Alignment" 
              value={emaAlignment || 'NEUTRAL'}
              isText={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* TRADE SIGNALS SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Signals & Confluence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SignalBadge 
                signal={entrySignal}
                confidence={confidenceScore}
                type="ENTRY"
              />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Confluence Score</h4>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${confidenceScore || 0}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm">{confidenceScore || 0}/100</span>
                </div>
              </div>
            </div>
            
            {/* ACTIVE TRADES */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Active Trade Management</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stop Loss:</span>
                  <span className="font-medium">{currentStopLoss || 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Take Profit:</span>
                  <span className="font-medium">{currentTakeProfit || 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Position Size:</span>
                  <span className="font-medium">{positionSize || '0'} lots</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add these helper components
function IndicatorCard({ title, value, status, suffix = '', isText = false }) {
  return (
    <div className="border rounded-lg p-3">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      {isText ? (
        <p className="text-lg font-bold mt-1">{value}</p>
      ) : (
        <p className="text-lg font-bold mt-1">{value}{suffix}</p>
      )}
      {status && (
        <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
          status === 'OVERBOUGHT' || status === 'TRENDING' ? 'bg-red-100 text-red-800' :
          status === 'OVERSOLD' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      )}
    </div>
  );
}

function SignalBadge({ signal, confidence, type }) {
  const colors = {
    BUY: 'bg-green-100 text-green-800 border-green-300',
    SELL: 'bg-red-100 text-red-800 border-red-300',
    HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };
  
  return (
    <div className="border rounded-lg p-3">
      <h4 className="text-sm font-medium text-gray-500">{type} Signal</h4>
      <div className={`mt-2 text-lg font-bold px-3 py-2 rounded border ${colors[signal] || colors.HOLD}`}>
        {signal || 'HOLD'}
      </div>
      <p className="text-xs text-gray-500 mt-1">Confidence: {confidence}%</p>
    </div>
  );
}
